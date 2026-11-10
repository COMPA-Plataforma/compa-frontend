import api from "@/lib/axiosConfig";

// Informe agregado y anonimizado: nunca incluye datos de estudiantes individuales
export interface MotivoItem {
  motivo: string;
  motivoNombre: string;
  estudiantes: number;
  adherenciaPromedio: number | null; // % de cumplimiento; null si no hay datos
}

export interface Sugerencia {
  motivo: string;
  motivoNombre: string;
  enfoque: string;
  talleres: string[];
  nota: string | null;
}

export interface InformeMotivos {
  desde: string | null;
  hasta: string;
  motivoFiltro: string | null;
  motivos: MotivoItem[]; // de mayor a menor número de estudiantes
  hayMotivosOmitidos: boolean;
  sugerencia: Sugerencia | null;
}

export interface InformeMotivosFiltros {
  desde?: string; // yyyy-MM-dd
  hasta?: string; // yyyy-MM-dd
  motivo?: string;
}

// skipErrorToast: la pantalla muestra ella misma los errores de carga
const quiet = { skipErrorToast: true };

export const informeService = {
  motivos: ({ desde, hasta, motivo }: InformeMotivosFiltros = {}) =>
    api
      .get<InformeMotivos>("/api/coordinador/informes/motivos", {
        ...quiet,
        params: { ...(desde && { desde }), ...(hasta && { hasta }), ...(motivo && { motivo }) },
      })
      .then((r) => r.data),
};
