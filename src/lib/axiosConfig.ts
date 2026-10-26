import axios from "axios";
import { toast } from "sonner";

declare module "axios" {
  export interface AxiosRequestConfig {
    // Si es true, el interceptor no muestra el toast de error (la pantalla lo maneja)
    skipErrorToast?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("compa_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message || error.response?.data?.error;

    // 401, o 403 sin mensaje (rechazo de seguridad: token vencido o sin permiso de rol) -> cerrar sesión.
    // Cuando /error es público, Spring responde ese rechazo con el texto genérico "Forbidden":
    // se trata igual que un 403 sin mensaje.
    // Un 403 con mensaje propio es una regla de negocio (ej. estudiante de otro orientador): no cierra sesión.
    const rechazoDeSeguridad = status === 403 && (!backendMessage || backendMessage === "Forbidden");
    if (status === 401 || rechazoDeSeguridad) {
      localStorage.removeItem("compa_token");
      localStorage.removeItem("compa_user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (!error.config?.skipErrorToast) {
      toast.error(backendMessage || error.message || "Error inesperado");
    }
    return Promise.reject(error);
  }
);

export default api;