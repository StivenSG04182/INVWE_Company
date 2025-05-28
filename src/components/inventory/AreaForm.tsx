'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSubAccountsForAgency, createArea } from '@/lib/queries2';

interface AreaFormProps {
  agencyId: string;
  area?: {
    _id?: string;
    name: string;
    description?: string;
    subaccountId?: string;
  };
  isEditing?: boolean;
}

export default function AreaForm({ agencyId, area, isEditing = false }: AreaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subaccounts, setSubaccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: area?.name || '',
    description: area?.description || '',
    subaccountId: area?.subaccountId || '',
  });

  // Cargar subcuentas al montar el componente
  useEffect(() => {
    const fetchSubaccounts = async () => {
      try {
        // Llama directamente a la función del servidor para obtener subcuentas
        const subaccountsData = await getSubAccountsForAgency(agencyId);
        setSubaccounts(subaccountsData || []);
      } catch (error: any) {
        console.error('Error al cargar subcuentas:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar las subcuentas. Inténtalo de nuevo.',
        });
      }
    };

    fetchSubaccounts();
  }, [agencyId, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar que se haya seleccionado una subcuenta
    if (!formData.subaccountId) {
      toast({
        variant: 'destructive',
        title: 'Subcuenta requerida',
        description: 'Por favor selecciona una subcuenta para continuar.',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Llama directamente a la función del servidor para crear el área
      const areaCreated = await createArea({ ...formData, agencyId });
      toast({
        title: 'Área creada',
        description: `El área ${formData.name} ha sido creada exitosamente.`,
      });
      router.refresh();
      router.push(`/agency/${agencyId}/areas`);
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

          <div className="space-y-2">
            <Label htmlFor="subaccountId">Subcuenta *</Label>
            <Select
              value={formData.subaccountId}
              onValueChange={(value) => handleSelectChange('subaccountId', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar subcuenta" />
              </SelectTrigger>
              <SelectContent>
                {subaccounts.length > 0 ? (
                  subaccounts.map((subaccount) => (
                    <SelectItem key={subaccount.id} value={subaccount.id}>
                      {subaccount.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-subaccounts" disabled>
                    No hay subcuentas disponibles. Por favor, crea una subcuenta primero.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {subaccounts.length === 0 && (
              <p className="text-sm text-destructive mt-1">
                No hay subcuentas disponibles. Debes crear una subcuenta antes de continuar.
              </p>
            )}
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