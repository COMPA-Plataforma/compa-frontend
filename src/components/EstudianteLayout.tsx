import { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, CheckCircle2, Calendar, ClipboardList, LogOut, FileText, BarChart2, Moon, Sun, ShieldCheck, Loader2 } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { NotificationBell } from "@/components/NotificationBell";
import { AutorizacionMenorGate } from "@/components/consentimientos/AutorizacionMenorGate";
import { estudianteMeService } from "@/services/estudianteMeService";
import { autorizacionMenorService } from "@/services/autorizacionMenorService";

const navItems = [
  { to: "/estudiante/home", label: "Inicio", icon: Home },
  { to: "/estudiante/check-in", label: "Check-in", icon: CheckCircle2 },
  { to: "/estudiante/history", label: "Historial", icon: Calendar },
  { to: "/estudiante/plan", label: "Mi plan", icon: ClipboardList },
  { to: "/estudiante/progress-report", label: "Mi progreso", icon: BarChart2 },
];

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { isDark, toggle } = useDarkMode("estudiante");
  const queryClient = useQueryClient();

  // Un menor de edad (tarjeta de identidad) solo usa COMPA con la autorización de su representante legal aprobada.
  // Mientras tanto ve una única pantalla para subirla.
  const { data: me, isLoading: cargandoMe } = useQuery({
    queryKey: ["estudiante-me-layout"],
    queryFn: estudianteMeService.getMe,
  });
  const esMenor = me?.documentType === "TARJETA_DE_IDENTIDAD";
  const { data: autorizacion, isLoading: cargandoAut, refetch: refetchAut } = useQuery({
    queryKey: ["autorizacion-menor-me"],
    queryFn: autorizacionMenorService.getMia,
    enabled: esMenor,
  });
  const bloqueado = esMenor && autorizacion?.estado !== "APROBADA";
  const cargando = cargandoMe || (esMenor && cargandoAut);
  // Si no se pudo consultar la autorización de un menor, se avisa en vez de dejarlo pasar
  const errorAut = esMenor && !cargandoAut && !autorizacion;
  // El menú completo solo aparece cuando ya se sabe que puede usar la plataforma
  const libre = !cargando && !bloqueado;

  // Si el servidor rechaza algo por autorización pendiente, se vuelve a consultar el estado
  useEffect(() => {
    const alPendiente = () => queryClient.invalidateQueries({ queryKey: ["autorizacion-menor-me"] });
    window.addEventListener("compa:autorizacion-menor-pendiente", alPendiente);
    return () => window.removeEventListener("compa:autorizacion-menor-pendiente", alPendiente);
  }, [queryClient]);

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header id="estudiante-header" className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-foreground">COMPA</h1>
          {user && (
            <p className="text-xs text-muted-foreground">
              Hola, {user.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {libre && <NotificationBell />}
          {libre && (
            <NavLink
              to="/estudiante/consents"
              className={({ isActive }) =>
                cn(
                  "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent",
                  isActive && "text-primary"
                )
              }
              aria-label="Consentimientos"
            >
              <FileText className="h-5 w-5" />
            </NavLink>
          )}

          <NavLink
            to="/politica-datos"
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Política de datos"
            title="Política de datos"
          >
            <ShieldCheck className="h-5 w-5" />
          </NavLink>

          {/* Toggle modo oscuro */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="gap-1"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Cerrar sesión */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-auto pb-24 px-4 py-4 max-w-2xl mx-auto w-full">
        {cargando ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : errorAut ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm text-muted-foreground">No se pudo verificar tu autorización.</p>
            <Button variant="outline" onClick={() => refetchAut()}>Reintentar</Button>
          </div>
        ) : bloqueado && autorizacion && me ? (
          <AutorizacionMenorGate
            autorizacion={autorizacion}
            estudiante={{ nombre: `${me.name} ${me.lastName}`, documento: me.identityDocument }}
          />
        ) : (
          children
        )}
      </main>

      {/* Bottom navigation */}
      {libre && (
        <nav id="estudiante-nav" className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card shadow-lg">
          <div className="grid grid-cols-5 max-w-2xl mx-auto">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-1 py-2.5 text-xs transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}