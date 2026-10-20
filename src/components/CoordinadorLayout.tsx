import { LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppFooter } from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { useDarkMode } from "@/hooks/useDarkMode";

export default function CoordinadorLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  // El tema se comparte con las demás pantallas del personal.
  const { isDark, toggle } = useDarkMode("orientador");

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="h-14 flex items-center justify-between border-b bg-card px-4">
        <h1 className="text-lg font-semibold text-foreground">COMPA</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-label={isDark ? "Modo claro" : "Modo oscuro"}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
      <AppFooter />
    </div>
  );
}
