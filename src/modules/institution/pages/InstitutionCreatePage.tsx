/**
 * Página: InstitutionCreatePage
 * Página para crear una nueva institución (EJEMPLO)
 */

// import { InstitutionCreate } from '../components/InstitutionCreate'
// import type { CreateInstitutionDto } from '../models/institution.model'

export function InstitutionCreatePage() {
     // const handleSubmit = async (data: CreateInstitutionDto) => {
     //   await institutionService.create(data)
     //   console.log('Crear institución:', data)
     // }

     return (
          <div className="max-w-4xl mx-auto">
               <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                         Nueva Institución
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                         Complete el formulario para registrar una nueva
                         institución
                    </p>
               </div>

               <div className="bg-white rounded-lg shadow p-6">
                    {/* <InstitutionCreate onSubmit={handleSubmit} /> */}
                    <p className="text-gray-500">Componente en desarrollo...</p>
               </div>
          </div>
     );
}
