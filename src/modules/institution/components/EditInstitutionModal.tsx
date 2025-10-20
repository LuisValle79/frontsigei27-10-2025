import React, { useState } from 'react';
import { institutionService } from '../service/Institution.service';
import { 
  type InstitutionUpdateRequest,
  type InstitutionWithUsersAndClassroomsResponse,
  type Classroom,
  type UserResponse
} from '../models/Institution.interface';
import { type EditInstitutionModalProps } from '../models/EditInstitutionModalProps';
import { type InstitutionFormData as FormData } from '../models/InstitutionFormData';

const EditInstitutionModal: React.FC<EditInstitutionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  institution
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [editingClassroomId, setEditingClassroomId] = useState<string | null>(null);
  const [editedClassroomIds, setEditedClassroomIds] = useState<Set<string>>(new Set());
  const [deletedClassroomIds, setDeletedClassroomIds] = useState<Set<string>>(new Set());
  const [restoredClassroomIds, setRestoredClassroomIds] = useState<Set<string>>(new Set());

  // Pre-cargar datos existentes de la institución
  const [formData, setFormData] = useState<FormData>({
    institutionInformation: { ...institution.institutionInformation },
    address: { ...institution.address },
    contactMethods: institution.contactMethods.length > 0 ? [...institution.contactMethods] : [{ type: '', value: '' }],
    gradingType: institution.gradingType,
    classroomType: institution.classroomType,
    schedules: institution.schedules.length > 0 ? [...institution.schedules] : [{ type: '', entryTime: '', exitTime: '' }],
    classrooms: institution.classrooms.map((c: Classroom) => ({
      classroomId: c.classroomId,
      classroomName: c.classroomName,
      classroomAge: c.classroomAge,
      capacity: c.capacity,
      color: c.color,
      status: c.status
    })),
    director: institution.director ? {
      firstName: institution.director.firstName,
      lastName: institution.director.lastName,
      documentType: institution.director.documentType,
      documentNumber: institution.director.documentNumber,
      phone: institution.director.phone,
      email: institution.director.email,
      role: 'DIRECTOR'
    } : {
      firstName: '',
      lastName: '',
      documentType: '',
      documentNumber: '',
      phone: '',
      email: '',
      role: 'DIRECTOR'
    },
    auxiliaries: institution.auxiliaries?.length > 0 ? institution.auxiliaries.map((aux: UserResponse) => ({
      firstName: aux.firstName,
      lastName: aux.lastName,
      documentType: aux.documentType,
      documentNumber: aux.documentNumber,
      phone: aux.phone,
      email: aux.email,
      role: 'AUXILIAR'
    })) : [{
      firstName: '',
      lastName: '',
      documentType: '',
      documentNumber: '',
      phone: '',
      email: '',
      role: 'AUXILIAR'
    }],
    ugel: institution.ugel,
    dre: institution.dre
  });

  const steps = [
    'Información Básica',
    'Dirección y Contacto',
    'Configuración Académica',
    'Director',
    'Auxiliares',
    'Configuración Final'
  ];

  // Manejar cambios en los campos
  const handleInputChange = (section: keyof FormData, field: string, value: string | number) => {
    if (section === 'gradingType' || section === 'classroomType' || section === 'ugel' || section === 'dre') {
      setFormData(prev => ({
        ...prev,
        [section]: value as string
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as object),
          [field]: value
        }
      }));
    }
  };

  // Manejar arrays dinámicos
  const handleArrayChange = (section: 'contactMethods' | 'schedules' | 'classrooms' | 'auxiliaries', index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section: 'contactMethods' | 'schedules' | 'classrooms' | 'auxiliaries') => {
    const newItem = {
      contactMethods: { type: '', value: '' },
      schedules: { type: '', entryTime: '', exitTime: '' },
      classrooms: { classroomName: '', classroomAge: '', capacity: 0, color: '#3B82F6' },
      auxiliaries: { firstName: '', lastName: '', documentType: '', documentNumber: '', phone: '', email: '', role: 'AUXILIAR' }
    };

    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem[section]]
    }));
  };

  const removeArrayItem = (section: 'contactMethods' | 'schedules' | 'classrooms' | 'auxiliaries', index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // Prevenir envío del formulario con Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep !== 6) {
      e.preventDefault();
      e.stopPropagation();
      // Si no estamos en el paso 6, navegar al siguiente paso
      if (currentStep < 6) {
        setCurrentStep(prev => prev + 1);
      }
    } else if (e.key === 'Enter' && currentStep === 6) {
      e.preventDefault();
      e.stopPropagation();
      // En el paso 6, ejecutar el envío
      handleFormSubmit();
    }
  };

  // Manejar envío del formulario de forma explícita
  const handleFormSubmit = async () => {
    if (currentStep !== 6 || loading) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // 1. Actualizar la información de la institución
      const updateData: InstitutionUpdateRequest = {
        institutionInformation: formData.institutionInformation,
        address: formData.address,
        contactMethods: formData.contactMethods,
        gradingType: formData.gradingType,
        classroomType: formData.classroomType,
        schedules: formData.schedules,
        directorId: institution.director?.userId || '',
        auxiliaryIds: institution.auxiliaries?.map((aux: UserResponse) => aux.userId) || [],
        ugel: formData.ugel,
        dre: formData.dre
      };
      
      await institutionService.updateInstitution(institution.institutionId, updateData);
      console.log('✅ Institución actualizada');
      
      // 2. Eliminar aulas marcadas para eliminación
      for (const classroomId of deletedClassroomIds) {
        try {
          await institutionService.deleteClassroom(institution.institutionId, classroomId);
          console.log(`✅ Aula eliminada: ${classroomId}`);
        } catch (classroomError) {
          console.error(`❌ Error al eliminar aula ${classroomId}:`, classroomError);
        }
      }
      
      // 3. Restaurar aulas marcadas para restauración
      for (const classroomId of restoredClassroomIds) {
        try {
          await institutionService.restoreClassroom(institution.institutionId, classroomId);
          console.log(`✅ Aula restaurada: ${classroomId}`);
        } catch (classroomError) {
          console.error(`❌ Error al restaurar aula ${classroomId}:`, classroomError);
        }
      }
      
      // 4. Actualizar SOLO las aulas que fueron editadas (no eliminadas ni restauradas)
      const classroomsToUpdate = formData.classrooms.filter(
        c => c.classroomId && 
             editedClassroomIds.has(c.classroomId) &&
             !deletedClassroomIds.has(c.classroomId) &&
             !restoredClassroomIds.has(c.classroomId)
      );
      
      console.log('Aulas a actualizar:', classroomsToUpdate.map(c => c.classroomName));
      
      for (const classroom of classroomsToUpdate) {
        try {
          await institutionService.updateClassroom(classroom.classroomId!, {
            classroomName: classroom.classroomName,
            classroomAge: classroom.classroomAge,
            capacity: classroom.capacity,
            color: classroom.color
          });
          console.log(`✅ Aula "${classroom.classroomName}" actualizada exitosamente`);
        } catch (classroomError) {
          console.error(`❌ Error al actualizar aula ${classroom.classroomName}:`, classroomError);
          // Continuar con las demás aulas aunque una falle
        }
      }
      
      // 5. Crear nuevas aulas (las que no tienen classroomId)
      const newClassrooms = formData.classrooms.filter(c => !c.classroomId);
      
      console.log('Aulas nuevas a crear:', newClassrooms.map(c => c.classroomName));
      
      for (const classroom of newClassrooms) {
        try {
          await institutionService.createClassroom({
            classroomName: classroom.classroomName,
            classroomAge: classroom.classroomAge,
            capacity: classroom.capacity,
            color: classroom.color,
            institutionId: institution.institutionId
          });
          console.log(`✅ Aula "${classroom.classroomName}" creada exitosamente`);
        } catch (classroomError) {
          console.error(`❌ Error al crear aula ${classroom.classroomName}:`, classroomError);
          // Continuar con las demás aulas aunque una falle
        }
      }
      
      // 6. Limpiar todos los conjuntos de cambios
      setEditedClassroomIds(new Set());
      setDeletedClassroomIds(new Set());
      setRestoredClassroomIds(new Set());
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar institución');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Editar Institución
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 mb-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 < currentStep ? 'bg-green-500 text-white' :
                  index + 1 === currentStep ? 'bg-blue-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="mt-1 text-xs text-gray-500">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div onKeyDown={handleKeyDown} className="space-y-6">
          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Mensaje de Procesamiento */}
          {processingMessage && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">{processingMessage}</span>
            </div>
          )}

          {/* Mensaje de Éxito */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* Step 1: Información Básica */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-800">Información de la Institución</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Institución *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.institutionInformation.institutionName}
                    onChange={(e) => handleInputChange('institutionInformation', 'institutionName', e.target.value)}
                    placeholder="Ej: I.E. José María Arguedas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Modular *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.institutionInformation.modularCode}
                    onChange={(e) => handleInputChange('institutionInformation', 'modularCode', e.target.value)}
                    placeholder="Ej: 0123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Institución *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.institutionInformation.institutionType}
                    onChange={(e) => handleInputChange('institutionInformation', 'institutionType', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="PUBLICO">Público</option>
                    <option value="PRIVADO">Privado</option>
                    <option value="PARROQUIAL">Parroquial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel de Institución *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.institutionInformation.institutionLevel}
                    onChange={(e) => handleInputChange('institutionInformation', 'institutionLevel', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="INICIAL">Inicial</option>
                    <option value="PRIMARIA">Primaria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Género *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.institutionInformation.gender}
                    onChange={(e) => handleInputChange('institutionInformation', 'gender', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="MIXTO">Mixto</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lema/Slogan
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.institutionInformation.slogan}
                    onChange={(e) => handleInputChange('institutionInformation', 'slogan', e.target.value)}
                    placeholder="Ej: Educación con excelencia"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL del Logo
                  </label>
                  <input
                    type="url"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.institutionInformation.logoUrl}
                    onChange={(e) => handleInputChange('institutionInformation', 'logoUrl', e.target.value)}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dirección y Contacto */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-800">Dirección</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento *
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.address.department}
                    onChange={(e) => handleInputChange('address', 'department', e.target.value)}
                    placeholder="Ej: Lima"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provincia *
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.address.province}
                    onChange={(e) => handleInputChange('address', 'province', e.target.value)}
                    placeholder="Ej: Lima"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distrito *
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.address.district}
                    onChange={(e) => handleInputChange('address', 'district', e.target.value)}
                    placeholder="Ej: Miraflores"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.address.postalCode}
                    onChange={(e) => handleInputChange('address', 'postalCode', e.target.value)}
                    placeholder="Ej: 15074"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección Completa *
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                  placeholder="Ej: Av. Principal 123"
                />
              </div>

              <h4 className="text-md font-semibold text-gray-800 mt-6">Métodos de Contacto</h4>
              
              {formData.contactMethods.map((contact, index) => (
                <div key={index} className="border p-4 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Contacto {index + 1}</span>
                    {formData.contactMethods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('contactMethods', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={contact.type}
                        onChange={(e) => handleArrayChange('contactMethods', index, 'type', e.target.value)}
                      >
                        <option value="">Seleccionar</option>
                        <option value="TELEFONO">Teléfono</option>
                        <option value="CELULAR">Celular</option>
                        <option value="EMAIL">Email</option>
                        <option value="WHATSAPP">WhatsApp</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={contact.value}
                        onChange={(e) => handleArrayChange('contactMethods', index, 'value', e.target.value)}
                        placeholder="Ej: 01-1234567"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('contactMethods')}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                + Agregar Método de Contacto
              </button>
            </div>
          )}

          {/* Step 3: Configuración Académica */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h4 className="text-md font-semibold text-gray-800">Configuración Académica</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Calificación *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.gradingType}
                    onChange={(e) => handleInputChange('gradingType' as any, '', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="NUMERICO">Numérico (0-20)</option>
                    <option value="ALFABETICO">Alfabético (C, B, A)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Aula *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.classroomType}
                    onChange={(e) => handleInputChange('classroomType' as any, '', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="POR_GRADO">Por Grado</option>
                    <option value="POR_EDAD">Por Edad</option>
                    <option value="MIXTO">Mixto</option>
                  </select>
                </div>
              </div>

              <h4 className="text-md font-semibold text-gray-800 mt-6">Horarios</h4>
              
              {formData.schedules.map((schedule, index) => (
                <div key={index} className="border p-4 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Horario {index + 1}</span>
                    {formData.schedules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('schedules', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={schedule.type}
                        onChange={(e) => handleArrayChange('schedules', index, 'type', e.target.value)}
                      >
                        <option value="">Seleccionar</option>
                        <option value="MAÑANA">Mañana</option>
                        <option value="TARDE">Tarde</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrada</label>
                      <input
                        type="time"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={schedule.entryTime}
                        onChange={(e) => handleArrayChange('schedules', index, 'entryTime', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Salida</label>
                      <input
                        type="time"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={schedule.exitTime}
                        onChange={(e) => handleArrayChange('schedules', index, 'exitTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('schedules')}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                + Agregar Horario
              </button>

              {/* Aulas Existentes */}
              <h4 className="text-md font-semibold text-gray-800 mt-6">Gestión de Aulas</h4>
              
              {/* Aulas Activas */}
              {formData.classrooms.filter(c => c.classroomId && c.status === 'ACTIVE').length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-green-700 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Aulas Activas ({formData.classrooms.filter(c => c.classroomId && c.status === 'ACTIVE').length})
                  </h5>
                  
                  {formData.classrooms
                    .map((classroom, index) => ({ classroom, index }))
                    .filter(({ classroom }) => classroom.classroomId && classroom.status === 'ACTIVE')
                    .map(({ classroom, index }) => (
                      <div key={classroom.classroomId || index} className="border-2 border-green-200 p-4 rounded-md bg-green-50 mb-3">
                        {editingClassroomId === classroom.classroomId ? (
                          // Modo edición
                          <div className="space-y-3">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-semibold text-gray-700">Editando Aula</span>
                              <button
                                type="button"
                                onClick={() => setEditingClassroomId(null)}
                                className="text-gray-500 hover:text-gray-700 text-xs"
                              >
                                Cancelar
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Aula</label>
                                <input
                                  type="text"
                                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                  value={classroom.classroomName}
                                  onChange={(e) => {
                                    const updatedClassrooms = [...formData.classrooms];
                                    updatedClassrooms[index].classroomName = e.target.value;
                                    setFormData({ ...formData, classrooms: updatedClassrooms });
                                  }}
                                  placeholder="Ej: Aula A1"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Edad/Grado</label>
                                <select
                                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                  value={classroom.classroomAge}
                                  onChange={(e) => {
                                    const updatedClassrooms = [...formData.classrooms];
                                    updatedClassrooms[index].classroomAge = e.target.value;
                                    setFormData({ ...formData, classrooms: updatedClassrooms });
                                  }}
                                >
                                  <option value="">Seleccione edad</option>
                                  <option value="3 años">3 años</option>
                                  <option value="4 años">4 años</option>
                                  <option value="5 años">5 años</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Capacidad</label>
                                <input
                                  type="number"
                                  min="1"
                                  className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                  value={classroom.capacity}
                                  onChange={(e) => {
                                    const updatedClassrooms = [...formData.classrooms];
                                    updatedClassrooms[index].capacity = parseInt(e.target.value) || 0;
                                    setFormData({ ...formData, classrooms: updatedClassrooms });
                                  }}
                                  placeholder="30"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                                <input
                                  type="color"
                                  className="w-full h-10 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                  value={classroom.color || '#3B82F6'}
                                  onChange={(e) => {
                                    const updatedClassrooms = [...formData.classrooms];
                                    updatedClassrooms[index].color = e.target.value;
                                    setFormData({ ...formData, classrooms: updatedClassrooms });
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setEditingClassroomId(null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium transition duration-200"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  // Marcar el aula como editada
                                  if (classroom.classroomId) {
                                    setEditedClassroomIds(prev => new Set(prev).add(classroom.classroomId!));
                                  }
                                  // Cerrar el modo edición
                                  setEditingClassroomId(null);
                                  setSuccessMessage(`Cambios guardados localmente para el aula "${classroom.classroomName}"`);
                                  setTimeout(() => setSuccessMessage(null), 2000);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition duration-200"
                              >
                                Aplicar
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo vista
                          <>
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: classroom.color }}></span>
                                <span className="text-sm font-medium text-gray-700">
                                  {classroom.classroomName}
                                </span>
                                {editedClassroomIds.has(classroom.classroomId!) && (
                                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Editado
                                  </span>
                                )}
                                {deletedClassroomIds.has(classroom.classroomId!) && (
                                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    A Eliminar
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingClassroomId(classroom.classroomId!)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition duration-200"
                                  disabled={!!processingMessage}
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`¿Estás seguro de eliminar el aula "${classroom.classroomName}"?`)) {
                                      // Marcar como eliminada localmente
                                      setDeletedClassroomIds(prev => new Set(prev).add(classroom.classroomId!));
                                      // Remover de restauradas si estaba ahí
                                      setRestoredClassroomIds(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(classroom.classroomId!);
                                        return newSet;
                                      });
                                      
                                      // Actualizar el estado local
                                      const updatedClassrooms = [...formData.classrooms];
                                      updatedClassrooms[index].status = 'INACTIVE';
                                      setFormData({ ...formData, classrooms: updatedClassrooms });
                                      
                                      setSuccessMessage(`Aula "${classroom.classroomName}" marcada para eliminación`);
                                      setTimeout(() => setSuccessMessage(null), 2000);
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition duration-200"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Edad/Grado:</span>
                                <span className="ml-2 font-medium text-gray-900">{classroom.classroomAge}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Capacidad:</span>
                                <span className="ml-2 font-medium text-gray-900">{classroom.capacity}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Estado:</span>
                                <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Activa
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {/* Aulas Inactivas */}
              {formData.classrooms.filter(c => c.classroomId && c.status === 'INACTIVE').length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Aulas Inactivas ({formData.classrooms.filter(c => c.classroomId && c.status === 'INACTIVE').length})
                  </h5>
                  
                  {formData.classrooms
                    .map((classroom, index) => ({ classroom, index }))
                    .filter(({ classroom }) => classroom.classroomId && classroom.status === 'INACTIVE')
                    .map(({ classroom, index }) => (
                      <div key={classroom.classroomId || index} className="border-2 border-red-200 p-4 rounded-md bg-red-50 mb-3 opacity-75">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: classroom.color }}></span>
                            <span className="text-sm font-medium text-gray-700">
                              {classroom.classroomName}
                            </span>
                            {restoredClassroomIds.has(classroom.classroomId!) && (
                              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                </svg>
                                A Restaurar
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de restaurar el aula "${classroom.classroomName}"?`)) {
                                // Marcar como restaurada localmente
                                setRestoredClassroomIds(prev => new Set(prev).add(classroom.classroomId!));
                                // Remover de eliminadas si estaba ahí
                                setDeletedClassroomIds(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(classroom.classroomId!);
                                  return newSet;
                                });
                                
                                // Actualizar el estado local
                                const updatedClassrooms = [...formData.classrooms];
                                updatedClassrooms[index].status = 'ACTIVE';
                                setFormData({ ...formData, classrooms: updatedClassrooms });
                                
                                setSuccessMessage(`Aula "${classroom.classroomName}" marcada para restauración`);
                                setTimeout(() => setSuccessMessage(null), 2000);
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition duration-200"
                          >
                            Restaurar
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Edad/Grado:</span>
                            <span className="ml-2 font-medium text-gray-900">{classroom.classroomAge}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Capacidad:</span>
                            <span className="ml-2 font-medium text-gray-900">{classroom.capacity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Estado:</span>
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Inactiva
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Aulas Nuevas (sin ID) */}
              <h5 className="text-sm font-semibold text-blue-700 mb-2 flex items-center mt-4">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Agregar Nuevas Aulas
              </h5>
              
              {formData.classrooms
                .map((classroom, index) => ({ classroom, index }))
                .filter(({ classroom }) => !classroom.classroomId)
                .map(({ classroom, index }) => (
                <div key={index} className="border-2 border-blue-200 p-4 rounded-md bg-blue-50 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Nueva Aula {index + 1}</span>
                    {formData.classrooms.filter(c => !c.classroomId).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('classrooms', index)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Aula</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={classroom.classroomName}
                        onChange={(e) => handleArrayChange('classrooms', index, 'classroomName', e.target.value)}
                        placeholder="Ej: Aula A1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Edad/Grado</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={classroom.classroomAge}
                        onChange={(e) => handleArrayChange('classrooms', index, 'classroomAge', e.target.value)}
                      >
                        <option value="">Seleccione edad</option>
                        <option value="3 años">3 años</option>
                        <option value="4 años">4 años</option>
                        <option value="5 años">5 años</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={classroom.capacity}
                        onChange={(e) => handleArrayChange('classrooms', index, 'capacity', parseInt(e.target.value) || 0)}
                        placeholder="30"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input
                        type="color"
                        className="w-full h-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={classroom.color || '#3B82F6'}
                        onChange={(e) => handleArrayChange('classrooms', index, 'color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('classrooms')}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                + Agregar Aula
              </button>
            </div>
          )}

          {/* Step 4: Director */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-800">Información del Director</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.director.firstName}
                    onChange={(e) => handleInputChange('director', 'firstName', e.target.value)}
                    placeholder="Nombres del director"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.director.lastName}
                    onChange={(e) => handleInputChange('director', 'lastName', e.target.value)}
                    placeholder="Apellidos del director"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Documento *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.director.documentType}
                    onChange={(e) => handleInputChange('director', 'documentType', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    <option value="DNI">DNI</option>
                    <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.director.documentNumber}
                    onChange={(e) => handleInputChange('director', 'documentNumber', e.target.value)}
                    placeholder="Número de documento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.director.phone}
                    onChange={(e) => handleInputChange('director', 'phone', e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.director.email}
                    onChange={(e) => handleInputChange('director', 'email', e.target.value)}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Auxiliares */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-semibold text-gray-800">Personal Auxiliar</h4>
                <span className="text-sm text-gray-500">(Opcional)</span>
              </div>
              
              {formData.auxiliaries.map((auxiliary, index) => (
                <div key={index} className="border p-4 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-gray-700">Auxiliar {index + 1}</span>
                    {formData.auxiliaries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('auxiliaries', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={auxiliary.firstName}
                        onChange={(e) => handleArrayChange('auxiliaries', index, 'firstName', e.target.value)}
                        placeholder="Nombres del auxiliar"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={auxiliary.lastName}
                        onChange={(e) => handleArrayChange('auxiliaries', index, 'lastName', e.target.value)}
                        placeholder="Apellidos del auxiliar"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={auxiliary.documentType}
                        onChange={(e) => handleArrayChange('auxiliaries', index, 'documentType', e.target.value)}
                      >
                        <option value="">Seleccionar</option>
                        <option value="DNI">DNI</option>
                        <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={auxiliary.documentNumber}
                        onChange={(e) => handleArrayChange('auxiliaries', index, 'documentNumber', e.target.value)}
                        placeholder="Número de documento"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={auxiliary.phone}
                        onChange={(e) => handleArrayChange('auxiliaries', index, 'phone', e.target.value)}
                        placeholder="Número de teléfono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={auxiliary.email}
                        onChange={(e) => handleArrayChange('auxiliaries', index, 'email', e.target.value)}
                        placeholder="email@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('auxiliaries')}
                className="w-full py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                + Agregar Auxiliar
              </button>
            </div>
          )}

          {/* Step 6: Configuración Final */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-800">Configuración Final</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UGEL *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.ugel}
                    onChange={(e) => handleInputChange('ugel' as any, '', e.target.value)}
                    placeholder="Ej: UGEL 01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DRE *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={formData.dre}
                    onChange={(e) => handleInputChange('dre' as any, '', e.target.value)}
                    placeholder="Ej: DRE Lima Metropolitana"
                  />
                </div>
              </div>

              {/* Resumen */}
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h5 className="font-semibold text-gray-800 mb-2">Resumen de la Institución</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Nombre:</strong> {formData.institutionInformation.institutionName}</p>
                  <p><strong>Código Modular:</strong> {formData.institutionInformation.modularCode}</p>
                  <p><strong>Tipo:</strong> {formData.institutionInformation.institutionType}</p>
                  <p><strong>Nivel:</strong> {formData.institutionInformation.institutionLevel}</p>
                  <p><strong>Director:</strong> {formData.director.firstName} {formData.director.lastName}</p>
                  <p><strong>Auxiliares:</strong> {formData.auxiliaries.filter(aux => aux.firstName && aux.lastName).length}</p>
                  <p><strong>Ubicación:</strong> {formData.address.district}, {formData.address.province}, {formData.address.department}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(6, prev + 1))}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={loading}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Institución'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInstitutionModal;
