import api from "@/lib/axiosConfig";
import type { Experiencia, ExperienciaPayload } from "@/types";
 
export const experienciaService = {
  // Mis experiencias, de la más reciente a la más antigua
  list: () => api.get<Experiencia[]>("/api/estudiantes/me/experiencias").then((r) => r.data),
 
  create: (data: ExperienciaPayload) =>
    api.post<Experiencia>("/api/estudiantes/me/experiencias", data).then((r) => r.data),
 
  // Solo se puede corregir el mismo día en que se registró
  update: (id: number, data: ExperienciaPayload) =>
    api.put<Experiencia>(`/api/estudiantes/me/experiencias/${id}`, data).then((r) => r.data),
};
 