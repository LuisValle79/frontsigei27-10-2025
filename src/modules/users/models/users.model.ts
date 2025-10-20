/**
 * Modelo: User
 * Define la estructura de datos para el módulo de Usuarios
 */

export interface User {
  userId: string
  institutionId: string
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  phone: string
  address: string
  email: string
  userName: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export type UserRole = 'ADMIN' | 'PADRE' | 'MADRE' | 'DIRECTOR' | 'AUXILIAR' | 'TUTOR'

export type UserStatus = 'A' | 'I'

export interface CreateUserDto {
  institutionId: string
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  phone: string
  address: string
  email: string
  userName: string
  role: UserRole
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  status?: UserStatus
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  timestamp: string
}

export interface UserFilters {
  status?: UserStatus
  role?: UserRole
  search?: string
}
