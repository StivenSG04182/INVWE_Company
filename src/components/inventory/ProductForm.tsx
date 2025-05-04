'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadButton } from '@/lib/uploadthing';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
  agencyId: string;
  product?: {
    _id?: string;
    name: string;
    description?: string;
    sku: string;
    barcode?: string;
    price: number;
    cost?: number;
    minStock?: number;
    images?: string[];
  };
  isEditing?: boolean;
}

export default function ProductForm({ agencyId, product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    price: product?.price || 0,
    cost: product?.cost || 0,
    minStock: product?.minStock || 0,
    images: product?.images || [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'cost' || name === 'minStock' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = `/api/inventory/${agencyId}`;
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing
        ? { type: 'product', id: product?._id, data: formData }
        : { type: 'product', data: formData };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: isEditing ? 'Producto actualizado' : 'Producto creado',
          description: `El producto ${formData.name} ha sido ${isEditing ? 'actualizado' : 'creado'} exitosamente.`,
        });
        router.refresh();
        router.push(`/agency/${agencyId}/products`);
      } else {
        throw new Error(result.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Hubo un problema al guardar el producto. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio de Venta *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imágenes del Producto</Label>
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative w-24 h-24">
                  <Image
                    src={image}
                    alt={`Producto ${index + 1}`}
                    fill
                    className="object-cover rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }));
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="relative">
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-md">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Cargando imagen...</span>
                </div>
              )}
              <UploadButton
                endpoint="media"
                onUploadBegin={() => {
                  setIsUploading(true);
                }}
                onClientUploadComplete={(res) => {
                  setIsUploading(false);
                  if (res && res.length > 0) {
                    setFormData((prev) => ({
                      ...prev,
                      images: [...prev.images, ...res.map((file) => file.url)],
                    }));
                    toast({
                      title: 'Imagen subida',
                      description: 'La imagen se ha subido correctamente.',
                    });
                  }
                }}
                onUploadError={(error: Error) => {
                  setIsUploading(false);
                  console.error('Error de carga:', error);
                  toast({
                    variant: 'destructive',
                    title: 'Error al subir imagen',
                    description: error.message,
                  });
              }}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}