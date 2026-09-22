import { useQuery } from "@tanstack/react-query";
import { estudianteMeService } from "@/services/estudianteMeService";
import ProgressReportPage from "@/pages/ProgressReportPage";
import { Loader2 } from "lucide-react";

export default function EstudianteProgressReportPage() {
  const { data: me, isLoading } = useQuery({
    queryKey: ["estudiante-me"],
    queryFn: estudianteMeService.getMe,
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <Loader2 style={{ width: 32, height: 32, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!me) return null;

  // Inyectamos el id del estudiante en la URL para que ProgressReportPage lo lea
  return <ProgressReportPage overrideEstudianteId={me.id} />;
}