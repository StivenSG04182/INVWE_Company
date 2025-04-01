import React, { useState, useEffect } from 'react';

interface UserData {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserData) => void;
  initialData?: UserData;
  mode?: 'add' | 'edit';
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  mode = 'add'
}) => {
  const [userData, setUserData] = useState<UserData>({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    fechaNacimiento: ''
  });

  // Actualizar datos cuando cambia initialData
  useEffect(() => {
    if (initialData) {
      setUserData(initialData);
    } else {
      // Resetear los datos cuando se abre el modal para añadir
      setUserData({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        fechaNacimiento: ''
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validación básica
    if (!userData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!userData.apellido.trim()) {
      alert('El apellido es obligatorio');
      return;
    }
    if (!userData.correo.trim() || !userData.correo.includes('@')) {
      alert('Por favor, introduce un correo electrónico válido');
      return;
    }
    
    onSubmit(userData);
  };

  const handleDelete = () => {
    if (mode === 'edit' && confirm('¿Estás seguro de que deseas eliminar este trabajador?')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header with avatar icon - edit icon removed */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>

          {/* Form inputs */}
          <div className="space-y-4">
            <input
              type="text"
              name="nombre"
              value={userData.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              className="w-full px-4 py-3 rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="text"
              name="apellido"
              value={userData.apellido}
              onChange={handleChange}
              placeholder="Apellido"
              className="w-full px-4 py-3 rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="email"
              name="correo"
              value={userData.correo}
              onChange={handleChange}
              placeholder="Correo"
              className="w-full px-4 py-3 rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="tel"
              name="telefono"
              value={userData.telefono}
              onChange={handleChange}
              placeholder="Numero de teléfono"
              className="w-full px-4 py-3 rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <input
              type="date"
              name="fechaNacimiento"
              value={userData.fechaNacimiento}
              onChange={handleChange}
              placeholder="Fecha de nacimiento"
              className="w-full px-4 py-3 rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-between mt-6">
            {mode === 'edit' ? (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 focus:outline-none"
              >
                Eliminar
              </button>
            ) : (
              <div></div> // Espacio vacío para mantener la alineación
            )}
            
            <div className="space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {mode === 'add' ? 'Añadir' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;