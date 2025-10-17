/**
 * Modelo: Attendance
 * Define la estructura de datos para el módulo de Asistencias
 */

export interface Attendance {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateAttendanceDto {
  name: string
  description?: string
}

export interface UpdateAttendanceDto extends Partial<CreateAttendanceDto> {
  status?: 'active' | 'inactive'
}
