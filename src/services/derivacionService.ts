import api from "@/lib/axiosConfig";
import type { AlertStatus } from "@/services/alertService";

export type DestinoDerivacion = "EPS" | "HOSPITAL_ALMA_MATER" | "OTRA";

export type EstadoDerivacion = "DERIVADO" | "EN_ESPERA" | "ACEPTADO" | "CITA_ASIGNADA" | "EN_ATENCION";

export interface DerivacionPayload {
  destino: DestinoDerivacion;
  destinoOtro?: string;
  fecha: string; // yyyy-MM-dd
  motivo: string;
}

export interface Derivacion {
  id: number;
  estudianteId: number;
  alertId: number;
  alertStatus: AlertStatus;
  destino: DestinoDerivacion;
  destinoNombre: string;
  fecha: string;
  motivo: string;
  estado: EstadoDerivacion;
  orientadorId: number;
  orientadorNombre: string;
  createdAt: string;
}

export interface NovedadDerivacionPayload {
  fecha?: string; // yyyy-MM-dd; si no se envía, el backend usa hoy
  descripcion: string;
  estado: EstadoDerivacion;
}

export interface NovedadDerivacion {
  id: number;
  derivacionId: number;
  fecha: string;
  descripcion: string;
  estado: EstadoDerivacion;
  estadoEtiqueta: string;
  estadoActual: EstadoDerivacion;
  diasTranscurridos: number;
  orientadorId: number;
  orientadorNombre: string;
  createdAt: string;
}

export interface DerivacionHistorial {
  id: number;
  estudianteId: number;
  estudianteNombre: string;
  destino: DestinoDerivacion;
  destinoNombre: string;
  fecha: string;
  motivo: string;
  estado: EstadoDerivacion;
  estadoEtiqueta: string;
  diasTranscurridos: number;
  orientadorNombre: string;
  novedades: NovedadDerivacion[]; // en orden cronológico
}

// skipErrorToast: la pantalla muestra ella misma el 403 (estudiante de otro psicoorientador o sin asignar)
const quiet = { skipErrorToast: true };

export const derivacionService = {
  // Se deriva siempre desde una alerta; el backend la marca como atendida por derivación
  derivar: (alertId: number, data: DerivacionPayload) =>
    api.post<Derivacion>(`/api/alerts/${alertId}/derivacion`, data).then((r) => r.data),

  // Vista general: derivaciones de todos los estudiantes asignados al psicoorientador
  listarMias: () =>
    api.get<DerivacionHistorial[]>("/api/derivaciones/mias", quiet).then((r) => r.data),

  listarPorEstudiante: (estudianteId: number) =>
    api.get<DerivacionHistorial[]>(`/api/derivaciones/estudiante/${estudianteId}`, quiet).then((r) => r.data),

  registrarNovedad: (derivacionId: number, data: NovedadDerivacionPayload) =>
    api.post<NovedadDerivacion>(`/api/derivaciones/${derivacionId}/novedades`, data).then((r) => r.data),
};