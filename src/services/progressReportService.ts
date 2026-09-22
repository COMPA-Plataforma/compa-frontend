import api from "@/lib/axiosConfig";
import { PlanStatus } from "@/types";

export type RiskLevel = "VERDE" | "AMARILLO" | "ROJO";
export type HealthStatus = "CRITICO" | "ESTABLE" | "EN_OBSERVACION" | "LEVE";

export interface RiskDayDTO {
  date: string;
  riskLevel: RiskLevel;
  compliancePercentage: number;
}

export interface HabitPlanDTO {
  name: string;
  startDate: string;
  status: PlanStatus;
}

export interface ConclusionDTO {
  id: number;
  content: string;
  orientadorName: string;
  createdAt: string;
}

export interface ProgressReport {
  estudianteFullName: string;
  orientadorFullName: string;
  generatedAt: string;
  weeklyCompliance: number;
  currentStreak: number;
  bestStreak: number;
  last7DaysRisk: RiskDayDTO[];
  highRiskCount: number;
  initialHealthStatus: HealthStatus | null;
  currentHealthStatus: HealthStatus | null;
  initialStatusDate: string | null;
  currentStatusDate: string | null;
  habitPlans: HabitPlanDTO[];
  conclusions: ConclusionDTO[];
}

export const progressReportService = {
  getReport: (estudianteId: number) =>
    api
      .get<ProgressReport>(`/api/estudiantes/${estudianteId}/progress-report`)
      .then((r) => r.data),

  addConclusion: (estudianteId: number, content: string, orientadorId: number) =>
    api
      .post(`/api/estudiantes/${estudianteId}/progress-report/conclusions`, {
        content,
        orientadorId,
      })
      .then((r) => r.data),
};