import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authService, RegisterData } from "@/services/authService";

const registerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  email: z.string().email("Debe ser un correo válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%", padding: "0.75rem 1rem",
  border: hasError ? "1px solid hsl(0, 72%, 51%)" : "1px solid hsl(214, 20%, 85%)",
  borderRadius: "8px", fontSize: "0.9rem",
  background: "white", color: "hsl(215, 25%, 15%)",
  fontFamily: "system-ui, sans-serif",
  outline: "none", boxSizing: "border-box" as const,
});

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.78rem", fontWeight: "500",
  color: "hsl(215, 25%, 30%)", marginBottom: "0.4rem",
  fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
};

const errorStyle: React.CSSProperties = {
  margin: "0.3rem 0 0", fontSize: "0.78rem",
  color: "hsl(0, 72%, 51%)", fontFamily: "system-ui, sans-serif",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authService.register(data as RegisterData);
      toast.success("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.");
      navigate("/login");
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Panel izquierdo */}
      <div style={{
        width: "40%",
        background: "hsl(199, 89%, 18%)",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "3rem", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "300px", height: "300px", borderRadius: "50%",
          border: "1px solid hsl(199, 60%, 35%)", opacity: 0.4,
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "-60px",
          width: "250px", height: "250px", borderRadius: "50%",
          border: "1px solid hsl(199, 60%, 35%)", opacity: 0.3,
        }} />

        <div style={{ position: "relative", textAlign: "center", color: "white", maxWidth: "280px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "hsl(199, 89%, 28%)",
            border: "1px solid hsl(199, 60%, 38%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(199, 89%, 70%)" strokeWidth="1.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>

          <h1 style={{
            fontSize: "1.75rem", fontWeight: "400",
            color: "white", margin: "0 0 0.75rem", letterSpacing: "-0.02em",
          }}>
            COMPA<br />
            <span style={{ color: "hsl(199, 89%, 65%)", fontStyle: "italic" }}>Acompañamiento estudiantil</span>
          </h1>

          <p style={{
            fontSize: "0.9rem", color: "hsl(199, 30%, 70%)",
            lineHeight: 1.7, fontFamily: "system-ui, sans-serif",
          }}>
            Crea tu cuenta como orientador de la salud y comienza a gestionar a tus estudiantes hoy.
          </p>

          <div style={{
            marginTop: "2rem", padding: "1.25rem",
            background: "hsl(199, 89%, 14%)",
            borderRadius: "12px",
            border: "1px solid hsl(199, 60%, 28%)",
          }}>
            <p style={{
              fontSize: "0.82rem", color: "hsl(199, 20%, 75%)",
              fontFamily: "system-ui, sans-serif", margin: 0,
              lineHeight: 1.7, fontStyle: "italic",
            }}>
              "La tecnología al servicio del bienestar mental de tus estudiantes."
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "3rem",
        background: "hsl(210, 20%, 98%)", overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>

          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{
              fontSize: "1.6rem", fontWeight: "400",
              color: "hsl(215, 25%, 15%)", margin: "0 0 0.5rem",
              letterSpacing: "-0.02em",
            }}>
              Crear cuenta
            </h2>
            <p style={{
              fontSize: "0.875rem", color: "hsl(215, 15%, 47%)",
              fontFamily: "system-ui, sans-serif", margin: 0,
            }}>
              Completa el formulario para registrarte como orientador
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input {...register("name")} placeholder="María" style={inputStyle(!!errors.name)} />
                {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Apellido</label>
                <input {...register("lastName")} placeholder="García" style={inputStyle(!!errors.lastName)} />
                {errors.lastName && <p style={errorStyle}>{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input type="email" {...register("email")} placeholder="orientador@clinica.com" style={inputStyle(!!errors.email)} />
              {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <input type="password" {...register("password")} placeholder="Mínimo 8 caracteres" style={inputStyle(!!errors.password)} />
              {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
            </div>

            <div>
              <label style={labelStyle}>Confirmar contraseña</label>
              <input type="password" {...register("confirmPassword")} placeholder="Repite la contraseña" style={inputStyle(!!errors.confirmPassword)} />
              {errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", padding: "0.85rem",
                background: isLoading ? "hsl(199, 40%, 55%)" : "hsl(199, 89%, 38%)",
                color: "white", border: "none", borderRadius: "8px",
                fontSize: "0.95rem", fontWeight: "500",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontFamily: "system-ui, sans-serif", marginTop: "0.25rem",
                transition: "background 0.2s",
              }}
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p style={{
            textAlign: "center", marginTop: "1.5rem",
            fontSize: "0.875rem", color: "hsl(215, 15%, 47%)",
            fontFamily: "system-ui, sans-serif",
          }}>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" style={{ color: "hsl(199, 89%, 38%)", textDecoration: "none", fontWeight: "500" }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}