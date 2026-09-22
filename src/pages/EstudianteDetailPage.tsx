import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientService } from "@/services/patientService";
import { clinicalInfoService } from "@/services/clinicalInfoService";
import { habitPlanService } from "@/services/habitPlanService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { ClinicalInfoDialog } from "@/components/dialogs/ClinicalInfoDialog";
import { UpdateHealthStatusDialog } from "@/components/dialogs/UpdateHealthStatusDialog";
import { CreateHabitPlanDialog } from "@/components/dialogs/CreateHabitPlanDialog";
import { AddTaskDialog } from "@/components/dialogs/AddTaskDialog";
import { ArrowLeft, Plus, Trash2, XCircle, ChevronDown, ChevronUp, Loader2, Mail, Phone, FileText, Calendar, Activity, ClipboardCheck, History } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RiskLevelSection } from "@/components/risk-level/RiskLevelSection";
import { consentService } from "@/services/consentService";
import { checkInService } from "@/services/checkInService";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [clinicalDialog, setClinicalDialog] = useState(false);
  const [healthStatusDialog, setHealthStatusDialog] = useState(false);
  const [habitPlanDialog, setHabitPlanDialog] = useState(false);
  const [addTaskDialog, setAddTaskDialog] = useState<{ open: boolean; planId: number }>({ open: false, planId: 0 });
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Set<number>>(new Set());

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getById(patientId),
    enabled: !!id && !isNaN(patientId),
  });

  const { data: clinicalInfo, isLoading: clinicalLoading } = useQuery({
    queryKey: ["clinicalInfo", patientId],
    queryFn: () => clinicalInfoService.get(patientId).catch(() => null),
    enabled: !!id && !isNaN(patientId),
  });

  const { data: healthHistory = [] } = useQuery({
    queryKey: ["healthHistory", patientId],
    queryFn: () => clinicalInfoService.getHistory(patientId).catch(() => []),
    enabled: historyOpen,
  });

  const { data: habitPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["habitPlans", patientId],
    queryFn: () => habitPlanService.list(patientId),
    enabled: !!id && !isNaN(patientId),
  });

  const { data: consents = [], isLoading: consentsLoading } = useQuery({
    queryKey: ["consents", patientId],
    queryFn: () => consentService.getByPatient(patientId),
    enabled: !!id && !isNaN(patientId),
  });

  const { data: todayTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["todayTasks", patientId],
    queryFn: () => checkInService.getTasksForToday(patientId),
    enabled: !!id && !isNaN(patientId),
  });

  const { data: todayCheckIn } = useQuery({
    queryKey: ["todayCheckIn", patientId],
    queryFn: () => checkInService.getToday(patientId).catch(() => null),
    enabled: !!id && !isNaN(patientId),
  });

  const deactivatePlan = useMutation({
    mutationFn: (planId: number) => habitPlanService.deactivate(patientId, planId),
    onSuccess: () => {
      toast.success("Plan desactivado");
      queryClient.invalidateQueries({ queryKey: ["habitPlans", patientId] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: ({ planId, taskId }: { planId: number; taskId: number }) =>
      habitPlanService.deleteTask(patientId, planId, taskId),
    onSuccess: () => {
      toast.success("Tarea eliminada");
      queryClient.invalidateQueries({ queryKey: ["habitPlans", patientId] });
    },
  });

  const togglePlan = (planId: number) => {
    setExpandedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(planId)) {
        next.delete(planId);
      } else {
        next.add(planId);
      }
      return next;
    });
  };

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return <p className="text-muted-foreground text-center py-20">Paciente no encontrado</p>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{patient.name} {patient.lastName}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {patient.identityDocument}</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {patient.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {patient.phoneNumber}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {format(new Date(patient.createdAt), "dd/MM/yyyy")}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate(`/patients/${patientId}/check-in`)} className="gap-2">
                <ClipboardCheck className="h-4 w-4" /> Check-in Diario
              </Button>
              <Button variant="outline" onClick={() => navigate(`/patients/${patientId}/check-in/history`)} className="gap-2">
                <History className="h-4 w-4" /> Historial
              </Button>
              <Button variant="outline" onClick={() => navigate(`/patients/${patientId}/adherence`)} className="gap-2">
                <Activity className="h-4 w-4" /> Métricas
              </Button>
              <Button variant="outline" onClick={() => navigate(`/patients/${patientId}/progress-report`)} className="gap-2">
                <FileText className="h-4 w-4" /> Reporte de Progreso
              </Button>
              <StatusBadge status={patient.status} />
            </div>
          </div>
        </CardHeader>
      </Card>

      <RiskLevelSection patientId={patientId} />

      <Tabs defaultValue="clinical">
        <TabsList>
          <TabsTrigger value="clinical">Información Clínica</TabsTrigger>
          <TabsTrigger value="habits">Planes de Hábitos</TabsTrigger>
          <TabsTrigger value="consents">Consentimientos</TabsTrigger>
          <TabsTrigger value="today-tasks">Tareas de Hoy</TabsTrigger>
        </TabsList>

        {/* ── Información Clínica ── */}
        <TabsContent value="clinical" className="space-y-4 mt-4">
          {clinicalLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : clinicalInfo ? (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Condición Principal</p>
                    <p className="font-medium">{clinicalInfo.mainCondition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Condiciones Secundarias</p>
                    <p className="font-medium">{clinicalInfo.secondaryConditions || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado de Salud</p>
                    <StatusBadge status={clinicalInfo.healthStatus} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setClinicalDialog(true)}>Editar</Button>
                  <Button variant="outline" size="sm" onClick={() => setHealthStatusDialog(true)}>Actualizar Estado</Button>
                </div>
                <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-1">
                      {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      Historial de Estados
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Estado Anterior</TableHead>
                          <TableHead>Nuevo Estado</TableHead>
                          <TableHead>Razón</TableHead>
                          <TableHead>Fecha</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {healthHistory.length === 0 ? (
                          <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin historial</TableCell></TableRow>
                        ) : (
                          healthHistory.map((h) => (
                            <TableRow key={h.id}>
                              <TableCell><StatusBadge status={h.previousStatus} /></TableCell>
                              <TableCell><StatusBadge status={h.newStatus} /></TableCell>
                              <TableCell>{h.reason}</TableCell>
                              <TableCell>{format(new Date(h.changedAt), "dd/MM/yyyy HH:mm")}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <p className="text-muted-foreground">No hay información clínica registrada.</p>
                <Button onClick={() => setClinicalDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Registrar Información Clínica
                </Button>
              </CardContent>
            </Card>
          )}
          <ClinicalInfoDialog open={clinicalDialog} onOpenChange={setClinicalDialog} patientId={patientId} existing={clinicalInfo ?? null} />
          <UpdateHealthStatusDialog open={healthStatusDialog} onOpenChange={setHealthStatusDialog} patientId={patientId} />
        </TabsContent>

        {/* ── Planes de Hábitos ── */}
        <TabsContent value="habits" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Planes de Hábitos</h3>
            <Button onClick={() => setHabitPlanDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Plan
            </Button>
          </div>
          {plansLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : habitPlans.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No hay planes de hábitos.
              </CardContent>
            </Card>
          ) : (
            habitPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader className="cursor-pointer" onClick={() => togglePlan(plan.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(plan.startDate), "dd/MM/yyyy")} — {format(new Date(plan.endDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={plan.status} />
                      {expandedPlans.has(plan.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
                {expandedPlans.has(plan.id) && (
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      {plan.status === "ACTIVO" && (
                        <Button variant="destructive" size="sm" onClick={() => deactivatePlan.mutate(plan.id)}>
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Desactivar Plan
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setAddTaskDialog({ open: true, planId: plan.id })}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> Agregar Tarea
                      </Button>
                      <Button variant="outline" size="sm"
                        onClick={() => navigate(`/patients/${patientId}/plans/${plan.id}/rules`)}>
                        <Activity className="mr-1 h-3.5 w-3.5" /> Ver Reglas
                      </Button>
                    </div>
                    {plan.tasks && plan.tasks.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tarea</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plan.tasks.map((task) => (
                            <TableRow key={task.id}>
                              <TableCell className="font-medium">{task.name}</TableCell>
                              <TableCell>{task.description}</TableCell>
                              <TableCell>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  task.priority === "ALTA" ? "bg-red-100 text-red-700"
                                  : task.priority === "MEDIA" ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                                }`}>
                                  {task.priority ?? "—"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteTask.mutate({ planId: plan.id, taskId: task.id })}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay tareas en este plan.</p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
          <CreateHabitPlanDialog open={habitPlanDialog} onOpenChange={setHabitPlanDialog} patientId={patientId} />
          <AddTaskDialog
            open={addTaskDialog.open}
            onOpenChange={(open) => setAddTaskDialog({ ...addTaskDialog, open })}
            patientId={patientId}
            planId={addTaskDialog.planId}
          />
        </TabsContent>

        {/* ── Consentimientos ── */}
        <TabsContent value="consents" className="space-y-4 mt-4">
          {consentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : consents.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No hay consentimientos registrados.
              </CardContent>
            </Card>
          ) : (
            consents.map((consent) => (
              <Card key={consent.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{consent.consentTemplate.titulo}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">Versión {consent.consentTemplate.version}</p>
                    </div>
                    {consent.aceptado ? (
                      <span className="text-sm text-green-600 font-medium">
                        ✅ Aceptado — {consent.fechaAceptacion ? format(new Date(consent.fechaAceptacion), "dd/MM/yyyy HH:mm") : ""}
                      </span>
                    ) : (
                      <span className="text-sm text-yellow-600 font-medium">
                        ⏳ Pendiente de aceptación del paciente
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{consent.consentTemplate.contenido}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── Tareas de Hoy ── */}
        <TabsContent value="today-tasks" className="space-y-4 mt-4">
          {tasksLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : todayTasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No hay tareas programadas para hoy.
              </CardContent>
            </Card>
          ) : (
            todayTasks.map((task) => {
              const completed = todayCheckIn?.tasks?.some(
                t => t.taskId === task.id && t.completed
              ) ?? false;
              return (
                <Card key={task.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{task.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          task.priority === "ALTA" ? "bg-red-100 text-red-700"
                          : task.priority === "MEDIA" ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                        }`}>
                          {task.priority}
                        </span>
                        {completed ? (
                          <span className="text-sm text-green-600 font-medium">✅ Registrada</span>
                        ) : (
                          <span className="text-sm text-yellow-600 font-medium">⏳ Pendiente</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}