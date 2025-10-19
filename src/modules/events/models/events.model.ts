/**
 * Modelos y tipos para el módulo de Eventos
 */

export interface Evento {
  idEvento: number
  idInstitucion: string
  titulo: string
  descripcion: string
  fechaInicio: string
  fechaFin: string | null
  tipoEvento: string
  esFeriado: boolean
  recurrente: boolean
  esNacional: boolean
  estado: "A" | "I"
  afectaClases: boolean
  creadoPor: string
  creadoEn: string
  actualizadoEn: string
}

export interface EventoCreateRequest {
  idInstitucion: string
  titulo: string
  descripcion: string
  fechaInicio: string
  fechaFin: string | null
  tipoEvento: string
  esFeriado: boolean
  recurrente: boolean
  esNacional: boolean
  afectaClases: boolean
  creadoPor: string
}

export const TIPO_EVENTO = {
  ACADEMICO: "ACADEMICO",
  CULTURAL: "CULTURAL",
  DEPORTIVO: "DEPORTIVO",
  EVALUACION: "EVALUACION",
  CAPACITACION: "CAPACITACION",
  CEREMONIAL: "CEREMONIAL",
  INCIDENTE: "INCIDENTE",
} as const

export const TIPO_EVENTO_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  ACADEMICO: { label: "Académico", color: "bg-blue-100 text-blue-800", icon: "📚" },
  CULTURAL: { label: "Cultural", color: "bg-pink-100 text-pink-800", icon: "🎭" },
  DEPORTIVO: { label: "Deportivo", color: "bg-green-100 text-green-800", icon: "⚽" },
  EVALUACION: { label: "Evaluación", color: "bg-orange-100 text-orange-800", icon: "✏️" },
  CAPACITACION: { label: "Capacitación", color: "bg-indigo-100 text-indigo-800", icon: "🎓" },
  CEREMONIAL: { label: "Ceremonial", color: "bg-red-100 text-red-800", icon: "🏛️" },
  INCIDENTE: { label: "Incidente", color: "bg-red-200 text-red-900", icon: "⚠️" },
}
