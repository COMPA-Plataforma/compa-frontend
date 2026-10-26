import api from "@/lib/axiosConfig";
import type { Experiencia } from "@/types";

export interface FiltroExperiencias {
  desde?: string;      // yyyy-MM-dd
  hasta?: string;      // yyyy-MM-dd
  actividadId?: number;
}

// Vista del psicoorientador: las experiencias que reportó un estudiante suyo.
// skipErrorToast: la pantalla muestra ella misma el 403 (estudiante de otro psicoorientador o sin asignar)
export const experienciaConsultaService = {
  list: (estudianteId: number, filtro: FiltroExperiencias = {}) =>
    api
      .get<Experiencia[]>(`/api/estudiantes/${estudianteId}/experiencias`, {
        params: filtro,
        skipErrorToast: true,
      })
      .then((r) => r.data),
};