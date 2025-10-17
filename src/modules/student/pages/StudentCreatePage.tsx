/**
 * Página: StudentCreatePage
 * Página para crear un nuevo estudiante
 */

import { StudentCreate } from "../components/StudentCreate";
import { CreateStudentDto } from "../models/student.model";
// import { studentService } from '../service/Student.service'

export function StudentCreatePage() {
     const handleSubmit = async (data: CreateStudentDto) => {
          // TODO: Implementar servicio
          // await studentService.create(data)
          console.log("Crear estudiante:", data);
     };

     return (
          <div className="max-w-4xl mx-auto">
               <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                         Nuevo Estudiante
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                         Complete el formulario para registrar un nuevo
                         estudiante
                    </p>
               </div>

               <div className="bg-white rounded-lg shadow p-6">
                    <StudentCreate onSubmit={handleSubmit} />
               </div>
          </div>
     );
}
