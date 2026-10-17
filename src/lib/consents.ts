// Nombres legibles para los tipos de consentimiento que envía el backend.
const TIPO_LABELS: Record<string, string> = {
  MEDICO: "Acompañamiento psicoorientador",
  DATOS_PERSONALES: "Datos personales",
};

export const consentTipoLabel = (tipo: string) => TIPO_LABELS[tipo] ?? tipo;

// "v1.0" -> "1.0"
export const formatConsentVersion = (version: string) => version.replace(/^v/i, "");
