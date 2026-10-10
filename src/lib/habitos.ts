import type { HabitTask } from "@/types";

// Texto de la frecuencia de una actividad: veces por semana y/o días específicos.
// Devuelve "" si la actividad no tiene frecuencia.
export const frecuenciaTexto = (task: Pick<HabitTask, "weeklyGoal" | "specificDays">) => {
  const partes: string[] = [];
  if (task.weeklyGoal) {
    partes.push(`${task.weeklyGoal} ${task.weeklyGoal === 1 ? "vez" : "veces"} por semana`);
  }
  if (task.specificDays && task.specificDays.length > 0) {
    partes.push(`Días: ${task.specificDays.join(", ")}`);
  }
  return partes.join(" · ");
};