/**
 * Página: StudentPage
 * Página principal del módulo de Estudiantes - Lista todos los estudiantes
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StudentList } from "../components/StudentList";
import { Student } from "../models/student.model";
// import { studentService } from '../service/Student.service'

export function StudentPage() {
     const navigate = useNavigate();
     const [students, setStudents] = useState<Student[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchStudents = async () => {
               try {
                    // TODO: Implementar servicio
                    // const data = await studentService.getAll()
                    // setStudents(data)

                    // Datos de ejemplo
                    setStudents([
                         {
                              id: "1",
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
                         },
                    ]);
               } catch (error) {
                    console.error("Error al cargar estudiantes:", error);
               } finally {
                    setLoading(false);
               }
          };

          fetchStudents();
     }, []);

     const handleDelete = async (id: string) => {
          try {
               // TODO: Implementar servicio
               // await studentService.delete(id)
               setStudents(students.filter((s) => s.id !== id));
               console.log("Eliminar estudiante:", id);
          } catch (error) {
               console.error("Error al eliminar estudiante:", error);
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
                              Estudiantes
                         </h1>
                         <p className="mt-2 text-sm text-gray-600">
                              Gestión de estudiantes del sistema
                         </p>
                    </div>
                    <button
                         onClick={() => navigate("/estudiantes/nuevo")}
                         className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                         Nuevo Estudiante
                    </button>
               </div>

               <StudentList students={students} onDelete={handleDelete} />
          </div>
     );
}
