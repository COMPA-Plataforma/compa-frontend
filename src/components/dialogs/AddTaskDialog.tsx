import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  planId: number;
}

// Agrega una actividad acordada en una sesión posterior, con la fecha de esa sesión
export function AddTaskDialog({ open, onOpenChange, estudianteId, planId }: Props) {
  const queryClient = useQueryClient();
  const [sessionDate, setSessionDate] = useState<Date | undefined>(new Date());
  const [activity, setActivity] = useState<ActivityDraft>(emptyActivity());

  const handleClose = () => {
    onOpenChange(false);
    setSessionDate(new Date());
    setActivity(emptyActivity());
  };

  const canSubmit = !!sessionDate && isActivityValid(activity, sessionDate);

  const mutation = useMutation({
    mutationFn: () =>
      habitPlanService.addTask(estudianteId, planId, {
        ...activityToPayload(activity),
        sessionDate: format(sessionDate!, "yyyy-MM-dd"),
      }),
    onSuccess: () => {
      toast.success("Tarea agregada");
      queryClient.invalidateQueries({ queryKey: ["habitPlans", estudianteId] });
      handleClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Tarea</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label>Fecha de la sesión *</Label>
            <DateField
              value={sessionDate}
              onChange={setSessionDate}
              disabled={(d) => isBefore(startOfDay(new Date()), startOfDay(d))}
            />
          </div>
          <ActivityFields value={activity} onChange={setActivity} sessionDate={sessionDate} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending ? "Agregando..." : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}