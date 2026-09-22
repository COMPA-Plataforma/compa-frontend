import api from "@/lib/axiosConfig";

export interface AdherenceSnapshot {
  id: number;
  snapshotDate: string;
  weeklyCompliance: number;
  monthlyCompliance: number;
  currentStreak: number;
  consistency: number;
}

export const adherenceService = {
  getLatestSnapshot: (estudianteId: number) =>
    api.get<AdherenceSnapshot>(`/api/estudiantes/${estudianteId}/adherence/snapshot`)
       .then((r) => r.data),

  getAllSnapshots: (estudianteId: number) =>
    api.get<AdherenceSnapshot[]>(`/api/estudiantes/${estudianteId}/adherence/snapshots`)
       .then((r) => r.data),
};