/**
 * Modelo: Academic Period
 * Define las estructuras de datos para Períodos Académicos
 */

// 🎓 Modelo principal de Período Académico - Basado en API Backend
export interface AcademicPeriod {
  // Campos de identificación
  id?: string; // Auto-generado por el backend - "period_xxxxxxxx"
  institutionId: string; // ✅ Requerido - "inst_001"
  academicYear: string; // ✅ Requerido - "2025", "2024"
  periodName: string; // ✅ Requerido - "Primer Bimestre", "Segundo Semestre"
  
  // Fechas del período académico
  startDate: string; // ✅ Requerido - ISO format date
  endDate: string; // ✅ Requerido - ISO format date
  
  // Fechas del período de matrícula
  enrollmentPeriodStart: string; // ✅ Requerido - ISO format date
  enrollmentPeriodEnd: string; // ✅ Requerido - ISO format date
  
  // Configuración de matrícula tardía
  allowLateEnrollment: boolean; // Default: false
  lateEnrollmentEndDate?: string; // ISO format date - Requerido si allowLateEnrollment = true
  
  // Estado y control
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CLOSED'; // Default: "ACTIVE"
  deleted?: boolean; // Soft delete - Default: false
}

// 📋 DTOs para creación y actualización
export interface CreateAcademicPeriodDto extends Omit<AcademicPeriod, 'id' | 'deleted'> {}

export interface UpdateAcademicPeriodDto extends Partial<Omit<AcademicPeriod, 'id'>> {}

// 🔧 Tipos de utilidad específicos para Academic Periods
export interface AcademicPeriodFilters {
  academicYear?: string;
  institutionId?: string;
  status?: string;
  activeOnly?: boolean;
  enrollmentOpen?: boolean;
  search?: string;
}

export interface AcademicPeriodStats {
  total: number;
  active: number;
  closed: number;
  inactive: number;
  pending: number;
}

// 📝 Constantes de valores permitidos para Academic Periods
export const PERIOD_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  CLOSED: 'CLOSED'
} as const;

export type PeriodStatus = typeof PERIOD_STATUS[keyof typeof PERIOD_STATUS];

// 📅 Utilidades de fechas para períodos académicos
export interface PeriodDateRange {
  startDate: string;
  endDate: string;
  label: string;
}

export interface EnrollmentDateRange {
  enrollmentPeriodStart: string;
  enrollmentPeriodEnd: string;
  lateEnrollmentEndDate?: string;
  allowLateEnrollment: boolean;
}

// 🔍 Tipos para validación
export interface AcademicPeriodValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 📊 Tipos para reportes y estadísticas
export interface PeriodEnrollmentSummary {
  periodId: string;
  periodName: string;
  totalEnrollments: number;
  activeEnrollments: number;
  pendingEnrollments: number;
  enrollmentRate: number;
}

export interface InstitutionPeriodSummary {
  institutionId: string;
  academicYear: string;
  totalPeriods: number;
  activePeriods: number;
  totalEnrollments: number;
}