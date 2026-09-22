import api from "@/lib/axiosConfig";
import type { Estudiante, EstudianteListDTO, Guardian, DocumentType } from "@/types";

export interface CreateEstudiantePayload {
  name: string;
  lastName: string;
  documentType: DocumentType;
  identityDocument: string;
  email: string;
  phoneNumber: string;
  guardian?: Omit<Guardian, "id">;
}

export const estudianteService = {
  create: (data: CreateEstudiantePayload) =>
    api.post<Estudiante>("/api/estudiantes", data).then((r) => r.data),

  listActive: () => api.get<Estudiante[]>("/api/estudiantes").then((r) => r.data),

  listInactive: () => api.get<Estudiante[]>("/api/estudiantes/inactive").then((r) => r.data),

  getById: (id: number) => api.get<Estudiante>(`/api/estudiantes/${id}`).then((r) => r.data),

  search: (params: { search?: string; status?: string; condition?: string }) =>
    api.get<EstudianteListDTO[]>("/api/estudiantes/list", { params }).then((r) => r.data),

  updateContact: (id: number, params: { email?: string; phoneNumber?: string }) =>
    api.patch<Estudiante>(`/api/estudiantes/${id}/contact`, null, { params }).then((r) => r.data),

  deactivate: (id: number, reason: string) =>
    api.patch<Estudiante>(`/api/estudiantes/${id}/deactivate`, { reason }).then((r) => r.data),

  reactivate: (id: number, data?: { name?: string; lastName?: string; email?: string; phoneNumber?: string }) =>
    api.patch<Estudiante>(`/api/estudiantes/${id}/reactivate`, data || {}).then((r) => r.data),

    // Crear cuenta de estudiante con email — el backend envía credenciales por correo
    createAccount: (orientadorId: number, data: { name: string; lastName: string; email: string; identityDocument: string; documentType: string }) =>
  api.post<Estudiante>(`/api/estudiantes/by-orientador/${orientadorId}`, data).then((r) => r.data),


  // Listar estudiantes vinculados al orientador autenticado
  listByOrientador: (orientadorId: number) =>
    api
      .get<Estudiante[]>(`/api/estudiantes/by-orientador/${orientadorId}`)
      .then((r) => r.data),
};
