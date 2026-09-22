import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type Status = "loading" | "success" | "error";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    // Endpoint público — sin Authorization header
    axios
      .post(`${API_URL}/api/estudiantes/activate`, null, { params: { token } })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
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
              Activando tu cuenta...
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2
              style={{ width: 64, height: 64, margin: "0 auto 1rem", color: "#16a34a" }}
            />
            <h1 style={{ fontSize: "1.75rem", color: "#2b2b2b", margin: "0 0 0.75rem" }}>
              ¡Cuenta activada!
            </h1>
            <p style={{ color: "#5e5e5e", lineHeight: 1.6, margin: "0 0 1.75rem" }}>
              Tu cuenta ha sido activada correctamente. Ya puedes iniciar sesión con tus
              credenciales.
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
              Ir al inicio de sesión
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle
              style={{ width: 64, height: 64, margin: "0 auto 1rem", color: "#dc2626" }}
            />
            <h1 style={{ fontSize: "1.75rem", color: "#2b2b2b", margin: "0 0 0.75rem" }}>
              Enlace inválido
            </h1>
            <p style={{ color: "#5e5e5e", lineHeight: 1.6, margin: "0 0 1.75rem" }}>
              El enlace de activación no es válido o ha vencido.
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
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
}