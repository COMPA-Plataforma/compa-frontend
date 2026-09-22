import api from "@/lib/axiosConfig";
import type { Patient, PatientListDTO, Guardian, DocumentType } from "@/types";

export interface CreatePatientPayload {
  name: string;
  lastName: string;
  documentType: DocumentType;
  identityDocument: string;
  email: string;
  phoneNumber: string;
  guardian?: Omit<Guardian, "id">;
}

export const patientService = {
  create: (data: CreatePatientPayload) =>
    api.post<Patient>("/api/patients", data).then((r) => r.data),

  listActive: () => api.get<Patient[]>("/api/patients").then((r) => r.data),

  listInactive: () => api.get<Patient[]>("/api/patients/inactive").then((r) => r.data),

  getById: (id: number) => api.get<Patient>(`/api/patients/${id}`).then((r) => r.data),

  search: (params: { search?: string; status?: string; condition?: string }) =>
    api.get<PatientListDTO[]>("/api/patients/list", { params }).then((r) => r.data),

  updateContact: (id: number, params: { email?: string; phoneNumber?: string }) =>
    api.patch<Patient>(`/api/patients/${id}/contact`, null, { params }).then((r) => r.data),

  deactivate: (id: number, reason: string) =>
    api.patch<Patient>(`/api/patients/${id}/deactivate`, { reason }).then((r) => r.data),

  reactivate: (id: number, data?: { name?: string; lastName?: string; email?: string; phoneNumber?: string }) =>
    api.patch<Patient>(`/api/patients/${id}/reactivate`, data || {}).then((r) => r.data),

    // Crear cuenta de paciente con email — el backend envía credenciales por correo
    createAccount: (professionalId: number, data: { name: string; lastName: string; email: string; identityDocument: string; documentType: string }) =>
  api.post<Patient>(`/api/patients/by-professional/${professionalId}`, data).then((r) => r.data),


  // Listar pacientes vinculados al profesional autenticado
  listByProfessional: (professionalId: number) =>
    api
      .get<Patient[]>(`/api/patients/by-professional/${professionalId}`)
      .then((r) => r.data),
};
