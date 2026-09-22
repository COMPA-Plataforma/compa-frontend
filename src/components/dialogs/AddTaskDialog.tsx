import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { habitPlanService } from "@/services/habitPlanService";
import { toast } from "sonner";

const DAYS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
const PRIORITIES = ["ALTA", "MEDIA", "BAJA"] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudianteId: number;
  planId: number;
}

export function AddTaskDialog({ open, onOpenChange, estudianteId, planId }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"ALTA" | "MEDIA" | "BAJA">("MEDIA");
  const [mandatory, setMandatory] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState<number | "">("");
  const [specificDays, setSpecificDays] = useState<string[]>([]);

  const toggleDay = (day: string) => {
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    setName("");
    setDescription("");
    setPriority("MEDIA");
    setMandatory(false);
    setWeeklyGoal("");
    setSpecificDays([]);
  };

  const mutation = useMutation({
    mutationFn: () =>
      habitPlanService.addTask(estudianteId, planId, {
        name,
        description,
        priority,
        mandatory,
        weeklyGoal: weeklyGoal === "" ? undefined : Number(weeklyGoal),
        specificDays,
      }),
    onSuccess: () => {
      toast.success("Tarea agregada");
      queryClient.invalidateQueries({ queryKey: ["habitPlans", estudianteId] });
      handleClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Tarea</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">

          {/* Nombre */}
          <div className="space-y-2">
            <Label>Nombre *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Prioridad */}
          <div className="space-y-2">
            <Label>Prioridad</Label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    priority === p
                      ? p === "ALTA" ? "bg-red-100 text-red-700 border-red-300"
                        : p === "MEDIA" ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : "bg-green-100 text-green-700 border-green-300"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Días específicos */}
          <div className="space-y-2">
            <Label>Días de la semana</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    specificDays.includes(day)
                      ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Objetivo semanal */}
          <div className="space-y-2">
            <Label>Objetivo semanal (veces por semana)</Label>
            <Input
              type="number"
              min={1}
              max={7}
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 3"
            />
          </div>

          {/* Obligatoria */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="mandatory"
              checked={mandatory}
              onChange={(e) => setMandatory(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="mandatory">Tarea obligatoria</Label>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !name || specificDays.length === 0}
          >
            {mutation.isPending ? "Agregando..." : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}