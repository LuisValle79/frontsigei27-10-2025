/**
 * Componente: StudentCreate
 * Formulario para crear un nuevo estudiante
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateStudentDto } from "../models/student.model";

interface StudentCreateProps {
     onSubmit: (data: CreateStudentDto) => Promise<void>;
}

export function StudentCreate({ onSubmit }: StudentCreateProps) {
     const navigate = useNavigate();
     const [loading, setLoading] = useState(false);
     const [formData, setFormData] = useState<CreateStudentDto>({
          firstName: "",
          lastName: "",
          dni: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          address: "",
          grade: "",
          section: "",
     });

     const handleChange = (
          e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
     ) => {
          const { name, value } = e.target;
          setFormData((prev) => ({ ...prev, [name]: value }));
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setLoading(true);
          try {
               await onSubmit(formData);
               navigate("/estudiantes");
          } catch (error) {
               console.error("Error al crear estudiante:", error);
          } finally {
               setLoading(false);
          }
     };

     return (
          <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="block text-sm font-medium text-gray-700">
                              Nombre
                         </label>
                         <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                         />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700">
                              Apellido
                         </label>
                         <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                         />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700">
                              DNI
                         </label>
                         <input
                              type="text"
                              name="dni"
                              value={formData.dni}
                              onChange={handleChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                         />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700">
                              Email
                         </label>
                         <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                         />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700">
                              Teléfono
                         </label>
                         <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                         />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700">
                              Fecha de Nacimiento
                         </label>
                         <input
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                         />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700">
                              Grado
                         </label>
                         <input
                              type="text"
                              name="grade"
                              value={formData.grade}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                         />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700">
                              Sección
                         </label>
                         <input
                              type="text"
                              name="section"
                              value={formData.section}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                         />
                    </div>

                    <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-700">
                              Dirección
                         </label>
                         <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                         />
                    </div>
               </div>

               <div className="flex justify-end space-x-3">
                    <button
                         type="button"
                         onClick={() => navigate("/estudiantes")}
                         className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                         Cancelar
                    </button>
                    <button
                         type="submit"
                         disabled={loading}
                         className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                         {loading ? "Guardando..." : "Crear Estudiante"}
                    </button>
               </div>
          </form>
     );
}
