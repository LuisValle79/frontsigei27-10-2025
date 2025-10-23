/**
 * Componente: EnrollmentForm
 * Formulario completo para crear y editar matrículas
 */

import { useState, useEffect } from "react";
import { User, FileText, AlertCircle, CheckCircle, Building, GraduationCap } from "lucide-react";
import type { Enrollment, AcademicPeriod } from "../models/enrollments.model";

interface EnrollmentFormProps {
  enrollment?: Enrollment;
  academicPeriods: AcademicPeriod[];
  onSave: (enrollment: Enrollment) => void;
  onCancel: () => void;
}

const defaultEnrollment: Omit<Enrollment, 'id'> = {
  studentId: "",
  institutionId: "",
  classroomId: "",
  academicYear: "2025",
  academicPeriodId: "",
  enrollmentDate: new Date().toISOString().split('T')[0] + 'T00:00:00',
  enrollmentStatus: "ACTIVE",
  enrollmentType: "NUEVA",
  ageGroup: "3_AÑOS",
  shift: "MAÑANA",
  section: "",
  modality: "PRESENCIAL",
  educationalLevel: "INITIAL",
  studentAge: 3,
  enrollmentCode: "",
  observations: "",
  previousInstitution: "",
  birthCertificate: false,
  studentDni: false,
  guardianDni: false,
  vaccinationCard: false,
  disabilityCertificate: false,
  utilityBill: false,
  psychologicalReport: false,
  studentPhoto: false,
  healthRecord: false,
  signedEnrollmentForm: false,
  dniVerification: false,
  deleted: false
};

