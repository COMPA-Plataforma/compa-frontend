import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  CheckInHistoryViewToggle,
  type CheckInHistoryView,
} from "@/components/check-in-history/CheckInHistoryViewToggle";
import { CheckInHistoryCalendar } from "@/components/check-in-history/CheckInHistoryCalendar";
import { CheckInHistoryList } from "@/components/check-in-history/CheckInHistoryList";
import { CheckInDetailDialog } from "@/components/dialogs/CheckInDetailDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { checkInService } from "@/services/checkInService";

function LoadingState() {
  return (
    <Card>
      <CardContent className="space-y-3 py-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

function MessageState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-10 text-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}

export default function CheckInHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const estudianteId = Number(id);
  const navigate = useNavigate();

  const [view, setView] = useState<CheckInHistoryView>("calendar");
  const [selectedCheckInId, setSelectedCheckInId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: summaries = [], isLoading, isError } = useQuery({
    queryKey: ["checkInLast30", estudianteId],
    queryFn: () => checkInService.getLast30Days(estudianteId),
    enabled: !Number.isNaN(estudianteId),
  });

  const sortedSummaries = useMemo(
    () => [...summaries].sort((first, second) => second.date.localeCompare(first.date)),
    [summaries]
  );

  const handleOpenDetail = (checkInId: number | null) => {
    if (checkInId === null) {
      return;
    }

    setSelectedCheckInId(checkInId);
    setDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setDetailOpen(open);

    if (!open) {
      setSelectedCheckInId(null);
    }
  };

  const renderContent = () => {
    if (Number.isNaN(estudianteId)) {
      return <MessageState message="No se pudo identificar el estudiante." />;
    }

    if (isLoading) {
      return <LoadingState />;
    }

    if (isError) {
      return <MessageState message="Error al cargar el historial. Intenta de nuevo." />;
    }

    if (summaries.length === 0) {
      return <MessageState message="No hay registros en los últimos 30 días." />;
    }

    if (view === "calendar") {
      return (
        <CheckInHistoryCalendar summaries={summaries} onOpenDetail={handleOpenDetail} />
      );
    }

    return <CheckInHistoryList summaries={sortedSummaries} onOpenDetail={handleOpenDetail} />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="w-fit gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <CheckInHistoryViewToggle view={view} onViewChange={setView} />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Historial de check-ins</h1>
        <p className="text-sm text-muted-foreground">Últimos 30 días</p>
      </div>

      {renderContent()}

      <CheckInDetailDialog
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
        estudianteId={estudianteId}
        checkInId={selectedCheckInId}
      />
    </div>
  );
}
