import type { SeguimientoPayload } from "@/types";

export type MarcaSeguimiento = keyof Omit<SeguimientoPayload, "fecha" | "descripcion">;

// Casillas de asistencia (primera fila del formulario)
export const MARCAS_ASISTENCIA: { key: MarcaSeguimiento; label: string }[] = [
  { key: "faltoCita", label: "Faltó a la cita" },
  { key: "faltoPrimeraCita", label: "Faltó a la primera cita" },
  { key: "canceladaEstudiante", label: "Cita cancelada por el estudiante" },
  { key: "canceladaDepartamento", label: "Cita cancelada por el Departamento" },
  { key: "citaVirtual", label: "Cita virtual" },
];

// Casillas de proceso (segunda fila)
export const MARCAS_PROCESO: { key: MarcaSeguimiento; label: string }[] = [
  { key: "primeraVez", label: "Primera vez" },
  { key: "cierreProceso", label: "Cierre de proceso" },
  { key: "remision", label: "Remisión" },
];

export const MARCAS = [...MARCAS_ASISTENCIA, ...MARCAS_PROCESO];

export const MAX_REGISTRO = 5000;