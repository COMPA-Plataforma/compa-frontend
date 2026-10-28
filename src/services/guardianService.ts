import axios from "axios";
import api from "@/lib/axiosConfig";
import type { Guardian } from "@/types";

export type GuardianPayload = Omit<Guardian, "id">;

export const guardianService = {
  // skipErrorToast: no tener acudiente es un caso esperado (400/404) y la pantalla lo muestra ella misma
  get: async (estudianteId: number): Promise<Guardian | null> => {
    try {
      const r = await api.get<Guardian>(`/api/estudiantes/${estudianteId}/guardian`, { skipErrorToast: true });
      return r.data;
    } catch (e) {
      if (axios.isAxiosError(e) && (e.response?.status === 400 || e.response?.status === 404)) return null;
      throw e;
    }
  },

  // Crea o actualiza (el backend guarda el acudiente del estudiante con el mismo PUT)
  save: (estudianteId: number, data: GuardianPayload) =>
    api.put<Guardian>(`/api/estudiantes/${estudianteId}/guardian`, data).then((r) => r.data),
};