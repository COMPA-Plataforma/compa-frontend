import { format } from "date-fns";

// Convierte una fecha sin hora (ej. "2026-10-09") en fecha local. Con new Date directo,
// la zona horaria la correría un día atrás.
export const parseFecha = (d: string): Date =>
  /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T00:00:00`) : new Date(d);

// Formatea una fecha del backend; devuelve "" si no hay fecha.
export const formatFecha = (d: string | null | undefined, pattern = "dd/MM/yyyy") =>
  d ? format(parseFecha(d), pattern) : "";