import api from "@/lib/axiosConfig";
import type { RiskLevelInfo, RiskLevelHistoryEntry } from "@/types";

export const riskLevelService = {
  get: (estudianteId: number) =>
    api.get<RiskLevelInfo>(`/api/estudiantes/${estudianteId}/risk-level`).then((r) => r.data),

  evaluate: (estudianteId: number) =>
    api.post<RiskLevelInfo>(`/api/estudiantes/${estudianteId}/risk-level/evaluate`).then((r) => r.data),

  history: (estudianteId: number) =>
    api.get<RiskLevelHistoryEntry[]>(`/api/estudiantes/${estudianteId}/risk-level/history`).then((r) => r.data),

  evaluateAll: () =>
    api.post<RiskLevelInfo[]>(`/api/risk-level/evaluate-all`).then((r) => r.data),

  listAll: () =>
    api.get<RiskLevelInfo[]>(`/api/risk-level/all`).then((r) => r.data),
};
