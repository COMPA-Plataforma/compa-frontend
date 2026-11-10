// Catálogo de motivos de consulta. Va fijo aquí porque el de /api/atenciones es solo del orientador.
export const MOTIVOS_CONSULTA: { value: string; label: string }[] = [
  { value: "BIENESTAR_EMOCIONAL", label: "Bienestar emocional" },
  { value: "DIFICULTADES_ACADEMICAS", label: "Dificultades académicas" },
  { value: "RELACIONES_INTERPERSONALES", label: "Relaciones interpersonales" },
  { value: "SITUACIONES_FAMILIARES", label: "Situaciones familiares" },
  { value: "ADAPTACION_PERMANENCIA", label: "Adaptación y permanencia universitaria" },
  { value: "PROYECTO_VIDA_VOCACIONAL", label: "Proyecto de vida y orientación vocacional" },
  { value: "SALUD_MENTAL_SEGUIMIENTO", label: "Salud mental y seguimiento" },
  { value: "VIOLENCIAS_GENERO_SEXUALES", label: "Violencias basadas en género y violencias sexuales" },
  { value: "OTROS_MOTIVOS", label: "Otros motivos de orientación" },
];
