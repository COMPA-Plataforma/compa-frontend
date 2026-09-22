import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar, Printer, CheckSquare } from "lucide-react";
import { patientMeService } from "@/services/patientMeService";
import { authService } from "@/services/authService";

export default function PatientPlanPage() {
  const currentUser = authService.getCurrentUser();

  const { data: plan, isLoading, isError } = useQuery({
    queryKey: ["me-plan"],
    queryFn: () => patientMeService.getActivePlan().catch(() => null),
    retry: false,
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", {
      day: "numeric", month: "long", year: "numeric",
    });

  const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Mi plan</h1>
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Aún no tienes un plan asignado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-header { display: flex !important; }
          .print-footer { display: block !important; }
          .print-checkbox { display: block !important; }
          .no-print-icon { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          html, body { height: auto !important; overflow: visible !important; }
          ::-webkit-scrollbar { display: none !important; }
          @page { margin: 1.5cm; size: A4; }
        }
        .print-header { display: none; }
        .print-footer { display: none; }
        .print-checkbox { display: none; }
      `}</style>

      <div className="space-y-4">

        {/* Encabezado con botón imprimir */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Mi plan</h1>
          <button
            className="no-print"
            onClick={() => window.print()}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: "hsl(199, 89%, 38%)", color: "white",
              border: "none", borderRadius: "8px", cursor: "pointer",
              fontSize: "0.875rem", fontWeight: 500,
            }}
          >
            <Printer size={16} /> Imprimir plan
          </button>
        </div>

        {/* Encabezado del documento — solo visible al imprimir */}
        <div
          className="print-header"
          style={{
            borderBottom: "2px solid hsl(199, 89%, 38%)",
            paddingBottom: "1rem", marginBottom: "1.5rem",
            justifyContent: "space-between", alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(199,89%,38%)" strokeWidth="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span style={{ fontWeight: 700, color: "hsl(199, 89%, 18%)", fontSize: "1rem" }}>
                LifeTracker Wellness
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
              Plan de hábitos terapéuticos
            </p>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#6b7280" }}>
            <p style={{ margin: 0 }}>Paciente: <strong>{currentUser?.name} {currentUser?.lastName}</strong></p>
            <p style={{ margin: 0 }}>Fecha de impresión: {today}</p>
          </div>
        </div>

        {/* Información del plan */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {plan.status}
              </Badge>
            </div>
            {plan.description && (
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {formatDate(plan.startDate)} — {formatDate(plan.endDate)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tareas */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground px-1">
            Tareas del plan ({plan.tasks?.length ?? 0})
          </h2>
          {plan.tasks && plan.tasks.length > 0 ? (
            plan.tasks.map((task, index) => (
              <Card key={task.id}>
                <CardContent className="py-4">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    {/* Checkbox visible solo al imprimir */}
                    <div
                      className="print-checkbox"
                      style={{
                        width: 18, height: 18,
                        border: "1.5px solid #9ca3af",
                        borderRadius: 4, flexShrink: 0, marginTop: 2,
                      }}
                    />
                    <CheckSquare size={16} className="no-print-icon text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        {index + 1}. {task.name}
                      </p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                Tu plan aún no tiene tareas.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pie de página — solo al imprimir */}
        <div
          className="print-footer"
          style={{
            marginTop: "2rem", paddingTop: "1rem",
            borderTop: "1px solid #e5e7eb",
            textAlign: "center", fontSize: "0.75rem", color: "#9ca3af",
          }}
        >
          <p style={{ margin: 0 }}>LifeTracker Wellness — Documento generado el {today}</p>
          <p style={{ margin: "0.25rem 0 0" }}>Este documento es de uso personal y confidencial.</p>
        </div>

      </div>
    </>
  );
}