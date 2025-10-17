/**
 * Página: InstitutionPage
 * Página principal del módulo de Institución - Lista todas las instituciones
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InstitutionList } from "../components/InstitutionList";
import type { Institution } from "../models/institution.model";

export function InstitutionPage() {
     const navigate = useNavigate();
     const [institutions, setInstitutions] = useState<Institution[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchInstitutions = async () => {
               try {
                    // TODO: Implementar servicio
                    // const data = await institutionService.getAll()
                    // setInstitutions(data)

                    // Datos de ejemplo
                    setInstitutions([
                         {
                              id: "1",
                              name: "Institución Educativa San José",
                              code: "IE-001",
                              director: "María García",
                              email: "contacto@iesanjose.edu",
                              phone: "987654321",
                              address: "Av. Principal 456",
                              city: "Lima",
                              state: "Lima",
                              country: "Perú",
                              type: "public",
                              level: "both",
                              status: "active",
                              createdAt: "2023-01-01T00:00:00Z",
                              updatedAt: "2023-01-01T00:00:00Z",
                         },
                    ]);
               } catch (error) {
                    console.error("Error al cargar instituciones:", error);
               } finally {
                    setLoading(false);
               }
          };

          fetchInstitutions();
     }, []);

     const handleDelete = async (id: string) => {
          try {
               // TODO: Implementar servicio
               // await institutionService.delete(id)
               setInstitutions(institutions.filter((i) => i.id !== id));
               console.log("Eliminar institución:", id);
          } catch (error) {
               console.error("Error al eliminar institución:", error);
          }
     };

     if (loading) {
          return (
               <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600">Cargando...</div>
               </div>
          );
     }

     return (
          <div className="max-w-7xl mx-auto">
               <div className="mb-6 flex justify-between items-center">
                    <div>
                         <h1 className="text-3xl font-bold text-gray-900">
                              Institución
                         </h1>
                         <p className="mt-2 text-sm text-gray-600">
                              Gestión de instituciones educativas del sistema
                         </p>
                    </div>
                    <button
                         onClick={() => navigate("/institucion/nuevo")}
                         className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                         Nueva Institución
                    </button>
               </div>

               <InstitutionList
                    institutions={institutions}
                    onDelete={handleDelete}
               />
          </div>
     );
}
