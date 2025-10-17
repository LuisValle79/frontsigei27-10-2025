/**
 * Servicio: EnrollmentService
 * Maneja las peticiones al API para Matrículas
 */

import type { Enrollment, CreateEnrollmentDto, UpdateEnrollmentDto } from '../models/enrollments.model'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const enrollmentsService = {
  async getAll(): Promise<Enrollment[]> {
    const response = await fetch(`${API_URL}/matriculas`)
    if (!response.ok) throw new Error('Error al obtener datos')
    return response.json()
  },

  async getById(id: string): Promise<Enrollment> {
    const response = await fetch(`${API_URL}/matriculas/${id}`)
    if (!response.ok) throw new Error('Error al obtener el registro')
    return response.json()
  },

  async create(data: CreateEnrollmentDto): Promise<Enrollment> {
    const response = await fetch(`${API_URL}/matriculas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Error al crear el registro')
    return response.json()
  },

  async update(id: string, data: UpdateEnrollmentDto): Promise<Enrollment> {
    const response = await fetch(`${API_URL}/matriculas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Error al actualizar el registro')
    return response.json()
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/matriculas/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Error al eliminar el registro')
  },
}
