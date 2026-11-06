import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFecha } from "@/lib/dates";
import { autorizacionMenorService } from "@/services/autorizacionMenorService";

// Documentos de autorización de menores que esperan revisión del psicoorientador.
// No se muestra si no hay ninguno.
export function AutorizacionesPendientesCard() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["autorizaciones-pendientes"],
    queryFn: autorizacionMenorService.pendientes,
  });

  if (!data || data.length === 0) return null;

  return (
    <Card className="border-amber-400" data-testid="autorizaciones-pendientes">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileCheck2 className="h-4 w-4 text-amber-600" />
          Autorizaciones por revisar ({data.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map((a) => (
          <div key={a.estudianteId} className="flex items-center justify-between gap-2 text-sm">
            <div>
              <p className="font-medium">{a.estudianteNombre}</p>
              {a.subidoEn && <p className="text-xs text-muted-foreground">Enviado el {formatFecha(a.subidoEn, "dd/MM/yyyy HH:mm")}</p>}
            </div>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/estudiantes/${a.estudianteId}`)}>
              Revisar <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}