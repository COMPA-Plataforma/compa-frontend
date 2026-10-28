import api from "@/lib/axiosConfig";
import type { ActividadInformada, EstadoValidacion, ValidacionesResponse } from "@/types";

// Vista del psicoorientador asignado. skipErrorToast en la lista: la pantalla muestra ella misma el 403.
export const validacionService = {
  list: (estudianteId: number) =>
    api
      .get<ValidacionesResponse>(`/api/estudiantes/${estudianteId}/validaciones`, { skipErrorToast: true })
      .then((r) => r.data),

  validar: (estudianteId: number, registroId: number, estado: EstadoValidacion) =>
    api
      .put<ActividadInformada>(`/api/estudiantes/${estudianteId}/validaciones/${registroId}`, { estado })
      .then((r) => r.data),
};