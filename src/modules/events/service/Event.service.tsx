/**
 * Servicio: EventService
 * Maneja las peticiones al API para Eventos
 */

import type { Event, CreateEventDto, UpdateEventDto } from '../models/events.model'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const eventsService = {
  async getAll(): Promise<Event[]> {
    const response = await fetch(`${API_URL}/eventos`)
    if (!response.ok) throw new Error('Error al obtener datos')
    return response.json()
  },

  async getById(id: string): Promise<Event> {
    const response = await fetch(`${API_URL}/eventos/${id}`)
    if (!response.ok) throw new Error('Error al obtener el registro')
    return response.json()
  },

  async create(data: CreateEventDto): Promise<Event> {
    const response = await fetch(`${API_URL}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Error al crear el registro')
    return response.json()
  },

  async update(id: string, data: UpdateEventDto): Promise<Event> {
    const response = await fetch(`${API_URL}/eventos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Error al actualizar el registro')
    return response.json()
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/eventos/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Error al eliminar el registro')
  },
}
