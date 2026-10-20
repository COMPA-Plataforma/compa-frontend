// Pie de página de las pantallas del personal (mismo contenido que el de AppLayout).
export function AppFooter() {
  return (
    <footer className="border-t bg-blue-100 px-6 py-3 text-center text-sm text-muted-foreground">
      <p className="font-medium text-foreground">COMPA - Acompañamiento estudiantil</p>
      <p className="mt-1">
        Desarrollado por{" "}
        <span className="font-medium text-foreground">Mariana Carvajal Rueda</span>
        {" "}&{" "}
        <span className="font-medium text-foreground">Andrea Marín Díaz</span>
        {" "}— Desarrolladoras FullStack
      </p>
      <p className="mt-1 text-xs">© {new Date().getFullYear()} Todos los derechos reservados</p>
    </footer>
  );
}
