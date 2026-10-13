import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { atencionService } from "@/services/atencionService";
import { CAMPOS_ANAMNESIS, MAX_CAMPO, type CampoAnamnesis } from "@/lib/atencion";
import type { Atencion } from "@/types";

const MAX_OTRO = 200;

type Textos = Record<CampoAnamnesis, string>;
const textosVacios = (): Textos =>
  Object.fromEntries(CAMPOS_ANAMNESIS.map((c) => [c.key, ""])) as Textos;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudianteId: number;
  existing: Atencion | null;
}

// Campo de texto libre con contador de caracteres
function CampoTexto({
  id, label, required, rows, value, onChange,
}: {
  id: string;
  label: string;
  required: boolean;
  rows: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? " *" : <span className="text-muted-foreground font-normal"> (opcional)</span>}
      </Label>
      <Textarea id={id} rows={rows} maxLength={MAX_CAMPO} value={value} onChange={(e) => onChange(e.target.value)} />
      <p className="text-xs text-muted-foreground text-right">{value.length}/{MAX_CAMPO}</p>
    </div>
  );
}

export function AtencionDialog({ open, onOpenChange, estudianteId, existing }: Props) {
  const queryClient = useQueryClient();
  const [textos, setTextos] = useState<Textos>(textosVacios());
  const [motivos, setMotivos] = useState<string[]>([]);
  const [motivoOtro, setMotivoOtro] = useState("");

  const { data: catalogo = [] } = useQuery({
    queryKey: ["atencionMotivos"],
    queryFn: () => atencionService.motivos(),
    enabled: open,
    staleTime: Infinity,
  });

  // Cargar los valores actuales al abrir
  useEffect(() => {
    if (!open) return;
    setTextos(
      Object.fromEntries(
        CAMPOS_ANAMNESIS.map((c) => [c.key, existing?.[c.key] ?? ""])
      ) as Textos
    );
    setMotivos(existing?.motivos.map((m) => m.codigo) ?? []);
    setMotivoOtro(existing?.motivoOtro ?? "");
  }, [open, existing]);

  // ¿Hay cambios respecto a lo guardado? (el backend rechaza guardar sin cambios)
  const dirty = useMemo(() => {
    if (!existing) return true;
    const antes = [...existing.motivos.map((m) => m.codigo)].sort().join(",");
    const ahora = [...motivos].sort().join(",");
    return (
      CAMPOS_ANAMNESIS.some((c) => textos[c.key].trim() !== (existing[c.key] ?? "")) ||
      antes !== ahora ||
      motivoOtro.trim() !== (existing.motivoOtro ?? "")
    );
  }, [existing, textos, motivos, motivoOtro]);

  const toggleMotivo = (codigo: string, checked: boolean) =>
    setMotivos((prev) => (checked ? [...prev, codigo] : prev.filter((c) => c !== codigo)));

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...(Object.fromEntries(
          CAMPOS_ANAMNESIS.map((c) => [c.key, textos[c.key].trim()])
        ) as Textos),
        motivos,
        motivoOtro: motivoOtro.trim(),
      };
      return existing
        ? atencionService.update(estudianteId, payload)
        : atencionService.register(estudianteId, payload);
    },
    onSuccess: () => {
      toast.success(existing ? "Atención actualizada" : "Atención registrada");
      queryClient.invalidateQueries({ queryKey: ["atencion", estudianteId] });
      queryClient.invalidateQueries({ queryKey: ["atencionHistorial", estudianteId] });
      onOpenChange(false);
    },
  });

  const canSave = textos.entrevistaRecepcion.trim().length > 0 && dirty && !mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Actualizar" : "Registrar"} atención</DialogTitle>
          <DialogDescription>
            {existing
              ? "Puedes completar o corregir la atención en cualquier sesión. Cada cambio queda en el historial con fecha y autor."
              : "Al registrar la primera atención, el estudiante queda asignado a ti."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Anamnesis</h3>
            {CAMPOS_ANAMNESIS.filter((c) => c.key !== "impresionDiagnostica").map((c) => (
              <CampoTexto
                key={c.key}
                id={c.key}
                label={c.label}
                required={c.required}
                rows={c.rows}
                value={textos[c.key]}
                onChange={(v) => setTextos((prev) => ({ ...prev, [c.key]: v }))}
              />
            ))}
          </div>

          <div className="space-y-2">
            <Label>Motivos de consulta</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {catalogo.map((m) => (
                <label key={m.codigo} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={motivos.includes(m.codigo)}
                    onCheckedChange={(c) => toggleMotivo(m.codigo, c === true)}
                  />
                  {m.nombre}
                </label>
              ))}
            </div>
            <div className="space-y-1 pt-1">
              <Label htmlFor="motivoOtro" className="text-sm">Otro</Label>
              <Input
                id="motivoOtro"
                maxLength={MAX_OTRO}
                value={motivoOtro}
                onChange={(e) => setMotivoOtro(e.target.value)}
                placeholder="Otro motivo (opcional)"
              />
            </div>
            <p className="text-xs text-muted-foreground">Puedes dejar los motivos en blanco.</p>
          </div>

          {CAMPOS_ANAMNESIS.filter((c) => c.key === "impresionDiagnostica").map((c) => (
            <CampoTexto
              key={c.key}
              id={c.key}
              label={c.label}
              required={false}
              rows={c.rows}
              value={textos[c.key]}
              onChange={(v) => setTextos((prev) => ({ ...prev, [c.key]: v }))}
            />
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSave}>
            {mutation.isPending ? "Guardando..." : existing ? "Guardar cambios" : "Registrar atención"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}