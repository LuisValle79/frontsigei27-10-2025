/**
 * Componente: StudentDetail
 * Muestra los detalles completos de un estudiante
 */

import { useNavigate } from "react-router-dom";
import { Student } from "../models/student.model";

interface StudentDetailProps {
     student: Student;
}

export function StudentDetail({ student }: StudentDetailProps) {
     const navigate = useNavigate();

     return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                         <h2 className="text-2xl font-bold text-gray-900">
                              {student.firstName} {student.lastName}
                         </h2>
                         <span
                              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                   student.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : student.status === "inactive"
                                        ? "bg-gray-100 text-gray-800"
                                        : "bg-red-100 text-red-800"
                              }`}
                         >
                              {student.status}
                         </span>
                    </div>
               </div>

               <div className="px-6 py-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                              <dt className="text-sm font-medium text-gray-500">
                                   DNI
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                   {student.dni}
                              </dd>
                         </div>

                         <div>
                              <dt className="text-sm font-medium text-gray-500">
                                   Email
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                   {student.email}
                              </dd>
                         </div>

                         <div>
                              <dt className="text-sm font-medium text-gray-500">
                                   Teléfono
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                   {student.phone || "No especificado"}
                              </dd>
                         </div>

                         <div>
                              <dt className="text-sm font-medium text-gray-500">
                                   Fecha de Nacimiento
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                   {new Date(
                                        student.dateOfBirth
                                   ).toLocaleDateString()}
                              </dd>
                         </div>

                         <div>
                              <dt className="text-sm font-medium text-gray-500">
                                   Grado
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                   {student.grade || "No asignado"}
                              </dd>
                         </div>

                         <div>
                              <dt className="text-sm font-medium text-gray-500">
                                   Sección
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                   {student.section || "No asignado"}
                              </dd>
                         </div>

                         <div className="md:col-span-2">
                              <dt className="text-sm font-medium text-gray-500">
                                   Dirección
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                   {student.address || "No especificada"}
                              </dd>
                         </div>

                         <div>
                              <dt className="text-sm font-medium text-gray-500">
                                   Fecha de Inscripción
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                   {new Date(
                                        student.enrollmentDate
                                   ).toLocaleDateString()}
                              </dd>
                         </div>

                         <div>
                              <dt className="text-sm font-medium text-gray-500">
                                   Última Actualización
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                   {new Date(
                                        student.updatedAt
                                   ).toLocaleDateString()}
                              </dd>
                         </div>
                    </dl>
               </div>

               <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                         onClick={() => navigate("/estudiantes")}
                         className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                         Volver
                    </button>
                    <button
                         onClick={() =>
                              navigate(`/estudiantes/${student.id}/editar`)
                         }
                         className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                         Editar
                    </button>
               </div>
          </div>
     );
}
