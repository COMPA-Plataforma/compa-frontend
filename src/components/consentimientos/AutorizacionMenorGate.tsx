import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CheckCircle2, Clock, Download, FileCheck2, Loader2, ShieldAlert, Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { descargarAutorizacionPdf } from "../../lib/generarAutorizacionPdf";
import { formatFecha } from "@/lib/dates";
import {
  autorizacionMenorService,
  MAX_BYTES_AUTORIZACION,
  type AutorizacionMenor,
} from "@/services/autorizacionMenorService";

interface Props {
  autorizacion: AutorizacionMenor;
  estudiante: { nombre: string; documento: string };
}

const TIPOS_OK = ["application/pdf", "image/jpeg", "image/png"];

// Pantalla única de un estudiante menor de edad mientras su autorización no esté aprobada:
// descarga el documento con los datos de su acudiente, sube el escaneado firmado y espera la revisión.
export function AutorizacionMenorGate({ autorizacion, estudiante }: Props) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [generando, setGenerando] = useState(false);

  const { estado, acudiente } = autorizacion;

  const descargar = async () => {
    setGenerando(true);
    try {
      await descargarAutorizacionPdf(
        { nombre: estudiante.nombre, tipoDocumento: "Tarjeta de identidad", documento: estudiante.documento },
        {
          nombre: acudiente ? `${acudiente.name} ${acudiente.lastName}` : undefined,
          documento: acudiente?.identityDocument,
          parentesco: acudiente?.relationship,
          telefono: acudiente?.phoneNumber,
          email: acudiente?.email,
        },
      );
    } catch {
      toast.error("No se pudo generar el documento. Inténtalo de nuevo.");
    } finally {
      setGenerando(false);
    }
  };

  const subir = useMutation({
    mutationFn: (f: File) => autorizacionMenorService.subir(f),
    onSuccess: (data) => {
      toast.success("Documento enviado. Tu psicoorientador lo va a revisar.");
      queryClient.setQueryData(["autorizacion-menor-me"], data);
      setArchivo(null);
      if (inputRef.current) inputRef.current.value = "";
    },
    onError: (err: AxiosError<{ message?: string; error?: string }>) => {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "No se pudo enviar el documento.");
    },
  });

  const elegirArchivo = (f: File | undefined) => {
    if (!f) return;
    if (!TIPOS_OK.includes(f.type)) {
      toast.error("El documento debe ser un PDF, JPG o PNG.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (f.size > MAX_BYTES_AUTORIZACION) {
      toast.error("El documento no puede superar los 5 MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setArchivo(f);
  };

  const enRevision = estado === "EN_REVISION";
  const puedeSubir = autorizacion.puedeSubir;

  return (
    <div className="space-y-4" data-testid="autorizacion-menor-gate">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Falta un paso para empezar</h2>
        <p className="text-sm text-muted-foreground">
          Como eres menor de edad, tu representante legal debe autorizar tu participación en COMPA. Cuando tu
          psicoorientador apruebe el documento, podrás usar la plataforma.
        </p>
      </div>

      {estado === "RECHAZADA" && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Tu psicoorientador no pudo aprobar el documento</AlertTitle>
          <AlertDescription>
            {autorizacion.motivoRechazo || "Revisa el documento y súbelo de nuevo."}
            <span className="mt-1 block">Corrígelo y súbelo otra vez.</span>
          </AlertDescription>
        </Alert>
      )}

      {!acudiente && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Aún no tenemos los datos de tu acudiente</AlertTitle>
          <AlertDescription>
            Pídele a tu psicoorientador que los registre. Cuando los tenga, podrás descargar el documento.
          </AlertDescription>
        </Alert>
      )}

      {enRevision ? (
        <Card>
          <CardContent className="flex items-start gap-3 py-5">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-sm">
              <p className="font-medium">Tu documento está en revisión</p>
              <p className="text-muted-foreground">
                Enviaste «{autorizacion.archivoNombre}»
                {autorizacion.subidoEn ? ` el ${formatFecha(autorizacion.subidoEn, "dd/MM/yyyy HH:mm")}` : ""}. Tu
                psicoorientador lo está revisando; cuando lo apruebe podrás entrar. Vuelve a ingresar más tarde.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                Descarga el documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Ya trae los datos que registró tu psicoorientador. Imprímelo, léelo con tu representante legal y
                fírmenlo los dos.
              </p>
              <Button variant="outline" onClick={descargar} disabled={generando || !acudiente} className="gap-2">
                {generando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Descargar autorización (PDF)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
                Sube el documento firmado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Escanéalo o tómale una foto clara. Puede ser PDF, JPG o PNG, de máximo 5 MB.
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                data-testid="autorizacion-file"
                onChange={(e) => elegirArchivo(e.target.files?.[0])}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={!puedeSubir} className="gap-2">
                  <FileCheck2 className="h-4 w-4" />
                  {archivo ? "Cambiar archivo" : "Elegir archivo"}
                </Button>
                {archivo && <span className="break-all text-muted-foreground">{archivo.name}</span>}
              </div>
              <Button
                onClick={() => archivo && subir.mutate(archivo)}
                disabled={!archivo || !puedeSubir || subir.isPending}
                className="gap-2"
              >
                {subir.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Enviar a mi psicoorientador
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Solo tu psicoorientador y tú pueden ver este documento.
      </p>
    </div>
  );
}