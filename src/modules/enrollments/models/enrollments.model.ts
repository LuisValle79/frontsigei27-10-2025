/**
 * Modelos: Enrollment y Academic Period
 * Define las estructuras de datos para el módulo de Matrículas y Períodos Académicos
 */

// 📝 Modelo principal de Matrícula - Basado en API Backend
export interface Enrollment {
  // Campos de identificación
  id?: string; // Auto-generado por el backend
  studentId: string; // ✅ Requerido
  institutionId: string; // ✅ Requerido
  classroomId: string; // ✅ Requerido
  
  // Información académica
  academicYear: string; // ✅ Requerido - "2025", "2024"
  academicPeriodId: string; // ✅ Requerido
  enrollmentDate?: string; // ISO format date - Auto-generado
  enrollmentStatus?: 'ACTIVE' | 'INACTIVE' | 'PENDING'; // Default: "ACTIVE"
  enrollmentType?: 'NUEVA' | 'REINSCRIPCION'; // Default: "NUEVA"
  
  // Información del estudiante
  ageGroup: '3_AÑOS' | '4_AÑOS' | '5_AÑOS'; // ✅ Requerido
  shift: 'MAÑANA' | 'TARDE'; // ✅ Requerido
  section: string; // ✅ Requerido - "A", "B", "C"
  modality: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA'; // ✅ Requerido
  educationalLevel?: 'INITIAL' | 'PRIMARY' | 'SECONDARY'; // Default: "INITIAL"
  studentAge?: number; // 3, 4, 5
  
  // Información adicional
  enrollmentCode?: string; // "MAT2025001"
  previousInstitution?: string; // Solo para reinscripciones
  observations?: string; // Texto libre
  
  // 📋 Documentos Requeridos (todos boolean, default: false)
  birthCertificate?: boolean; // Partida de nacimiento
  studentDni?: boolean; // DNI del estudiante
  guardianDni?: boolean; // DNI del apoderado
  vaccinationCard?: boolean; // Carnet de vacunas
  disabilityCertificate?: boolean; // Certificado de discapacidad
  utilityBill?: boolean; // Recibo de servicios
  psychologicalReport?: boolean; // Informe psicológico
  studentPhoto?: boolean; // Foto del estudiante
  healthRecord?: boolean; // Ficha de salud
  signedEnrollmentForm?: boolean; // Ficha de matrícula firmada
  dniVerification?: boolean; // Verificación de DNI
  
  // Campo de control
  deleted?: boolean; // Soft delete - Default: false
}

// 🎓 Importar modelo de Período Académico desde su archivo específico
export type { AcademicPeriod, CreateAcademicPeriodDto, UpdateAcademicPeriodDto, AcademicPeriodFilters } from './academicPeriod.model';

// 📋 DTOs para creación y actualización
export interface CreateEnrollmentDto extends Omit<Enrollment, 'id' | 'enrollmentDate' | 'deleted'> {}

export interface UpdateEnrollmentDto extends Partial<Omit<Enrollment, 'id'>> {}



// 🔧 Tipos de utilidad
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  status: number;
  errors?: Record<string, string>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface DocumentProgress {
  completed: number;
  total: number;
  percentage: number;
}

// 📊 Filtros para búsquedas
export interface EnrollmentFilters {
  academicYear?: string;
  institutionId?: string;
  status?: string;
  shift?: string;
  ageGroup?: string;
  modality?: string;
  enrollmentType?: string;
  search?: string;
}



// 📝 Constantes de valores permitidos
export const ENROLLMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING'
} as const;

export const ENROLLMENT_TYPE = {
  NUEVA: 'NUEVA',
  REINSCRIPCION: 'REINSCRIPCION'
} as const;

export const AGE_GROUP = {
  THREE_YEARS: '3_AÑOS',
  FOUR_YEARS: '4_AÑOS',
  FIVE_YEARS: '5_AÑOS'
} as const;

export const SHIFT = {
  MORNING: 'MAÑANA',
  AFTERNOON: 'TARDE'
} as const;

export const MODALITY = {
  PRESENCIAL: 'PRESENCIAL',
  VIRTUAL: 'VIRTUAL',
  HIBRIDA: 'HIBRIDA'
} as const;

export const EDUCATIONAL_LEVEL = {
  INITIAL: 'INITIAL',
  PRIMARY: 'PRIMARY',
  SECONDARY: 'SECONDARY'
} as const;



// 📋 Lista de documentos requeridos
export const REQUIRED_DOCUMENTS = [
  { key: 'birthCertificate', label: 'Certificado de Nacimiento', required: true },
  { key: 'studentDni', label: 'DNI del Estudiante', required: true },
  { key: 'guardianDni', label: 'DNI del Apoderado', required: true },
  { key: 'vaccinationCard', label: 'Carné de Vacunación', required: true },
  { key: 'disabilityCertificate', label: 'Certificado de Discapacidad', required: false },
  { key: 'utilityBill', label: 'Recibo de Servicios', required: true },
  { key: 'psychologicalReport', label: 'Informe Psicológico', required: false },
  { key: 'studentPhoto', label: 'Foto del Estudiante', required: true },
  { key: 'healthRecord', label: 'Ficha de Salud', required: true },
  { key: 'signedEnrollmentForm', label: 'Formulario de Matrícula Firmado', required: true },
  { key: 'dniVerification', label: 'Verificación de DNI', required: true }
] as const;
