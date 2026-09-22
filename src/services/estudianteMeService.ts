import api from "@/lib/axiosConfig";
import type {
  CheckInPayload,
  CheckInDetail,
  CheckInSummary,
  ClosingResponse,
  TodayCheckIn,
  TodayTask,
} from "@/services/checkInService";
import type { HabitPlan, Estudiante } from "@/types";
import type { EstudianteConsent } from "@/services/consentService";

export const estudianteMeService = {
  getMe: () => api.get<Estudiante>("/api/estudiantes/me").then((r) => r.data),

  getTodayCheckIn: () =>
    api.get<TodayCheckIn>("/api/estudiantes/me/check-in/today").then((r) => r.data),

  getClosing: () =>
    api
      .get<ClosingResponse>("/api/estudiantes/me/check-in/closing")
      .then((r) => r.data),

  getEmotionalStates: () =>
    api
      .get<string[]>("/api/estudiantes/me/check-in/emotional-states")
      .then((r) => r.data),

  getTodayTasks: () =>
    api
      .get<TodayTask[]>("/api/estudiantes/me/check-in/today-tasks")
      .then((r) => r.data),

  createCheckIn: (payload: CheckInPayload) =>
    api.post("/api/estudiantes/me/check-in", payload).then((r) => r.data),

  updateCheckIn: (payload: CheckInPayload) =>
    api.put("/api/estudiantes/me/check-in", payload).then((r) => r.data),

  getLast30Days: () =>
    api
      .get<CheckInSummary[]>("/api/estudiantes/me/check-in/last-30-days")
      .then((r) => r.data),

  getCheckInDetail: (checkInId: number) =>
    api
      .get<CheckInDetail>(`/api/estudiantes/me/check-in/${checkInId}/detail`)
      .then((r) => r.data),

  getActivePlan: () =>
    api.get<HabitPlan>("/api/estudiantes/me/plan").then((r) => r.data),

  getConsents: () =>
    api
      .get<EstudianteConsent[]>("/api/estudiantes/me/consents")
      .then((r) => r.data),

  acceptConsent: (consentId: number) =>
    api
      .patch(`/api/estudiantes/me/consents/${consentId}/accept`)
      .then((r) => r.data),
};
