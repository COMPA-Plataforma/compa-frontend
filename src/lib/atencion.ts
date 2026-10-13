// Campos de texto libre de la anamnesis, en el orden en que se muestran y se llenan.
// La entrevista de recepción es la única obligatoria al registrar la atención.
export const CAMPOS_ANAMNESIS = [
  { key: "entrevistaRecepcion", label: "Entrevista de recepción", required: true, rows: 6 },
  { key: "situacionActual", label: "Identificación y descripción de la situación actual (aspectos relevantes)", required: false, rows: 4 },
  { key: "antecedentes", label: "Antecedentes", required: false, rows: 4 },
  { key: "aspectosPsicosociales", label: "Aspectos psicosociales y redes de apoyo", required: false, rows: 4 },
  { key: "relacionesFamiliares", label: "Relaciones familiares", required: false, rows: 4 },
  { key: "observacionesSalud", label: "Observaciones (aseguramiento en salud)", required: false, rows: 3 },
  { key: "impresionDiagnostica", label: "Impresión diagnóstica", required: false, rows: 3 },
] as const;

export type CampoAnamnesis = (typeof CAMPOS_ANAMNESIS)[number]["key"];

// Máximo de caracteres por campo (el mismo que valida el backend)
export const MAX_CAMPO = 5000;