import { Link, useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, CalendarDays, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import {
  POLITICA_DATOS_TRATADOS,
  POLITICA_DERECHOS,
  POLITICA_ENCARGADOS,
  POLITICA_FINALIDADES,
  POLITICA_PLAZOS,
  POLITICA_PRINCIPIOS,
  POLITICA_RESPONSABLE,
  POLITICA_SOLICITUD_REQUISITOS,
  POLITICA_VIGENCIA,
} from "@/lib/politicaDatos";

function Seccion({ numero, titulo, children }: { numero: number; titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3" aria-labelledby={`sec-${numero}`}>
      <h2 id={`sec-${numero}`} className="text-lg font-semibold tracking-tight text-foreground">
        {numero}. {titulo}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Lista({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

// Página pública: se puede abrir sin iniciar sesión (desde el login) y también desde el menú
export default function PoliticaDatosPage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const volver = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(user ? (user.role === "ESTUDIANTE" ? "/estudiante/home" : "/dashboard") : "/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to={user ? "/" : "/login"} className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight">COMPA</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={volver} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Protección de datos</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Política de tratamiento de datos personales
          </h1>
          <p className="text-sm text-muted-foreground">
            Aquí te explicamos qué datos tuyos usa COMPA, para qué los usa, qué derechos tienes y cómo ejercerlos,
            de acuerdo con la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y las demás normas colombianas sobre protección de datos personales (hábeas data).
          </p>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Vigente desde el {POLITICA_VIGENCIA.desde} · Versión {POLITICA_VIGENCIA.version}
          </p>
        </div>

        <Seccion numero={1} titulo="Responsable del tratamiento">
          <p>
            <strong className="text-foreground">{POLITICA_RESPONSABLE.nombre}</strong>. {POLITICA_RESPONSABLE.descripcion}
          </p>
          <ul className="space-y-1">
            <li>Domicilio: {POLITICA_RESPONSABLE.domicilio}.</li>
            {POLITICA_RESPONSABLE.direccion && <li>Dirección: {POLITICA_RESPONSABLE.direccion}.</li>}
            {POLITICA_RESPONSABLE.telefono && <li>Teléfono: {POLITICA_RESPONSABLE.telefono}.</li>}
            <li>
              Correo:{" "}
              {POLITICA_RESPONSABLE.contactos.map((c, k) => (
                <span key={c.email}>
                  {k > 0 && ", "}
                  <a href={`mailto:${c.email}`} className="text-primary underline-offset-2 hover:underline">
                    {c.email}
                  </a>
                </span>
              ))}
              .
            </li>
          </ul>
          <p>{POLITICA_ENCARGADOS}</p>
        </Seccion>

        <Seccion numero={2} titulo="Datos que tratamos">
          <Lista items={POLITICA_DATOS_TRATADOS} />
          <p>
            Los datos de bienestar y salud son <strong className="text-foreground">datos sensibles</strong>, es decir,
            datos que afectan tu intimidad. Responder las preguntas sobre ellos es facultativo: no estás obligado a
            hacerlo. Solo los tratamos con tu autorización explícita y para el acompañamiento.
          </p>
          <p>
            Si el titular es menor de edad, sus datos solo se tratan respetando su interés superior y sus derechos
            prevalentes, y con la autorización de su representante legal.
          </p>
        </Seccion>

        <Seccion numero={3} titulo="Autorización">
          <p>
            Tratamos tus datos con tu autorización previa, expresa e informada. La conservamos para poder demostrar
            que la diste. Puedes revocarla en cualquier momento, salvo cuando la ley o un contrato te obliguen a
            permanecer en la base de datos.
          </p>
          <p>{POLITICA_PRINCIPIOS}</p>
        </Seccion>

        <Seccion numero={4} titulo="Finalidades del tratamiento">
          <Lista items={POLITICA_FINALIDADES} />
          <p>No usamos tus datos para finalidades distintas a estas sin pedirte antes tu autorización.</p>
        </Seccion>

        <Seccion numero={5} titulo="Con quién compartimos tus datos">
          <p>
            No vendemos ni cedemos tus datos. Solo los compartimos con la ruta de atención a la que el psicoorientador
            te derive y con tu conocimiento, con los encargados mencionados en la sección 1 para que la plataforma
            funcione, o cuando una autoridad competente lo exija por ley. Si algún proveedor tiene sus servidores fuera
            de Colombia, los datos viajan con las medidas de seguridad necesarias para ese servicio.
          </p>
        </Seccion>

        <Seccion numero={6} titulo="Tus derechos como titular">
          <Lista items={POLITICA_DERECHOS} />
        </Seccion>

        <Seccion numero={7} titulo="Consultas y reclamos: cómo ejercer tus derechos">
          <p>
            Persona o área encargada de atender tus peticiones, consultas y reclamos:{" "}
            <strong className="text-foreground">{POLITICA_RESPONSABLE.areaEncargada}</strong>. Es gratis y puedes hacerlo
            escribiendo a:
          </p>
          <ul className="space-y-1.5">
            {POLITICA_RESPONSABLE.contactos.map((c) => (
              <li key={c.email} className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  {c.nombre}:{" "}
                  <a href={`mailto:${c.email}`} className="font-medium text-primary underline-offset-2 hover:underline">
                    {c.email}
                  </a>
                </span>
              </li>
            ))}
          </ul>
          <p>Tu solicitud debe incluir:</p>
          <Lista items={POLITICA_SOLICITUD_REQUISITOS} />
          <p>Plazos de respuesta:</p>
          <Lista items={POLITICA_PLAZOS} />
          <p>
            Solo puedes acudir a la Superintendencia de Industria y Comercio (SIC,{" "}
            <a
              href="https://www.sic.gov.co"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              www.sic.gov.co
            </a>
            ) después de haber agotado la consulta o el reclamo ante nosotros.
          </p>
        </Seccion>

        <Seccion numero={8} titulo="Seguridad de la información">
          <p>
            Aplicamos medidas técnicas y administrativas para proteger tus datos contra pérdida, acceso no autorizado,
            adulteración o uso indebido. Si ocurre una violación de seguridad que los afecte, la informaremos a la SIC
            y a las personas afectadas cuando corresponda.
          </p>
        </Seccion>

        <Seccion numero={9} titulo="Vigencia">
          <p>
            Esta política entra en vigencia el {POLITICA_VIGENCIA.desde} (versión {POLITICA_VIGENCIA.version}).{" "}
            {POLITICA_VIGENCIA.baseDeDatos}
          </p>
          <p>
            Si hacemos cambios sustanciales, te los comunicaremos antes de aplicarlos y publicaremos la nueva versión
            en esta página con su fecha de vigencia.
          </p>
        </Seccion>
      </main>
    </div>
  );
}