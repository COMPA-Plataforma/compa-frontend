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

export interface MoodCountDTO {
  state: string;
  label: string;
  icon: string;
  count: number;
}

// Adherencia al plan en un periodo: lo que informó el estudiante y lo que validó el psicoorientador
export interface AdherenciaDTO {
  from: string;                    // yyyy-MM-dd
  to: string;
  hasActivePlan: boolean;
  hasInfo: boolean;                // false si en el periodo no hay actividades informadas ni ánimo
  scheduled: number;
  reportedCompleted: number;
  reportedPercentage: number | null;
  validated: number;
  validatedPercentage: number | null;
  toValidate: number;
  notPerformed: number;
  moodCheckIns: number;
  predominantMood: string | null;
  predominantMoodLabel: string | null;
  predominantMoodIcon: string | null;
  mood: MoodCountDTO[];
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
  adherencia: AdherenciaDTO;
}

export const progressReportService = {
  // from/to (yyyy-MM-dd) filtran la adherencia y el estado de ánimo
  getReport: (estudianteId: number, from?: string, to?: string) =>
    api
      .get<ProgressReport>(`/api/estudiantes/${estudianteId}/progress-report`, { params: { from, to } })
      .then((r) => r.data),

  addConclusion: (estudianteId: number, content: string, orientadorId: number) =>
    api
      .post(`/api/estudiantes/${estudianteId}/progress-report/conclusions`, {
        content,
        orientadorId,
      })
      .then((r) => r.data),
};