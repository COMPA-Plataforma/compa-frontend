import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Flame, CheckCircle2, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { patientMeService } from "@/services/patientMeService";

const EMOTION_MAP: Record<string, { emoji: string; label: string }> = {
  MUY_MAL: { emoji: "😢", label: "Muy mal" },
  MAL: { emoji: "😕", label: "Mal" },
  REGULAR: { emoji: "😐", label: "Regular" },
  BIEN: { emoji: "🙂", label: "Bien" },
  MUY_BIEN: { emoji: "😄", label: "Muy bien" },
};

export default function PatientHomePage() {
  const navigate = useNavigate();

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["patient-me"],
    queryFn: patientMeService.getMe,
  });

  const { data: closing } = useQuery({
    queryKey: ["patient-me-closing"],
    queryFn: patientMeService.getClosing,
  });

  const { data: today, isLoading: todayLoading } = useQuery({
    queryKey: ["patient-me-today"],
    queryFn: () => patientMeService.getTodayCheckIn().catch(() => null),
    retry: false,
  });

  const alreadyCheckedIn = !!today;
  const emotion = today ? EMOTION_MAP[today.emotionalState] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Saludo */}
      <div className="space-y-1">
        {meLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h1 className="text-2xl font-bold text-foreground">
            Hola, {me?.name} 👋
          </h1>
        )}
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Check-in card */}
      {todayLoading ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : alreadyCheckedIn ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 pb-6 text-center space-y-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-6xl">{emotion?.emoji ?? "✅"}</span>
              <h2 className="text-lg font-semibold text-foreground">
                Ya registraste tu día
              </h2>
              {emotion && (
                <p className="text-sm text-muted-foreground">
                  Te sentiste: {emotion.label}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => navigate("/patient/history")}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Ver historial
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/patient/check-in")}
                className="text-sm"
              >
                Editar mi check-in
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="pt-6 pb-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                ¿Cómo va tu día?
              </h2>
              <p className="text-sm text-muted-foreground">
                Aún no registras tu check-in de hoy
              </p>
            </div>
            <Button
              onClick={() => navigate("/patient/check-in")}
              className="w-full h-12 text-base gap-2"
              size="lg"
            >
              Hacer check-in de hoy
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Racha */}
      {closing && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6 pb-6 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Flame className="h-10 w-10 text-orange-500" />
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold text-foreground leading-none">
                  {closing.streak}
                </span>
                <span className="text-base text-muted-foreground font-medium pb-1">
                  {closing.streak === 1 ? "día" : "días"}
                </span>
              </div>
            </div>
            <p className="text-sm text-center text-orange-700 font-medium">
              🔥 Racha actual
            </p>
            {closing.message && (
              <p className="text-center text-sm text-foreground italic">
                "{closing.message}"
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
