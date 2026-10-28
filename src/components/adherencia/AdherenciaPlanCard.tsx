import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { progressReportService } from "@/services/progressReportService";
import { formatFecha } from "@/lib/dates";

const card: React.CSSProperties = {
  background: "hsl(210, 20%, 98%)", borderRadius: "10px", padding: "1.25rem",
  border: "1px solid hsl(214, 20%, 90%)", marginBottom: "1.75rem",
};
const titulo: React.CSSProperties = {
  margin: "0 0 1rem", fontSize: "0.85rem", fontWeight: 600, color: "#374151",
  textTransform: "uppercase", letterSpacing: "0.06em",
};
const inputFecha: React.CSSProperties = {
  padding: "0.4rem 0.6rem", border: "1px solid hsl(214, 20%, 85%)", borderRadius: 6,
  fontSize: "0.8rem", fontFamily: "system-ui, sans-serif",
};

function Barra({ etiqueta, detalle, pct, color }: { etiqueta: string; detalle: string; pct: number | null; color: string }) {
  return (
    <div style={{ marginBottom: "0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>{etiqueta}</span>
        <span style={{ fontSize: "1.1rem", fontWeight: 700, color }}>{pct === null ? "—" : `${pct}%`}</span>
      </div>
      <div style={{ height: 10, background: "hsl(214, 20%, 90%)", borderRadius: 6, overflow: "hidden" }}>
        <div style={{ width: `${pct ?? 0}%`, height: "100%", background: color, borderRadius: 6 }} />
      </div>
      <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: "#9ca3af" }}>{detalle}</p>
    </div>
  );
}

// Cumplimiento informado vs. validado y estado de ánimo, con filtro por rango de fechas
export function AdherenciaPlanCard({ estudianteId }: { estudianteId: number }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const rangoInvalido = !!from && !!to && from > to;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["progress-report", estudianteId, "adherencia", from, to],
    queryFn: () => progressReportService.getReport(estudianteId, from || undefined, to || undefined),
    enabled: !isNaN(estudianteId) && !rangoInvalido,
    select: (r) => r.adherencia,
  });

  return (
    <div style={card}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <h3 style={{ ...titulo, margin: 0 }}>Adherencia al plan</h3>
        <div className="no-print" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Desde</label>
          <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} style={inputFecha} aria-label="Desde" />
          <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Hasta</label>
          <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} style={inputFecha} aria-label="Hasta" />
          {(from || to) && (
            <button
              onClick={() => { setFrom(""); setTo(""); }}
              style={{ padding: "0.4rem 0.75rem", background: "transparent", border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer", fontSize: "0.78rem" }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {rangoInvalido ? (
        <p style={{ textAlign: "center", color: "#ef4444", fontSize: "0.875rem" }}>
          La fecha inicial no puede ser posterior a la final.
        </p>
      ) : isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
          <Loader2 size={22} style={{ color: "hsl(199, 89%, 38%)", animation: "spin 1s linear infinite" }} />
        </div>
      ) : isError || !data ? (
        <p style={{ textAlign: "center", color: "#ef4444", fontSize: "0.875rem" }}>
          No pudimos cargar la adherencia. Intenta de nuevo en un momento.
        </p>
      ) : (
        <>
          <p style={{ margin: "0 0 1rem", fontSize: "0.78rem", color: "#6b7280" }}>
            Periodo: del {formatFecha(data.from)} al {formatFecha(data.to)}
          </p>

          {!data.hasInfo ? (
            <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.875rem", padding: "0.5rem 0" }}>
              {data.hasActivePlan
                ? "No hay información registrada en este periodo."
                : "No hay plan activo ni información registrada en este periodo."}
            </p>
          ) : (
            <>
              {data.hasActivePlan && (
                <>
                  <Barra
                    etiqueta="Cumplimiento informado por el estudiante"
                    detalle={`${data.reportedCompleted} de ${data.scheduled} actividades programadas`}
                    pct={data.reportedPercentage}
                    color="hsl(199, 89%, 38%)"
                  />
                  <Barra
                    etiqueta="Cumplimiento validado por el psicoorientador"
                    detalle={`${data.validated} de ${data.scheduled} actividades programadas`}
                    pct={data.validatedPercentage}
                    color="#16a34a"
                  />
                  <p style={{ margin: "0 0 1rem", fontSize: "0.75rem", color: "#6b7280" }}>
                    {data.toValidate} informadas sin validar · {data.notPerformed} marcadas como no realizadas
                  </p>
                </>
              )}

              <div style={{ borderTop: "1px solid hsl(214, 20%, 90%)", paddingTop: "0.9rem" }}>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>
                  Estado de ánimo registrado
                </p>
                {data.moodCheckIns === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#9ca3af" }}>Sin estados de ánimo en este periodo.</p>
                ) : (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {data.mood.map((m) => (
                        <span key={m.state} style={{ padding: "0.3rem 0.7rem", background: "white", border: "1px solid hsl(214,20%,88%)", borderRadius: 20, fontSize: "0.8rem", color: "#374151" }}>
                          {m.icon} {m.label} · {m.count}
                        </span>
                      ))}
                    </div>
                    {data.predominantMoodLabel && (
                      <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                        Predomina: {data.predominantMoodIcon} {data.predominantMoodLabel} ({data.moodCheckIns} {data.moodCheckIns === 1 ? "registro" : "registros"})
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}