'use client'

import React, { useState } from 'react';
import UserProfileModal from '@/components/modal/employee-modal';
import { XCircle, Search, Plus, Edit, Trash2, Calendar } from 'lucide-react';

interface Employee {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
}

const EmployeeDirectory: React.FC = () => {
  // Estado para los empleados
  const [employees, setEmployees] = useState<Employee[]>([
    { 
      id: '1', 
      nombre: 'María', 
      apellido: 'García', 
      correo: 'maria@ejemplo.com', 
      telefono: '555-123-4567', 
      fechaNacimiento: '1990-05-15' 
    },
    { 
      id: '2', 
      nombre: 'Juan', 
      apellido: 'Pérez', 
      correo: 'juan@ejemplo.com', 
      telefono: '555-987-6543', 
      fechaNacimiento: '1988-10-22' 
    },
    { 
      id: '3', 
      nombre: 'Ana', 
      apellido: 'López', 
      correo: 'ana@ejemplo.com', 
      telefono: '555-567-8901', 
      fechaNacimiento: '1995-03-07' 
    },
  ]);
  
  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  // Función para filtrar empleados basado en el término de búsqueda
  const filteredEmployees = employees.filter(employee => 
    employee.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.telefono.includes(searchTerm) ||
    employee.fechaNacimiento.includes(searchTerm)
  );
  
  // Función para abrir el modal en modo añadir
  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setModalMode('add');
    setIsModalOpen(true);
  };
  
  // Función para abrir el modal en modo editar
  const handleEditEmployee = (employee: Employee) => {
    setCurrentEmployee(employee);
    setModalMode('edit');
    setIsModalOpen(true);
  };
  
  // Función para eliminar un empleado
  const handleDeleteEmployee = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };
  
  // Función para formatear la fecha
  const formatDate = (dateString: string): string => {
    if (!dateString) return "No disponible";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Función para calcular la edad
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Función para manejar el envío del formulario
  const handleSubmit = (userData: Omit<Employee, 'id'>) => {
    if (modalMode === 'add') {
      // Generar un ID único para el nuevo empleado
      const newId = Date.now().toString();
      setEmployees([...employees, { id: newId, ...userData }]);
    } else if (modalMode === 'edit' && currentEmployee) {
      // Actualizar empleado existente
      setEmployees(employees.map(emp => 
        emp.id === currentEmployee.id ? { ...emp, ...userData } : emp
      ));
    }
    setIsModalOpen(false);
  };
  
  // Función para limpiar la búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Directorio de Trabajadores</h1>
      
      {/* Barra de búsqueda y botón añadir */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar trabajadores..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          onClick={handleAddEmployee}
          className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Añadir trabajador</span>
        </button>
      </div>
      
      {/* Lista de trabajadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map(employee => (
            <div key={employee.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {employee.nombre} {employee.apellido}
                  </h3>
                  <p className="text-sm text-blue-600">{employee.correo}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditEmployee(employee)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    aria-label="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center">
                  <span className="font-medium w-24">Teléfono:</span>
                  <span>{employee.telefono}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-24">Fecha nac.:</span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(employee.fechaNacimiento)}
                    <span className="text-sm text-gray-500 ml-1">
                      ({calculateAge(employee.fechaNacimiento)} años)
                    </span>
                  </span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            {searchTerm 
              ? "No se encontraron trabajadores que coincidan con su búsqueda."
              : "No hay trabajadores registrados. Añada un nuevo trabajador para comenzar."}
          </div>
        )}
      </div>
      
      {/* Modal para añadir/editar empleados */}
      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={currentEmployee || undefined}
        mode={modalMode}
      />
    </div>
  );
};

export default EmployeeDirectory;