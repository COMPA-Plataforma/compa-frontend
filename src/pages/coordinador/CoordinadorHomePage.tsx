import { InformeMotivosSection } from "@/components/informes/InformeMotivosSection";
import { authService } from "@/services/authService";

// El coordinador solo consulta informes agregados y anonimizados:
// nunca información individual de estudiantes.
export default function CoordinadorHomePage() {
  const user = authService.getCurrentUser();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bienvenido/a, {user?.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informes agregados y anonimizados de Bienestar Institucional.
        </p>
      </div>

      <InformeMotivosSection />
    </div>
  );
}
