import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Users, AlertTriangle, CheckCircle, ShieldAlert,
  TrendingUp, ArrowRight, Loader2, UserX
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { riskLevelService } from "@/services/riskLevelService";
import { estudianteService } from "@/services/estudianteService";
import { authService } from "@/services/authService";
import type { RiskLevel, RiskLevelInfo } from "@/types";
import { cn } from "@/lib/utils";

const formatPct = (value: number) => `${Math.round(value)}%`;
const formatDate = (value: string) => format(new Date(value), "dd/MM/yyyy");

function StatCard({
  label, value, icon, colorClass, isLoading, onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  isLoading: boolean;
  onClick?: () => void;
}) {
  return (
    <Card
      className={cn("transition-shadow", onClick && "cursor-pointer hover:shadow-md")}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-9 w-12" />
            ) : (
              <p className={cn("text-4xl font-bold", colorClass)}>{value}</p>
            )}
          </div>
          <div className="rounded-full bg-muted p-3">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const { data: riskData = [], isLoading: loadingRisk } = useQuery({
    queryKey: ["riskLevelAll"],
    queryFn: () => riskLevelService.listAll(),
  });

  const { data: estudiantes = [], isLoading: loadingEstudiantes } = useQuery({
    queryKey: ["estudiantes", "list", "", ""],
    queryFn: () => estudianteService.listActive(),
  });

  const { data: inactiveEstudiantes = [], isLoading: loadingInactive } = useQuery({
    queryKey: ["estudiantes", "inactive"],
    queryFn: () => estudianteService.listInactive(),
  });

  const grouped = useMemo(() => {
    const map: Record<RiskLevel, RiskLevelInfo[]> = { ROJO: [], AMARILLO: [], VERDE: [] };
    riskData.forEach((item) => {
      if (map[item.riskLevel]) map[item.riskLevel].push(item);
    });
    return map;
  }, [riskData]);

  const rojos = grouped["ROJO"];
  const amarillos = grouped["AMARILLO"];
  const verdes = grouped["VERDE"];
  const isLoading = loadingRisk || loadingEstudiantes;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-6">

      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting}, {user?.name} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Aquí está el resumen de tus estudiantes hoy — {format(new Date(), "dd/MM/yyyy")}
        </p>
      </div>

      {/* Tarjetas estadísticas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total estudiantes"
          value={estudiantes.length}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          colorClass="text-foreground"
          isLoading={isLoading}
          onClick={() => navigate("/estudiantes")}
        />
        <StatCard
          label="Riesgo alto"
          value={rojos.length}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          colorClass="text-red-500"
          isLoading={isLoading}
          onClick={() => navigate("/risk-level")}
        />
        <StatCard
          label="Riesgo medio"
          value={amarillos.length}
          icon={<AlertTriangle className="h-5 w-5 text-yellow-500" />}
          colorClass="text-yellow-500"
          isLoading={isLoading}
          onClick={() => navigate("/risk-level")}
        />
        <StatCard
          label="Riesgo bajo"
          value={verdes.length}
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          colorClass="text-green-500"
          isLoading={isLoading}
          onClick={() => navigate("/risk-level")}
        />
      </div>

      {/* Alerta estudiantes en rojo */}
      {!isLoading && rojos.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>{rojos.length} {rojos.length === 1 ? "estudiante requiere" : "estudiantes requieren"} atención inmediata</strong>
              {" "}— adherencia por debajo del 50%.
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => navigate("/risk-level")}
            className="shrink-0 gap-1"
          >
            Ver panel <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Estudiantes en riesgo alto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              Estudiantes en riesgo alto
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/risk-level")} className="gap-1 text-xs">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingRisk ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : rojos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="mb-2 h-8 w-8 text-green-400" />
                <p className="text-sm font-medium text-muted-foreground">
                  Ningún estudiante en riesgo alto
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {rojos.slice(0, 5).map((p) => (
                  <button
                    key={p.estudianteId}
                    onClick={() => navigate(`/estudiantes/${p.estudianteId}`)}
                    className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.estudianteName}</p>
                        <p className="text-xs text-muted-foreground">
                          Última eval: {formatDate(p.evaluatedDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-bold text-red-500">
                          {formatPct(p.compliancePercentage)}
                        </span>
                        <RiskBadge level="ROJO" />
                      </div>
                    </div>
                  </button>
                ))}
                {rojos.length > 5 && (
                  <p className="pt-1 text-center text-xs text-muted-foreground">
                    +{rojos.length - 5} más en el panel de riesgo
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista rápida de estudiantes activos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Estudiantes recientes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/estudiantes")} className="gap-1 text-xs">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingEstudiantes ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : estudiantes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No hay estudiantes activos</p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate("/estudiantes")}
                >
                  Agregar estudiante
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {estudiantes.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/estudiantes/${p.id}`)}
                    className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.name} {p.lastName}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                  </button>
                ))}
                {estudiantes.length > 5 && (
                  <p className="pt-1 text-center text-xs text-muted-foreground">
                    +{estudiantes.length - 5} más en la lista de estudiantes
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Estudiantes inactivos */}
      {!loadingInactive && inactiveEstudiantes.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserX className="h-4 w-4 text-muted-foreground" />
              Estudiantes inactivos
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {inactiveEstudiantes.length}
              </span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/estudiantes/inactive")} className="gap-1 text-xs">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inactiveEstudiantes.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/estudiantes/${p.id}`)}
                  className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-muted-foreground">
                        {p.name} {p.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}