import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { alertService, Alert, AlertType, AlertStatus } from "@/services/alertService";
import { Bell, CheckCircle2, XCircle, Loader2, AlertTriangle, AlertCircle } from "lucide-react";

const typeConfig: Record<AlertType, { label: string; color: string; bg: string; icon: JSX.Element }> = {
  RIESGO_ALTO: {
    label: "Riesgo alto",
    color: "#dc2626",
    bg: "#fef2f2",
    icon: <AlertCircle size={16} color="#dc2626" />,
  },
  RIESGO_MEDIO: {
    label: "Riesgo medio",
    color: "#d97706",
    bg: "#fffbeb",
    icon: <AlertTriangle size={16} color="#d97706" />,
  },
  SIN_CHECKIN: {
    label: "Sin check-in",
    color: "#6b7280",
    bg: "#f9fafb",
    icon: <Bell size={16} color="#6b7280" />,
  },
};

const statusLabel: Record<AlertStatus, string> = {
  PENDIENTE: "Pendiente",
  RESUELTA: "Resuelta",
  IGNORADA: "Ignorada",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [confirmIgnoreId, setConfirmIgnoreId] = useState<number | null>(null);
  const [confirmIgnoreName, setConfirmIgnoreName] = useState<string>("");

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: alertService.getAlerts,
  });

  const resolveMutation = useMutation({
    mutationFn: alertService.resolveAlert,
    onSuccess: (_, alertId) => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-count"] });
      // Navegar al detalle del estudiante
      const alert = alerts?.find((a) => a.id === alertId);
      if (alert) {
        navigate(`/estudiantes/${alert.estudianteId}`);
      }
    },
  });

  const ignoreMutation = useMutation({
    mutationFn: alertService.ignoreAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-count"] });
      setConfirmIgnoreId(null);
    },
  });

  const pendingAlerts = alerts?.filter((a) => a.status === "PENDIENTE") ?? [];
  const resolvedAlerts = alerts?.filter((a) => a.status !== "PENDIENTE") ?? [];

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 style={{ width: 32, height: 32, color: "hsl(199, 89%, 38%)", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem 1rem", fontFamily: "system-ui, sans-serif" }}>

      {/* Modal de confirmación para ignorar */}
      {confirmIgnoreId !== null && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50,
        }}>
          <div style={{
            background: "white", borderRadius: 12, padding: "2rem",
            maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <XCircle size={40} color="#6b7280" style={{ margin: "0 auto 0.75rem" }} />
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}>
                ¿Ignorar esta alerta?
              </h3>
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                La alerta de <strong>{confirmIgnoreName}</strong> pasará al historial como ignorada. Esta acción no se puede deshacer.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setConfirmIgnoreId(null)}
                style={{
                  flex: 1, padding: "0.75rem",
                  background: "transparent", border: "1px solid #d1d5db",
                  borderRadius: 8, cursor: "pointer", fontSize: "0.875rem",
                  fontWeight: 500, color: "#374151",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => ignoreMutation.mutate(confirmIgnoreId)}
                disabled={ignoreMutation.isPending}
                style={{
                  flex: 1, padding: "0.75rem",
                  background: "#6b7280", color: "white",
                  border: "none", borderRadius: 8, cursor: "pointer",
                  fontSize: "0.875rem", fontWeight: 500,
                  opacity: ignoreMutation.isPending ? 0.6 : 1,
                }}
              >
                {ignoreMutation.isPending ? "Ignorando..." : "Sí, ignorar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón Volver */}

      <div style={{ marginBottom: "1rem" }}>
  <button
    onClick={() => navigate(-1)}
    style={{
      display: "flex", alignItems: "center", gap: "0.5rem",
      padding: "0.5rem 1rem",
      background: "transparent", color: "hsl(199, 89%, 38%)",
      border: "1px solid hsl(199, 89%, 38%)", borderRadius: "8px",
      cursor: "pointer", fontSize: "0.875rem", fontWeight: 500,
    }}
  >
    ← Volver
  </button>
</div>

      {/* Encabezado */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "hsl(199, 89%, 38%)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Bell size={20} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#111827" }}>Alertas</h1>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
            {pendingAlerts.length} pendiente{pendingAlerts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Alertas pendientes */}
      {pendingAlerts.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "3rem",
          background: "#f9fafb", borderRadius: 12,
          border: "1px solid #e5e7eb", marginBottom: "1.5rem",
        }}>
          <CheckCircle2 size={40} color="#22c55e" style={{ margin: "0 auto 0.75rem" }} />
          <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#374151" }}>
            ¡Sin alertas pendientes!
          </p>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "#9ca3af" }}>
            Todos los estudiantes están bajo control
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.75rem" }}>
          {pendingAlerts.map((alert) => {
            const config = typeConfig[alert.type];
            return (
              <div key={alert.id} style={{
                background: config.bg,
                border: `1px solid ${config.color}33`,
                borderLeft: `4px solid ${config.color}`,
                borderRadius: 10, padding: "1rem 1.25rem",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      {config.icon}
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: config.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {config.label}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 0.3rem", fontSize: "0.95rem", fontWeight: 600, color: "#111827" }}>
                      {alert.estudianteName}
                    </p>
                    <p style={{ margin: "0 0 0.4rem", fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.5 }}>
                      {alert.description}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>
                      {formatDate(alert.createdAt)}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0 }}>
                    <button
                      onClick={() => resolveMutation.mutate(alert.id)}
                      disabled={resolveMutation.isPending}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.35rem",
                        padding: "0.4rem 0.85rem",
                        background: "#22c55e", color: "white",
                        border: "none", borderRadius: 6, cursor: "pointer",
                        fontSize: "0.78rem", fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={13} /> Resolver
                    </button>
                    <button
                      onClick={() => {
                        setConfirmIgnoreId(alert.id);
                        setConfirmIgnoreName(alert.estudianteName);
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.35rem",
                        padding: "0.4rem 0.85rem",
                        background: "transparent", color: "#6b7280",
                        border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer",
                        fontSize: "0.78rem", fontWeight: 600,
                      }}
                    >
                      <XCircle size={13} /> Ignorar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historial */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h2 style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
            Historial
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {resolvedAlerts.map((alert) => {
              const config = typeConfig[alert.type];
              return (
                <div key={alert.id} style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderLeft: "4px solid #d1d5db",
                  borderRadius: 10, padding: "0.875rem 1.25rem",
                  opacity: 0.7,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    {config.icon}
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: config.color, textTransform: "uppercase" }}>
                      {config.label}
                    </span>
                    <span style={{
                      fontSize: "0.7rem", padding: "0.1rem 0.5rem",
                      background: alert.status === "RESUELTA" ? "#dcfce7" : "#f3f4f6",
                      color: alert.status === "RESUELTA" ? "#16a34a" : "#6b7280",
                      borderRadius: 20, fontWeight: 600,
                    }}>
                      {statusLabel[alert.status]}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 0.2rem", fontSize: "0.9rem", fontWeight: 600, color: "#374151" }}>
                    {alert.estudianteName}
                  </p>
                  <p style={{ margin: "0 0 0.3rem", fontSize: "0.82rem", color: "#6b7280" }}>
                    {alert.description}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#9ca3af" }}>
                    {formatDate(alert.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}