import api from "@/lib/axiosConfig";

export type EstadoEstrategia = "VIGENTE" | "ANULADA";

// Estrategia que el psicoorientador trabajó con el estudiante dentro de su plan
export interface Estrategia {
  id: number;
  planId: number;
  planNombre: string;
  descripcion: string;
  fechaSesion: string; // yyyy-MM-dd
  estado: EstadoEstrategia;
  creadaEn: string;
  actualizadaEn: string | null; // fecha del último cambio, si se actualizó
  anuladaEn: string | null;
}

export interface EstrategiaPayload {
  descripcion: string;
  fechaSesion: string;
}

export const estrategiaService = {
  // Orientador
  historial: (estudianteId: number) =>
    api.get<Estrategia[]>(`/api/estudiantes/${estudianteId}/estrategias`).then((r) => r.data),

  crear: (estudianteId: number, data: EstrategiaPayload) =>
    api.post<Estrategia>(`/api/estudiantes/${estudianteId}/estrategias`, data).then((r) => r.data),

  actualizar: (estudianteId: number, estrategiaId: number, data: EstrategiaPayload) =>
    api.put<Estrategia>(`/api/estudiantes/${estudianteId}/estrategias/${estrategiaId}`, data).then((r) => r.data),

  // "Eliminar" = anular: se conserva en el historial
  anular: (estudianteId: number, estrategiaId: number) =>
    api.delete<Estrategia>(`/api/estudiantes/${estudianteId}/estrategias/${estrategiaId}`).then((r) => r.data),

  // Estudiante: solo las vigentes de su plan activo
  vigentesMias: () => api.get<Estrategia[]>("/api/estudiantes/me/plan/estrategias").then((r) => r.data),
};