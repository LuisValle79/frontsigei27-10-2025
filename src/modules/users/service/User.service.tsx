/**
 * Servicio: UserService
 * Maneja las peticiones al API para Usuarios
 */

import type { User, CreateUserDto, UpdateUserDto } from '../models/users.model'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await fetch(`${API_URL}/usuarios`)
    if (!response.ok) throw new Error('Error al obtener datos')
    return response.json()
  },

  async getById(id: string): Promise<User> {
    const response = await fetch(`${API_URL}/usuarios/${id}`)
    if (!response.ok) throw new Error('Error al obtener el registro')
    return response.json()
  },

  async create(data: CreateUserDto): Promise<User> {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Error al crear el registro')
    return response.json()
  },

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Error al actualizar el registro')
    return response.json()
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Error al eliminar el registro')
  },
}
