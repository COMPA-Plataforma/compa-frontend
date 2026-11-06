// Texto de la autorización del representante legal de un estudiante menor de edad.
// El documento se descarga en PDF, lo firma el representante y se entrega al psicoorientador.
// Se mantiene alineado con el consentimiento de acompañamiento y el de tratamiento de datos.

export const AUTORIZACION_VERSION = "1.0";

export const AUTORIZACION_TITULO =
  "Autorización del representante legal para el acompañamiento de psicoorientación en COMPA";

export const AUTORIZACION_INTRO =
  "Este documento es para el representante legal (madre, padre o tutor) de un estudiante menor de 18 años que usa COMPA. " +
  "Léalo con calma, fírmelo si está de acuerdo junto con el estudiante, y el estudiante lo sube escaneado a COMPA.";

export interface SeccionAutorizacion {
  titulo: string;
  parrafos?: string[];
  items?: string[];
}

export const AUTORIZACION_SECCIONES: SeccionAutorizacion[] = [
  {
    titulo: "Qué es COMPA y para qué sirve",
    parrafos: [
      "COMPA es una aplicación web que apoya el acompañamiento y seguimiento entre sesiones de psicoorientación. " +
        "No reemplaza las sesiones con el psicoorientador: las complementa.",
      "La psicoorientación es un servicio de orientación y acompañamiento. No incluye diagnóstico ni tratamiento clínico, " +
        "y COMPA no reemplaza la atención médica, psicológica clínica, psiquiátrica ni de urgencias.",
    ],
  },
  {
    titulo: "Qué implica la participación del estudiante",
    items: [
      "Sesiones con su psicoorientador, en las que él registra la atención (motivos de consulta e información de la sesión) y los compromisos acordados. Este registro solo lo consulta el psicoorientador.",
      "Un plan de acompañamiento con las actividades que acuerdan en cada sesión, que el estudiante puede consultar en la plataforma.",
      "El reporte del cumplimiento de sus actividades, el motivo cuando no pudo realizarlas y, si quiere, un comentario, además del registro de su estado de ánimo.",
      "Recordatorios de sus actividades pendientes y mensajes de acompañamiento por correo electrónico, según sus motivos de consulta.",
      "El seguimiento de su adherencia al plan por parte del psicoorientador, para conversar con él en la sesión sobre su avance y sus dificultades.",
    ],
  },
  {
    titulo: "Alertas y derivación",
    parrafos: [
      "Si el sistema detecta una baja adherencia al plan, el psicoorientador podrá recibir una alerta para acercarse al estudiante y apoyarlo.",
      "Si el psicoorientador considera que el estudiante necesita otro tipo de atención, podrá orientarlo o derivarlo hacia una ruta institucional o externa " +
        "(por ejemplo, su EPS o el Hospital Alma Máter), y la plataforma registrará el avance de ese proceso.",
    ],
  },
  {
    titulo: "Confidencialidad y sus límites",
    parrafos: [
      "El psicoorientador mantendrá la confidencialidad de lo que el estudiante comparta con él. Esta confidencialidad puede tener límites cuando exista un riesgo " +
        "para la vida o integridad del estudiante o de otras personas, o cuando una autoridad competente lo exija conforme a la ley.",
      "Para apoyar la planificación de talleres y actividades de psicoorientación, el área de Bienestar Institucional solo conocerá información agregada y anonimizada, " +
        "a partir de la cual no es posible identificar al estudiante.",
    ],
  },
  {
    titulo: "Línea ALMA",
    parrafos: [
      "Si el estudiante necesita ayuda, puede comunicarse con la Línea ALMA: teléfono 018000 423874 o WhatsApp 305 433 6317. Al comunicarse puede elegir:",
    ],
    items: [
      "Opción 1: atención por temas de salud mental.",
      "Opción 2: orientación y atención ante violencias basadas en género.",
      "Opción 3: orientación para personas señaladas como responsables de algún tipo de violencia o discriminación basada en género.",
    ],
  },
  {
    titulo: "Tratamiento de datos personales del estudiante",
    parrafos: [
      "Los datos del estudiante se tratan de acuerdo con la Ley Estatutaria 1581 de 2012 y sus decretos reglamentarios, respetando su interés superior y sus derechos prevalentes.",
      "Responsable del tratamiento: Equipo de desarrollo de COMPA, plataforma de acompañamiento psicoorientador desarrollada en el marco del curso Proyecto Integrador I " +
        "de la Universidad de Antioquia (Medellín, Antioquia, Colombia). Contacto: mariana.carvajalr@udea.edu.co y andrea.marind.1@gmail.com.",
      "Datos que se tratan: identificación y contacto (nombre, documento, correo y teléfono); acompañamiento (registros de atención, seguimientos, plan de hábitos y su cumplimiento); " +
        "bienestar y salud (check-ins diarios, nivel de riesgo, motivos de consulta, observaciones del psicoorientador y aseguramiento en salud); y uso de la plataforma " +
        "(alertas, derivaciones y notificaciones).",
      "Parte de estos datos se refiere a la salud y al estado emocional del estudiante, por lo que son datos sensibles. Nadie está obligado a autorizar su tratamiento " +
        "y el estudiante puede negarse a responder cualquier pregunta sobre ellos. Si no se autoriza, el estudiante no podrá usar la plataforma.",
      "Finalidades: brindar acompañamiento psicoorientador y llevar el historial del proceso; registrar el plan, los check-ins y el avance entre sesiones; generar alertas de riesgo " +
        "para que el psicoorientador actúe oportunamente; derivar al estudiante a una ruta de atención cuando sea necesario; enviar notificaciones y recordatorios por correo; " +
        "generar informes agregados y anonimizados para Bienestar Institucional; y garantizar la seguridad de la cuenta y el funcionamiento de la plataforma.",
      "Quién ve la información: la información de acompañamiento solo la consultan el estudiante y el psicoorientador que tiene asignado. COMPA usa proveedores tecnológicos " +
        "de alojamiento, base de datos y envío de correos que tratan los datos por cuenta del responsable y solo para prestar ese servicio.",
    ],
  },
  {
    titulo: "Derechos del estudiante y de su representante legal",
    parrafos: ["El representante legal puede ejercer, en nombre del estudiante, estos derechos:"],
    items: [
      "Conocer, actualizar y rectificar sus datos personales.",
      "Solicitar prueba de esta autorización.",
      "Ser informado sobre el uso que se ha dado a sus datos.",
      "Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.",
      "Revocar la autorización y solicitar la supresión de los datos cuando no se respeten los principios, derechos y garantías legales.",
      "Acceder de forma gratuita a sus datos personales.",
    ],
  },
  {
    titulo: "Vigencia, participación voluntaria y retiro",
    parrafos: [
      "Los datos se conservarán mientras dure el proceso de acompañamiento y por el tiempo adicional que exijan las obligaciones legales. Después se suprimen.",
      "La participación del estudiante es voluntaria. El representante legal puede retirar esta autorización en cualquier momento, escribiendo al equipo de COMPA o al psicoorientador, " +
        "sin que esto afecte la atención que el estudiante recibe de su psicoorientador. Puede consultar la política completa en la página «Política de tratamiento de datos» de COMPA.",
    ],
  },
];

export const AUTORIZACION_DECLARACION =
  "Declaro que soy el representante legal del estudiante identificado arriba, que leí y entendí este documento y que mis preguntas fueron resueltas. " +
  "De manera libre, previa, expresa e informada, autorizo su participación en el acompañamiento de psicoorientación en COMPA y el tratamiento de sus datos personales, " +
  "incluidos sus datos sensibles de bienestar y salud, para las finalidades descritas.";

export const AUTORIZACION_ASENTIMIENTO =
  "El estudiante fue informado y escuchado sobre su participación en COMPA, de acuerdo con su edad y madurez, y manifiesta estar de acuerdo.";

export const AUTORIZACION_ENTREGA =
  "El estudiante debe subir este documento firmado y escaneado a COMPA. El psicoorientador lo revisará y, cuando lo apruebe, el estudiante podrá usar la plataforma.";