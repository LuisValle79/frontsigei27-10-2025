/**
 * Modelo: Event
 * Define la estructura de datos para el módulo de Eventos
 */

export interface Event {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface CreateEventDto {
  name: string
  description?: string
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  status?: 'active' | 'inactive'
}
