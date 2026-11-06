import {
  AUTORIZACION_ASENTIMIENTO,
  AUTORIZACION_DECLARACION,
  AUTORIZACION_ENTREGA,
  AUTORIZACION_INTRO,
  AUTORIZACION_SECCIONES,
  AUTORIZACION_TITULO,
  AUTORIZACION_VERSION,
} from "./autorizacionRepresentante";

// Si algún dato no se conoce todavía (por ejemplo, al imprimir antes de registrar al estudiante),
// se deja una línea en blanco para llenarlo a mano.
export interface DatosEstudianteAutorizacion {
  nombre?: string;
  tipoDocumento?: string;
  documento?: string;
}

// Datos del representante legal. Los que lleguen vienen ya escritos en el documento;
// los que falten se dejan en blanco para llenarlos a mano.
export interface DatosAcudienteAutorizacion {
  nombre?: string;
  documento?: string;
  parentesco?: string;
  telefono?: string;
  email?: string;
}

const MARGEN = 20;
const ANCHO = 210 - MARGEN * 2;
const ALTO_PAGINA = 297;
const LIMITE_INFERIOR = ALTO_PAGINA - 20;

// Genera y descarga el PDF de la autorización del representante legal, con los datos del estudiante y,
// si se conocen, los del representante legal ya escritos. Lo que falte queda en blanco para llenar a mano.
export async function descargarAutorizacionPdf(est: DatosEstudianteAutorizacion, acudiente: DatosAcudienteAutorizacion = {}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGEN;

  const espacio = (alto: number) => {
    if (y + alto > LIMITE_INFERIOR) {
      doc.addPage();
      y = MARGEN;
    }
  };

  const parrafo = (texto: string, opts: { size?: number; bold?: boolean; sangria?: number; gap?: number } = {}) => {
    const { size = 10, bold = false, sangria = 0, gap = 2 } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lineas = doc.splitTextToSize(texto, ANCHO - sangria) as string[];
    const alto = size * 0.4;
    for (const l of lineas) {
      espacio(alto);
      doc.text(l, MARGEN + sangria, y);
      y += alto;
    }
    y += gap;
  };

  const titulo = (texto: string) => {
    espacio(14);
    y += 2;
    parrafo(texto, { size: 11, bold: true, gap: 1.5 });
  };

  const item = (texto: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lineas = doc.splitTextToSize(texto, ANCHO - 6) as string[];
    lineas.forEach((l, i) => {
      espacio(4);
      if (i === 0) doc.text("•", MARGEN + 1.5, y);
      doc.text(l, MARGEN + 6, y);
      y += 4;
    });
    y += 1;
  };

  // Campo para llenar a mano: etiqueta y línea
  const campoLinea = (etiqueta: string, x: number, ancho: number, yy: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(etiqueta, x, yy);
    const w = doc.getTextWidth(etiqueta) + 2;
    doc.line(x + w, yy + 0.8, x + ancho, yy + 0.8);
  };

  // ── Encabezado ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("COMPA", MARGEN, y);
  y += 7;
  parrafo(AUTORIZACION_TITULO, { size: 12, bold: true, gap: 3 });
  parrafo(AUTORIZACION_INTRO, { size: 10, gap: 3 });

  // ── Datos del estudiante (prellenados) ──
  titulo("Datos del estudiante (menor de edad)");
  const nombre = est.nombre?.trim();
  const documento = est.documento?.trim();
  if (nombre) {
    parrafo(`Nombre: ${nombre}`);
  } else {
    espacio(10);
    y += 2;
    campoLinea("Nombre completo del estudiante:", MARGEN, ANCHO, y);
    y += 8;
  }
  if (documento) {
    parrafo(`Documento: ${est.tipoDocumento ?? "Tarjeta de identidad"} ${documento}`);
  } else {
    espacio(10);
    y += 2;
    campoLinea("Tarjeta de identidad No.:", MARGEN, 100, y);
    y += 8;
  }

  // ── Datos del representante legal (escritos si se conocen, si no en blanco) ──
  titulo("Datos del representante legal");
  espacio(40);
  y += 3;
  // Un dato conocido se escribe tal cual; si falta, queda la línea para llenarlo a mano
  const campo = (etiqueta: string, valor: string | undefined, x: number, ancho: number, yy: number) => {
    const v = valor?.trim();
    if (!v) {
      campoLinea(etiqueta, x, ancho, yy);
      return;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(etiqueta, x, yy);
    const w = doc.getTextWidth(etiqueta) + 2;
    doc.setFont("helvetica", "bold");
    const lineas = doc.splitTextToSize(v, ancho - w) as string[];
    doc.text(lineas[0], x + w, yy);
    doc.setFont("helvetica", "normal");
  };
  campo("Nombre completo:", acudiente.nombre, MARGEN, ANCHO, y);
  y += 9;
  campo("Cédula de ciudadanía:", acudiente.documento, MARGEN, 85, y);
  campo("Parentesco:", acudiente.parentesco, MARGEN + 90, ANCHO - 90, y);
  y += 9;
  campo("Teléfono:", acudiente.telefono, MARGEN, 85, y);
  campo("Correo electrónico:", acudiente.email, MARGEN + 90, ANCHO - 90, y);
  y += 8;

  // ── Cuerpo ──
  for (const s of AUTORIZACION_SECCIONES) {
    titulo(s.titulo);
    s.parrafos?.forEach((p) => parrafo(p));
    s.items?.forEach(item);
  }

  // ── Autorización y firmas ── (la declaración y las firmas van siempre juntas en la misma página)
  espacio(95);
  titulo("Autorización");
  parrafo(AUTORIZACION_DECLARACION);
  parrafo(AUTORIZACION_ASENTIMIENTO);

  y += 14;
  doc.line(MARGEN, y, MARGEN + 80, y);
  doc.line(MARGEN + 90, y, MARGEN + ANCHO, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Firma del representante legal", MARGEN, y);
  doc.text("Firma del estudiante", MARGEN + 90, y);
  y += 12;
  campoLinea("Fecha (día/mes/año):", MARGEN, 70, y);
  y += 10;
  parrafo(AUTORIZACION_ENTREGA, { size: 9, bold: true });

  // ── Pie con numeración ──
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`COMPA · Autorización del representante legal · Versión ${AUTORIZACION_VERSION}`, MARGEN, ALTO_PAGINA - 10);
    doc.text(`Página ${i} de ${paginas}`, 210 - MARGEN, ALTO_PAGINA - 10, { align: "right" });
  }

  doc.save("Autorizacion-representante-legal-COMPA.pdf");
}