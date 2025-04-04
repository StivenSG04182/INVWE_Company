'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Functionality } from '@/data/functionalities';
import { toast } from 'sonner';
import { CheckCircle2, PlusCircle, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function FunctionalityProgressPage() {
    const [functionalities, setFunctionalities] = useState<Functionality[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFunctionality, setSelectedFunctionality] = useState<Functionality | null>(null);
    const [newTaskDescription, setNewTaskDescription] = useState('');

    // Cargar funcionalidades desde la API
    useEffect(() => {
        const fetchFunctionalities = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/client/control_dash/(settings)/functionality/read');
                if (response.ok) {
                    const data = await response.json();
                    setFunctionalities(data.functionalities || []);

                    // Si hay funcionalidades, seleccionar la primera por defecto
                    if (data.functionalities && data.functionalities.length > 0) {
                        setSelectedFunctionality(data.functionalities[0]);
                    }
                } else {
                    toast.error('Error al cargar las funcionalidades');
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('Error al cargar las funcionalidades');
            } finally {
                setLoading(false);
            }
        };

        fetchFunctionalities();
    }, []);

    // Manejar la selección de una funcionalidad
    const handleSelectFunctionality = (functionality: Functionality) => {
        setSelectedFunctionality(functionality);
    };

    // Manejar el cambio de estado de una tarea
    const handleTaskChange = (taskId: string, completed: boolean) => {
        if (!selectedFunctionality) return;

        // Crear una copia de las tareas actuales
        const updatedTasks = selectedFunctionality.tareas?.map(task =>
            task.id === taskId ? { ...task, completada: completed } : task
        ) || [];

        // Calcular el nuevo progreso
        const totalTasks = updatedTasks.length;
        const completedTasks = updatedTasks.filter(task => task.completada).length;
        const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Actualizar la funcionalidad seleccionada
        const updatedFunctionality = {
            ...selectedFunctionality,
            tareas: updatedTasks,
            progreso: newProgress
        };

        setSelectedFunctionality(updatedFunctionality);

        // Actualizar la lista de funcionalidades
        setFunctionalities(prev =>
            prev.map(item => item.id === updatedFunctionality.id ? updatedFunctionality : item)
        );
    };

    // Añadir una nueva tarea
    const handleAddTask = () => {
        if (!selectedFunctionality || !newTaskDescription.trim()) return;

        const newTask = {
            id: `task-${Date.now()}`,
            descripcion: newTaskDescription.trim(),
            completada: false
        };

        const updatedTasks = [...(selectedFunctionality.tareas || []), newTask];

        // Actualizar la funcionalidad seleccionada
        const updatedFunctionality = {
            ...selectedFunctionality,
            tareas: updatedTasks
        };

        setSelectedFunctionality(updatedFunctionality);
        setFunctionalities(prev =>
            prev.map(item => item.id === updatedFunctionality.id ? updatedFunctionality : item)
        );
        setNewTaskDescription('');
    };

    // Guardar los cambios en la API
    const handleSaveChanges = async () => {
        if (!selectedFunctionality) return;

        try {
            const response = await fetch('/api/client/control_dash/(settings)/functionality/write', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    functionality: selectedFunctionality,
                    mode: 'edit'
                }),
            });

            if (!response.ok) {
                throw new Error('Error al guardar los cambios');
            }

            toast.success('Cambios guardados correctamente');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al guardar los cambios');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Cargando funcionalidades...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Gestión de Progreso de Funcionalidades</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Lista de funcionalidades */}
                <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Funcionalidades</h2>

                    {functionalities.length === 0 ? (
                        <p className="text-gray-500">No hay funcionalidades disponibles</p>
                    ) : (
                        <ul className="space-y-2">
                            {functionalities.map(functionality => (
                                <li
                                    key={functionality.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedFunctionality?.id === functionality.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                    onClick={() => handleSelectFunctionality(functionality)}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{functionality.nombre}</span>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                            {functionality.progreso}%
                                        </span>
                                    </div>
                                    <Progress value={functionality.progreso} className="h-2 mt-2" />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Detalle de la funcionalidad seleccionada */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    {selectedFunctionality ? (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-2">{selectedFunctionality.nombre}</h2>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        {selectedFunctionality.categoria}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {selectedFunctionality.votos} {selectedFunctionality.votos === 1 ? 'voto' : 'votos'}
                                    </span>
                                </div>
                                <p className="text-gray-700 mb-4">{selectedFunctionality.descripcion}</p>

                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium">Progreso</span>
                                        <span className="font-medium">{selectedFunctionality.progreso}%</span>
                                    </div>
                                    <Progress value={selectedFunctionality.progreso} className="h-3" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-4">Tareas</h3>

                                {/* Añadir nueva tarea */}
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Añadir nueva tarea..."
                                        value={newTaskDescription}
                                        onChange={(e) => setNewTaskDescription(e.target.value)}
                                        className="flex-grow"
                                    />
                                    <Button onClick={handleAddTask} disabled={!newTaskDescription.trim()}>
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Añadir
                                    </Button>
                                </div>

                                {/* Lista de tareas */}
                                <div className="space-y-3 max-h-[400px] overflow-y-auto p-2">
                                    {selectedFunctionality.tareas && selectedFunctionality.tareas.length > 0 ? (
                                        selectedFunctionality.tareas.map(task => (
                                            <div key={task.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-md">
                                                <Checkbox
                                                    id={task.id}
                                                    checked={task.completada}
                                                    onCheckedChange={(checked) => handleTaskChange(task.id, checked === true)}
                                                />
                                                <label
                                                    htmlFor={task.id}
                                                    className={`text-sm cursor-pointer ${task.completada ? 'line-through text-gray-400' : 'text-gray-700'}`}
                                                >
                                                    {task.descripcion}
                                                </label>
                                                {task.completada && (
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No hay tareas definidas</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveChanges}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar cambios
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64">
                            <p className="text-gray-500 mb-4">Selecciona una funcionalidad para ver sus detalles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}