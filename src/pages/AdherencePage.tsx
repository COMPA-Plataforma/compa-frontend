import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adherenceService } from "@/services/adherenceService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdherencePage() {
  const { id } = useParams<{ id: string }>();
  const estudianteId = Number(id);
  const navigate = useNavigate();

  const { data: snapshot, isLoading } = useQuery({
    queryKey: ["adherenceSnapshot", estudianteId],
    queryFn: () => adherenceService.getLatestSnapshot(estudianteId),
    enabled: !!id && !isNaN(estudianteId),
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>

      <div>
        <h2 className="text-2xl font-bold">Métricas de Adherencia</h2>
        {snapshot && (
          <p className="text-sm text-muted-foreground mt-1">
            Último cálculo: {format(new Date(snapshot.snapshotDate), "dd/MM/yyyy")}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !snapshot ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No hay métricas calculadas aún. El estudiante debe realizar su primer check-in.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Cumplimiento Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${
                snapshot.weeklyCompliance >= 80 ? "text-green-600"
                : snapshot.weeklyCompliance >= 50 ? "text-yellow-600"
                : "text-red-600"
              }`}>
                {snapshot.weeklyCompliance}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Últimos 7 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Cumplimiento Mensual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${
                snapshot.monthlyCompliance >= 80 ? "text-green-600"
                : snapshot.monthlyCompliance >= 50 ? "text-yellow-600"
                : "text-red-600"
              }`}>
                {snapshot.monthlyCompliance}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Últimos 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Racha Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {snapshot.currentStreak}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Días consecutivos ≥80%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                Consistencia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${
                snapshot.consistency >= 80 ? "text-green-600"
                : snapshot.consistency >= 50 ? "text-yellow-600"
                : "text-red-600"
              }`}>
                {snapshot.consistency}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Últimos 14 días</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}