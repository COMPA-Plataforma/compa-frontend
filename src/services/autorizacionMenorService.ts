import axios from "axios";
import api from "@/lib/axiosConfig";
import type { Guardian } from "@/types";

export type EstadoAutorizacionMenor = "PENDIENTE" | "EN_REVISION" | "APROBADA" | "RECHAZADA";

// Autorización del representante legal de un estudiante menor de edad
export interface AutorizacionMenor {
  estudianteId: number;
  estudianteNombre: string;
  estado: EstadoAutorizacionMenor;
  versionDocumento: string;
  acudiente: Guardian | null;
  puedeSubir: boolean;
  archivoNombre: string | null;
  archivoTipo: string | null;
  archivoTamano: number | null;
  subidoEn: string | null;
  revisadoPorNombre: string | null;
  revisadoEn: string | null;
  motivoRechazo: string | null;
}

export type DecisionRevision = "APROBAR" | "RECHAZAR";

export const MAX_BYTES_AUTORIZACION = 5 * 1024 * 1024;

export const autorizacionMenorService = {
  // Estudiante: su propia autorización
  getMia: () =>
    api.get<AutorizacionMenor>("/api/estudiantes/me/autorizacion-menor", { skipErrorToast: true }).then((r) => r.data),

  subir: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<AutorizacionMenor>("/api/estudiantes/me/autorizacion-menor", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  // Psicoorientador: la autorización de un estudiante. Devuelve null si el estudiante no es menor.
  getDeEstudiante: async (estudianteId: number): Promise<AutorizacionMenor | null> => {
    try {
      const r = await api.get<AutorizacionMenor>(`/api/estudiantes/${estudianteId}/autorizacion-menor`, {
        skipErrorToast: true,
      });
      return r.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 400) return null;
      throw e;
    }
  },

  // El documento escaneado, para abrirlo en otra pestaña
  getArchivo: (estudianteId: number) =>
    api
      .get<Blob>(`/api/estudiantes/${estudianteId}/autorizacion-menor/archivo`, { responseType: "blob" })
      .then((r) => r.data),

  revisar: (estudianteId: number, decision: DecisionRevision, motivo?: string) =>
    api
      .put<AutorizacionMenor>(`/api/estudiantes/${estudianteId}/autorizacion-menor/revision`, { decision, motivo })
      .then((r) => r.data),

  pendientes: () => api.get<AutorizacionMenor[]>("/api/autorizaciones-menor/pendientes").then((r) => r.data),
};