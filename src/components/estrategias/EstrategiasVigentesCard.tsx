import { useQuery } from "@tanstack/react-query";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { estrategiaService } from "@/services/estrategiaService";
import { formatFecha } from "@/lib/dates";

// Lo que el estudiante ve dentro de su plan: las estrategias vigentes que trabajó con su psicoorientador
export function EstrategiasVigentesCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me-estrategias"],
    queryFn: estrategiaService.vigentesMias,
    retry: false,
  });

  if (isError) return null;

  return (
    <div className="space-y-2" data-testid="estrategias-vigentes">
      <h2 className="px-1 text-sm font-semibold text-foreground">
        Estrategias que trabajamos en sesión{data ? ` (${data.length})` : ""}
      </h2>
      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-lg" />
      ) : !data || data.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Aún no hay estrategias registradas en tu plan.
          </CardContent>
        </Card>
      ) : (
        data.map((e) => (
          <Card key={e.id}>
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                Sesión del {formatFecha(e.fechaSesion)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm text-muted-foreground">{e.descripcion}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}