import api from "@/lib/axiosConfig";

export type FrecuenciaRecordatorio = "DIARIA" | "DIAS_ESPECIFICOS";

export type DiaSemana =
  | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY"
  | "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface ConfiguracionRecordatorio {
  hora: string; // "HH:mm"
  frecuencia: FrecuenciaRecordatorio;
  dias: DiaSemana[];
  predeterminada: boolean;
  horaPredeterminada: string;
}

export interface ConfiguracionRecordatorioRequest {
  hora: string;
  frecuencia: FrecuenciaRecordatorio;
  dias: DiaSemana[];
}

const BASE = "/api/estudiantes/me/recordatorios";

export const recordatorioService = {
  obtener: () => api.get<ConfiguracionRecordatorio>(BASE).then((r) => r.data),
  guardar: (data: ConfiguracionRecordatorioRequest) =>
    api.put<ConfiguracionRecordatorio>(BASE, data).then((r) => r.data),
  restablecer: () => api.delete<ConfiguracionRecordatorio>(BASE).then((r) => r.data),
};