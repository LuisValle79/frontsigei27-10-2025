import React, { useState } from 'react';
import { institutionService } from '../service/Institution.service';
import { type InstitutionCreateWithUsersRequest } from '../models/Institution.interface';
import { type CreateInstitutionModalProps } from '../models/CreateInstitutionModalProps';
import { type InstitutionFormData as FormData } from '../models/InstitutionFormData';

const CreateInstitutionModal: React.FC<CreateInstitutionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    institutionInformation: {
      institutionName: '',
      modularCode: '',
      institutionType: '',
      institutionLevel: '',
      gender: '',
      slogan: '',
      logoUrl: ''
    },
    address: {
      street: '',
      district: '',
      province: '',
      department: '',
      postalCode: ''
    },
    contactMethods: [{ type: '', value: '' }],
    gradingType: '',
    classroomType: '',
    schedules: [{ type: '', entryTime: '', exitTime: '' }],
    classrooms: [{ classroomName: '', classroomAge: '', capacity: 0, color: '' }],
    director: {
      firstName: '',
      lastName: '',
      documentType: '',
      documentNumber: '',
      phone: '',
      email: '',
      role: 'DIRECTOR'
    },
    auxiliaries: [{
      firstName: '',
      lastName: '',
      documentType: '',
      documentNumber: '',
      phone: '',
      email: '',
      role: 'AUXILIAR'
    }],
    ugel: '',
    dre: ''
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
      classrooms: { classroomName: '', classroomAge: '', capacity: 0, color: '' },
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

  // Validar paso actual
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.institutionInformation.institutionName && 
                 formData.institutionInformation.modularCode &&
                 formData.institutionInformation.institutionType &&
                 formData.institutionInformation.institutionLevel &&
                 formData.institutionInformation.gender);
      case 2:
        return !!(formData.address.street &&
                 formData.address.district &&
                 formData.address.province &&
                 formData.address.department);
      case 3:
        return !!(formData.gradingType && formData.classroomType);
      case 4:
        return !!(formData.director.firstName &&
                 formData.director.lastName &&
                 formData.director.documentType &&
                 formData.director.documentNumber &&
                 formData.director.phone &&
                 formData.director.email);
      case 5:
        return true; // Auxiliares son opcionales
      case 6:
        return !!(formData.ugel && formData.dre);
      default:
        return true;
    }
  };

  // Navegar entre pasos
  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mapear el formData al formato esperado por el backend
      const requestData: InstitutionCreateWithUsersRequest = {
        institutionInformation: formData.institutionInformation,
        address: formData.address,
        contactMethods: formData.contactMethods.filter(cm => cm.type && cm.value),
        gradingType: formData.gradingType,
        classroomType: formData.classroomType,
        schedules: formData.schedules.filter(s => s.type && s.entryTime && s.exitTime),
        classrooms: formData.classrooms.filter(c => c.classroomName && c.classroomAge && c.capacity > 0),
        ugel: formData.ugel,
        dre: formData.dre,
        director: {
          firstName: formData.director.firstName,
          lastName: formData.director.lastName,
          documentType: formData.director.documentType,
          documentNumber: formData.director.documentNumber,
          phone: formData.director.phone,
          email: formData.director.email,
          role: formData.director.role
        },
        auxiliaries: formData.auxiliaries
          .filter(aux => aux.firstName && aux.lastName && aux.email && aux.documentNumber)
          .map(aux => ({
            firstName: aux.firstName,
            lastName: aux.lastName,
            documentType: aux.documentType,
            documentNumber: aux.documentNumber,
            phone: aux.phone,
            email: aux.email,
            role: aux.role
          }))
      };

      await institutionService.createInstitutionWithUsers(requestData);
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la institución');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      institutionInformation: {
        institutionName: '',
        modularCode: '',
        institutionType: '',
        institutionLevel: '',
        gender: '',
        slogan: '',
        logoUrl: ''
      },
      address: {
        street: '',
        district: '',
        province: '',
        department: '',
        postalCode: ''
      },
      contactMethods: [{ type: '', value: '' }],
      gradingType: '',
      classroomType: '',
      schedules: [{ type: '', entryTime: '', exitTime: '' }],
      classrooms: [{ classroomName: '', classroomAge: '', capacity: 0, color: '' }],
      director: {
        firstName: '',
        lastName: '',
        documentType: '',
        documentNumber: '',
        phone: '',
        email: '',
        role: 'DIRECTOR'
      },
      auxiliaries: [{
        firstName: '',
        lastName: '',
        documentType: '',
        documentNumber: '',
        phone: '',
        email: '',
        role: 'AUXILIAR'
      }],
      ugel: '',
      dre: ''
    });
  };

  if (!isOpen) {
    console.log('Modal no se muestra porque isOpen =', isOpen);
    return null;
  }

  console.log('Renderizando CreateInstitutionModal con isOpen =', isOpen);

  return (
    <div className="fixed inset-0 bg-gray-900/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Crear Nueva Institución
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Paso 1: Información Básica */}
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
                    <option value="PUBLICA">Pública</option>
                    <option value="PRIVADA">Privada</option>
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
                    <option value="INICIAL_PRIMARIA">Inicial - Primaria</option>
                    <option value="PRIMARIA_SECUNDARIA">Primaria - Secundaria</option>
                    <option value="INICIAL_PRIMARIA_SECUNDARIA">Inicial - Primaria - Secundaria</option>
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
              </div>

              <div>
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
          )}

          {/* Paso 2: Dirección y Contacto */}
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
                    required
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
                    required
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
                    required
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
                  required
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
                        <option value="EMAIL">Email</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="WEBSITE">Sitio Web</option>
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

          {/* Paso 3: Configuración Académica */}
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

              <h4 className="text-md font-semibold text-gray-800 mt-6">Aulas Iniciales</h4>
              
              {formData.classrooms.map((classroom, index) => (
                <div key={index} className="border p-4 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Aula {index + 1}</span>
                    {formData.classrooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('classrooms', index)}
                        className="text-red-500 hover:text-red-700"
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

          {/* Paso 4: Director */}
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

          {/* Paso 5: Auxiliares */}
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

          {/* Paso 6: Configuración Final */}
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
              onClick={prevStep}
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
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    validateStep(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !validateStep(currentStep)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    loading || !validateStep(currentStep)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Creando...' : 'Crear Institución'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInstitutionModal;
