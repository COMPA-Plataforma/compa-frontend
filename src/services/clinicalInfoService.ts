import api from "@/lib/axiosConfig";
import type { ClinicalInfo, HealthStatus, HealthStatusHistory } from "@/types";

export const clinicalInfoService = {
  register: (estudianteId: number, data: { mainCondition: string; secondaryConditions: string; healthStatus: HealthStatus }) =>
    api.post<ClinicalInfo>(`/api/estudiantes/${estudianteId}/clinical-info`, data).then((r) => r.data),

  get: (estudianteId: number) =>
    api.get<ClinicalInfo>(`/api/estudiantes/${estudianteId}/clinical-info`).then((r) => r.data),

  update: (estudianteId: number, data: { mainCondition: string; secondaryConditions: string; healthStatus: HealthStatus }) =>
    api.put<ClinicalInfo>(`/api/estudiantes/${estudianteId}/clinical-info`, data).then((r) => r.data),

  updateHealthStatus: (estudianteId: number, data: { healthStatus: HealthStatus; reason: string }) =>
    api.patch<ClinicalInfo>(`/api/estudiantes/${estudianteId}/clinical-info/health-status`, data).then((r) => r.data),

  getHistory: (estudianteId: number) =>
    api.get<HealthStatusHistory[]>(`/api/estudiantes/${estudianteId}/clinical-info/history`).then((r) => r.data),

  getHealthStatuses: (estudianteId: number) =>
    api.get<string[]>(`/api/estudiantes/${estudianteId}/clinical-info/health-statuses`).then((r) => r.data),
};