export function EnrollmentForm({ enrollment, academicPeriods, onSave, onCancel }: EnrollmentFormProps) {
  const [formData, setFormData] = useState<Omit<Enrollment, 'id'>>(enrollment || defaultEnrollment);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"basic" | "documents">("basic");

  useEffect(() => {
    if (enrollment) {
      setFormData(enrollment);
    }
  }, [enrollment]);

  // Actualizar edad automáticamente cuando cambia el grupo de edad
  useEffect(() => {
    const ageMap = {
      "3_AÑOS": 3,
      "4_AÑOS": 4,
      "5_AÑOS": 5
    };
    
    if (formData.ageGroup && ageMap[formData.ageGroup as keyof typeof ageMap]) {
      setFormData(prev => ({ 
        ...prev, 
        studentAge: ageMap[formData.ageGroup as keyof typeof ageMap] 
      }));
    }
  }, [formData.ageGroup]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Campos requeridos según la API
    if (!formData.studentId.trim()) {
      newErrors.studentId = "El ID del estudiante es requerido";
    }
    
    if (!formData.institutionId.trim()) {
      newErrors.institutionId = "El ID de la institución es requerido";
    }
    
    if (!formData.classroomId.trim()) {
      newErrors.classroomId = "El ID del aula es requerido";
    }
    
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = "El año académico es requerido";
    }
    
    if (!formData.academicPeriodId.trim()) {
      newErrors.academicPeriodId = "El período académico es requerido";
    }
    
    if (!formData.ageGroup) {
      newErrors.ageGroup = "El grupo de edad es requerido";
    }
    
    if (!formData.shift) {
      newErrors.shift = "El turno es requerido";
    }
    
    if (!formData.section.trim()) {
      newErrors.section = "La sección es requerida";
    }
    
    if (!formData.modality) {
      newErrors.modality = "La modalidad es requerida";
    }
    
    if (!formData.studentAge || formData.studentAge <= 0) {
      newErrors.studentAge = "La edad del estudiante debe ser mayor a 0";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (enrollment && enrollment.id) {
        onSave({ ...formData, id: enrollment.id });
      } else {
        onSave(formData as Enrollment);
      }
    }
  };

  // Calcular progreso de documentos
  const calculateDocumentProgress = () => {
    const documents = [
      formData.birthCertificate,
      formData.studentDni,
      formData.guardianDni,
      formData.vaccinationCard,
      formData.disabilityCertificate,
      formData.utilityBill,
      formData.psychologicalReport,
      formData.studentPhoto,
      formData.healthRecord,
      formData.signedEnrollmentForm,
      formData.dniVerification
    ];
    
    const completed = documents.filter(Boolean).length;
    const total = documents.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  const docProgress = calculateDocumentProgress();

  return (
    <div className="bg-white">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === "basic"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <User className="h-4 w-4 mr-2" />
            Información Básica
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === "documents"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Documentos
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              docProgress.percentage === 100 ? 'bg-green-100 text-green-800' :
              docProgress.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {docProgress.completed}/{docProgress.total}
            </span>
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {activeTab === "basic" && (
          <div className="space-y-8">
            {/* Información del Estudiante */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información del Estudiante
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Estudiante *
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.studentId ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Ej: std_001"
                  />
                  {errors.studentId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.studentId}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-2">
                    Grupo de Edad *
                  </label>
                  <select
                    id="ageGroup"
                    name="ageGroup"
                    value={formData.ageGroup}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.ageGroup ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <option value="3_AÑOS">3 años</option>
                    <option value="4_AÑOS">4 años</option>
                    <option value="5_AÑOS">5 años</option>
                  </select>
                  {errors.ageGroup && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.ageGroup}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="studentAge" className="block text-sm font-medium text-gray-700 mb-2">
                    Edad del Estudiante *
                  </label>
                  <input
                    type="number"
                    id="studentAge"
                    name="studentAge"
                    value={formData.studentAge}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.studentAge ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Edad en años"
                  />
                  {errors.studentAge && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.studentAge}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="enrollmentCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Matrícula
                  </label>
                  <input
                    type="text"
                    id="enrollmentCode"
                    name="enrollmentCode"
                    value={formData.enrollmentCode || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
                    placeholder="Ej: MAT2025001 (opcional)"
                  />
                </div>
              </div>
            </div>

            {/* Información Institucional */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Información Institucional
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="institutionId" className="block text-sm font-medium text-gray-700 mb-2">
                    ID de la Institución *
                  </label>
                  <input
                    type="text"
                    id="institutionId"
                    name="institutionId"
                    value={formData.institutionId}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.institutionId ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Ej: inst_001"
                  />
                  {errors.institutionId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.institutionId}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="classroomId" className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Aula *
                  </label>
                  <input
                    type="text"
                    id="classroomId"
                    name="classroomId"
                    value={formData.classroomId}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.classroomId ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Ej: cls_001"
                  />
                  {errors.classroomId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.classroomId}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                    Sección *
                  </label>
                  <input
                    type="text"
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.section ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Ej: A"
                  />
                  {errors.section && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.section}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-2">
                    Turno *
                  </label>
                  <select
                    id="shift"
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.shift ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <option value="MAÑANA">Mañana</option>
                    <option value="TARDE">Tarde</option>
                  </select>
                  {errors.shift && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.shift}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="modality" className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidad *
                  </label>
                  <select
                    id="modality"
                    name="modality"
                    value={formData.modality}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.modality ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <option value="PRESENCIAL">Presencial</option>
                    <option value="VIRTUAL">Virtual</option>
                    <option value="HIBRIDA">Híbrida</option>
                  </select>
                  {errors.modality && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.modality}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="educationalLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel Educativo
                  </label>
                  <select
                    id="educationalLevel"
                    name="educationalLevel"
                    value={formData.educationalLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
                  >
                    <option value="INITIAL">Inicial</option>
                    <option value="PRIMARY">Primaria</option>
                    <option value="SECONDARY">Secundaria</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Información Académica */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Información Académica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-2">
                    Año Académico *
                  </label>
                  <input
                    type="text"
                    id="academicYear"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.academicYear ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="Ej: 2025"
                  />
                  {errors.academicYear && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.academicYear}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="academicPeriodId" className="block text-sm font-medium text-gray-700 mb-2">
                    Período Académico *
                  </label>
                  <select
                    id="academicPeriodId"
                    name="academicPeriodId"
                    value={formData.academicPeriodId}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.academicPeriodId ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <option value="">Seleccione un período académico</option>
                    {academicPeriods.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.periodName} - {period.academicYear}
                      </option>
                    ))}
                  </select>
                  {errors.academicPeriodId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.academicPeriodId}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="enrollmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Matrícula
                  </label>
                  <input
                    type="datetime-local"
                    id="enrollmentDate"
                    name="enrollmentDate"
                    value={formData.enrollmentDate?.slice(0, 16) || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="enrollmentStatus" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Matrícula
                  </label>
                  <select
                    id="enrollmentStatus"
                    name="enrollmentStatus"
                    value={formData.enrollmentStatus}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
                  >
                    <option value="ACTIVE">Activa</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="INACTIVE">Inactiva</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="enrollmentType" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Matrícula
                  </label>
                  <select
                    id="enrollmentType"
                    name="enrollmentType"
                    value={formData.enrollmentType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
                  >
                    <option value="NUEVA">Nueva</option>
                    <option value="REINSCRIPCION">Reinscripción</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="previousInstitution" className="block text-sm font-medium text-gray-700 mb-2">
                    Institución Anterior
                  </label>
                  <input
                    type="text"
                    id="previousInstitution"
                    name="previousInstitution"
                    value={formData.previousInstitution || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
                    placeholder="Solo para reinscripciones (opcional)"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  id="observations"
                  name="observations"
                  rows={4}
                  value={formData.observations || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all"
                  placeholder="Ingrese observaciones adicionales sobre la matrícula (opcional)"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-green-800 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documentos Requeridos
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="bg-white rounded-full px-3 py-1 border border-green-200">
                    <span className="text-sm font-medium text-green-800">
                      {docProgress.completed}/{docProgress.total} completados
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    docProgress.percentage === 100 ? 'bg-green-100 text-green-800' :
                    docProgress.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {docProgress.percentage}%
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      docProgress.percentage === 100 ? 'bg-green-500' :
                      docProgress.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${docProgress.percentage}%` }}
                  />
                </div>
              </div>
              
              <p className="text-sm text-green-700 mb-6">
                Marque los documentos que han sido entregados por el estudiante o apoderado.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'birthCertificate', label: 'Certificado de Nacimiento', required: true },
                  { key: 'studentDni', label: 'DNI del Estudiante', required: true },
                  { key: 'guardianDni', label: 'DNI del Apoderado', required: true },
                  { key: 'vaccinationCard', label: 'Carné de Vacunación', required: true },
                  { key: 'disabilityCertificate', label: 'Certificado de Discapacidad', required: false },
                  { key: 'utilityBill', label: 'Recibo de Servicios', required: true },
                  { key: 'psychologicalReport', label: 'Informe Psicológico', required: false },
                  { key: 'studentPhoto', label: 'Foto del Estudiante', required: true },
                  { key: 'healthRecord', label: 'Ficha de Salud', required: true },
                  { key: 'signedEnrollmentForm', label: 'Formulario de Matrícula Firmado', required: true },
                  { key: 'dniVerification', label: 'Verificación de DNI', required: true }
                ].map((doc) => (
                  <div key={doc.key} className="bg-white rounded-lg p-4 border border-green-200 hover:border-green-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id={doc.key}
                          name={doc.key}
                          type="checkbox"
                          checked={formData[doc.key as keyof typeof formData] as boolean}
                          onChange={handleChange}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor={doc.key} className="ml-3 block text-sm font-medium text-gray-900">
                          {doc.label}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                      </div>
                      <div className="flex items-center">
                        {formData[doc.key as keyof typeof formData] ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {enrollment ? "Actualizar" : "Crear"} Matrícula
          </button>
        </div>
      </form>
    </div>
  );
}