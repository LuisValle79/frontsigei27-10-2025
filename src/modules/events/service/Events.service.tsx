import type { Evento, EventoCreateRequest } from "../models/events.model"

const API_BASE_URL = "http://localhost:8080/api/eventos"

export class EventsService {
  static async listarEventosActivos(): Promise<Evento[]> {
    const response = await fetch(`${API_BASE_URL}`)
    if (!response.ok) throw new Error("Error al listar eventos activos")
    return response.json()
  }

  static async listarEventosInactivos(): Promise<Evento[]> {
    const response = await fetch(`${API_BASE_URL}/inactivos`)
    if (!response.ok) throw new Error("Error al listar eventos inactivos")
    return response.json()
  }

  static async obtenerEventoPorId(id: number): Promise<Evento> {
    const response = await fetch(`${API_BASE_URL}/${id}`)
    if (!response.ok) throw new Error("Error al obtener evento")
    return response.json()
  }

  static async crearEvento(evento: EventoCreateRequest): Promise<Evento> {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evento),
    })
    if (!response.ok) throw new Error("Error al crear evento")
    return response.json()
  }

  static async editarEvento(id: number, evento: EventoCreateRequest): Promise<Evento> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evento),
    })
    if (!response.ok) throw new Error("Error al editar evento")
    return response.json()
  }

  static async eliminarEvento(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Error al eliminar evento")
  }

  static async restaurarEvento(id: number): Promise<Evento> {
    const response = await fetch(`${API_BASE_URL}/${id}/restaurar`, {
      method: "PATCH",
    })
    if (!response.ok) throw new Error("Error al restaurar evento")
    try {
      return await response.json()
    } catch {
      // If response is not JSON, return empty object - the restore was successful
      return {} as Evento
    }
  }

  static async obtenerInstitucionesPrueba(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/instituciones-prueba`)
    if (!response.ok) throw new Error("Error al obtener instituciones")
    return response.json()
  }
}

export type { Evento, EventoCreateRequest }
