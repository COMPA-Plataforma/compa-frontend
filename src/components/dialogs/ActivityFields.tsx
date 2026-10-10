import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import type { HabitTaskPayload, TaskPriority } from "@/types";

const DAYS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
const PRIORITIES: TaskPriority[] = ["ALTA", "MEDIA", "BAJA"];

// Una actividad puede no tener seguimiento, tener una fecha límite o tener una frecuencia
export type ActivityMode = "NINGUNA" | "FECHA" | "FRECUENCIA";

export interface ActivityDraft {
  name: string;
  description: string;
  priority: TaskPriority;
  mandatory: boolean;
  mode: ActivityMode;
  dueDate?: Date;
  weeklyGoal: number | "";
  specificDays: string[];
}

export const emptyActivity = (): ActivityDraft => ({
  name: "",
  description: "",
  priority: "MEDIA",
  mandatory: false,
  mode: "NINGUNA",
  dueDate: undefined,
  weeklyGoal: "",
  specificDays: [],
});

// La fecha límite no puede ser anterior a la fecha de la sesión
const dueBeforeSession = (a: ActivityDraft, sessionDate?: Date) =>
  a.mode === "FECHA" && !!a.dueDate && !!sessionDate &&
  isBefore(startOfDay(a.dueDate), startOfDay(sessionDate));

// Válida: nombre y descripción obligatorios; si se eligió fecha límite debe tenerla;
// si se eligió frecuencia debe indicar veces por semana o días.
export const isActivityValid = (a: ActivityDraft, sessionDate?: Date) => {
  if (!a.name.trim() || !a.description.trim()) return false;
  if (a.mode === "FECHA") return !!a.dueDate && !dueBeforeSession(a, sessionDate);
  if (a.mode === "FRECUENCIA") return a.weeklyGoal !== "" || a.specificDays.length > 0;
  return true;
};

// Convierte el borrador en lo que espera el backend (solo envía fecha o frecuencia, según el modo)
export const activityToPayload = (a: ActivityDraft): HabitTaskPayload => ({
  name: a.name.trim(),
  description: a.description.trim(),
  priority: a.priority,
  mandatory: a.mandatory,
  ...(a.mode === "FECHA" && a.dueDate ? { dueDate: format(a.dueDate, "yyyy-MM-dd") } : {}),
  ...(a.mode === "FRECUENCIA"
    ? {
        weeklyGoal: a.weeklyGoal === "" ? undefined : Number(a.weeklyGoal),
        specificDays: a.specificDays,
      }
    : {}),
});

// Selector de fecha con calendario
export function DateField({
  value, onChange, disabled, placeholder = "Seleccionar",
}: {
  value?: Date;
  onChange: (d: Date | undefined) => void;
  disabled?: (d: Date) => boolean;
  placeholder?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd/MM/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

const pill = (active: boolean, activeClass: string) =>
  `px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
    active ? activeClass : "bg-gray-100 text-gray-500 border-gray-200"
  }`;

// Campos de una actividad: nombre, descripción, prioridad y (opcional) fecha límite o frecuencia
export function ActivityFields({
  value, onChange, sessionDate,
}: {
  value: ActivityDraft;
  onChange: (a: ActivityDraft) => void;
  sessionDate?: Date;
}) {
  const uid = useId();
  const set = <K extends keyof ActivityDraft>(key: K, v: ActivityDraft[K]) =>
    onChange({ ...value, [key]: v });

  const toggleDay = (day: string) =>
    set(
      "specificDays",
      value.specificDays.includes(day)
        ? value.specificDays.filter((d) => d !== day)
        : [...value.specificDays, day]
    );

  return (
    <div className="grid gap-3">
      <div className="space-y-2">
        <Label htmlFor={`${uid}-name`}>Nombre *</Label>
        <Input id={`${uid}-name`} value={value.name} onChange={(e) => set("name", e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${uid}-description`}>Descripción *</Label>
        <Textarea
          id={`${uid}-description`}
          rows={2}
          value={value.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Qué debe hacer el estudiante"
        />
      </div>

      <div className="space-y-2">
        <Label>Prioridad</Label>
        <div className="flex gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("priority", p)}
              className={pill(
                value.priority === p,
                p === "ALTA" ? "bg-red-100 text-red-700 border-red-300"
                  : p === "MEDIA" ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                  : "bg-green-100 text-green-700 border-green-300"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Fecha límite o frecuencia (opcional)</Label>
        <div className="flex flex-wrap gap-2">
          {([
            ["NINGUNA", "Ninguna"],
            ["FECHA", "Fecha límite"],
            ["FRECUENCIA", "Frecuencia"],
          ] as [ActivityMode, string][]).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => set("mode", mode)}
              className={pill(value.mode === mode, "bg-blue-100 text-blue-700 border-blue-300")}
            >
              {label}
            </button>
          ))}
        </div>

        {value.mode === "FECHA" && (
          <div className="space-y-1">
            <DateField
              value={value.dueDate}
              onChange={(d) => set("dueDate", d)}
              disabled={(d) => !!sessionDate && isBefore(startOfDay(d), startOfDay(sessionDate))}
            />
            {dueBeforeSession(value, sessionDate) && (
              <p className="text-xs text-destructive">
                La fecha límite no puede ser anterior a la fecha de la sesión.
              </p>
            )}
          </div>
        )}

        {value.mode === "FRECUENCIA" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Veces por semana</Label>
              <Input
                type="number"
                min={1}
                max={7}
                value={value.weeklyGoal}
                onChange={(e) =>
                  set("weeklyGoal", e.target.value === "" ? "" : Math.min(7, Math.max(1, Number(e.target.value))))
                }
                placeholder="Ej: 3"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Días de la semana</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={pill(value.specificDays.includes(day), "bg-blue-100 text-blue-700 border-blue-300")}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`mandatory-${uid}`}
          checked={value.mandatory}
          onChange={(e) => set("mandatory", e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor={`mandatory-${uid}`}>Tarea obligatoria</Label>
      </div>
    </div>
  );
}