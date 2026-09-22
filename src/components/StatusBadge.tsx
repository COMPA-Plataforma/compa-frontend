import type { HealthStatus, EstudianteStatus, PlanStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVO: { label: "Activo", className: "bg-status-active/15 text-status-active border-status-active/30" },
  INACTIVO: { label: "Inactivo", className: "bg-status-inactive/15 text-status-inactive border-status-inactive/30" },
  CRITICO: { label: "Crítico", className: "bg-status-critical/15 text-status-critical border-status-critical/30" },
  ESTABLE: { label: "Estable", className: "bg-status-stable/15 text-status-stable border-status-stable/30" },
  EN_OBSERVACION: { label: "En observación", className: "bg-status-observation/15 text-status-observation border-status-observation/30" },
  LEVE: { label: "Leve", className: "bg-status-mild/15 text-status-mild border-status-mild/30" },
};

export function StatusBadge({ status }: { status: EstudianteStatus | HealthStatus | PlanStatus }) {
  const config = statusConfig[status] || { label: status, className: "" };
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
