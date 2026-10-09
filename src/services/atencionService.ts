import api from "@/lib/axiosConfig";
import type { Atencion, AtencionPayload, AtencionVersion, MotivoItem } from "@/types";

// skipErrorToast: la pantalla maneja ella misma los errores esperados (404 = sin atención, 403 = otro orientador)
const quiet = { skipErrorToast: true };

export const atencionService = {
  motivos: () =>
    api.get<MotivoItem[]>("/api/atenciones/motivos").then((r) => r.data),

  get: (estudianteId: number) =>
    api.get<Atencion>(`/api/estudiantes/${estudianteId}/atencion`, quiet).then((r) => r.data),

  register: (estudianteId: number, data: AtencionPayload) =>
    api.post<Atencion>(`/api/estudiantes/${estudianteId}/atencion`, data).then((r) => r.data),

  update: (estudianteId: number, data: Partial<AtencionPayload>) =>
    api.put<Atencion>(`/api/estudiantes/${estudianteId}/atencion`, data).then((r) => r.data),

  historial: (estudianteId: number) =>
    api.get<AtencionVersion[]>(`/api/estudiantes/${estudianteId}/atencion/historial`).then((r) => r.data),
};