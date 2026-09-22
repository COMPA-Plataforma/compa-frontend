import api from "@/lib/axiosConfig";
import type {
  CheckInPayload,
  CheckInDetail,
  CheckInSummary,
  ClosingResponse,
  TodayCheckIn,
  TodayTask,
} from "@/services/checkInService";
import type { HabitPlan, Patient } from "@/types";
import type { PatientConsent } from "@/services/consentService";

export const patientMeService = {
  getMe: () => api.get<Patient>("/api/patients/me").then((r) => r.data),

  getTodayCheckIn: () =>
    api.get<TodayCheckIn>("/api/patients/me/check-in/today").then((r) => r.data),

  getClosing: () =>
    api
      .get<ClosingResponse>("/api/patients/me/check-in/closing")
      .then((r) => r.data),

  getEmotionalStates: () =>
    api
      .get<string[]>("/api/patients/me/check-in/emotional-states")
      .then((r) => r.data),

  getTodayTasks: () =>
    api
      .get<TodayTask[]>("/api/patients/me/check-in/today-tasks")
      .then((r) => r.data),

  createCheckIn: (payload: CheckInPayload) =>
    api.post("/api/patients/me/check-in", payload).then((r) => r.data),

  updateCheckIn: (payload: CheckInPayload) =>
    api.put("/api/patients/me/check-in", payload).then((r) => r.data),

  getLast30Days: () =>
    api
      .get<CheckInSummary[]>("/api/patients/me/check-in/last-30-days")
      .then((r) => r.data),

  getCheckInDetail: (checkInId: number) =>
    api
      .get<CheckInDetail>(`/api/patients/me/check-in/${checkInId}/detail`)
      .then((r) => r.data),

  getActivePlan: () =>
    api.get<HabitPlan>("/api/patients/me/plan").then((r) => r.data),

  getConsents: () =>
    api
      .get<PatientConsent[]>("/api/patients/me/consents")
      .then((r) => r.data),

  acceptConsent: (consentId: number) =>
    api
      .patch(`/api/patients/me/consents/${consentId}/accept`)
      .then((r) => r.data),
};
