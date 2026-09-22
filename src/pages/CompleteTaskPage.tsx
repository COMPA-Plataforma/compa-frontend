import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { notificationService, type AppNotification } from "@/services/notificationService";

type Status = "loading" | "success" | "error";

export default function CompleteTaskPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [notification, setNotification] = useState<AppNotification | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("El enlace no es válido.");
      return;
    }
    notificationService
      .completeTaskByActionToken(token)
      .then((data) => {
        setNotification(data);
        setStatus("success");
      })
      .catch((err) => {
        setErrorMessage(
          err.response?.data?.error || "El enlace no es válido o ya venció."
        );
        setStatus("error");
      });
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fcfbf8",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: "100%",
          background: "#ffffff",
          border: "1px solid #ece8df",
          borderRadius: 12,
          padding: "2.5rem 2rem",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        }}
      >
        {status === "loading" && (
          <>
            <Loader2
              className="animate-spin"
              style={{ width: 48, height: 48, margin: "0 auto 1rem", color: "#6b6b6b" }}
            />
            <h1 style={{ fontSize: "1.5rem", color: "#2b2b2b", margin: 0 }}>
              Registrando tu tarea...
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2
              style={{ width: 64, height: 64, margin: "0 auto 1rem", color: "#16a34a" }}
            />
            <h1 style={{ fontSize: "1.75rem", color: "#2b2b2b", margin: "0 0 0.75rem" }}>
              ¡Tarea registrada como cumplida!
            </h1>
            <p style={{ color: "#5e5e5e", lineHeight: 1.6, margin: "0 0 1.75rem" }}>
              Quedó guardada en tu registro de hoy, tal como si la hubieras marcado
              dentro de la app.
              {notification?.actionTakenAt && (
                <>
                  <br />
                  <span style={{ fontSize: "0.85rem", color: "#8a8a8a" }}>
                    {new Date(notification.actionTakenAt).toLocaleString("es-CO")}
                  </span>
                </>
              )}
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "#2b2b2b",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "1rem",
              }}
            >
              Ir a la app
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle
              style={{ width: 64, height: 64, margin: "0 auto 1rem", color: "#dc2626" }}
            />
            <h1 style={{ fontSize: "1.75rem", color: "#2b2b2b", margin: "0 0 0.75rem" }}>
              No pudimos registrar la tarea
            </h1>
            <p style={{ color: "#5e5e5e", lineHeight: 1.6, margin: "0 0 1.75rem" }}>
              {errorMessage}
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "#2b2b2b",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "1rem",
              }}
            >
              Ir a la app
            </button>
          </>
        )}
      </div>
    </div>
  );
}