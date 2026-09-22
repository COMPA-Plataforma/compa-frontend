import api from "@/lib/axiosConfig";

export interface ConsentTemplate {
  id: number;
  tipo: string;
  titulo: string;
  contenido: string;
  version: string;
}

export interface EstudianteConsent {
  id: number;
  aceptado: boolean;
  fechaAceptacion: string | null;
  consentTemplate: ConsentTemplate;
}

export const consentService = {
  getByEstudiante: (estudianteId: number) =>
    api.get<EstudianteConsent[]>(`/api/estudiantes/${estudianteId}/consents`)
       .then((r) => r.data),

  hasPending: (estudianteId: number) =>
    api.get<boolean>(`/api/estudiantes/${estudianteId}/consents/pending`)
       .then((r) => r.data),

  accept: (estudianteId: number, consentId: number) =>
    api.patch(`/api/estudiantes/${estudianteId}/consents/${consentId}/accept`)
       .then((r) => r.data),
};