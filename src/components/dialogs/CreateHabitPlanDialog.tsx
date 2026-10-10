import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { format, startOfDay, isBefore } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { habitPlanService } from "@/services/habitPlanService";
import { toast } from "sonner";
import {
  ActivityFields,
  DateField,
  activityToPayload,
  emptyActivity,
  isActivityValid,
  type ActivityDraft,
} from "@/components/dialogs/ActivityFields";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudianteId: number;
}

export function CreateHabitPlanDialog({ open, onOpenChange, estudianteId }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDate, setSessionDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [activities, setActivities] = useState<ActivityDraft[]>([emptyActivity()]);

  const reset = () => {
    setName("");
    setDescription("");
    setSessionDate(new Date());
    setStartDate(new Date());
    setEndDate(undefined);
    setActivities([emptyActivity()]);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) reset();
    onOpenChange(value);
  };

  const updateActivity = (index: number, activity: ActivityDraft) =>
    setActivities((prev) => prev.map((a, i) => (i === index ? activity : a)));

  const removeActivity = (index: number) =>
    setActivities((prev) => prev.filter((_, i) => i !== index));

  const endBeforeStart =
    !!startDate && !!endDate && isBefore(startOfDay(endDate), startOfDay(startDate));

  // Para crear el plan: datos básicos, fecha de la sesión y al menos una actividad válida
  const canSubmit =
    name.trim() !== "" &&
    !!startDate &&
    !!sessionDate &&
    !endBeforeStart &&
    activities.length > 0 &&
    activities.every((a) => isActivityValid(a, sessionDate));

  const mutation = useMutation({
    mutationFn: () =>
      habitPlanService.create(estudianteId, {
        name: name.trim(),
        description: description.trim(),
        startDate: format(startDate!, "yyyy-MM-dd"),
        ...(endDate ? { endDate: format(endDate, "yyyy-MM-dd") } : {}),
        sessionDate: format(sessionDate!, "yyyy-MM-dd"),
        tasks: activities.map(activityToPayload),
      }),
    onSuccess: () => {
      toast.success("Plan de hábitos creado");
      queryClient.invalidateQueries({ queryKey: ["habitPlans", estudianteId] });
      handleOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Plan de Hábitos</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Fecha de la sesión *</Label>
              <DateField
                value={sessionDate}
                onChange={setSessionDate}
                disabled={(d) => isBefore(startOfDay(new Date()), startOfDay(d))}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Inicio *</Label>
              <DateField value={startDate} onChange={setStartDate} />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <DateField value={endDate} onChange={setEndDate} />
            </div>
          </div>
          {endBeforeStart && (
            <p className="text-xs text-destructive -mt-2">
              La fecha de fin no puede ser anterior a la fecha de inicio.
            </p>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Actividades acordadas en la sesión *</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActivities((prev) => [...prev, emptyActivity()])}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Agregar actividad
              </Button>
            </div>

            {activities.map((activity, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Actividad {index + 1}
                  </span>
                  {activities.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeActivity(index)}
                      aria-label={`Quitar actividad ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <ActivityFields
                  value={activity}
                  onChange={(a) => updateActivity(index, a)}
                  sessionDate={sessionDate}
                />
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? "Creando..." : "Crear Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}