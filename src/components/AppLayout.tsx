import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-lg font-semibold text-foreground">COMPA</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </Button>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
          <footer className="border-t bg-blue-100 px-6 py-3 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">COMPA - Acompañamiento estudiantil</p>
            <p className="mt-1">
              Desarrollado por{" "}
              <span className="font-medium text-foreground">Mariana Carvajal Rueda</span>
              {" "}&{" "}
              <span className="font-medium text-foreground">Andrea Marín Díaz</span>
              {" "}— Desarrolladoras FullStack
            </p>
            <p className="mt-1 text-xs">© {new Date().getFullYear()} Todos los derechos reservados</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}