import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/authService";

// El coordinador no tiene acceso a información individual de estudiantes:
// esta pantalla no consulta ningún endpoint.
export default function CoordinadorHomePage() {
  const user = authService.getCurrentUser();

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Bienvenido/a, {user?.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aquí verás los informes agregados y anonimizados de Bienestar Institucional. Esta
            sección estará disponible próximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
