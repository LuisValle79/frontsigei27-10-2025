import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSupportById, updateSupport } from '../../service/SpecialNeedsSupport.service';
import type { SpecialNeedsSupport } from '../../models/specialNeedSupport';
import Swal from 'sweetalert2';

export function SpecialNeedsSupportEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<Omit<SpecialNeedsSupport, 'status'> | null>(null);
  const [originalStatus, setOriginalStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [adaptation, setAdaptation] = useState('');
  const [material, setMaterial] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------------------- Cargar datos del soporte ----------------------
  useEffect(() => {
    if (id) loadSupport(id);
  }, [id]);

  const loadSupport = async (supportId: string) => {
    try {
      const support = await getSupportById(supportId);
      const { status, ...data } = support;
      setFormData(data);
      setOriginalStatus(status);
    } catch (error) {
      console.error('Error loading support:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar',
        text: 'No se pudo cargar la información del soporte.',
        confirmButtonColor: '#6366f1',
      });
      navigate('/psychology/supports');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- Manejo de cambios ----------------------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev!,
      [name]: name === 'academicYear' ? parseInt(value) || 0 : value,
    }));
  };

  // ---------------------- Adaptaciones ----------------------
  const handleAddAdaptation = () => {
    if (!formData || !adaptation.trim()) return;

    if (formData.adaptationsRequired.includes(adaptation.trim())) {
      Swal.fire('Advertencia', 'Esta adaptación ya fue agregada.', 'warning');
      return;
    }

    setFormData(prev => ({
      ...prev!,
      adaptationsRequired: [...prev!.adaptationsRequired, adaptation.trim()],
    }));
    setAdaptation('');
  };

  const handleRemoveAdaptation = (index: number) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      adaptationsRequired: prev!.adaptationsRequired.filter((_, i) => i !== index),
    }));
  };

  // ---------------------- Materiales ----------------------
  const handleAddMaterial = () => {
    if (!formData || !material.trim()) return;

    if (formData.supportMaterials.includes(material.trim())) {
      Swal.fire('Advertencia', 'Este material ya fue agregado.', 'warning');
      return;
    }

    setFormData(prev => ({
      ...prev!,
      supportMaterials: [...prev!.supportMaterials, material.trim()],
    }));
    setMaterial('');
  };

  const handleRemoveMaterial = (index: number) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      supportMaterials: prev!.supportMaterials.filter((_, i) => i !== index),
    }));
  };

  // ---------------------- Guardar Cambios ----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;

    setSaving(true);

    try {
      const supportData: SpecialNeedsSupport = {
        ...formData,
        status: originalStatus,
      };

      await updateSupport(id, supportData);

      await Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'El soporte ha sido actualizado correctamente.',
        confirmButtonColor: '#4f46e5',
      });

      navigate('/psychology/supports');
    } catch (error) {
      console.error('Error updating support:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        text: 'No se pudo actualizar el soporte.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setSaving(false);
    }
  };

  // ---------------------- Renderizado ----------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md border">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="font-semibold text-gray-900">Cargando soporte</h3>
              <p className="text-gray-600 text-sm">Obteniendo datos del servidor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center border border-red-300">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-700 mb-4">No se pudo cargar la información del soporte.</p>
          <button
            onClick={() => navigate('/psychology/supports')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // ---------------------- Formulario ----------------------
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Editar Apoyo para Necesidades Especiales
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Información básica</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {['studentId', 'classroomId', 'institutionId'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field === 'studentId'
                      ? 'ID del Estudiante'
                      : field === 'classroomId'
                      ? 'ID del Aula'
                      : 'ID de la Institución'}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={(formData as any)[field]}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700">Año Académico</label>
                <input
                  type="number"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </section>

 {/* Diagnóstico */}
<section>
  <h2 className="text-lg font-semibold text-gray-700 mb-4">Diagnóstico</h2>
  <div className="grid md:grid-cols-2 gap-4">
    {/* Campo: Diagnóstico */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
      <input
        type="text"
        name="diagnosis"
        value={formData.diagnosis}
        onChange={handleChange}
        required
        className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    {/* Campo: Fecha de Diagnóstico */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Fecha de Diagnóstico</label>
      <input
        type="date"
        name="diagnosisDate"
        value={formData.diagnosisDate}
        onChange={handleChange}
        required
        className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    {/* Campo: Diagnosticado por */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Diagnosticado por</label>
      <input
        type="text"
        name="diagnosedBy"
        value={formData.diagnosedBy}
        onChange={handleChange}
        required
        className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    {/* Campo: Tipo de soporte */}
    <div>
      <label className="block text-sm font-medium text-gray-700">Tipo de Soporte</label>
      <select
        name="supportType"
        value={formData.supportType}
        onChange={handleChange}
        required
        className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="MOTOR">Motor</option>
        <option value="COGNITIVE">Cognitivo</option>
        <option value="VISUAL">Visual</option>
        <option value="AUDITORY">Auditivo</option>
        <option value="OTHER">Otro</option>
      </select>
    </div>
  </div>
</section>


          {/* Adaptaciones y Materiales */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Adaptaciones y Materiales</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Adaptaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adaptaciones requeridas</label>
                <div className="flex">
                  <input
                    type="text"
                    value={adaptation}
                    onChange={e => setAdaptation(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l-md p-2"
                    placeholder="Agregar adaptación"
                  />
                  <button
                    type="button"
                    onClick={handleAddAdaptation}
                    className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.adaptationsRequired.map((item, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full flex items-center"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveAdaptation(index)}
                        className="ml-2 text-indigo-600 hover:text-indigo-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Materiales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materiales de soporte</label>
                <div className="flex">
                  <input
                    type="text"
                    value={material}
                    onChange={e => setMaterial(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l-md p-2"
                    placeholder="Agregar material"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="bg-green-600 text-white px-4 rounded-r-md hover:bg-green-700"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.supportMaterials.map((item, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(index)}
                        className="ml-2 text-green-600 hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/psychology/supports')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
