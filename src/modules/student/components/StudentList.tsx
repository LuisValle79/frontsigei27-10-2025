/**
 * Componente: StudentList
 * Muestra la lista de estudiantes con opciones de ver, editar y eliminar
 */

import { useNavigate } from "react-router-dom";
import { Student } from "../models/student.model";

interface StudentListProps {
     students: Student[];
     onDelete?: (id: string) => void;
}

export function StudentList({ students, onDelete }: StudentListProps) {
     const navigate = useNavigate();

     const handleView = (id: string) => {
          navigate(`/estudiantes/${id}`);
     };

     const handleEdit = (id: string) => {
          navigate(`/estudiantes/${id}/editar`);
     };

     const handleDelete = (id: string) => {
          if (window.confirm("¿Estás seguro de eliminar este estudiante?")) {
               onDelete?.(id);
          }
     };

     return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
               <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                         <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Nombre
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   DNI
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Grado
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Estado
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Acciones
                              </th>
                         </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                         {students.map((student) => (
                              <tr key={student.id} className="hover:bg-gray-50">
                                   <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                             {student.firstName}{" "}
                                             {student.lastName}
                                        </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.dni}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.email}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.grade} - {student.section}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                             className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                  student.status === "active"
                                                       ? "bg-green-100 text-green-800"
                                                       : student.status ===
                                                         "inactive"
                                                       ? "bg-gray-100 text-gray-800"
                                                       : "bg-red-100 text-red-800"
                                             }`}
                                        >
                                             {student.status}
                                        </span>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                             onClick={() =>
                                                  handleView(student.id)
                                             }
                                             className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                             Ver
                                        </button>
                                        <button
                                             onClick={() =>
                                                  handleEdit(student.id)
                                             }
                                             className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                             Editar
                                        </button>
                                        <button
                                             onClick={() =>
                                                  handleDelete(student.id)
                                             }
                                             className="text-red-600 hover:text-red-900"
                                        >
                                             Eliminar
                                        </button>
                                   </td>
                              </tr>
                         ))}
                    </tbody>
               </table>
          </div>
     );
}
