'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface Provider {
  id?: number;
  name: string;
  product: string;
  phone: number | string;
  email: string;
}

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (providerData: Provider) => void;
  onDelete?: () => void;
  initialData?: Provider;
  mode?: 'add' | 'edit';
}

export const ProviderModal: React.FC<ProviderModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete,
  initialData,
  mode = 'add'
}) => {
  const [providerData, setProviderData] = useState<Provider>({
    name: '',
    product: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (initialData) {
      setProviderData(initialData);
    } else {
      setProviderData({
        name: '',
        product: '',
        phone: '',
        email: ''
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProviderData(prev => ({ 
      ...prev, 
      [name]: name === 'phone' ? (value === '' ? '' : Number(value)) : value 
    }));
  };

  const handleSubmit = () => {
    // Validación básica
    if (!providerData.name.trim()) {
      alert('El nombre del proveedor es obligatorio');
      return;
    }
    if (!providerData.product.trim()) {
      alert('El producto es obligatorio');
      return;
    }
    if (!providerData.phone) {
      alert('El teléfono es obligatorio');
      return;
    }
    if (!providerData.email.trim() || !providerData.email.includes('@')) {
      alert('Por favor, introduce un email válido');
      return;
    }
    
    onSubmit(providerData);
  };

  const handleDelete = () => {
    if (mode === 'edit' && confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      onDelete?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto max-h-screen">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">
            {mode === 'add' ? 'Agregar Proveedor' : 'Editar Proveedor'}
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={providerData.name}
                onChange={handleChange}
                placeholder="Nombre del proveedor"
              />
            </div>
            
            <div>
              <Label htmlFor="product">Producto</Label>
              <Input
                id="product"
                name="product"
                value={providerData.product}
                onChange={handleChange}
                placeholder="Producto que provee"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={providerData.phone}
                onChange={handleChange}
                placeholder="Número de teléfono"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={providerData.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            {mode === 'edit' ? (
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Eliminar
              </Button>
            ) : (
              <div></div>
            )}
            
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handleSubmit}
              >
                {mode === 'add' ? 'Agregar Proveedor' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};