/**
 * Modelo: Enrollment
 * Define la estructura de datos para el módulo de Matrículas
 */

export interface Enrollment {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateEnrollmentDto {
  name: string
  description?: string
}

export interface UpdateEnrollmentDto extends Partial<CreateEnrollmentDto> {
  status?: 'active' | 'inactive'
}
