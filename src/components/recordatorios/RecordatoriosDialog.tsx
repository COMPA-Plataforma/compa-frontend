import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  recordatorioService,
  type DiaSemana,
  type FrecuenciaRecordatorio,
} from "@/services/recordatorioService";

const DIAS: { valor: DiaSemana; corto: string; largo: string }[] = [
  { valor: "MONDAY", corto: "L", largo: "Lunes" },
  { valor: "TUESDAY", corto: "M", largo: "Martes" },
  { valor: "WEDNESDAY", corto: "X", largo: "Miércoles" },
  { valor: "THURSDAY", corto: "J", largo: "Jueves" },
  { valor: "FRIDAY", corto: "V", largo: "Viernes" },
  { valor: "SATURDAY", corto: "S", largo: "Sábado" },
  { valor: "SUNDAY", corto: "D", largo: "Domingo" },
];

// "20:00" -> "8:00 p. m."
function formatoHora(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const sufijo = h >= 12 ? "p. m." : "a. m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

function mensajeError(e: unknown) {
  const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return msg || "No se pudo guardar la configuración.";
}

interface Props {
  abierto: boolean;
  setAbierto: (v: boolean) => void;
}

export function RecordatoriosDialog({ abierto, setAbierto }: Props) {
  const qc = useQueryClient();
  const [hora, setHora] = useState("20:00");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaRecordatorio>("DIARIA");
  const [dias, setDias] = useState<DiaSemana[]>([]);

  const { data: config, isLoading } = useQuery({
    queryKey: ["recordatorios-me"],
    queryFn: recordatorioService.obtener,
    enabled: abierto,
  });

  // cada vez que se abre o llega la config, cargo el formulario
  useEffect(() => {
    if (!config) return;
    setHora(config.hora);
    setFrecuencia(config.frecuencia);
    setDias(config.dias ?? []);
  }, [config, abierto]);

  const onGuardado = (c: typeof config, texto: string) => {
    qc.setQueryData(["recordatorios-me"], c);
    toast.success(texto);
    setAbierto(false);
  };

  const guardar = useMutation({
    mutationFn: () => recordatorioService.guardar({ hora, frecuencia, dias: frecuencia === "DIARIA" ? [] : dias }),
    onSuccess: (c) => onGuardado(c, "Listo, tus recordatorios quedaron actualizados."),
    onError: (e) => toast.error(mensajeError(e)),
  });

  const restablecer = useMutation({
    mutationFn: recordatorioService.restablecer,
    onSuccess: (c) => onGuardado(c, "Volvimos a la hora predeterminada."),
    onError: (e) => toast.error(mensajeError(e)),
  });

  const horaInvalida = !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora) || Number(hora.split(":")[1]) % 15 !== 0;
  const sinDias = frecuencia === "DIAS_ESPECIFICOS" && dias.length === 0;
  const ocupado = guardar.isPending || restablecer.isPending;

  const toggleDia = (d: DiaSemana) =>
    setDias((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  return (
    <>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>⏰ Mis recordatorios</DialogTitle>
            <DialogDescription>
              Elige a qué hora y en qué días quieres que te avisemos para reportar tus actividades.
            </DialogDescription>
          </DialogHeader>

          {isLoading || !config ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="rec-hora">Hora</Label>
                  {config.predeterminada && <Badge variant="secondary">Predeterminada</Badge>}
                </div>
                <Input
                  id="rec-hora"
                  type="time"
                  step={900}
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-36"
                />
                {horaInvalida ? (
                  <p className="text-xs text-destructive">
                    Elige una hora en punto o a y 15, 30 o 45 (ej. 8:15 p. m.).
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Te llegará a las {formatoHora(hora)} (la hora por defecto es {formatoHora(config.horaPredeterminada)})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <RadioGroup
                  value={frecuencia}
                  onValueChange={(v) => setFrecuencia(v as FrecuenciaRecordatorio)}
                  className="gap-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="DIARIA" id="rec-diaria" />
                    <Label htmlFor="rec-diaria" className="font-normal">Todos los días</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="DIAS_ESPECIFICOS" id="rec-dias" />
                    <Label htmlFor="rec-dias" className="font-normal">Solo algunos días</Label>
                  </div>
                </RadioGroup>

                {frecuencia === "DIAS_ESPECIFICOS" && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1.5">
                      {DIAS.map((d) => {
                        const activo = dias.includes(d.valor);
                        return (
                          <button
                            key={d.valor}
                            type="button"
                            onClick={() => toggleDia(d.valor)}
                            aria-pressed={activo}
                            aria-label={d.largo}
                            title={d.largo}
                            className={cn(
                              "h-9 w-9 rounded-full border text-sm font-medium transition-colors",
                              activo
                                ? "border-primary bg-primary text-primary-foreground"
                                : "bg-background text-muted-foreground hover:bg-accent"
                            )}
                          >
                            {d.corto}
                          </button>
                        );
                      })}
                    </div>
                    {sinDias && (
                      <p className="text-xs text-destructive">Elige al menos un día.</p>
                    )}
                  </div>
                )}
              </div>

              <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                El cambio aplica desde tu próximo recordatorio. Solo te avisamos si todavía te quedan
                actividades por reportar ese día.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              disabled={ocupado || !config || config.predeterminada}
              onClick={() => restablecer.mutate()}
            >
              {restablecer.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Restablecer
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAbierto(false)} disabled={ocupado}>
                Cancelar
              </Button>
              <Button
                onClick={() => guardar.mutate()}
                disabled={ocupado || !config || horaInvalida || sinDias}
              >
                {guardar.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}