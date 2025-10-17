/**
 * Modelo: Academic
 * Define la estructura de datos para el módulo de Gestión Académica
 */

export interface Academic {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateAcademicDto {
  name: string
  description?: string
}

export interface UpdateAcademicDto extends Partial<CreateAcademicDto> {
  status?: 'active' | 'inactive'
}
