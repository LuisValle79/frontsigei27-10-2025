/**
 * Página: StudentEditPage
 * Página para editar un estudiante existente
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { StudentEdit } from "../components/StudentEdit";
import { Student, UpdateStudentDto } from "../models/student.model";
// import { studentService } from '../service/Student.service'

export function StudentEditPage() {
     const { id } = useParams<{ id: string }>();
     const [student, setStudent] = useState<Student | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchStudent = async () => {
               try {
                    // TODO: Implementar servicio
                    // const data = await studentService.getById(id!)
                    // setStudent(data)

                    // Datos de ejemplo
                    setStudent({
                         id: id!,
                         firstName: "Juan",
                         lastName: "Pérez",
                         dni: "12345678",
                         email: "juan.perez@example.com",
                         phone: "987654321",
                         dateOfBirth: "2005-05-15",
                         address: "Av. Principal 123",
                         enrollmentDate: "2023-03-01",
                         grade: "5to",
                         section: "A",
                         status: "active",
                         createdAt: "2023-03-01T00:00:00Z",
                         updatedAt: "2023-03-01T00:00:00Z",
                    });
               } catch (error) {
                    console.error("Error al cargar estudiante:", error);
               } finally {
                    setLoading(false);
               }
          };

          fetchStudent();
     }, [id]);

     const handleSubmit = async (id: string, data: UpdateStudentDto) => {
          // TODO: Implementar servicio
          // await studentService.update(id, data)
          console.log("Actualizar estudiante:", id, data);
     };

     if (loading) {
          return (
               <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600">Cargando...</div>
               </div>
          );
     }

     if (!student) {
          return (
               <div className="text-center py-12">
                    <p className="text-gray-600">Estudiante no encontrado</p>
               </div>
          );
     }

     return (
          <div className="max-w-4xl mx-auto">
               <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                         Editar Estudiante
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                         Modifique los datos del estudiante
                    </p>
               </div>

               <div className="bg-white rounded-lg shadow p-6">
                    <StudentEdit student={student} onSubmit={handleSubmit} />
               </div>
          </div>
     );
}
