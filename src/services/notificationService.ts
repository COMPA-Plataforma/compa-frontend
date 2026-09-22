import api from "@/lib/axiosConfig";
import axios from "axios";

export type NotificationType =
  | "MENSAJE_MOTIVACIONAL"
  | "RECORDATORIO_CHECKIN"
  | "RACHA_EN_RIESGO"
  | "MENSAJE_ORIENTADOR";

export type NotificationChannel = "IN_APP" | "EMAIL" | "IN_APP_Y_EMAIL";
export type NotificationStatus = "PENDIENTE" | "ENVIADA" | "LEIDA" | "FALLIDA";

export interface AppNotification {
  id: number;
  estudianteId: number;
  estudianteName: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  title: string;
  message: string;
  createdAt: string;
  sentAt: string | null;
  readAt: string | null;
  // HU-03: presentes cuando la notificación está vinculada a una tarea puntual
  relatedTaskId: number | null;
  actionTaken: boolean;
  actionTakenAt: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const notificationService = {
  // ---- Estudiante (self-service) ----

  getMyNotifications: () =>
    api.get<AppNotification[]>("/api/notifications/me").then((r) => r.data),

  getUnreadCount: () =>
    api
      .get<{ count: number }>("/api/notifications/me/unread-count")
      .then((r) => r.data.count),

  markAsRead: (id: number) =>
    api
      .patch<AppNotification>(`/api/notifications/me/${id}/read`)
      .then((r) => r.data),

  markAllAsRead: () => api.patch("/api/notifications/me/read-all"),

  // HU-03: marcar la tarea asociada como cumplida desde la notificación (in-app, con sesión)
  completeTask: (notificationId: number) =>
    api
      .patch<AppNotification>(`/api/notifications/me/${notificationId}/complete-task`)
      .then((r) => r.data),

  // HU-03: misma acción pero sin sesión iniciada (link del correo).
  // Usa axios "pelado", sin el interceptor de auth/401, porque se llama
  // desde una página pública (ver CompleteTaskPage).
  completeTaskByActionToken: (token: string) =>
    axios
      .post<AppNotification>(`${API_URL}/api/notifications/actions/${token}/complete-task`)
      .then((r) => r.data),

  // ---- Orientador ----

  getEstudianteNotifications: (estudianteId: number) =>
    api
      .get<AppNotification[]>(`/api/notifications/estudiantes/${estudianteId}`)
      .then((r) => r.data),

  sendManualMessage: (
    estudianteId: number,
    payload: { title: string; message: string; channel?: NotificationChannel; taskId?: number }
  ) =>
    api
      .post<AppNotification>(`/api/notifications/estudiantes/${estudianteId}`, payload)
      .then((r) => r.data),
};