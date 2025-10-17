/**
 * Página: EventsPage
 * Página principal del módulo de Eventos - Lista todos los eventos
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EventList } from "../components/EventList";
import type { Event } from "../models/events.model";

export function EventsPage() {
     const navigate = useNavigate();
     const [items, setItems] = useState<Event[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchItems = async () => {
               try {
                    // TODO: Implementar servicio
                    // const data = await eventsService.getAll()
                    // setItems(data)

                    // Datos de ejemplo
                    setItems([
                         {
                              id: "1",
                              name: "Día del Estudiante",
                              description:
                                   "Celebración del día del estudiante con actividades recreativas",
                              status: "active",
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                         },
                         {
                              id: "2",
                              name: "Feria de Ciencias",
                              description:
                                   "Presentación de proyectos científicos estudiantiles",
                              status: "active",
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                         },
                    ]);
               } catch (error) {
                    console.error("Error al cargar datos:", error);
               } finally {
                    setLoading(false);
               }
          };

          fetchItems();
     }, []);

     const handleDelete = async (id: string) => {
          try {
               // TODO: Implementar servicio
               // await eventsService.delete(id)
               setItems(items.filter((item) => item.id !== id));
               console.log("Eliminar registro:", id);
          } catch (error) {
               console.error("Error al eliminar:", error);
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
                              Eventos
                         </h1>
                         <p className="mt-2 text-sm text-gray-600">
                              Gestión de eventos y actividades escolares
                         </p>
                    </div>
                    <button
                         onClick={() => navigate("/eventos/nuevo")}
                         className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                         Nuevo Evento
                    </button>
               </div>

               <EventList items={items} onDelete={handleDelete} />
          </div>
     );
}
