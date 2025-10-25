import React, { useEffect, useState } from 'react';
import {
  getAllSupports,
  deactivateSupport,
  activateSupport,
} from '../service/SpecialNeedsSupport.service';
import type { SpecialNeedsSupport } from '../models/specialNeedSupport';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const SpecialNeedsSupportList: React.FC = () => {
  const [supports, setSupports] = useState<SpecialNeedsSupport[]>([]);
  const [filteredSupports, setFilteredSupports] = useState<SpecialNeedsSupport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadSupports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [supports, searchTerm, statusFilter]);

  // Cargar todos los registros
  const loadSupports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllSupports();
      setSupports(data);
    } catch (error) {
      console.error('Error al cargar los soportes:', error);
      setError('No se pudieron cargar los soportes');
      Swal.fire('Error', 'No se pudieron cargar los soportes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtro de búsqueda y estado
  const applyFilters = () => {
    let filtered = [...supports];

    if (searchTerm.trim()) {
      filtered = filtered.filter((support) =>
        support.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        support.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        support.supportType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((support) => support.status === statusFilter);
    }

    setFilteredSupports(filtered);
  };

  // Desactivar
  const handleDeactivate = async (id: string) => {
    const confirmResult = await Swal.fire({
      title: '¿Desactivar este soporte?',
      text: '¿Está seguro que desea desactivar este soporte?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    });

    if (confirmResult.isConfirmed) {
      try {
        await deactivateSupport(id);
        Swal.fire('Desactivado', 'El soporte fue desactivado correctamente.', 'success');
        await loadSupports();
      } catch (error) {
        console.error('Error al desactivar el soporte:', error);
        Swal.fire('Error', 'No se pudo desactivar el soporte', 'error');
      }
    }
  };

  // Activar
  const handleActivate = async (id: string) => {
    try {
      await activateSupport(id);
      Swal.fire('Reactivado', 'El soporte fue reactivado correctamente.', 'success');
      await loadSupports();
    } catch (error) {
      console.error('Error al reactivar el soporte:', error);
      Swal.fire('Error', 'No se pudo reactivar el soporte', 'error');
    }
  };

  // Etiquetas legibles
  const getSupportTypeLabel = (type: string): string => {
    switch (type) {
      case 'MOTOR': return 'Motor';
      case 'COGNITIVE': return 'Cognitivo';
      case 'VISUAL': return 'Visual';
      case 'AUDITORY': return 'Auditivo';
      case 'OTHER': return 'Otro';
      default: return type;
    }
  };

  const getStatusBadge = (status: 'ACTIVE' | 'INACTIVE') => (
    status === 'ACTIVE' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Activo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactivo
      </span>
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Cargando soportes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por estudiante o diagnóstico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'ACTIVE' | 'INACTIVE')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="all">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadSupports}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Estudiante</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Diagnóstico</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tipo</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Estado</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredSupports.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No se encontraron soportes
                </td>
              </tr>
            ) : (
              filteredSupports.map((support) => (
                <tr key={support.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{support.studentId}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{support.diagnosis}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getSupportTypeLabel(support.supportType)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getStatusBadge(support.status)}</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/psychology/supports/${support.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => navigate(`/psychology/supports/edit/${support.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                      {support.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleDeactivate(support.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(support.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpecialNeedsSupportList;
