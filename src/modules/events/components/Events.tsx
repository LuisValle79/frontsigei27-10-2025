"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Event, EventCreateRequest } from "../models/events.model"
import { TIPO_EVENTO, TIPO_EVENTO_LABELS } from "../models/events.model"
import { EventsService } from "../service/Events.service"
import { Plus, Edit2, Trash2, RotateCcw, X, Calendar, AlertCircle, CheckCircle, Eye } from "lucide-react"
import Swal from "sweetalert2"

export function Events() {
  const [eventos, setEventos] = useState<Event[]>([])
  const [instituciones, setInstituciones] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showInactivos, setShowInactivos] = useState(false)
  const [editingEvento, setEditingEvento] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [detailsEvento, setDetailsEvento] = useState<Event | null>(null)

  const [formData, setFormData] = useState<EventCreateRequest>({
    institutionId: "",
    title: "",
    description: "",
    startDate: "",
    endDate: null,
    eventType: TIPO_EVENTO.ACADEMICO,
    isHoliday: false,
    isRecurring: false,
    isNational: false,
    affectsClasses: false,
    createdBy: "admin",
  })

  useEffect(() => {
    cargarDatos()
  }, [showInactivos])

  const cargarDatos = async (inactivos?: boolean) => {
    try {
      setLoading(true)
      const isInactive = inactivos !== undefined ? inactivos : showInactivos
      const [eventosData, institucionesData] = await Promise.all([
        isInactive ? EventsService.listInactiveEvents() : EventsService.listActiveEvents(),
        EventsService.getTestInstitutions(),
      ])
      setEventos(eventosData)
      setInstituciones(institucionesData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.institutionId.trim()) {
      errors.institutionId = "La institución es requerida"
    }
    if (!formData.title.trim()) {
      errors.title = "El título es requerido"
    } else if (formData.title.length < 3) {
      errors.title = "El título debe tener al menos 3 caracteres"
    }
    if (!formData.description.trim()) {
      errors.description = "La descripción es requerida"
    } else if (formData.description.length < 10) {
      errors.description = "La descripción debe tener al menos 10 caracteres"
    }
    if (!formData.startDate) {
      errors.startDate = "La fecha de inicio es requerida"
    }
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const showEventPreview = (evento: EventCreateRequest) => {
    const attributes = []
    if (evento.isHoliday) attributes.push("🎉 Feriado")
    if (evento.isRecurring) attributes.push("🔄 Recurrente")
    if (evento.isNational) attributes.push("🇵🇪 Nacional")
    if (evento.affectsClasses) attributes.push("⚠️ Afecta Clases")

    const previewHTML = `
      <div style="text-align: left; padding: 20px; background: #f8f9fa; border-radius: 12px;">
        <div style="margin-bottom: 16px;">
          <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px 0; font-weight: 600;">Título</p>
          <p style="margin: 0; color: #333; font-weight: 500; font-size: 14px;">${evento.title}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div>
            <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px 0; font-weight: 600;">Fecha Inicio</p>
            <p style="margin: 0; color: #333; font-weight: 500; font-size: 14px;">${new Date(evento.startDate).toLocaleDateString("es-PE")}</p>
          </div>
          ${
            evento.endDate
              ? `
            <div>
              <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px 0; font-weight: 600;">Fecha Fin</p>
              <p style="margin: 0; color: #333; font-weight: 500; font-size: 14px;">${new Date(evento.endDate).toLocaleDateString("es-PE")}</p>
            </div>
          `
              : ""
          }
        </div>

        <div style="margin-bottom: 16px;">
          <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px 0; font-weight: 600;">Descripción</p>
          <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.5;">${evento.description}</p>
        </div>

        <div style="margin-bottom: 16px;">
          <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px 0; font-weight: 600;">Tipo de Evento</p>
          <p style="margin: 0; color: #333; font-weight: 500; font-size: 14px;">${TIPO_EVENTO_LABELS[evento.eventType]?.label}</p>
        </div>

        ${
          attributes.length > 0
            ? `
          <div>
            <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 600;">Atributos</p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${attributes.map((attr) => `<span style="display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;">${attr}</span>`).join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `

    return previewHTML
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const previewHTML = showEventPreview(formData)

    const result = await Swal.fire({
      title: editingEvento ? "¿Actualizar Evento?" : "¿Agregar Evento?",
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 15px; color: #666;">
            ${editingEvento ? "¿Estás seguro de actualizar este evento?" : "¿Estás seguro de agregar este evento?"}
          </p>
          ${previewHTML}
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: editingEvento ? "Actualizar" : "Agregar",
      cancelButtonText: "Cancelar",
      backdrop: true,
      customClass: {
        popup: "swal-popup",
        title: "swal-title",
        htmlContainer: "swal-html",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
    })

    if (!result.isConfirmed) return

    try {
      if (editingEvento) {
        await EventsService.updateEvent(editingEvento.eventId, formData)
      } else {
        await EventsService.createEvent(formData)
      }
      setShowModal(false)
      resetForm()
      cargarDatos()

      Swal.fire({
        title: "¡Éxito!",
        text: editingEvento ? "Evento actualizado correctamente" : "Evento creado correctamente",
        icon: "success",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "swal-popup",
          title: "swal-title",
          confirmButton: "swal-confirm-btn",
        },
      })
    } catch (error) {
      console.error("Error al guardar evento:", error)
      Swal.fire({
        title: "Error",
        text: "Hubo un error al guardar el evento",
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-popup",
          title: "swal-title",
          confirmButton: "swal-confirm-btn",
        },
      })
    }
  }

  const handleEdit = (evento: Event) => {
    setEditingEvento(evento)
    setFormData({
      institutionId: evento.institutionId,
      title: evento.title,
      description: evento.description,
      startDate: evento.startDate,
      endDate: evento.endDate,
      eventType: evento.eventType,
      isHoliday: evento.isHoliday,
      isRecurring: evento.isRecurring,
      isNational: evento.isNational,
      affectsClasses: evento.affectsClasses,
      createdBy: evento.createdBy,
    })
    setValidationErrors({})
    setShowModal(true)
  }

  const handleDelete = async (evento: Event) => {
  const previewHTML = showEventPreview(evento)

  const result = await Swal.fire({
    title: "¿Eliminar Evento?",
    html: `
      <div style="text-align: left;">
        <p style="margin-bottom: 15px; color: #666;">
          ¿Estás seguro de eliminar este evento?
        </p>
        ${previewHTML}
      </div>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    backdrop: true,
    customClass: {
      popup: "swal-popup",
      title: "swal-title",
      htmlContainer: "swal-html",
      confirmButton: "swal-confirm-btn",
      cancelButton: "swal-cancel-btn",
    },
  })

  if (!result.isConfirmed) return

  try {
    // 👇 Aquí agregas el console.log solicitado
    console.log("🟠 ID del evento a eliminar:", evento.eventId)

    await EventsService.logicalDeleteEvent(evento.eventId)
    cargarDatos()

    Swal.fire({
      title: "¡Eliminado!",
      text: "Evento eliminado correctamente",
      icon: "success",
      confirmButtonColor: "#3b82f6",
      customClass: {
        popup: "swal-popup",
        title: "swal-title",
        confirmButton: "swal-confirm-btn",
      },
    })
  } catch (error) {
    console.error("Error al eliminar evento:", error)
    Swal.fire({
      title: "Error",
      text: "Hubo un error al eliminar el evento",
      icon: "error",
      confirmButtonColor: "#ef4444",
      customClass: {
        popup: "swal-popup",
        title: "swal-title",
        confirmButton: "swal-confirm-btn",
      },
    })
  }
}


  const handleRestore = async (evento: Event) => {
    const previewHTML = showEventPreview(evento)

    const result = await Swal.fire({
      title: "¿Restaurar Evento?",
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 15px; color: #666; font-size: 14px;">
            ¿Estás seguro que quieres restaurar este evento?
          </p>
          ${previewHTML}
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Restaurar",
      cancelButtonText: "Cancelar",
      backdrop: true,
      customClass: {
        popup: "swal-popup",
        title: "swal-title",
        htmlContainer: "swal-html",
        confirmButton: "swal-confirm-btn",
        cancelButton: "swal-cancel-btn",
      },
    })

    if (!result.isConfirmed) return

    try {
      await EventsService.restoreEvent(evento.eventId)
      await cargarDatos(false)

      Swal.fire({
        title: "¡Restaurado!",
        text: "Evento restaurado correctamente",
        icon: "success",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "swal-popup",
          title: "swal-title",
          confirmButton: "swal-confirm-btn",
        },
      })
    } catch (error) {
      console.error("Error al restaurar evento:", error)
      Swal.fire({
        title: "Error",
        text: "Hubo un error al restaurar el evento",
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-popup",
          title: "swal-title",
          confirmButton: "swal-confirm-btn",
        },
      })
    }
  }

  const resetForm = () => {
    setEditingEvento(null)
    setValidationErrors({})
    setFormData({
      institutionId: "",
      title: "",
      description: "",
      startDate: "",
      endDate: null,
      eventType: TIPO_EVENTO.ACADEMICO,
      isHoliday: false,
      isRecurring: false,
      isNational: false,
      affectsClasses: false,
      createdBy: "admin",
    })
  }

  const eventosFiltrados = eventos.filter(
    (evento) =>
      (evento.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filterTipo || evento.eventType === filterTipo),
  )

  const getEventIcon = (tipoEvento: string) => {
    return TIPO_EVENTO_LABELS[tipoEvento]?.icon || "📅"
  }

  const getEventColor = (tipoEvento: string) => {
    return TIPO_EVENTO_LABELS[tipoEvento]?.color || "bg-gray-100 text-gray-800"
  }

  const isEventoProximo = (fechaInicio: string) => {
    const hoy = new Date()
    const fecha = new Date(fechaInicio)
    const diasDiferencia = Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    return diasDiferencia >= 0 && diasDiferencia <= 7
  }

  return (
    <div>
      <div
        className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6 ${showModal || detailsEvento ? "blur-sm" : ""}`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gestión de Eventos
              </h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">
                Administra fechas cívicas, eventos académicos e incidentes
              </p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            >
              <Plus size={20} />
              Nuevo Evento
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-4 backdrop-blur-sm">
            <div className="flex flex-col gap-3 md:gap-4">
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Buscar eventos por título o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                >
                  <option value="">Todos los tipos</option>
                  {Object.entries(TIPO_EVENTO).map(([key, value]) => (
                    <option key={key} value={value}>
                      {TIPO_EVENTO_LABELS[value]?.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowInactivos(!showInactivos)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm whitespace-nowrap ${
                    showInactivos
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {showInactivos ? "Ver Activos" : "Ver Inactivos"}
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : eventosFiltrados.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No se encontraron eventos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                        Tipo
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                        Título
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                        Fecha Inicio
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-gray-700">
                        Estado
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {eventosFiltrados.map((evento, index) => (
                      <tr
                        key={evento.eventId}
                        className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span
                            className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getEventColor(evento.eventType)}`}
                          >
                            <span>{getEventIcon(evento.eventType)}</span>
                            <span className="hidden sm:inline">{TIPO_EVENTO_LABELS[evento.eventType]?.label}</span>
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-gray-900">
                          {evento.title}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                          {new Date(evento.startDate).toLocaleDateString("es-PE")}
                          {isEventoProximo(evento.startDate) && (
                            <span className="ml-2 inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                              Próximo
                            </span>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full ${
                              evento.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {evento.status === "ACTIVE" ? (
                              <>
                                <CheckCircle size={14} />
                                <span className="hidden sm:inline">Activo</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle size={14} />
                                <span className="hidden sm:inline">Inactivo</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center justify-center gap-1 md:gap-2">
                            <button
                              onClick={() => setDetailsEvento(evento)}
                              className="p-1.5 md:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Ver Detalles"
                            >
                              <Eye size={16} className="md:w-5 md:h-5" />
                            </button>
                            {evento.status === "ACTIVE" ? (
                              <>
                                <button
                                  onClick={() => handleEdit(evento)}
                                  className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 size={16} className="md:w-5 md:h-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(evento)}
                                  className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} className="md:w-5 md:h-5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRestore(evento)}
                                className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Restaurar"
                              >
                                <RotateCcw size={16} className="md:w-5 md:h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {detailsEvento && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Detalles del Evento</h2>
              <button
                onClick={() => setDetailsEvento(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Type */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-600 mb-2">Tipo de Evento</label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${getEventColor(detailsEvento.eventType)}`}
                  >
                    <span>{getEventIcon(detailsEvento.eventType)}</span>
                    {TIPO_EVENTO_LABELS[detailsEvento.eventType]?.label}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-600 mb-2">Título</label>
                <p className="text-sm md:text-base text-gray-900">{detailsEvento.title}</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-600 mb-2">Descripción</label>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">{detailsEvento.description}</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-600 mb-2">Fecha Inicio</label>
                  <p className="text-sm md:text-base text-gray-900">
                    {new Date(detailsEvento.startDate).toLocaleDateString("es-PE")}
                  </p>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-600 mb-2">Fecha Fin</label>
                  <p className="text-sm md:text-base text-gray-900">
                    {detailsEvento.endDate ? new Date(detailsEvento.endDate).toLocaleDateString("es-PE") : "-"}
                  </p>
                </div>
              </div>

              {/* Attributes */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-600 mb-3">Atributos</label>
                <div className="flex flex-wrap gap-2">
                  {detailsEvento.isHoliday && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                      🎉 Feriado
                    </span>
                  )}
                  {detailsEvento.isRecurring && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                      🔄 Recurrente
                    </span>
                  )}
                  {detailsEvento.isNational && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-100 text-red-800 px-3 py-1 rounded-full">
                      🇵🇪 Nacional
                    </span>
                  )}
                  {detailsEvento.affectsClasses && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                      ⚠️ Afecta Clases
                    </span>
                  )}
                  {!detailsEvento.isHoliday &&
                    !detailsEvento.isRecurring &&
                    !detailsEvento.isNational &&
                    !detailsEvento.affectsClasses && (
                      <span className="text-xs text-gray-500">Sin atributos especiales</span>
                    )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-600 mb-2">Estado</label>
                <span
                  className={`inline-flex items-center gap-2 text-xs md:text-sm font-medium px-3 py-2 rounded-full ${
                    detailsEvento.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {detailsEvento.status === "ACTIVE" ? (
                    <>
                      <CheckCircle size={16} /> Activo
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} /> Inactivo
                    </>
                  )}
                </span>
              </div>

              {/* Institution */}
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-600 mb-2">Institución</label>
                <p className="text-sm md:text-base text-gray-900">{detailsEvento.institutionId}</p>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setDetailsEvento(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {editingEvento ? "Editar Evento" : "Nuevo Evento"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Institution */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institución *</label>
                  <select
                    value={formData.institutionId}
                    onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                      validationErrors.institutionId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione una institución</option>
                    {instituciones.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                  {validationErrors.institutionId && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.institutionId}</p>
                  )}
                </div>

                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                      validationErrors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ej: Día del Niño"
                  />
                  {validationErrors.title && <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                      validationErrors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Describe el evento..."
                  />
                  {validationErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                      validationErrors.startDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.startDate}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (Opcional)</label>
                  <input
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value || null })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm ${
                      validationErrors.endDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {validationErrors.endDate && <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>}
                </div>

                {/* Event Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento *</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  >
                    {Object.entries(TIPO_EVENTO).map(([key, value]) => (
                      <option key={key} value={value}>
                        {TIPO_EVENTO_LABELS[value]?.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isHoliday}
                      onChange={(e) => setFormData({ ...formData, isHoliday: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Es Feriado</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Recurrente</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNational}
                      onChange={(e) => setFormData({ ...formData, isNational: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Es Nacional</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.affectsClasses}
                      onChange={(e) => setFormData({ ...formData, affectsClasses: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Afecta Clases</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm"
                >
                  {editingEvento ? "Actualizar" : "Crear"} Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-in-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-in-out;
        }

        /* improved SweetAlert styling */
        .swal-popup {
          border-radius: 12px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
          padding: 30px !important;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
        }

        .swal-title {
          font-size: 24px !important;
          font-weight: 700 !important;
          color: #1f2937 !important;
          margin-bottom: 15px !important;
        }

        .swal-html {
          font-size: 14px !important;
          color: #4b5563 !important;
          line-height: 1.6 !important;
        }

        .swal-confirm-btn {
          border-radius: 8px !important;
          padding: 10px 24px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          transition: all 0.3s ease !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }

        .swal-confirm-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
        }

        .swal-cancel-btn {
          border-radius: 8px !important;
          padding: 10px 24px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          background-color: #e5e7eb !important;
          color: #374151 !important;
          transition: all 0.3s ease !important;
        }

        .swal-cancel-btn:hover {
          background-color: #d1d5db !important;
        }
      `}</style>
    </div>
  )
}
