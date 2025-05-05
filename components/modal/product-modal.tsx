'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Product {
  id?: number;
  name: string;
  type: string;
  stock: number;
  price: number;
  description: string;
  imagen?: File | string | null;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Product) => void;
  onDelete?: () => void;
  initialData?: Product;
  mode?: 'add' | 'edit';
  categories: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete,
  initialData,
  mode = 'add',
  categories = []
}) => {
  const [productData, setProductData] = useState<Product>({
    name: '',
    type: '',
    stock: 0,
    price: 0,
    description: '',
    imagen: null
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setProductData(initialData);
      if (typeof initialData.imagen === 'string') {
        setPreviewImage(initialData.imagen);
      }
    } else {
      setProductData({
        name: '',
        type: '',
        stock: 0,
        price: 0,
        description: '',
        imagen: null
      });
      setPreviewImage(null);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({ 
      ...prev, 
      [name]: name === 'stock' || name === 'price' ? Number(value) : value 
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductData(prev => ({ ...prev, imagen: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setProductData(prev => ({ ...prev, imagen: null }));
    setPreviewImage(null);
  };

  const handleSubmit = () => {
    if (!productData.name.trim()) {
      alert('El nombre del producto es obligatorio');
      return;
    }
    if (productData.price <= 0) {
      alert('El precio debe ser mayor que 0');
      return;
    }
    if (productData.stock < 0) {
      alert('El stock no puede ser negativo');
      return;
    }
    
    onSubmit(productData);
  };

  const handleDelete = () => {
    if (mode === 'edit' && confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      onDelete?.();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto max-h-screen">
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div 
              className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer relative"
              onClick={triggerFileInput}
            >
              {previewImage ? (
                <>
                  <img 
                    src={previewImage} 
                    alt="Preview del producto" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 hover:opacity-100">Cambiar imagen</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 mt-2">Haz clic para agregar una imagen</p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {previewImage && (
            <Button
              variant="ghost"
              onClick={removeImage}
              className="mb-4 text-sm text-red-600 hover:text-red-800"
            >
              Eliminar imagen
            </Button>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={productData.name}
                onChange={handleChange}
                placeholder="Nombre del producto"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={productData.description}
                onChange={handleChange}
                placeholder="Descripción"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio Total</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={productData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={productData.stock}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                name="type"
                value={productData.type}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccione un tipo</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
                {mode === 'add' ? 'Añadir producto' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};