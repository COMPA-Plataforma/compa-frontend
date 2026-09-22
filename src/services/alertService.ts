import api from "@/lib/axiosConfig";

export type AlertType = "RIESGO_ALTO" | "RIESGO_MEDIO" | "SIN_CHECKIN";
export type AlertStatus = "PENDIENTE" | "RESUELTA" | "IGNORADA";

export interface Alert {
  id: number;
  estudianteId: number;
  estudianteName: string;
  type: AlertType;
  status: AlertStatus;
  description: string;
  createdAt: string;
  resolvedAt: string | null;
}
export const alertService = {
  getAlerts: () =>
    api.get<Alert[]>("/api/alerts").then((r) => r.data),

  getUnreadCount: () =>
    api.get<{ count: number }>("/api/alerts/unread-count").then((r) => r.data.count),

  resolveAlert: (id: number) =>
    api.patch<Alert>(`/api/alerts/${id}/resolve`).then((r) => r.data),

  ignoreAlert: (id: number) =>
    api.patch<Alert>(`/api/alerts/${id}/ignore`).then((r) => r.data),
};