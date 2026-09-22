import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import EstudianteLayout from "@/components/EstudianteLayout";
import EstudianteListPage from "@/pages/EstudianteListPage";
import EstudianteDetailPage from "@/pages/EstudianteDetailPage";
import InactiveEstudiantesPage from "@/pages/InactiveEstudiantesPage";
import NotFound from "./pages/NotFound.tsx";
import PlanRulesPage from "@/pages/PlanRulesPage";
import CheckInPage from "@/pages/CheckInPage";
import CheckInHistoryPage from "@/pages/CheckInHistoryPage";
import RiskLevelPanelPage from "@/pages/RiskLevelPanelPage";
import AdherencePage from "@/pages/AdherencePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import ActivateAccountPage from "@/pages/ActivateAccountPage";
import EstudianteHomePage from "@/pages/estudiante/EstudianteHomePage";
import EstudianteCheckInPage from "@/pages/estudiante/EstudianteCheckInPage";
import EstudianteHistoryPage from "@/pages/estudiante/EstudianteHistoryPage";
import EstudiantePlanPage from "@/pages/estudiante/EstudiantePlanPage";
import EstudianteConsentsPage from "@/pages/estudiante/EstudianteConsentsPage";
import { authService } from "@/services/authService";
import EstudianteProgressReportPage from "@/pages/estudiante/EstudianteProgressReportPage";
import ProgressReportPage from "@/pages/ProgressReportPage";
import AlertsPage from "@/pages/AlertsPage";
import DashboardPage from "@/pages/DashboardPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole: "ORIENTADOR" | "ESTUDIANTE";
}) => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/activate" element={<ActivateAccountPage />} />
          <Route path="/estudiante/progress-report" element={<EstudianteProgressReportPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/activate" element={<ActivateAccountPage />} />

          {/* Rutas del ESTUDIANTE */}
          <Route
            path="/estudiante/*"
            element={
              <ProtectedRoute allowedRole="ESTUDIANTE">
                <EstudianteLayout>
                  <Routes>
                    <Route index element={<Navigate to="home" replace />} />
                    <Route path="home" element={<EstudianteHomePage />} />
                    <Route path="check-in" element={<EstudianteCheckInPage />} />
                    <Route path="history" element={<EstudianteHistoryPage />} />
                    <Route path="plan" element={<EstudiantePlanPage />} />
                    <Route path="consents" element={<EstudianteConsentsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </EstudianteLayout>
              </ProtectedRoute>
            }
          />

          {/* Rutas del ORIENTADOR */}
          <Route
            path="/*"
            element={
              <ProtectedRoute allowedRole="ORIENTADOR">
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/estudiantes" element={<EstudianteListPage />} />
                    <Route path="/estudiantes/inactive" element={<InactiveEstudiantesPage />} />
                    <Route path="/estudiantes/:id" element={<EstudianteDetailPage />} />
                    <Route path="/estudiantes/:id/plans/:planId/rules" element={<PlanRulesPage />} />
                    <Route path="/estudiantes/:id/check-in" element={<CheckInPage />} />
                    <Route path="/estudiantes/:id/check-in/history" element={<CheckInHistoryPage />} />
                    <Route path="/risk-level" element={<RiskLevelPanelPage />} />
                    <Route path="/estudiantes/:id/adherence" element={<AdherencePage />} />
                    <Route path="/estudiantes/:id/progress-report" element={<ProgressReportPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;