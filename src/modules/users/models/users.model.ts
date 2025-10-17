/**
 * Modelo: User
 * Define la estructura de datos para el módulo de Usuarios
 */

export interface User {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  name: string
  description?: string
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  status?: 'active' | 'inactive'
}
