import api from "@/lib/axiosConfig";

export interface TodayTask {
  id: number;
  name: string;
  description: string;
  priority: "ALTA" | "MEDIA" | "BAJA";
  mandatory: boolean;
  weeklyGoal: number | null;
  specificDays: string[];
}

export interface TaskResponse {
  taskId: number;
  completed: boolean;
  barrier?: string | null;
}

export interface CheckInPayload {
  emotionalState: string;
  tasks: TaskResponse[];
}

export interface ClosingResponse {
  streak: number;
  message: string;
}

export interface TodayCheckIn {
  id: number;
  emotionalState: string | null;
  checkInDate: string;
  tasks: TaskResponse[];
}

export type TaskBarrier =
  | "FALTA_DE_TIEMPO"
  | "OLVIDO"
  | "NO_QUISE"
  | "ME_SENTI_MAL"
  | "OTRO";

export const BARRIER_LABELS: Record<TaskBarrier, string> = {
  FALTA_DE_TIEMPO: "Falta de tiempo",
  OLVIDO: "Olvido",
  NO_QUISE: "No quise",
  ME_SENTI_MAL: "Me sentí mal",
  OTRO: "Otro",
};

export interface CheckInSummary {
  date: string;
  status: "COMPLETADO" | "NO_REGISTRADO";
  emotionalState: string | null;
  emotionalStateIcon: string | null;
  checkInId: number | null;
}

export interface CheckInDetailTask {
  taskId: number;
  taskName: string;
  taskDescription: string;
  completed: boolean;
  barrier: string | null;
  barrierLabel: string | null;
}

export interface CheckInDetail {
  id: number;
  checkInDate: string;
  emotionalState: string | null;
  emotionalStateIcon: string | null;
  emotionalStateLabel: string | null;
  createdAt: string;
  updatedAt: string;
  tasks: CheckInDetailTask[];
}

export const checkInService = {
  getEmotionalStates: (estudianteId: number) =>
    api
      .get<string[]>(`/api/estudiantes/${estudianteId}/check-in/emotional-states`)
      .then((r) => r.data),

  getTodayTasks: (estudianteId: number) =>
    api
      .get<TodayTask[]>(`/api/estudiantes/${estudianteId}/check-in/today-tasks`)
      .then((r) => r.data),

  submit: (estudianteId: number, payload: CheckInPayload) =>
    api
      .post(`/api/estudiantes/${estudianteId}/check-in`, payload)
      .then((r) => r.data),

  update: (estudianteId: number, payload: CheckInPayload) =>
    api
      .put(`/api/estudiantes/${estudianteId}/check-in`, payload)
      .then((r) => r.data),

  getClosing: (estudianteId: number) =>
    api
      .get<ClosingResponse>(`/api/estudiantes/${estudianteId}/check-in/closing`)
      .then((r) => r.data),

  getToday: (estudianteId: number) =>
    api
      .get<TodayCheckIn>(`/api/estudiantes/${estudianteId}/check-in/today`)
      .then((r) => r.data),

  getLast30Days: (estudianteId: number) =>
    api
      .get<CheckInSummary[]>(`/api/estudiantes/${estudianteId}/check-in/last-30-days`)
      .then((r) => r.data),

  getDetail: (estudianteId: number, checkInId: number) =>
    api
      .get<CheckInDetail>(`/api/estudiantes/${estudianteId}/check-in/${checkInId}/detail`)
      .then((r) => r.data),

  getTasksForToday: (estudianteId: number) =>
  api
    .get<TodayTask[]>(`/api/estudiantes/${estudianteId}/habit-plans/tasks/today`)
    .then((r) => r.data),
};