import { HeartHandshake, MessageCircle, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Datos de la Línea ALMA, como los indicó Bienestar
const TELEFONO = "018000 423874";
const TELEFONO_HREF = "tel:018000423874";
const WHATSAPP = "305 433 6317";
const WHATSAPP_HREF = "https://wa.me/573054336317";

const OPCIONES = [
  { numero: 1, texto: "Atención por temas de salud mental." },
  { numero: 2, texto: "Orientación y atención ante violencias basadas en género." },
  {
    numero: 3,
    texto: "Orientación para personas señaladas como responsables de algún tipo de violencia o discriminación basada en género.",
  },
];

// Recuadro de la pantalla de inicio del estudiante con la Línea ALMA como alternativa de orientación y atención
export function LineaAlmaCard() {
  return (
    <Card id="linea-alma" className="border-primary/30 bg-primary/5">
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold">¿Necesitas ayuda ahora? Línea ALMA</h2>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href={TELEFONO_HREF} className="flex items-center gap-2 font-medium underline-offset-2 hover:underline">
            <Phone className="h-4 w-4" /> {TELEFONO}
          </a>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-medium underline-offset-2 hover:underline"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp {WHATSAPP}
          </a>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Al comunicarte puedes elegir la opción que necesites:</p>
          <ul className="space-y-1">
            {OPCIONES.map((o) => (
              <li key={o.numero}>
                <span className="font-medium text-foreground">Opción {o.numero}: </span>
                {o.texto}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}