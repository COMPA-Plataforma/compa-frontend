import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskBadge } from "@/components/RiskBadge";
import { riskLevelService } from "@/services/riskLevelService";

interface Props {
  estudianteId: number;
}

const formatPct = (value: number) => `${Math.round(value)}%`;

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

export function RiskLevelSection({ estudianteId }: Props) {
  const queryClient = useQueryClient();
  const [historyOpen, setHistoryOpen] = useState(false);

  const {
    data: risk,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["riskLevel", estudianteId],
    queryFn: () => riskLevelService.get(estudianteId),
    enabled: !!estudianteId,
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ["riskLevelHistory", estudianteId],
    queryFn: () => riskLevelService.history(estudianteId),
    enabled: historyOpen,
    staleTime: 0,
  });

  const evaluate = useMutation({
    mutationFn: () => riskLevelService.evaluate(estudianteId),
    onSuccess: (data) => {
      toast.success("Riesgo evaluado correctamente");
      queryClient.setQueryData(["riskLevel", estudianteId], data);
      queryClient.invalidateQueries({ queryKey: ["riskLevel", estudianteId] });
      queryClient.invalidateQueries({ queryKey: ["riskLevelHistory", estudianteId] });
    },
    onError: () => {
      toast.error("Error al evaluar el riesgo");
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Nivel de Riesgo</CardTitle>
              <p className="text-sm text-muted-foreground">
                Prioriza la atención según el cumplimiento del estudiante.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => evaluate.mutate()}
            disabled={evaluate.isPending}
            className="gap-2"
          >
            {evaluate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Evaluar ahora
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : isError || !risk ? (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Aún no hay evaluación de riesgo. Pulsa "Evaluar ahora" para generar la primera.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Nivel actual</p>
              <div className="flex items-center gap-2">
                <RiskBadge level={risk.riskLevel} label={risk.riskLevelDisplay} />
              </div>
              <p className="text-xs text-muted-foreground">{risk.riskLevelDescription}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Cumplimiento</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatPct(risk.compliancePercentage)}
              </p>
              <p className="text-xs text-muted-foreground">de cumplimiento esta semana</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Última evaluación
              </p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(risk.evaluatedDate)}
              </p>
            </div>
          </div>
        )}

        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              {historyOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Ver historial de riesgo
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            {historyLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Sin historial de evaluaciones.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cambio de nivel</TableHead>
                      <TableHead className="text-right">Cumplimiento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.evaluatedDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.previousRiskLevel ? (
                              <RiskBadge
                                level={entry.previousRiskLevel}
                                label={entry.previousRiskLevelDisplay ?? undefined}
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">Inicial</span>
                            )}
                            <span className="text-muted-foreground">→</span>
                            <RiskBadge
                              level={entry.riskLevel}
                              label={entry.riskLevelDisplay}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPct(entry.compliancePercentage)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
