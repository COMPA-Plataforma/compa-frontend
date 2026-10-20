export type Role = "ORIENTADOR" | "ESTUDIANTE" | "COORDINADOR_BIENESTAR" | "ADMINISTRADOR";

export const ROLE_LABELS: Record<Role, string> = {
  ORIENTADOR: "Psicoorientador",
  ESTUDIANTE: "Estudiante",
  COORDINADOR_BIENESTAR: "Coordinador de Bienestar",
  ADMINISTRADOR: "Administrador",
};

// Pantalla de inicio de cada rol. Un rol desconocido vuelve al login.
export const homeByRole = (role: string | null | undefined): string => {
  switch (role) {
    case "ORIENTADOR":
      return "/dashboard";
    case "ESTUDIANTE":
      return "/estudiante/home";
    case "ADMINISTRADOR":
      return "/admin/users";
    case "COORDINADOR_BIENESTAR":
      return "/coordinador";
    default:
      return "/login";
  }
};
