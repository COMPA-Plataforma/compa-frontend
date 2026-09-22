import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  progressReportService,
  ProgressReport,
  RiskLevel,
  HealthStatus,
} from "@/services/progressReportService";
import { authService } from "@/services/authService";
import { Loader2, Printer, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";

const riskLabel: Record<RiskLevel, string> = {
  VERDE: "Bajo",
  AMARILLO: "Medio",
  ROJO: "Alto",
};

const healthLabel: Record<HealthStatus, string> = {
  CRITICO: "Crítico",
  ESTABLE: "Estable",
  EN_OBSERVACION: "En observación",
  LEVE: "Leve",
};

const healthOrder: Record<HealthStatus, number> = {
  CRITICO: 0,
  EN_OBSERVACION: 1,
  LEVE: 2,
  ESTABLE: 3,
};

function getEvolution(initial: HealthStatus | null, current: HealthStatus | null) {
  if (!initial || !current) return null;
  const diff = healthOrder[current] - healthOrder[initial];
  if (diff > 0) return "mejora";
  if (diff < 0) return "deterioro";
  return "estable";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short",
  });
}

interface Props {
  overrideEstudianteId?: number;
}

export default function ProgressReportPage(props: Props = {}) {
  const { id } = useParams<{ id: string }>();
  const estudianteId = props.overrideEstudianteId ?? Number(id);
  const reportRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const currentUser = authService.getCurrentUser();

  const [newConclusion, setNewConclusion] = useState("");
  const [showConclusionForm, setShowConclusionForm] = useState(false);

  const { data: report, isLoading, error } = useQuery<ProgressReport>({
    queryKey: ["progress-report", estudianteId],
    queryFn: () => progressReportService.getReport(estudianteId),
  });

  const addConclusionMutation = useMutation({
    mutationFn: () => progressReportService.addConclusion(estudianteId, newConclusion, currentUser!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress-report", estudianteId] });
      setNewConclusion("");
      setShowConclusionForm(false);
    },
  });

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Loader2 style={{ width: 32, height: 32, color: "hsl(199, 89%, 38%)", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
        Error cargando el reporte. Verifica que el estudiante tenga datos registrados.
      </div>
    );
  }

  const evolution = getEvolution(report.initialHealthStatus, report.currentHealthStatus);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
          body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          html, body { height: auto !important; overflow: visible !important; }
          ::-webkit-scrollbar { display: none !important; }
          * { scrollbar-width: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 1cm; size: A4; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Botones volver e imprimir */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", padding: "0 1rem" }}>
        <button
          onClick={() => window.history.back()}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            background: "transparent", color: "hsl(199, 89%, 38%)",
            border: "1px solid hsl(199, 89%, 38%)", borderRadius: "8px",
            cursor: "pointer", fontSize: "0.875rem", fontWeight: 500,
          }}
        >
          ← Volver
        </button>
        <button
          onClick={handlePrint}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.6rem 1.25rem",
            background: "hsl(199, 89%, 38%)", color: "white",
            border: "none", borderRadius: "8px", cursor: "pointer",
            fontSize: "0.875rem", fontWeight: 500,
          }}
        >
          <Printer size={16} /> Imprimir / Exportar PDF
        </button>
      </div>

      {/* Reporte */}
      <div
        ref={reportRef}
        className="print-container"
        style={{
          maxWidth: "860px", margin: "0 auto", background: "white",
          borderRadius: "12px", boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
          fontFamily: "system-ui, sans-serif", overflow: "hidden",
        }}
      >
        {/* Encabezado */}
        <div style={{ background: "hsl(199, 89%, 18%)", color: "white", padding: "1.75rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "hsl(199, 89%, 28%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(199,89%,70%)" strokeWidth="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span style={{ fontSize: "1rem", fontWeight: 600 }}>COMPA - Acompañamiento estudiantil</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "hsl(199, 30%, 70%)" }}>
              Orientador: <strong style={{ color: "white" }}>{report.orientadorFullName}</strong>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 0.25rem", fontSize: "0.75rem", color: "hsl(199, 30%, 70%)" }}>Reporte generado</p>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>{formatDate(report.generatedAt)}</p>
          </div>
        </div>

        {/* Nombre estudiante */}
        <div style={{ background: "hsl(199, 89%, 24%)", color: "white", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 0.2rem", fontSize: "0.75rem", color: "hsl(199, 40%, 70%)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Estudiante</p>
            <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>{report.estudianteFullName}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 0.2rem", fontSize: "0.75rem", color: "hsl(199, 40%, 70%)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Veces en riesgo alto</p>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: report.highRiskCount > 0 ? "#fca5a5" : "#86efac" }}>{report.highRiskCount}</p>
          </div>
        </div>

        <div style={{ padding: "1.75rem 2rem" }}>

          {/* Métricas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
            {[
              { label: "Cumplimiento semanal", value: `${report.weeklyCompliance ?? 0}%`, color: (report.weeklyCompliance ?? 0) >= 80 ? "#22c55e" : (report.weeklyCompliance ?? 0) >= 50 ? "#eab308" : "#ef4444", icon: "📊", extra: null },
              { label: "Racha actual", value: `${report.currentStreak} días`, color: "hsl(199, 89%, 38%)", icon: report.currentStreak > 7 ? "🔥" : "📅", extra: report.currentStreak > 7 ? "¡Racha motivacional!" : null },
              { label: "Mejor racha histórica", value: `${report.bestStreak} días`, color: "hsl(199, 89%, 38%)", icon: "🏆", extra: null },
            ].map((metric) => (
              <div key={metric.label} style={{ background: "hsl(210, 20%, 98%)", borderRadius: "10px", padding: "1.25rem", border: "1px solid hsl(214, 20%, 90%)", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{metric.icon}</div>
                <p style={{ margin: "0 0 0.25rem", fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>{metric.label}</p>
                <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: metric.color }}>{metric.value}</p>
                {metric.extra && <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#f97316", fontWeight: 600 }}>{metric.extra}</p>}
              </div>
            ))}
          </div>

          {/* Gráfico últimos 7 días */}
          <div style={{ background: "hsl(210, 20%, 98%)", borderRadius: "10px", padding: "1.25rem", border: "1px solid hsl(214, 20%, 90%)", marginBottom: "1.75rem" }}>
            <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.85rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Cumplimiento — Últimos 7 días
            </h3>
            {report.last7DaysRisk.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>Sin registros disponibles</p>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", padding: "0 0.5rem", borderBottom: "2px solid hsl(214, 20%, 85%)", marginBottom: "0.5rem" }}>
                  {[...report.last7DaysRisk].reverse().map((day, i) => {
                    const pct = Math.round(day.compliancePercentage);
                    const barHeightPx = Math.max(pct * 1.5, 6);
                    const barColor = day.riskLevel === "VERDE" ? "linear-gradient(to top, #15803d, #4ade80)" : day.riskLevel === "AMARILLO" ? "linear-gradient(to top, #a16207, #fde047)" : "linear-gradient(to top, #b91c1c, #f87171)";
                    const textColor = day.riskLevel === "VERDE" ? "#15803d" : day.riskLevel === "AMARILLO" ? "#a16207" : "#b91c1c";
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: textColor }}>{pct}%</span>
                        <div style={{ width: "70%", height: `${barHeightPx}px`, background: barColor, borderRadius: "5px 5px 0 0", boxShadow: "0 -2px 6px rgba(0,0,0,0.12)" }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: "0.75rem", padding: "0 0.5rem", marginBottom: "0.75rem" }}>
                  {[...report.last7DaysRisk].reverse().map((day, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.65rem", color: "#9ca3af" }}>{formatShortDate(day.date)}</div>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", marginTop: "0.5rem" }}>
              {([{ level: "VERDE" as RiskLevel, label: "Bajo (≥80%)", from: "#4ade80", to: "#15803d" }, { level: "AMARILLO" as RiskLevel, label: "Medio (50-79%)", from: "#fde047", to: "#a16207" }, { level: "ROJO" as RiskLevel, label: "Alto (<50%)", from: "#f87171", to: "#b91c1c" }] as const).map((item) => (
                <div key={item.level} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: `linear-gradient(to top, ${item.to}, ${item.from})`, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evolución de salud */}
          <div style={{ background: "hsl(210, 20%, 98%)", borderRadius: "10px", padding: "1.25rem", border: "1px solid hsl(214, 20%, 90%)", marginBottom: "1.75rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Evolución del estado de salud
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ flex: 1, textAlign: "center", padding: "1rem", background: "white", borderRadius: 8, border: "1px solid hsl(214,20%,88%)" }}>
                <p style={{ margin: "0 0 0.25rem", fontSize: "0.7rem", color: "#9ca3af", textTransform: "uppercase" }}>Estado inicial</p>
                <p style={{ margin: "0 0 0.25rem", fontSize: "1.1rem", fontWeight: 700, color: "#374151" }}>{report.initialHealthStatus ? healthLabel[report.initialHealthStatus] : "—"}</p>
                {report.initialStatusDate && <p style={{ margin: 0, fontSize: "0.7rem", color: "#9ca3af" }}>{formatDate(report.initialStatusDate)}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                {evolution === "mejora" && <TrendingUp size={28} color="#22c55e" />}
                {evolution === "deterioro" && <TrendingDown size={28} color="#ef4444" />}
                {evolution === "estable" && <Minus size={28} color="#eab308" />}
                {evolution && <span style={{ fontSize: "0.7rem", fontWeight: 600, color: evolution === "mejora" ? "#22c55e" : evolution === "deterioro" ? "#ef4444" : "#eab308" }}>{evolution === "mejora" ? "Mejora" : evolution === "deterioro" ? "Deterioro" : "Estable"}</span>}
              </div>
              <div style={{ flex: 1, textAlign: "center", padding: "1rem", background: "white", borderRadius: 8, border: "1px solid hsl(214,20%,88%)" }}>
                <p style={{ margin: "0 0 0.25rem", fontSize: "0.7rem", color: "#9ca3af", textTransform: "uppercase" }}>Estado actual</p>
                <p style={{ margin: "0 0 0.25rem", fontSize: "1.1rem", fontWeight: 700, color: "#374151" }}>{report.currentHealthStatus ? healthLabel[report.currentHealthStatus] : "—"}</p>
                {report.currentStatusDate && <p style={{ margin: 0, fontSize: "0.7rem", color: "#9ca3af" }}>{formatDate(report.currentStatusDate)}</p>}
              </div>
            </div>
          </div>

          {/* Planes de hábitos */}
          <div style={{ background: "hsl(210, 20%, 98%)", borderRadius: "10px", padding: "1.25rem", border: "1px solid hsl(214, 20%, 90%)", marginBottom: "1.75rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Planes de hábitos
            </h3>
            {report.habitPlans.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>Sin planes asignados</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {report.habitPlans.map((plan, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "white", borderRadius: 8, border: "1px solid hsl(214,20%,88%)" }}>
                    <div>
                      <p style={{ margin: "0 0 0.2rem", fontSize: "0.9rem", fontWeight: 600, color: "#374151" }}>{plan.name}</p>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>Inicio: {formatDate(plan.startDate)}</p>
                    </div>
                    <span style={{ padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: plan.status === "ACTIVO" ? "#dcfce7" : "#f3f4f6", color: plan.status === "ACTIVO" ? "#16a34a" : "#6b7280" }}>
                      {plan.status === "ACTIVO" ? "Activo" : "Finalizado"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conclusiones */}
          <div style={{ background: "hsl(210, 20%, 98%)", borderRadius: "10px", padding: "1.25rem", border: "1px solid hsl(214, 20%, 90%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Conclusiones del orientador
              </h3>
              {!props.overrideEstudianteId && (
                <button
                  className="no-print"
                  onClick={() => setShowConclusionForm(!showConclusionForm)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    padding: "0.4rem 0.85rem",
                    background: "hsl(199, 89%, 38%)", color: "white",
                    border: "none", borderRadius: 6, cursor: "pointer",
                    fontSize: "0.8rem", fontWeight: 500,
                  }}
                >
                  <Plus size={14} /> Agregar
                </button>
              )}
            </div>

            {showConclusionForm && (
              <div className="no-print" style={{ marginBottom: "1rem" }}>
                <textarea
                  value={newConclusion}
                  onChange={(e) => setNewConclusion(e.target.value)}
                  placeholder="Escribe la conclusión clínica..."
                  rows={3}
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid hsl(214, 20%, 85%)", borderRadius: 8, fontSize: "0.875rem", resize: "vertical", fontFamily: "system-ui, sans-serif", boxSizing: "border-box" }}
                />
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", justifyContent: "flex-end" }}>
                  <button onClick={() => setShowConclusionForm(false)} style={{ padding: "0.4rem 0.85rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem" }}>
                    Cancelar
                  </button>
                  <button
                    onClick={() => addConclusionMutation.mutate()}
                    disabled={!newConclusion.trim() || addConclusionMutation.isPending}
                    style={{ padding: "0.4rem 0.85rem", background: "hsl(199, 89%, 38%)", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", fontWeight: 500, opacity: !newConclusion.trim() ? 0.5 : 1 }}
                  >
                    {addConclusionMutation.isPending ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            )}

            {report.conclusions.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>Sin conclusiones registradas</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {report.conclusions.map((c) => (
                  <div key={c.id} style={{ padding: "0.875rem 1rem", background: "white", borderRadius: 8, border: "1px solid hsl(214,20%,88%)", borderLeft: "3px solid hsl(199, 89%, 38%)" }}>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "#374151", lineHeight: 1.6 }}>{c.content}</p>
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>{c.orientadorName} · {formatDate(c.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}