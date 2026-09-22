import { Users, UserX, ShieldAlert, Activity, LogOut, Bell, LayoutDashboard, Moon, Sun } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { authService } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { alertService } from "@/services/alertService";
import { useDarkMode } from "@/hooks/useDarkMode";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Estudiantes", url: "/estudiantes", icon: Users },
  { title: "Estudiantes Inactivos", url: "/estudiantes/inactive", icon: UserX },
  { title: "Panel de Riesgo", url: "/risk-level", icon: ShieldAlert },
  { title: "Alertas", url: "/alerts", icon: Bell },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkMode("orientador");
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const { data: unreadCount } = useQuery({
    queryKey: ["alerts-count"],
    queryFn: alertService.getUnreadCount,
    refetchInterval: 30000,
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-sidebar-primary" />
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
              COMPA
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/estudiantes" || item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <div style={{ position: "relative", display: "inline-flex" }}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.url === "/alerts" && unreadCount && unreadCount > 0 && (
                          <span style={{
                            position: "absolute", top: -6, right: 4,
                            background: "#ef4444", color: "white",
                            borderRadius: "50%", width: 16, height: 16,
                            fontSize: "0.65rem", fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="px-2 py-1 mb-2">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {user.name} {user.lastName}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user.email}
            </p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggle}
              className="hover:bg-sidebar-accent/50 cursor-pointer text-sidebar-foreground/80 hover:text-sidebar-foreground"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!collapsed && (
                <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="hover:bg-sidebar-accent/50 cursor-pointer text-sidebar-foreground/80 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Cerrar sesión</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}