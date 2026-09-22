import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckInHistoryViewToggle,
  type CheckInHistoryView,
} from "@/components/check-in-history/CheckInHistoryViewToggle";
import { CheckInHistoryCalendar } from "@/components/check-in-history/CheckInHistoryCalendar";
import { CheckInHistoryList } from "@/components/check-in-history/CheckInHistoryList";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { patientMeService } from "@/services/patientMeService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const EMOTION_MAP: Record<string, { emoji: string; label: string }> = {
  MUY_MAL: { emoji: "😢", label: "Muy mal" },
  MAL: { emoji: "😕", label: "Mal" },
  REGULAR: { emoji: "😐", label: "Regular" },
  BIEN: { emoji: "🙂", label: "Bien" },
  MUY_BIEN: { emoji: "😄", label: "Muy bien" },
};

function MessageState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}

export default function PatientHistoryPage() {
  const [view, setView] = useState<CheckInHistoryView>("calendar");
  const [selectedCheckInId, setSelectedCheckInId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: summaries = [], isLoading, isError } = useQuery({
    queryKey: ["me-checkInLast30"],
    queryFn: patientMeService.getLast30Days,
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["me-checkInDetail", selectedCheckInId],
    queryFn: () => patientMeService.getCheckInDetail(selectedCheckInId!),
    enabled: detailOpen && selectedCheckInId !== null,
  });

  const sortedSummaries = useMemo(
    () => [...summaries].sort((a, b) => b.date.localeCompare(a.date)),
    [summaries]
  );

  const handleOpenDetail = (checkInId: number | null) => {
    if (checkInId === null) return;
    setSelectedCheckInId(checkInId);
    setDetailOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="space-y-3 py-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      );
    }
    if (isError) return <MessageState message="Error al cargar el historial." />;
    if (summaries.length === 0)
      return <MessageState message="Aún no hay registros en los últimos 30 días." />;

    if (view === "calendar") {
      return <CheckInHistoryCalendar summaries={summaries} onOpenDetail={handleOpenDetail} />;
    }
    return <CheckInHistoryList summaries={sortedSummaries} onOpenDetail={handleOpenDetail} />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight">Mi historial</h1>
          <p className="text-xs text-muted-foreground">Últimos 30 días</p>
        </div>
        <CheckInHistoryViewToggle view={view} onViewChange={setView} />
      </div>

      {renderContent()}

      <Dialog open={detailOpen} onOpenChange={(open) => {
        setDetailOpen(open);
        if (!open) setSelectedCheckInId(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del check-in</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : detail ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <span className="text-3xl">
                  {EMOTION_MAP[detail.emotionalState]?.emoji ?? detail.emotionalStateIcon}
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(detail.checkInDate).toLocaleDateString("es-ES", {
                      weekday: "long", day: "numeric", month: "long",
                    })}
                  </p>
                  <p className="font-medium">
                    {EMOTION_MAP[detail.emotionalState]?.label ?? detail.emotionalStateLabel}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Tareas</h4>
                {detail.tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin tareas registradas.</p>
                ) : (
                  detail.tasks.map((t) => (
                    <div key={t.taskId} className="flex items-start justify-between gap-2 p-2 rounded border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{t.taskName}</p>
                        {t.barrierLabel && (
                          <p className="text-xs text-muted-foreground">Barrera: {t.barrierLabel}</p>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        t.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {t.completed ? "Hecha" : "No hecha"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
