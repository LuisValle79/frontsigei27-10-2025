import type { Event, EventCreateRequest } from "../models/events.model"

const API_BASE_URL = "http://localhost:8080/api/v1/events"

export class EventsService {
  static async listActiveEvents(): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}`)
    if (!response.ok) throw new Error("Error fetching active events")
    return response.json()
  }

  static async listInactiveEvents(): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/inactive`)
    if (!response.ok) throw new Error("Error fetching inactive events")
    return response.json()
  }

  static async getEventById(id: number): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/${id}`)
    if (!response.ok) throw new Error("Error fetching event by ID")
    return response.json()
  }

  static async createEvent(event: EventCreateRequest): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    })
    if (!response.ok) throw new Error("Error creating event")
    return response.json()
  }

  static async updateEvent(id: number, event: EventCreateRequest): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    })
    if (!response.ok) throw new Error("Error updating event")
    return response.json()
  }

  static async logicalDeleteEvent(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Error deleting event")
  }

  static async restoreEvent(id: number): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/${id}/restore`, {
      method: "PATCH",
    })
    if (!response.ok) throw new Error("Error restoring event")
    try {
      return await response.json()
    } catch {
      return {} as Event // Si no devuelve JSON, el restore fue exitoso
    }
  }

  static async getTestInstitutions(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/test-institutions`)
    if (!response.ok) throw new Error("Error fetching test institutions")
    return response.json()
  }
}

export type { Event, EventCreateRequest }
