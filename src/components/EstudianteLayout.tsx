import { NavLink, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, CheckCircle2, Calendar, ClipboardList, LogOut, FileText, BarChart2, Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

const navItems = [
  { to: "/patient/home", label: "Inicio", icon: Home },
  { to: "/patient/check-in", label: "Check-in", icon: CheckCircle2 },
  { to: "/patient/history", label: "Historial", icon: Calendar },
  { to: "/patient/plan", label: "Mi plan", icon: ClipboardList },
  { to: "/patient/progress-report", label: "Mi progreso", icon: BarChart2 },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { isDark, toggle } = useDarkMode("patient");

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header id="patient-header" className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-foreground">LifeTracker</h1>
          {user && (
            <p className="text-xs text-muted-foreground">
              Hola, {user.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <NavLink
            to="/patient/consents"
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
        {children}
      </main>

      {/* Bottom navigation */}
      <nav id="patient-nav" className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card shadow-lg">
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
    </div>
  );
}