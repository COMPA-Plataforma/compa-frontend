import { useQuery } from "@tanstack/react-query";
import { checkInService, type CheckInDetail } from "@/services/checkInService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estudianteId: number;
  checkInId: number | null;
}

export function CheckInDetailDialog({ open, onOpenChange, estudianteId, checkInId }: Props) {
  const { data: detail, isLoading } = useQuery({
    queryKey: ["checkInDetail", estudianteId, checkInId],
    queryFn: () => checkInService.getDetail(estudianteId, checkInId!),
    enabled: open && checkInId !== null,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle del Check-in</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : detail ? (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground capitalize">
                {format(parseISO(detail.checkInDate), "EEEE d 'de' MMMM yyyy", { locale: es })}
              </p>
                            {detail.emotionalStateIcon ? (
                <>
                  <p className="text-4xl">{detail.emotionalStateIcon}</p>
                  <p className="font-medium">{detail.emotionalStateLabel}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Aún sin estado de ánimo registrado
                </p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Tareas</h4>
              {detail.tasks.map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{task.taskName}</p>
                    <p className="text-xs text-muted-foreground">{task.taskDescription}</p>
                    {!task.completed && task.barrierLabel && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Motivo: {task.barrierLabel}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No se encontró el detalle.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
