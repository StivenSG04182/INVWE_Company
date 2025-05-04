'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AreaFormProps {
  agencyId: string;
  area?: {
    _id?: string;
    name: string;
    description?: string;
  };
  isEditing?: boolean;
}

export default function AreaForm({ agencyId, area, isEditing = false }: AreaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: area?.name || '',
    description: area?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = `/api/inventory/${agencyId}`;
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing
        ? { type: 'area', id: area?._id, data: formData }
        : { type: 'area', data: formData };

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
          title: isEditing ? 'Área actualizada' : 'Área creada',
          description: `El área ${formData.name} ha sido ${isEditing ? 'actualizada' : 'creada'} exitosamente.`,
        });
        router.refresh();
        router.push(`/agency/${agencyId}/areas`);
      } else {
        throw new Error(result.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error al guardar el área:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Hubo un problema al guardar el área. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Área' : 'Nueva Área'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Área *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descripción o detalles adicionales sobre esta área"
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