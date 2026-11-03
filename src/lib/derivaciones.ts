import type { DestinoDerivacion, EstadoDerivacion } from "@/services/derivacionService";

export const DESTINOS: { value: DestinoDerivacion; label: string }[] = [
  { value: "EPS", label: "EPS" },
  { value: "HOSPITAL_ALMA_MATER", label: "Hospital Alma Mater" },
  { value: "OTRA", label: "Otra ruta institucional o externa" },
];

export const MAX_MOTIVO = 5000;
export const MAX_DESTINO_OTRO = 200;
export const MAX_DESCRIPCION = 5000;

export const ESTADOS_DERIVACION: { value: EstadoDerivacion; label: string }[] = [
  { value: "DERIVADO", label: "Derivado" },
  { value: "EN_ESPERA", label: "En espera" },
  { value: "ACEPTADO", label: "Aceptado" },
  { value: "CITA_ASIGNADA", label: "Cita asignada" },
  { value: "EN_ATENCION", label: "En atención" },
];

// Qué significa cada estado para el estudiante, en lenguaje sencillo
export const FRASE_ESTADO_DERIVACION: Record<EstadoDerivacion, string> = {
  DERIVADO: "Tu psicoorientador envió tu caso a esta ruta de atención.",
  EN_ESPERA: "Tu caso está en espera de respuesta.",
  ACEPTADO: "Tu caso fue aceptado por la ruta de atención.",
  CITA_ASIGNADA: "Ya tienes una cita asignada. Revisa los detalles con tu psicoorientador.",
  EN_ATENCION: "Ya estás siendo atendido/a en esta ruta.",
};

// Fondos suaves por estado: "En espera" pide atención y "En atención" es el más avanzado
export const ESTADO_DERIVACION_BADGE: Record<EstadoDerivacion, string> = {
  DERIVADO: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
  EN_ESPERA: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  ACEPTADO: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  CITA_ASIGNADA: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  EN_ATENCION: "bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700",
};