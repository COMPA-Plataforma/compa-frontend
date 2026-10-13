import api from "@/lib/axiosConfig";
import type { Seguimiento, SeguimientoPayload } from "@/types";

// skipErrorToast: la pantalla muestra ella misma el 403 (estudiante de otro psicoorientador o sin asignar)
const quiet = { skipErrorToast: true };

export const seguimientoService = {
  list: (estudianteId: number) =>
    api.get<Seguimiento[]>(`/api/estudiantes/${estudianteId}/seguimientos`, quiet).then((r) => r.data),

  create: (estudianteId: number, data: SeguimientoPayload) =>
    api.post<Seguimiento>(`/api/estudiantes/${estudianteId}/seguimientos`, data).then((r) => r.data),

  // "Eliminar" en el backend anula el seguimiento y lo conserva en el historial
  anular: (estudianteId: number, seguimientoId: number) =>
    api.delete<Seguimiento>(`/api/estudiantes/${estudianteId}/seguimientos/${seguimientoId}`).then((r) => r.data),
};