import api from "@/lib/axiosConfig";
import type { HabitPlan, HabitTask } from "@/types";

export const habitPlanService = {
  create: (estudianteId: number, data: { name: string; description: string; startDate: string; endDate: string }) =>
    api.post<HabitPlan>(`/api/estudiantes/${estudianteId}/habit-plans`, data).then((r) => r.data),

  list: (estudianteId: number) =>
    api.get<HabitPlan[]>(`/api/estudiantes/${estudianteId}/habit-plans`).then((r) => r.data),

  getActive: (estudianteId: number) =>
    api.get<HabitPlan>(`/api/estudiantes/${estudianteId}/habit-plans/active`).then((r) => r.data),

  getById: (estudianteId: number, planId: number) =>
    api.get<HabitPlan>(`/api/estudiantes/${estudianteId}/habit-plans/${planId}`).then((r) => r.data),

  update: (estudianteId: number, planId: number, data: { name: string; description: string; startDate: string; endDate: string }) =>
    api.put<HabitPlan>(`/api/estudiantes/${estudianteId}/habit-plans/${planId}`, data).then((r) => r.data),

  deactivate: (estudianteId: number, planId: number) =>
    api.patch<HabitPlan>(`/api/estudiantes/${estudianteId}/habit-plans/${planId}/deactivate`).then((r) => r.data),

  addTask: (
    estudianteId: number,
    planId: number,
    data: {
      name: string;
      description: string;
      priority?: "ALTA" | "MEDIA" | "BAJA";
      mandatory?: boolean;
      weeklyGoal?: number;
      specificDays?: string[];
    }
  ) =>
    api.post<HabitTask>(`/api/estudiantes/${estudianteId}/habit-plans/${planId}/tasks`, data).then((r) => r.data),

  deleteTask: (estudianteId: number, planId: number, taskId: number) =>
    api.delete(`/api/estudiantes/${estudianteId}/habit-plans/${planId}/tasks/${taskId}`).then((r) => r.data),
};