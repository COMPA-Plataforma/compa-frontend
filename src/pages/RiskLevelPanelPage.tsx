import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/RiskBadge";
import { riskLevelService } from "@/services/riskLevelService";
import type { RiskLevel, RiskLevelInfo } from "@/types";
import { cn } from "@/lib/utils";

const COLUMNS: {
  level: RiskLevel;
  title: string;
  emoji: string;
  description: string;
  accent: string;
}[] = [
  {
    level: "ROJO",
    title: "Rojo",
    emoji: "🔴",
    description: "Cumplimiento < 50%",
    accent: "border-risk-red/40",
  },
  {
    level: "AMARILLO",
    title: "Amarillo",
    emoji: "🟡",
    description: "Cumplimiento 50% – 79%",
    accent: "border-risk-yellow/40",
  },
  {
    level: "VERDE",
    title: "Verde",
    emoji: "🟢",
    description: "Cumplimiento ≥ 80%",
    accent: "border-risk-green/40",
  },
];

const formatPct = (value: number) => `${Math.round(value)}%`;
const formatDate = (value: string) => format(new Date(value), "dd/MM/yyyy");

export default function RiskLevelPanelPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["riskLevelAll"],
    queryFn: () => riskLevelService.listAll(),
  });

  const evaluateAll = useMutation({
    mutationFn: () => riskLevelService.evaluateAll(),
    onSuccess: () => {
      toast.success("Evaluación de todos los estudiantes completada");
      queryClient.invalidateQueries({ queryKey: ["riskLevelAll"] });
    },
  });

  const grouped = useMemo(() => {
    const map: Record<RiskLevel, RiskLevelInfo[]> = {
      ROJO: [],
      AMARILLO: [],
      VERDE: [],
    };
    (data ?? []).forEach((item) => {
      if (map[item.riskLevel]) map[item.riskLevel].push(item);
    });
    return map;
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Panel de Riesgo</h1>
            <p className="text-sm text-muted-foreground">
              Visualiza a tus estudiantes agrupados por nivel de riesgo.
            </p>
          </div>
        </div>
        <Button
          onClick={() => evaluateAll.mutate()}
          disabled={evaluateAll.isPending}
          className="gap-2"
        >
          {evaluateAll.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Evaluar todos
        </Button>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No fue posible cargar el panel de riesgo. Intenta nuevamente.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {COLUMNS.map((col) => {
            const estudiantes = grouped[col.level];
            return (
              <Card key={col.level} className={cn("border-t-4", col.accent)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span aria-hidden>{col.emoji}</span>
                      <span>{col.title}</span>
                    </CardTitle>
                    <RiskBadge level={col.level} />
                  </div>
                  <p className="text-xs text-muted-foreground">{col.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </>
                  ) : estudiantes.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Sin estudiantes en este nivel
                    </p>
                  ) : (
                    estudiantes.map((p) => (
                      <button
                        key={p.estudianteId}
                        type="button"
                        onClick={() => navigate(`/estudiantes/${p.estudianteId}`)}
                        className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {p.estudianteName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Última evaluación: {formatDate(p.evaluatedDate)}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-foreground">
                            {formatPct(p.compliancePercentage)}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

