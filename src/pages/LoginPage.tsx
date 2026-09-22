import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService, LoginData } from "@/services/authService";

const loginSchema = z.object({
  email: z.string().email("Debe ser un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function ContactModal({ onClose }: { onClose: () => void }) {
  const [hoveredGithub, setHoveredGithub] = useState<string | null>(null);

  const team = [
    {
      name: "Mariana Carvajal Rueda",
      role: "Desarrolladora FullStack",
      email: "mariana.carvajalr@udea.edu.co",
      github: "https://github.com/Mariaca1911",
      githubUser: "Mariaca1911",
    },
    {
      name: "Andrea Marín Díaz",
      role: "Desarrolladora FullStack",
      email: "andrea.marind.1@gmail.com",
      github: "https://github.com/marin-Diaz",
      githubUser: "marin-Diaz",
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "2.5rem",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          fontFamily: "system-ui, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "hsl(215, 25%, 15%)",
            }}
          >
            Contáctanos
          </h3>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.25rem",
              color: "hsl(215, 15%, 47%)",
              lineHeight: 1,
              padding: "0.25rem",
            }}
          >
            ✕
          </button>
        </div>

        <p
          style={{
            fontSize: "0.9rem",
            color: "hsl(215, 15%, 47%)",
            marginBottom: "1.5rem",
            lineHeight: 1.6,
          }}
        >
          COMPA es una plataforma desarrollada en el marco del curso
          Proyecto Integrador I — Universidad de Antioquia. Para más
          información, contáctanos:
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {team.map((person) => (
            <div
              key={person.email}
              style={{
                padding: "1rem 1.25rem",
                background: "hsl(210, 20%, 97%)",
                borderRadius: "10px",
                border: "1px solid hsl(214, 20%, 90%)",
              }}
            >
              <p
                style={{
                  margin: "0 0 0.2rem",
                  fontWeight: "600",
                  color: "hsl(215, 25%, 15%)",
                  fontSize: "0.95rem",
                }}
              >
                {person.name}
              </p>

              <p
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.8rem",
                  color: "hsl(199, 89%, 35%)",
                }}
              >
                {person.role}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <a
                  href={`mailto:${person.email}`}
                  style={{
                    fontSize: "0.85rem",
                    color: "hsl(199, 89%, 38%)",
                    textDecoration: "none",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  ✉ {person.email}
                </a>

                <a
                  href={person.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() =>
                    setHoveredGithub(person.githubUser)
                  }
                  onMouseLeave={() => setHoveredGithub(null)}
                  style={{
                    fontSize: "0.85rem",
                    color:
                      hoveredGithub === person.githubUser
                        ? "white"
                        : "hsl(215, 25%, 30%)",
                    textDecoration: "none",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "6px",
                    background:
                      hoveredGithub === person.githubUser
                        ? "hsl(215, 25%, 20%)"
                        : "hsl(214, 20%, 92%)",
                    border: "1px solid",
                    borderColor:
                      hoveredGithub === person.githubUser
                        ? "hsl(215, 25%, 30%)"
                        : "hsl(214, 20%, 85%)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                    width: "fit-content",
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill={
                      hoveredGithub === person.githubUser
                        ? "white"
                        : "currentColor"
                    }
                  >
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>

                  github.com/{person.githubUser}

                  {hoveredGithub === person.githubUser && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        opacity: 0.8,
                      }}
                    >
                      ↗
                    </span>
                  )}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid hsl(214, 20%, 90%)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.8rem",
              color: "hsl(215, 15%, 57%)",
            }}
          >
            Universidad de Antioquia · Ingeniería de Sistemas · 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await authService.login(data as LoginData);

      if (response.role === "ORIENTADOR") {
        navigate("/dashboard");
      } else if (response.role === "ESTUDIANTE") {
        navigate("/estudiante/home");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Georgia', 'Times New Roman', serif" }}>

        {/* Panel izquierdo — identidad de marca */}
        <div style={{
          width: "45%",
          background: "hsl(199, 89%, 18%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
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
          <div style={{
            position: "absolute", top: "40%", right: "-40px",
            width: "160px", height: "160px", borderRadius: "50%",
            border: "1px solid hsl(199, 60%, 35%)", opacity: 0.25,
          }} />

          <div style={{ position: "relative", textAlign: "center", color: "white", maxWidth: "320px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "20px",
              background: "hsl(199, 89%, 28%)",
              border: "1px solid hsl(199, 60%, 38%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 2rem",
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="hsl(199, 89%, 70%)" strokeWidth="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>

            <h1 style={{
              fontSize: "2rem", fontWeight: "400", letterSpacing: "-0.02em",
              color: "white", margin: "0 0 0.75rem", lineHeight: 1.2,
            }}>
              COMPA<br />
              <span style={{ color: "hsl(199, 89%, 65%)", fontStyle: "italic" }}>Acompañamiento estudiantil</span>
            </h1>

            <p style={{
              fontSize: "0.95rem", color: "hsl(199, 30%, 70%)",
              lineHeight: 1.7, margin: "0 0 3rem", fontFamily: "system-ui, sans-serif",
            }}>
              Plataforma para orientadores de la salud mental. Gestiona tus estudiantes con claridad y precisión.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: "👥", text: "Gestión integral de estudiantes" },
                { icon: "📋", text: "Planes de hábitos personalizados" },
                { icon: "📊", text: "Seguimiento de adherencia" },
              ].map((item) => (
                <div key={item.text} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  background: "hsl(199, 89%, 14%)",
                  borderRadius: "10px",
                  border: "1px solid hsl(199, 60%, 28%)",
                }}>
                  <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                  <span style={{
                    fontSize: "0.85rem", color: "hsl(199, 20%, 80%)",
                    fontFamily: "system-ui, sans-serif",
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowContact(true)}
              style={{
                marginTop: "2rem",
                background: "transparent",
                border: "1px solid hsl(199, 60%, 45%)",
                borderRadius: "8px",
                padding: "0.6rem 1.5rem",
                color: "hsl(199, 89%, 75%)",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                transition: "all 0.2s",
                width: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "hsl(199, 89%, 14%)";
                e.currentTarget.style.borderColor = "hsl(199, 60%, 55%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "hsl(199, 60%, 45%)";
              }}
            >
              {"✉"} Contáctanos
            </button>
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          background: "hsl(210, 20%, 98%)",
        }}>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div style={{ marginBottom: "2.5rem" }}>
              <h2 style={{
                fontSize: "1.75rem", fontWeight: "400",
                color: "hsl(215, 25%, 15%)", margin: "0 0 0.5rem",
                letterSpacing: "-0.02em",
              }}>
                Bienvenido de vuelta
              </h2>
              <p style={{
                fontSize: "0.9rem", color: "hsl(215, 15%, 47%)",
                fontFamily: "system-ui, sans-serif", margin: 0,
              }}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{
                  display: "block", fontSize: "0.8rem", fontWeight: "500",
                  color: "hsl(215, 25%, 30%)", marginBottom: "0.4rem",
                  fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="orientador@clinica.com"
                  style={{
                    width: "100%", padding: "0.75rem 1rem",
                    border: errors.email ? "1px solid hsl(0, 72%, 51%)" : "1px solid hsl(214, 20%, 85%)",
                    borderRadius: "8px", fontSize: "0.95rem",
                    background: "white", color: "hsl(215, 25%, 15%)",
                    fontFamily: "system-ui, sans-serif",
                    outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                />
                {errors.email && (
                  <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "hsl(0, 72%, 51%)", fontFamily: "system-ui, sans-serif" }}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: "block", fontSize: "0.8rem", fontWeight: "500",
                  color: "hsl(215, 25%, 30%)", marginBottom: "0.4rem",
                  fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  {...register("password")}
                  placeholder="Tu contraseña"
                  style={{
                    width: "100%", padding: "0.75rem 1rem",
                    border: errors.password ? "1px solid hsl(0, 72%, 51%)" : "1px solid hsl(214, 20%, 85%)",
                    borderRadius: "8px", fontSize: "0.95rem",
                    background: "white", color: "hsl(215, 25%, 15%)",
                    fontFamily: "system-ui, sans-serif",
                    outline: "none", boxSizing: "border-box",
                  }}
                />
                {errors.password && (
                  <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "hsl(0, 72%, 51%)", fontFamily: "system-ui, sans-serif" }}>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%", padding: "0.85rem",
                  background: isLoading ? "hsl(199, 40%, 55%)" : "hsl(199, 89%, 38%)",
                  color: "white", border: "none", borderRadius: "8px",
                  fontSize: "0.95rem", fontWeight: "500", cursor: isLoading ? "not-allowed" : "pointer",
                  fontFamily: "system-ui, sans-serif", marginTop: "0.5rem",
                  transition: "background 0.2s",
                }}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>

            <p style={{
              textAlign: "center", marginTop: "1.75rem",
              fontSize: "0.875rem", color: "hsl(215, 15%, 47%)",
              fontFamily: "system-ui, sans-serif",
            }}>
              ¿No tienes cuenta?{" "}
              <Link to="/register" style={{
                color: "hsl(199, 89%, 38%)", textDecoration: "none", fontWeight: "500",
              }}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}