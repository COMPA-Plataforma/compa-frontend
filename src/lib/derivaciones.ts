import type { DestinoDerivacion } from "@/services/derivacionService";

export const DESTINOS: { value: DestinoDerivacion; label: string }[] = [
  { value: "EPS", label: "EPS" },
  { value: "HOSPITAL_ALMA_MATER", label: "Hospital Alma Mater" },
  { value: "OTRA", label: "Otra ruta institucional o externa" },
];

export const MAX_MOTIVO = 5000;
export const MAX_DESTINO_OTRO = 200;