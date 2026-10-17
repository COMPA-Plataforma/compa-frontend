import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { estudianteMeService } from "@/services/estudianteMeService";
import type { EstudianteConsent } from "@/services/consentService";
import { consentTipoLabel, formatConsentVersion } from "@/lib/consents";

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function PendingConsentCard({ consent }: { consent: EstudianteConsent }) {
  const queryClient = useQueryClient();
  const [checked, setChecked] = useState(false);
  const checkboxId = `consent-${consent.id}`;

  const acceptMutation = useMutation({
    mutationFn: () => estudianteMeService.acceptConsent(consent.id),
    onSuccess: () => {
      toast.success("Consentimiento aceptado");
      queryClient.invalidateQueries({ queryKey: ["me-consents-pending"] });
      queryClient.invalidateQueries({ queryKey: ["me-consents"] });
    },
    onError: () => toast.error("No se pudo aceptar el consentimiento"),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{consent.consentTemplate.titulo}</CardTitle>
        <p className="text-xs text-muted-foreground">
          Versión {formatConsentVersion(consent.consentTemplate.version)} · {consentTipoLabel(consent.consentTemplate.tipo)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground whitespace-pre-line">
          {consent.consentTemplate.contenido}
        </p>

        <div className="flex items-center gap-2">
          <Checkbox
            id={checkboxId}
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
            disabled={acceptMutation.isPending}
          />
          <Label htmlFor={checkboxId} className="text-sm cursor-pointer">
            He leído y acepto
          </Label>
        </div>

        <Button
          onClick={() => acceptMutation.mutate()}
          disabled={!checked || acceptMutation.isPending}
          className="w-full"
        >
          {acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aceptar"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ConsentGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const pendingQuery = useQuery({
    queryKey: ["me-consents-pending"],
    queryFn: estudianteMeService.hasPendingConsents,
  });

  const hasPending = pendingQuery.data === true;

  const consentsQuery = useQuery({
    queryKey: ["me-consents"],
    queryFn: estudianteMeService.getConsents,
    enabled: hasPending,
  });

  const handleReject = () => {
    authService.logout();
    toast.error(
      "Sin aceptar el consentimiento informado no puedes usar la plataforma."
    );
    navigate("/login", { replace: true });
  };

  if (pendingQuery.isLoading) return <FullScreenSpinner />;

  if (pendingQuery.isError || consentsQuery.isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <p className="text-sm text-muted-foreground">
          No se pudieron verificar tus consentimientos.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            pendingQuery.refetch();
            if (hasPending) consentsQuery.refetch();
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (!hasPending) return <>{children}</>;

  if (consentsQuery.isLoading) return <FullScreenSpinner />;

  const pending = (consentsQuery.data ?? []).filter((c) => !c.aceptado);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">Consentimiento informado</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Para continuar debes leer y aceptar los siguientes documentos.
          </p>
        </div>

        {pending.map((consent) => (
          <PendingConsentCard key={consent.id} consent={consent} />
        ))}

        <Button variant="ghost" onClick={handleReject} className="w-full text-destructive">
          No acepto
        </Button>
      </main>
    </div>
  );
}
