/**
 * Modelo: Psychology
 * Define la estructura de datos para el módulo de Psicología
 */

export interface Psychology {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreatePsychologyDto {
  name: string
  description?: string
}

export interface UpdatePsychologyDto extends Partial<CreatePsychologyDto> {
  status?: 'active' | 'inactive'
}
