import { useQuery } from "@tanstack/react-query";
import { patientMeService } from "@/services/patientMeService";
import ProgressReportPage from "@/pages/ProgressReportPage";
import { Loader2 } from "lucide-react";

export default function PatientProgressReportPage() {
  const { data: me, isLoading } = useQuery({
    queryKey: ["patient-me"],
    queryFn: patientMeService.getMe,
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
        <Loader2 style={{ width: 32, height: 32, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!me) return null;

  // Inyectamos el id del paciente en la URL para que ProgressReportPage lo lea
  return <ProgressReportPage overridePatientId={me.id} />;
}