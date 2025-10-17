/**
 * Página: EnrollmentPage
 * Página principal del módulo de Matrículas - Lista todos los registros
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EnrollmentList } from '../components/EnrollmentList'
import type { Enrollment } from '../models/enrollments.model'

export function EnrollmentPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // TODO: Implementar servicio
        // const data = await enrollmentsService.getAll()
        // setItems(data)

        // Datos de ejemplo
        setItems([
          {
            id: '1',
            name: 'Ejemplo 1',
            description: 'Descripción de ejemplo',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implementar servicio
      // await enrollmentsService.delete(id)
      setItems(items.filter((item) => item.id !== id))
      console.log('Eliminar registro:', id)
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Matrículas</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestión de matrículas y procesos de inscripción
          </p>
        </div>
        <button
          onClick={() => navigate('/matriculas/nuevo')}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Nuevo Registro
        </button>
      </div>

      <EnrollmentList items={items} onDelete={handleDelete} />
    </div>
  )
}
