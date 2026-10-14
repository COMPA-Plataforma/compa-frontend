import api from "@/lib/axiosConfig";
import type { AlertStatus } from "@/services/alertService";

export type DestinoDerivacion = "EPS" | "HOSPITAL_ALMA_MATER" | "OTRA";

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
  estado: "DERIVADO";
  orientadorId: number;
  orientadorNombre: string;
  createdAt: string;
}

export const derivacionService = {
  // Se deriva siempre desde una alerta; el backend la marca como atendida por derivación
  derivar: (alertId: number, data: DerivacionPayload) =>
    api.post<Derivacion>(`/api/alerts/${alertId}/derivacion`, data).then((r) => r.data),
};