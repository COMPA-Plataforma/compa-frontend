// Contenido de la política de tratamiento de datos personales.
// Marco: Ley Estatutaria 1581 de 2012, Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015)
// y las normas que los modifiquen. El contenido sigue lo que exige el art. 2.2.2.25.3.1 del Decreto 1074 de 2015.
// Los datos del responsable, el canal y la vigencia se editan SOLO aquí.

export const POLITICA_VIGENCIA = {
  desde: "14 de octubre de 2026",
  version: "1.0",
  // Periodo de vigencia de la base de datos (exigido por la ley)
  baseDeDatos:
    "La base de datos de COMPA estará vigente mientras dure el proceso de acompañamiento de cada estudiante y por el tiempo adicional que exijan las obligaciones legales. Cuando ya no se necesiten, los datos se suprimen.",
};

export const POLITICA_RESPONSABLE = {
  nombre: "Equipo de desarrollo de COMPA",
  descripcion:
    "COMPA es una plataforma de acompañamiento psicoorientador para estudiantes, desarrollada en el marco del curso Proyecto Integrador I de la Universidad de Antioquia.",
  domicilio: "Medellín, Antioquia, Colombia",
  // La ley pide también dirección y teléfono del responsable. Si se completan, aparecen en la página.
  direccion: "" as string,
  telefono: "" as string,
  // Persona o área encargada de atender peticiones, consultas y reclamos
  areaEncargada: "Equipo de desarrollo de COMPA",
  contactos: [
    { nombre: "Mariana Carvajal Rueda", email: "mariana.carvajalr@udea.edu.co" },
    { nombre: "Andrea Marín Díaz", email: "andrea.marind.1@gmail.com" },
  ],
};

export const POLITICA_ENCARGADOS =
  "Para funcionar, COMPA usa proveedores tecnológicos de alojamiento, base de datos y envío de correos electrónicos. Ellos tratan los datos por cuenta nuestra y solo para prestar ese servicio (son «encargados» del tratamiento). Algunos pueden tener sus servidores fuera de Colombia.";

export const POLITICA_DATOS_TRATADOS = [
  "Datos de identificación y contacto: nombre, documento de identidad, correo electrónico y teléfono.",
  "Datos de acompañamiento: registros de atención, seguimientos de sesión, plan de hábitos y su cumplimiento.",
  "Datos de bienestar y salud: check-ins diarios, nivel de riesgo, motivos de consulta y observaciones del psicoorientador, incluido el aseguramiento en salud.",
  "Datos de uso de la plataforma: alertas generadas, derivaciones a rutas de atención y notificaciones enviadas.",
];

export const POLITICA_FINALIDADES = [
  "Brindar acompañamiento psicoorientador al estudiante y llevar el historial de su proceso.",
  "Registrar y consultar los check-ins, el plan de hábitos y el avance entre sesiones.",
  "Generar alertas de riesgo para que el psicoorientador asignado pueda actuar oportunamente.",
  "Derivar al estudiante hacia una ruta de atención institucional o externa (por ejemplo, la EPS o el Hospital Alma Mater) cuando el psicoorientador lo considere necesario.",
  "Enviar notificaciones, recordatorios y mensajes de acompañamiento por correo electrónico.",
  "Garantizar la seguridad de la cuenta y el correcto funcionamiento de la plataforma.",
];

// Derechos del titular (art. 8 de la Ley 1581 de 2012)
export const POLITICA_DERECHOS = [
  "Conocer, actualizar y rectificar tus datos personales.",
  "Solicitar prueba de la autorización que diste para el tratamiento de tus datos.",
  "Ser informado sobre el uso que se ha dado a tus datos, si lo pides.",
  "Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.",
  "Revocar la autorización y solicitar la supresión de tus datos cuando no se respeten los principios, derechos y garantías legales. La revocatoria o la supresión no proceden si tienes un deber legal o contractual de permanecer en la base de datos.",
  "Acceder de forma gratuita a tus datos personales.",
];

export const POLITICA_PRINCIPIOS =
  "Tratamos tus datos respetando los principios de legalidad, finalidad, libertad, veracidad o calidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad.";

// Procedimiento para ejercer los derechos (arts. 14, 15 y 16 de la Ley 1581 de 2012)
export const POLITICA_SOLICITUD_REQUISITOS = [
  "Tu nombre completo y número de documento de identidad.",
  "Lo que pides: consultar, actualizar, rectificar o suprimir tus datos, o revocar tu autorización.",
  "Una descripción de los hechos que dan lugar a tu reclamo, si es un reclamo.",
  "Un correo o dirección donde quieras recibir la respuesta.",
  "Los documentos que quieras hacer valer, si los hay.",
];

export const POLITICA_PLAZOS = [
  "Consultas: respondemos en máximo 10 días hábiles desde que recibimos tu solicitud. Si no podemos, te contamos el motivo y la nueva fecha, que no será mayor a 5 días hábiles adicionales.",
  "Reclamos: si están incompletos, te pedimos corregirlos dentro de los 5 días siguientes a su recibo. Si pasan 2 meses sin que lo hagas, entendemos que desististe del reclamo.",
  "Una vez completo, marcamos tus datos con la leyenda «reclamo en trámite» en máximo 2 días hábiles y respondemos en máximo 15 días hábiles. Si no podemos, te informamos el motivo y la nueva fecha, que no será mayor a 8 días hábiles adicionales.",
];