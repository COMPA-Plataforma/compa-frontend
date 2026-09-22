import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BARRIER_LABELS,
  type TaskBarrier,
  type TodayTask,
  type CheckInPayload,
  type TaskResponse,
} from "@/services/checkInService";
import { patientMeService } from "@/services/patientMeService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Flame, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const EMOTION_MAP: Record<string, { emoji: string; label: string }> = {
  MUY_MAL: { emoji: "😢", label: "Muy mal" },
  MAL: { emoji: "😕", label: "Mal" },
  REGULAR: { emoji: "😐", label: "Regular" },
  BIEN: { emoji: "🙂", label: "Bien" },
  MUY_BIEN: { emoji: "😄", label: "Muy bien" },
};

type Step = "emotion" | "tasks" | "closing" | "already-done";

export default function PatientCheckInPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("emotion");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskResponses, setTaskResponses] = useState<TaskResponse[]>([]);
  const [showBarrier, setShowBarrier] = useState(false);
  const [existingCheckIn, setExistingCheckIn] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { data: todayTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["me-todayTasks"],
    queryFn: patientMeService.getTodayTasks,
    enabled: step === "tasks",
  });

  const { data: closing, isLoading: closingLoading } = useQuery({
    queryKey: ["me-closing-checkin"],
    queryFn: patientMeService.getClosing,
    enabled: step === "closing",
  });

  const submitMutation = useMutation({
    mutationFn: (payload: CheckInPayload) => patientMeService.createCheckIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-me-today"] });
      queryClient.invalidateQueries({ queryKey: ["patient-me-closing"] });
      setStep("closing");
    },
    onError: async (error: any) => {
      if (error?.response?.status === 400) {
        try {
          const today = await patientMeService.getTodayCheckIn();
          setExistingCheckIn(today);
        } catch { /* noop */ }
        setStep("already-done");
      } else {
        toast.error("Ocurrió un error al guardar el check-in");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CheckInPayload) => patientMeService.updateCheckIn(payload),
    onSuccess: () => {
      toast.success("Check-in actualizado");
      queryClient.invalidateQueries({ queryKey: ["patient-me-today"] });
      setStep("closing");
    },
    onError: () => toast.error("No se pudo actualizar el check-in"),
  });

  // Detectar al inicio si ya hay check-in hoy
  useQuery({
    queryKey: ["me-today-check"],
    queryFn: async () => {
      try {
        const today = await patientMeService.getTodayCheckIn();
        if (today && step === "emotion" && !isEditing) {
          setExistingCheckIn(today);
          setStep("already-done");
        }
        return today;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const currentTask: TodayTask | undefined = todayTasks[currentTaskIndex];

  const advanceOrSubmit = (responses: TaskResponse[]) => {
    if (currentTaskIndex < todayTasks.length - 1) {
      setCurrentTaskIndex((i) => i + 1);
    } else {
      const payload: CheckInPayload = {
        emotionalState: selectedEmotion!,
        tasks: responses,
      };
      if (isEditing) updateMutation.mutate(payload);
      else submitMutation.mutate(payload);
    }
  };

  const handleTaskDone = () => {
    if (!currentTask) return;
    const updated = [...taskResponses, { taskId: currentTask.id, completed: true }];
    setTaskResponses(updated);
    setShowBarrier(false);
    advanceOrSubmit(updated);
  };

  const handleBarrierSelect = (barrier: TaskBarrier) => {
    if (!currentTask) return;
    const updated = [...taskResponses, { taskId: currentTask.id, completed: false, barrier }];
    setTaskResponses(updated);
    setShowBarrier(false);
    advanceOrSubmit(updated);
  };

  const handleEditCheckIn = () => {
    setIsEditing(true);
    setSelectedEmotion(existingCheckIn?.emotionalState ?? null);
    setCurrentTaskIndex(0);
    setTaskResponses([]);
    setShowBarrier(false);
    setStep("emotion");
  };

  return (
    <div className="space-y-6">
      {/* PASO 1 */}
      {step === "emotion" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              ¿Cómo te sientes hoy?
            </h2>
            <p className="text-muted-foreground text-sm">
              Selecciona el estado que mejor te represente
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {Object.entries(EMOTION_MAP).map(([key, { emoji, label }]) => (
              <button
                key={key}
                onClick={() => setSelectedEmotion(key)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                  "hover:scale-105",
                  selectedEmotion === key
                    ? "border-primary bg-primary/10 scale-105"
                    : "border-border bg-card"
                )}
              >
                <span className="text-3xl">{emoji}</span>
                <span className={cn(
                  "text-[10px] font-medium leading-tight text-center",
                  selectedEmotion === key ? "text-primary" : "text-muted-foreground"
                )}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          <Button
            onClick={() => selectedEmotion && setStep("tasks")}
            disabled={!selectedEmotion}
            className="w-full h-12 text-base"
            size="lg"
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* PASO 2 */}
      {step === "tasks" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-foreground">Tus tareas de hoy</h2>
            <p className="text-sm text-muted-foreground">
              Tarea {currentTaskIndex + 1} de {todayTasks.length}
            </p>
            <Progress
              value={(currentTaskIndex / Math.max(todayTasks.length, 1)) * 100}
              className="h-2"
            />
          </div>

          {tasksLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : todayTasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <p className="text-muted-foreground">No tienes tareas asignadas hoy.</p>
                <Button onClick={() => {
                  const payload: CheckInPayload = { emotionalState: selectedEmotion!, tasks: [] };
                  if (isEditing) updateMutation.mutate(payload);
                  else submitMutation.mutate(payload);
                }}>
                  Completar check-in
                </Button>
              </CardContent>
            </Card>
          ) : currentTask ? (
            <Card>
              <CardContent className="pt-6 pb-6 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-foreground">{currentTask.name}</h3>
                  {currentTask.description && (
                    <p className="text-sm text-muted-foreground">{currentTask.description}</p>
                  )}
                </div>

                {!showBarrier ? (
                  <div className="space-y-3">
                    <Button onClick={handleTaskDone} className="w-full h-14 text-base gap-2" size="lg">
                      <CheckCircle2 className="h-5 w-5" /> Lo hice
                    </Button>
                    <Button
                      onClick={() => setShowBarrier(true)}
                      variant="outline"
                      className="w-full h-12 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                      size="lg"
                    >
                      <XCircle className="h-5 w-5" /> No pude
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-200">
                    <p className="text-sm font-medium text-muted-foreground text-center">
                      ¿Qué te impidió hacerlo?
                    </p>
                    <div className="grid gap-2">
                      {(Object.keys(BARRIER_LABELS) as TaskBarrier[]).map((value) => (
                        <Button
                          key={value}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleBarrierSelect(value)}
                        >
                          {BARRIER_LABELS[value]}
                        </Button>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowBarrier(false)}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {(submitMutation.isPending || updateMutation.isPending) && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}

      {/* PASO 3 — Cierre */}
      {step === "closing" && (
        <div className="space-y-6 animate-in fade-in duration-500 text-center py-8">
          {closingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : closing ? (
            <>
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex items-center justify-center mb-2">
                  <div className="absolute w-24 h-24 rounded-full bg-orange-100 animate-pulse" />
                  <Flame className="relative h-14 w-14 text-orange-500" />
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-extrabold text-foreground leading-none">
                    {closing.streak}
                  </span>
                  <span className="text-lg text-muted-foreground pb-2">
                    {closing.streak === 1 ? "día" : "días"}
                  </span>
                </div>
                <p className="text-sm font-semibold text-orange-500">🔥 Racha actual</p>
              </div>

              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-6 pb-6">
                  <p className="text-base font-medium text-foreground">{closing.message}</p>
                </CardContent>
              </Card>

              <Button onClick={() => navigate("/patient/home")} className="w-full h-12" size="lg">
                Volver al inicio
              </Button>
            </>
          ) : null}
        </div>
      )}

      {/* Ya hizo check-in */}
      {step === "already-done" && (
        <div className="space-y-6 animate-in fade-in duration-300 text-center py-8">
          <div className="space-y-3">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">
              Ya completaste tu registro de hoy
            </h2>
            {existingCheckIn && EMOTION_MAP[existingCheckIn.emotionalState] && (
              <p className="text-muted-foreground">
                Estado emocional:{" "}
                <span className="text-2xl">
                  {EMOTION_MAP[existingCheckIn.emotionalState].emoji}
                </span>{" "}
                {EMOTION_MAP[existingCheckIn.emotionalState].label}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleEditCheckIn} variant="outline" className="w-full h-12">
              Editar mi check-in
            </Button>
            <Button onClick={() => navigate("/patient/home")} className="w-full h-12">
              Volver al inicio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
