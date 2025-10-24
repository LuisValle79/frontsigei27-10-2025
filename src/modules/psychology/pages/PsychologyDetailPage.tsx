import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { psychologyService } from '../service/Psychology.service'
import type { PsychologicalEvaluation } from '../models/psychology.model'

export function PsychologyDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  const [evaluation, setEvaluation] = useState<PsychologicalEvaluation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadEvaluation = async () => {
      if (!id) {
        navigate("/psicologia");
        return;
      }

      try {
        setIsLoading(true);
        const data = await psychologyService.getEvaluationById(id);
        
        // Enriquecer con nombres reales
        const [studentName, classroomName, institutionName, evaluatorName] = await Promise.all([
          psychologyService.getStudentName(data.studentId).catch(() => `Estudiante ${data.studentId.substring(0, 8)}`),
          psychologyService.getClassroomName(data.classroomId).catch(() => `Aula ${data.classroomId.substring(0, 8)}`),
          psychologyService.getInstitutionName(data.institutionId).catch(() => `Institución ${data.institutionId.substring(0, 8)}`),
          psychologyService.getEvaluatorName(data.evaluatedBy).catch(() => `Evaluador ${data.evaluatedBy.substring(0, 8)}`)
        ]);

        setEvaluation({
          ...data,
          studentName,
          classroomName,
          institutionName,
          evaluatedByName: evaluatorName
        });
      } catch (error) {
        console.error("Error loading evaluation:", error);
        setError("No se pudo cargar la evaluación");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvaluation();
  }, [id, navigate])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeLabel = (type: string) => {
    const types = {
      INICIAL: 'Inicial',
      SEGUIMIENTO: 'Seguimiento',
      ESPECIAL: 'Especial',
      DERIVACION: 'Derivación'
    }
    return types[type as keyof typeof types] || type
  }

  const getDevelopmentLabel = (level?: string) => {
    if (!level) return 'No evaluado'
    const levels = {
      ESPERADO: 'Esperado',
      EN_PROCESO: 'En Proceso',
      REQUIERE_APOYO: 'Requiere Apoyo',
      NO_EVALUADO: 'No Evaluado'
    }
    return levels[level as keyof typeof levels] || level
  }

  const getDevelopmentColor = (level?: string) => {
    if (!level) return 'bg-slate-100 text-slate-600 border-slate-200'
    const colors = {
      ESPERADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      EN_PROCESO: 'bg-amber-100 text-amber-700 border-amber-200',
      REQUIERE_APOYO: 'bg-red-100 text-red-700 border-red-200',
      NO_EVALUADO: 'bg-slate-100 text-slate-600 border-slate-200'
    }
    return colors[level as keyof typeof colors] || 'bg-slate-100 text-slate-600 border-slate-200'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border shadow-sm p-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="font-semibold text-gray-900">Cargando evaluación</h3>
              <p className="text-gray-600 text-sm">Obteniendo información detallada...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-red-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-700 mb-6">{error || 'Evaluación no encontrada'}</p>
          <button
            onClick={() => navigate('/psicologia')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header compacto */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button 
              onClick={() => navigate('/psicologia')}
              className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Evaluaciones
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Detalle</span>
          </nav>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Evaluación Psicológica
                  </h1>
                  <p className="text-gray-600">
                    {evaluation.studentName || 'Estudiante no identificado'}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                      evaluation.evaluationType === 'INICIAL' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      evaluation.evaluationType === 'SEGUIMIENTO' ? 'bg-green-100 text-green-700 border-green-200' :
                      evaluation.evaluationType === 'ESPECIAL' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {getTypeLabel(evaluation.evaluationType)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                      evaluation.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {evaluation.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {evaluation.status === 'ACTIVE' && (
                  <button
                    onClick={() => navigate(`/psicologia/${id}/editar`)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                )}
                <button
                  onClick={() => navigate('/psicologia')}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium border border-gray-300 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal ocupando todo el espacio */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Columna principal - 4/5 del espacio */}
          <div className="xl:col-span-4 space-y-8">
            {/* Información básica */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Información del Estudiante</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Estudiante</label>
                  <p className="text-gray-900 font-semibold">{evaluation.studentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Aula</label>
                  <p className="text-gray-900">{evaluation.classroomName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Institución</label>
                  <p className="text-gray-900">{evaluation.institutionName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Año Académico</label>
                  <p className="text-gray-900 font-mono">{evaluation.academicYear}</p>
                </div>
              </div>
            </div>

            {/* Áreas de desarrollo */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Áreas de Desarrollo</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Desarrollo Emocional</h3>
                      <p className="text-sm text-blue-700">Gestión de emociones</p>
                    </div>
                  </div>
                  <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full border ${getDevelopmentColor(evaluation.emotionalDevelopment)}`}>
                    {getDevelopmentLabel(evaluation.emotionalDevelopment)}
                  </span>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">Desarrollo Social</h3>
                      <p className="text-sm text-green-700">Interacción social</p>
                    </div>
                  </div>
                  <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full border ${getDevelopmentColor(evaluation.socialDevelopment)}`}>
                    {getDevelopmentLabel(evaluation.socialDevelopment)}
                  </span>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900">Desarrollo Cognitivo</h3>
                      <p className="text-sm text-purple-700">Capacidades mentales</p>
                    </div>
                  </div>
                  <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full border ${getDevelopmentColor(evaluation.cognitiveDevelopment)}`}>
                    {getDevelopmentLabel(evaluation.cognitiveDevelopment)}
                  </span>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-900">Desarrollo Motor</h3>
                      <p className="text-sm text-orange-700">Habilidades físicas</p>
                    </div>
                  </div>
                  <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full border ${getDevelopmentColor(evaluation.motorDevelopment)}`}>
                    {getDevelopmentLabel(evaluation.motorDevelopment)}
                  </span>
                </div>
              </div>
            </div>

            {/* Observaciones y Recomendaciones en una sola fila */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Observaciones */}
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Observaciones</h2>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                    {evaluation.observations}
                  </p>
                </div>
              </div>

              {/* Recomendaciones */}
              {evaluation.recommendations && (
                <div className="bg-white rounded-lg shadow-sm border p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Recomendaciones</h2>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                      {evaluation.recommendations}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar compacto - 1/5 del espacio */}
          <div className="space-y-6">
            {/* Detalles de evaluación */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Detalles de Evaluación</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <label className="text-blue-700 font-medium block mb-2">Fecha de Evaluación</label>
                  <p className="text-blue-900 font-semibold">{formatDate(evaluation.evaluationDate)}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <label className="text-green-700 font-medium block mb-2">Evaluador</label>
                  <p className="text-green-900 font-semibold">{evaluation.evaluatedByName}</p>
                </div>
                
                {evaluation.evaluationReason && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="text-gray-700 font-medium block mb-2">Motivo</label>
                    <p className="text-gray-900 text-sm leading-relaxed">
                      {evaluation.evaluationReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Seguimiento */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Seguimiento</h3>
              
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <label className="text-orange-700 font-medium block mb-2">Requiere Seguimiento</label>
                  <span className={`inline-block px-3 py-2 text-sm font-semibold rounded-full border ${
                    evaluation.requiresFollowUp ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}>
                    {evaluation.requiresFollowUp ? 'Sí' : 'No'}
                  </span>
                </div>
                
                {evaluation.requiresFollowUp && evaluation.followUpFrequency && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <label className="text-purple-700 font-medium block mb-2">Frecuencia</label>
                    <p className="text-purple-900 font-semibold">{evaluation.followUpFrequency}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información de registro */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Registro</h3>
              
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <label className="text-indigo-700 font-medium block mb-2">Creada</label>
                  <p className="text-indigo-900 font-mono text-sm">{formatDateTime(evaluation.evaluatedAt)}</p>
                </div>
                
                {evaluation.updatedAt && evaluation.updatedAt !== evaluation.evaluatedAt && (
                  <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                    <label className="text-teal-700 font-medium block mb-2">Actualizada</label>
                    <p className="text-teal-900 font-mono text-sm">{formatDateTime(evaluation.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}