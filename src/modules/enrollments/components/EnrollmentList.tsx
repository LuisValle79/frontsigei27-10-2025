/**
 * Componente: EnrollmentList
 * Muestra la lista de matrículas con funcionalidad completa
 */

import { useNavigate } from 'react-router-dom'
import { Eye, Edit, Trash2, User, GraduationCap, FileText } from 'lucide-react'
import type { Enrollment } from '../models/enrollments.model'
import PdfExportButton from './PdfExportButton'

interface EnrollmentListProps {
  readonly items: Enrollment[]
  readonly onDelete?: (id: string) => void
  readonly onView?: (enrollment: Enrollment) => void
  readonly onEdit?: (enrollment: Enrollment) => void
}

export function EnrollmentList({ items, onDelete, onView, onEdit }: EnrollmentListProps) {
  const navigate = useNavigate()

  const handleView = (enrollment: Enrollment) => {
    if (onView) {
      onView(enrollment)
    } else {
      navigate(`/matriculas/${enrollment.id}`)
    }
  }

  const handleEdit = (enrollment: Enrollment) => {
    if (onEdit) {
      onEdit(enrollment)
    } else {
      navigate(`/matriculas/${enrollment.id}/editar`)
    }
  }

  const handleDelete = (id: string) => {
    onDelete?.(id)
  }

  // Obtener clase de badge de estado
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtener texto de estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activa';
      case 'INACTIVE': return 'Inactiva';
      case 'PENDING': return 'Pendiente';
      default: return status;
    }
  };

  // Obtener texto de grupo de edad
  const getAgeGroupText = (ageGroup: string) => {
    switch (ageGroup) {
      case '3_AÑOS': return '3 años';
      case '4_AÑOS': return '4 años';
      case '5_AÑOS': return '5 años';
      default: return ageGroup;
    }
  };

  // Obtener texto de modalidad
  const getModalityText = (modality: string) => {
    switch (modality) {
      case 'PRESENCIAL': return 'Presencial';
      case 'VIRTUAL': return 'Virtual';
      case 'HIBRIDA': return 'Híbrida';
      default: return modality;
    }
  };

  // Calcular progreso de documentos
  const calculateDocumentProgress = (enrollment: Enrollment) => {
    const documents = [
      enrollment.birthCertificate,
      enrollment.studentDni,
      enrollment.guardianDni,
      enrollment.vaccinationCard,
      enrollment.disabilityCertificate,
      enrollment.utilityBill,
      enrollment.psychologicalReport,
      enrollment.studentPhoto,
      enrollment.healthRecord,
      enrollment.signedEnrollmentForm,
      enrollment.dniVerification
    ];
    
    const completed = documents.filter(Boolean).length;
    const total = documents.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  // Formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay matrículas</h3>
        <p className="text-gray-500">No se encontraron matrículas para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Información Académica
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documentos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((enrollment) => {
              const docProgress = calculateDocumentProgress(enrollment);
              
              return (
                <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.studentId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getAgeGroupText(enrollment.ageGroup)} - {enrollment.section}
                        </div>
                        {enrollment.enrollmentCode && (
                          <div className="text-xs text-gray-400">
                            {enrollment.enrollmentCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1 text-purple-600" />
                        {enrollment.academicYear}
                      </div>
                      <div className="text-gray-500">
                        {enrollment.shift} - {getModalityText(enrollment.modality)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {enrollment.institutionId}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(enrollment.enrollmentStatus || 'PENDING')}`}>
                      {getStatusText(enrollment.enrollmentStatus || 'PENDING')}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {enrollment.enrollmentType === 'NUEVA' ? 'Nueva' : 'Reinscripción'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {docProgress.completed}/{docProgress.total}
                          </span>
                          <span className="text-xs text-gray-500">
                            {docProgress.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              docProgress.percentage === 100 ? 'bg-green-500' :
                              docProgress.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${docProgress.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(enrollment.enrollmentDate)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(enrollment)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(enrollment)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {/* Botón de exportar PDF individual */}
                      <PdfExportButton
                        enrollment={enrollment}
                        variant="single"
                        className=""
                      />
                      
                      {enrollment.id && (
                        <button
                          onClick={() => handleDelete(enrollment.id!)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
