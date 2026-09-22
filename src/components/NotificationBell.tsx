import { useState } from "react";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationService, type AppNotification } from "@/services/notificationService";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

function NotificationItem({ notification }: { notification: AppNotification }) {
  const queryClient = useQueryClient();

  const completeTaskMutation = useMutation({
    mutationFn: () => notificationService.completeTask(notification.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["today-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["today-check-in"] });
      toast.success("¡Tarea registrada como cumplida!");
    },
    onError: () => {
      toast.error("No pudimos registrar la tarea. Intenta de nuevo.");
    },
  });

  const isActionable = notification.relatedTaskId != null;
  const alreadyDone = notification.actionTaken;

  return (
    <div className="border-b last:border-b-0 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{notification.title}</p>
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {timeAgo(notification.createdAt)}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>

      {isActionable && (
        <div className="mt-2">
          {alreadyDone ? (
            <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-500">
              <CheckCircle2 className="h-4 w-4" />
              Tarea registrada como cumplida
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={completeTaskMutation.isPending}
              onClick={() => completeTaskMutation.mutate()}
            >
              {completeTaskMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Marcar como cumplida
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getMyNotifications,
    enabled: open,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-2.5">
          <p className="text-sm font-semibold text-foreground">Notificaciones</p>
        </div>
        <ScrollArea className="max-h-96">
          {isLoading && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && (!notifications || notifications.length === 0) && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No tienes notificaciones por ahora.
            </p>
          )}
          {notifications?.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}