export type EstudianteStatus = "ACTIVO" | "INACTIVO";
export type HealthStatus = "CRITICO" | "ESTABLE" | "EN_OBSERVACION" | "LEVE";
export type PlanStatus = "ACTIVO" | "INACTIVO";
export type DeactivationReason = "ALTA_MEDICA" | "ABANDONO_PERDIDA_SEGUIMIENTO";
export type DocumentType = "CEDULA" | "TARJETA_DE_IDENTIDAD";

export interface Guardian {
  id?: number;
  name: string;
  lastName: string;
  documentType: DocumentType;
  identityDocument: string;
  relationship: string;
  email?: string;
  phoneNumber?: string;
}

export interface ClinicalInfo {
  id: number;
  mainCondition: string;
  secondaryConditions: string;
  healthStatus: HealthStatus;
  justification?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Estudiante {
  id: number;
  name: string;
  lastName: string;
  documentType: DocumentType;
  identityDocument: string;
  email: string;
  phoneNumber: string;
  status: EstudianteStatus;
  deactivationReason: string | null;
  deactivatedAt: string | null;
  createdAt: string;
  clinicalInfo: ClinicalInfo | null;
  guardian: Guardian | null;
}


export interface EstudianteListDTO {
  id: number;
  name: string;
  lastName: string;
  identityDocument: string;
  email: string;
  phoneNumber: string;
  status: EstudianteStatus;
  mainCondition?: string;
  healthStatus?: HealthStatus;
}

export type TaskPriority = "ALTA" | "MEDIA" | "BAJA";

export interface HabitTask {
  id: number;
  name: string;
  description: string;
  priority?: TaskPriority;
  mandatory?: boolean;
  weeklyGoal?: number | null;
  specificDays?: string[];
  createdAt: string;
}

export interface HabitPlan {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  createdAt: string;
  tasks: HabitTask[];
}

export interface HealthStatusHistory {
  id: number;
  previousStatus: HealthStatus;
  newStatus: HealthStatus;
  reason: string;
  changedAt: string;
}

export interface RuleTemplate {
  id: number;
  name: string;
  description: string;
  umbralDefault: number;
  umbralMin: number;
  umbralMax: number;
}

export interface PlanRule {
  id: number;
  ruleTemplate: RuleTemplate;
  umbralPersonalizado: number;
  active: boolean;
}

export interface EvaluationLog {
  id: number;
  planRule: {
    id: number;
    umbralPersonalizado: number;
    active: boolean;
    ruleTemplate: {
      id: number;
      name: string;
      description: string;
      umbralDefault: number;
      umbralMin: number;
      umbralMax: number;
    };
  };
  estudiante: {
    id: number;
    name: string;
    lastName: string;
  };
  evaluationDate: string;
  triggered: boolean;
  complianceValue: number;
  createdAt: string;
}

export type RiskLevel = "VERDE" | "AMARILLO" | "ROJO";

export interface RiskLevelInfo {
  estudianteId: number;
  estudianteName: string;
  riskLevel: RiskLevel;
  riskLevelDisplay: string;
  riskLevelDescription: string;
  compliancePercentage: number;
  evaluatedDate: string;
  createdAt: string;
}

export interface RiskLevelHistoryEntry {
  id: number;
  riskLevel: RiskLevel;
  riskLevelDisplay: string;
  previousRiskLevel: RiskLevel | null;
  previousRiskLevelDisplay: string | null;
  compliancePercentage: number;
  evaluatedDate: string;
  createdAt: string;
}