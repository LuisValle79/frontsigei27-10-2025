/**
 * Componente: InstitutionList
 * Muestra la lista de instituciones
 */

import { useNavigate } from "react-router-dom";
import type { Institution } from "../models/institution.model";

interface InstitutionListProps {
     readonly institutions: Institution[];
     readonly onDelete?: (id: string) => void;
}

export function InstitutionList({
     institutions,
     onDelete,
}: InstitutionListProps) {
     const navigate = useNavigate();

     const handleView = (id: string) => {
          navigate(`/institucion/${id}`);
     };

     const handleEdit = (id: string) => {
          navigate(`/institucion/${id}/editar`);
     };

     const handleDelete = (id: string) => {
          if (
               globalThis.confirm("¿Estás seguro de eliminar esta institución?")
          ) {
               onDelete?.(id);
          }
     };

     const getStatusClass = (status: string) => {
          return status === "active"
               ? "bg-green-100 text-green-800"
               : "bg-gray-100 text-gray-800";
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
                                   Código
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Director
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                   Tipo
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
                         {institutions.map((institution) => (
                              <tr
                                   key={institution.id}
                                   className="hover:bg-gray-50"
                              >
                                   <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                             {institution.name}
                                        </div>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {institution.code}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {institution.director}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {institution.type}
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                             className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                                                  institution.status
                                             )}`}
                                        >
                                             {institution.status}
                                        </span>
                                   </td>
                                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                             onClick={() =>
                                                  handleView(institution.id)
                                             }
                                             className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                             Ver
                                        </button>
                                        <button
                                             onClick={() =>
                                                  handleEdit(institution.id)
                                             }
                                             className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                             Editar
                                        </button>
                                        <button
                                             onClick={() =>
                                                  handleDelete(institution.id)
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
