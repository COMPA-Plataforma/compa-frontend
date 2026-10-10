import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Calendar, Printer, CheckSquare, Repeat } from "lucide-react";
import { estudianteMeService } from "@/services/estudianteMeService";
import { authService } from "@/services/authService";
import { frecuenciaTexto } from "@/lib/habitos";

export default function EstudiantePlanPage() {
  const currentUser = authService.getCurrentUser();

  // getActivePlan devuelve null si no hay plan activo; cualquier otro fallo llega como isError
  const { data: plan, isLoading, isError } = useQuery({
    queryKey: ["me-plan"],
    queryFn: () => estudianteMeService.getActivePlan(),
    retry: false,
  });

  // Las fechas sin hora (ej. 2026-10-09) se leen como fecha local; con new Date directo
  // se correrían un día atrás por la zona horaria.
  const formatDate = (d: string) => {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T00:00:00`) : new Date(d);
    return date.toLocaleDateString("es-ES", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

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

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Mi plan</h1>
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              No pudimos cargar tu plan. Intenta de nuevo en un momento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Mi plan</h1>
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Aún no tienes un plan de acompañamiento activo.
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
                COMPA - Acompañamiento estudiantil
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
              Plan de hábitos terapéuticos
            </p>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#6b7280" }}>
            <p style={{ margin: 0 }}>Estudiante: <strong>{currentUser?.name} {currentUser?.lastName}</strong></p>
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Inicio: {formatDate(plan.startDate)}
              </span>
              {plan.endDate && <span>Fecha límite: {formatDate(plan.endDate)}</span>}
              <span>Acordado el {formatDate(plan.agreedDate ?? plan.createdAt)}</span>
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
                      {frecuenciaTexto(task) && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Repeat className="h-3 w-3" />
                          {frecuenciaTexto(task)}
                        </p>
                      )}
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          Fecha límite: {formatDate(task.dueDate)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Acordada el {formatDate(task.agreedDate ?? task.createdAt)}
                      </p>
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
          <p style={{ margin: 0 }}>COMPA - Acompañamiento estudiantil — Documento generado el {today}</p>
          <p style={{ margin: "0.25rem 0 0" }}>Este documento es de uso personal y confidencial.</p>
        </div>

      </div>
    </>
  );
}