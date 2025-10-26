import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { createSupport } from '../../service/SpecialNeedsSupport.service';
import type { SpecialNeedsSupport } from '../../models/specialNeedSupport';

// ---------- Inicialización del formulario ----------
const initialFormState: Omit<SpecialNeedsSupport, 'status'> = {
  id: '',
  studentId: '',
  classroomId: '',
  institutionId: '',
  academicYear: new Date().getFullYear(),
  diagnosis: '',
  diagnosisDate: new Date().toISOString().split('T')[0],
  diagnosedBy: '',
  supportType: 'MOTOR',
  description: '',
  adaptationsRequired: [],
  supportMaterials: [],
  specialistInvolved: '',
  progressNotes: '',
  lastReviewDate: new Date().toISOString().split('T')[0],
  nextReviewDate: new Date().toISOString().split('T')[0],
};

// ---------- Componentes reutilizables ----------
interface FieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  required?: boolean;
  rows?: number;
  options?: { label: string; value: string }[];
}

const InputField = ({ label, name, value, onChange, type = 'text', required }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, rows = 3 }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options = [] }: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface TagListFieldProps {
  label: string;
  items: string[];
  value: string;
  setValue: (val: string) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  colorClass?: string;
}

const TagListField = ({ label, items, value, setValue, addItem, removeItem, colorClass = 'blue' }: TagListFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex mt-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`flex-1 border border-gray-300 rounded-l-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500`}
        placeholder={`Agregar ${label.toLowerCase()}`}
      />
      <button type="button" onClick={addItem} className={`bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700`}>
        Agregar
      </button>
    </div>
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={index} className={`bg-${colorClass}-100 text-${colorClass}-800 px-3 py-1 rounded-full text-sm flex items-center`}>
          {item}
          <button
            type="button"
            onClick={() => removeItem(index)}
            className={`ml-2 text-${colorClass}-600 hover:text-${colorClass}-900`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  </div>
);

// ---------- Componente Principal ----------
export function SpecialNeedsSupportCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [adaptation, setAdaptation] = useState('');
  const [material, setMaterial] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'academicYear' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddAdaptation = () => {
    if (adaptation.trim()) {
      setFormData((prev) => ({ ...prev, adaptationsRequired: [...prev.adaptationsRequired, adaptation.trim()] }));
      setAdaptation('');
    }
  };

  const handleRemoveAdaptation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      adaptationsRequired: prev.adaptationsRequired.filter((_, i) => i !== index),
    }));
  };

  const handleAddMaterial = () => {
    if (material.trim()) {
      setFormData((prev) => ({ ...prev, supportMaterials: [...prev.supportMaterials, material.trim()] }));
      setMaterial('');
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      supportMaterials: prev.supportMaterials.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createSupport({ ...formData, status: 'ACTIVE' });
      Swal.fire('Éxito', 'Soporte creado correctamente', 'success');
      navigate('/psychology/supports');
    } catch (error) {
      console.error('Error creating support:', error);
      Swal.fire('Error', 'No se pudo crear el soporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Crear Apoyo para Necesidades Especiales</h1>
            <p className="mt-1 text-sm text-gray-500">Agregar un nuevo apoyo para un estudiante</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="ID del Estudiante" name="studentId" value={formData.studentId} onChange={handleChange} required />
                <InputField label="ID del Aula" name="classroomId" value={formData.classroomId} onChange={handleChange} required />
                <InputField label="ID de la Institución" name="institutionId" value={formData.institutionId} onChange={handleChange} required />
                <InputField label="Año Académico" name="academicYear" type="number" value={formData.academicYear} onChange={handleChange} required />
              </div>

              {/* Diagnóstico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Diagnóstico" name="diagnosis" value={formData.diagnosis} onChange={handleChange} required />
                <InputField label="Fecha de Diagnóstico" name="diagnosisDate" type="date" value={formData.diagnosisDate} onChange={handleChange} required />
                <InputField label="Diagnosticado Por" name="diagnosedBy" value={formData.diagnosedBy} onChange={handleChange} required />
                <SelectField
                  label="Tipo de Soporte"
                  name="supportType"
                  value={formData.supportType}
                  onChange={handleChange}
                  options={[
                    { label: 'Motor', value: 'MOTOR' },
                    { label: 'Cognitivo', value: 'COGNITIVE' },
                    { label: 'Visual', value: 'VISUAL' },
                    { label: 'Auditivo', value: 'AUDITORY' },
                    { label: 'Otro', value: 'OTHER' },
                  ]}
                />
              </div>

              <TextAreaField label="Descripción" name="description" value={formData.description} onChange={handleChange} />

              <TagListField
                label="Adaptaciones Requeridas"
                items={formData.adaptationsRequired}
                value={adaptation}
                setValue={setAdaptation}
                addItem={handleAddAdaptation}
                removeItem={handleRemoveAdaptation}
                colorClass="blue"
              />

              <TagListField
                label="Materiales de Soporte"
                items={formData.supportMaterials}
                value={material}
                setValue={setMaterial}
                addItem={handleAddMaterial}
                removeItem={handleRemoveMaterial}
                colorClass="green"
              />

              {/* Información Adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Especialista Involucrado" name="specialistInvolved" value={formData.specialistInvolved} onChange={handleChange} />
                <InputField label="Fecha de Última Revisión" name="lastReviewDate" type="date" value={formData.lastReviewDate} onChange={handleChange} />
                <InputField label="Fecha de Próxima Revisión" name="nextReviewDate" type="date" value={formData.nextReviewDate} onChange={handleChange} />
              </div>

              <TextAreaField label="Notas de Progreso" name="progressNotes" value={formData.progressNotes} onChange={handleChange} />

              {/* Botones */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/psychology/supports')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Soporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
