import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  checkInService,
  BARRIER_LABELS,
  type TaskBarrier,
  type TodayTask,
  type CheckInPayload,
  type TaskResponse,
} from "@/services/checkInService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Flame, CheckCircle2, XCircle } from "lucide-react";
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

export default function CheckInPage() {
  const { id } = useParams<{ id: string }>();
  const estudianteId = Number(id);
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("emotion");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskResponses, setTaskResponses] = useState<TaskResponse[]>([]);
  const [showBarrier, setShowBarrier] = useState(false);
  const [existingCheckIn, setExistingCheckIn] = useState<any>(null);

  // Fetch today tasks
  const { data: todayTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["todayTasks", estudianteId],
    queryFn: () => checkInService.getTodayTasks(estudianteId),
    enabled: step === "tasks",
  });

  // Fetch closing
  const { data: closing, isLoading: closingLoading } = useQuery({
    queryKey: ["closing", estudianteId],
    queryFn: () => checkInService.getClosing(estudianteId),
    enabled: step === "closing",
  });

  // Submit check-in
  const submitMutation = useMutation({
    mutationFn: (payload: CheckInPayload) =>
      checkInService.submit(estudianteId, payload),
    onSuccess: () => {
      setStep("closing");
    },
    onError: async (error: any) => {
      if (error?.response?.status === 400) {
        try {
          const today = await checkInService.getToday(estudianteId);
          setExistingCheckIn(today);
        } catch {
          // no hay check-in previo
        }
        setStep("already-done");
      } else {
        toast.error("Ocurrió un error al guardar el check-in");
      }
    },
  });

  // Update check-in
  const updateMutation = useMutation({
    mutationFn: (payload: CheckInPayload) =>
      checkInService.update(estudianteId, payload),
    onSuccess: () => {
      toast.success("Check-in actualizado");
      setStep("closing");
    },
    onError: () => {
      toast.error("No se pudo actualizar el check-in");
    },
  });

  const handleEmotionNext = () => {
    if (!selectedEmotion) return;
    setStep("tasks");
  };

  const currentTask: TodayTask | undefined = todayTasks[currentTaskIndex];

  const handleTaskDone = () => {
    if (!currentTask) return;
    const response: TaskResponse = { taskId: currentTask.id, completed: true };
    const updated = [...taskResponses, response];
    setTaskResponses(updated);
    setShowBarrier(false);
    advanceOrSubmit(updated);
  };

  const handleTaskNotDone = () => {
    setShowBarrier(true);
  };

  const handleBarrierSelect = (barrier: TaskBarrier) => {
    if (!currentTask) return;
    const response: TaskResponse = {
      taskId: currentTask.id,
      completed: false,
      barrier,
    };
    const updated = [...taskResponses, response];
    setTaskResponses(updated);
    setShowBarrier(false);
    advanceOrSubmit(updated);
  };

  const advanceOrSubmit = (responses: TaskResponse[]) => {
    if (currentTaskIndex < todayTasks.length - 1) {
      setCurrentTaskIndex((i) => i + 1);
    } else {
      const payload: CheckInPayload = {
        emotionalState: selectedEmotion!,
        tasks: responses,
      };
      submitMutation.mutate(payload);
    }
  };

  const handleEditCheckIn = () => {
    setSelectedEmotion(existingCheckIn?.emotionalState ?? null);
    setCurrentTaskIndex(0);
    setTaskResponses([]);
    setShowBarrier(false);
    setStep("emotion");
  };

  const handleUpdateSubmit = () => {
    const payload: CheckInPayload = {
      emotionalState: selectedEmotion!,
      tasks: taskResponses,
    };
    updateMutation.mutate(payload);
  };

  if (!id || isNaN(estudianteId)) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        Estudiante no válido
      </p>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-4 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(`/estudiantes/${estudianteId}`)}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al estudiante
      </Button>

      {/* PASO 1: Estado emocional */}
      {step === "emotion" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              ¿Cómo te sientes hoy?
            </h2>
            <p className="text-muted-foreground">
              Selecciona el estado que mejor te represente
            </p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {Object.entries(EMOTION_MAP).map(([key, { emoji, label }]) => (
              <button
                key={key}
                onClick={() => setSelectedEmotion(key)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
                  "hover:scale-105 hover:shadow-md",
                  selectedEmotion === key
                    ? "border-primary bg-primary/10 shadow-lg scale-105"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <span className="text-4xl md:text-5xl">{emoji}</span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    selectedEmotion === key
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

          <Button
            onClick={handleEmotionNext}
            disabled={!selectedEmotion}
            className="w-full h-12 text-lg"
            size="lg"
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* PASO 2: Tareas */}
      {step === "tasks" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Tus tareas de hoy
            </h2>
            <p className="text-muted-foreground">
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
                <p className="text-muted-foreground text-lg">
                  No tienes tareas asignadas hoy.
                </p>
                <Button
                  onClick={() => {
                    const payload: CheckInPayload = {
                      emotionalState: selectedEmotion!,
                      tasks: [],
                    };
                    submitMutation.mutate(payload);
                  }}
                >
                  Completar check-in
                </Button>
              </CardContent>
            </Card>
          ) : currentTask ? (
            <Card className="overflow-hidden">
              <CardContent className="pt-8 pb-8 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {currentTask.name}
                  </h3>
                  {currentTask.description && (
                    <p className="text-muted-foreground">
                      {currentTask.description}
                    </p>
                  )}
                </div>

                {!showBarrier ? (
                  <div className="space-y-3">
                    <Button
                      onClick={handleTaskDone}
                      className="w-full h-14 text-lg gap-2"
                      size="lg"
                    >
                      <CheckCircle2 className="h-5 w-5" /> Lo hice 
                    </Button>
                    <Button
                      onClick={handleTaskNotDone}
                      variant="outline"
                      className="w-full h-12 text-base gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
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
                      {(Object.keys(BARRIER_LABELS) as TaskBarrier[]).map(
                        (value) => (
                          <Button
                            key={value}
                            variant="outline"
                            className="w-full h-11 justify-start text-left"
                            onClick={() => handleBarrierSelect(value)}
                          >
                            {BARRIER_LABELS[value]}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowBarrier(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {submitMutation.isPending && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}

      {/* PASO 3: Cierre */}
  {step === "closing" && (
    <div className="space-y-8 animate-in fade-in duration-500 text-center py-8">
      {closingLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : closing ? (
        <>
          <div className="flex flex-col items-center gap-3">
            <div className="relative flex items-center justify-center mb-2">
              <div className="absolute w-28 h-28 rounded-full bg-orange-100 animate-pulse" />
              <div className="absolute w-20 h-20 rounded-full bg-orange-200 animate-pulse delay-75" />
              <Flame className="relative h-16 w-16 text-orange-500 drop-shadow-lg" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-7xl font-extrabold text-foreground leading-none">
                {closing.streak}
              </span>
              <span className="text-xl text-muted-foreground font-medium pb-2">
                {closing.streak === 1 ? "día" : "días"}
              </span>
            </div>
            <p className="text-base font-semibold text-orange-500 tracking-wide">
              🔥 Racha actual
            </p>
          </div>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6 pb-6">
              <p className="text-lg font-medium text-foreground leading-relaxed">
                {closing.message}
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={() => navigate(`/estudiantes/${estudianteId}`)}
            className="w-full h-12 text-lg"
            size="lg"
          >
            Volver al inicio
          </Button>
        </>
      ) : null}
    </div>
  )}

      {/* Ya hizo check-in hoy */}
      {step === "already-done" && (
        <div className="space-y-6 animate-in fade-in duration-300 text-center py-8">
          <div className="space-y-3">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">
              Ya completaste tu registro de hoy
            </h2>
            {existingCheckIn && (
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Estado emocional:{" "}
                  <span className="text-2xl">
                    {EMOTION_MAP[existingCheckIn.emotionalState]?.emoji ??
                      existingCheckIn.emotionalState}
                  </span>{" "}
                  {EMOTION_MAP[existingCheckIn.emotionalState]?.label}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleEditCheckIn}
              variant="outline"
              className="w-full h-12 text-base"
            >
              Editar mi check-in
            </Button>
            <Button
              onClick={() => navigate(`/estudiantes/${estudianteId}`)}
              className="w-full h-12 text-base"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      )}

      {/* Botón de guardar edición cuando viene de already-done */}
      {step === "tasks" && existingCheckIn && (
        <Button
          onClick={handleUpdateSubmit}
          disabled={updateMutation.isPending}
          variant="outline"
          className="w-full"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Guardar cambios"
          )}
        </Button>
      )}
    </div>
  );
}