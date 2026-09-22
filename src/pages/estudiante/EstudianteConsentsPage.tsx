import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { patientMeService } from "@/services/patientMeService";

export default function PatientConsentsPage() {
  const queryClient = useQueryClient();

  const { data: consents = [], isLoading } = useQuery({
    queryKey: ["me-consents"],
    queryFn: patientMeService.getConsents,
  });

  const acceptMutation = useMutation({
    mutationFn: (consentId: number) => patientMeService.acceptConsent(consentId),
    onSuccess: () => {
      toast.success("Consentimiento aceptado");
      queryClient.invalidateQueries({ queryKey: ["me-consents"] });
    },
    onError: () => toast.error("No se pudo aceptar el consentimiento"),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Mis consentimientos</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Documentos legales y de tratamiento
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : consents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              No tienes consentimientos por revisar.
            </p>
          </CardContent>
        </Card>
      ) : (
        consents.map((consent) => (
          <Card key={consent.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{consent.consentTemplate.titulo}</CardTitle>
                {consent.aceptado ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Aceptado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    Pendiente
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Versión {consent.consentTemplate.version} · {consent.consentTemplate.tipo}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground whitespace-pre-line line-clamp-6">
                {consent.consentTemplate.contenido}
              </p>

              {consent.aceptado ? (
                consent.fechaAceptacion && (
                  <p className="text-xs text-muted-foreground">
                    Aceptado el{" "}
                    {new Date(consent.fechaAceptacion).toLocaleDateString("es-ES", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                )
              ) : (
                <Button
                  onClick={() => acceptMutation.mutate(consent.id)}
                  disabled={acceptMutation.isPending}
                  className="w-full"
                >
                  {acceptMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Aceptar"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
