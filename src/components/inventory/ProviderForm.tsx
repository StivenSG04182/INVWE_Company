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
import { createProvider, updateProvider } from '@/lib/queries2';

interface ProviderFormProps {
  agencyId: string;
  provider?: {
    _id?: string;
    id?: string;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
    subaccountId?: string;
    subAccountId?: string;
  };
  isEditing?: boolean;
}

export default function ProviderForm({ agencyId, provider, isEditing = false }: ProviderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subaccounts, setSubaccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: provider?.name || '',
    contactName: provider?.contactName || '',
    email: provider?.email || '',
    phone: provider?.phone || '',
    address: provider?.address || '',
    subaccountId: provider?.subaccountId || provider?.subAccountId || '',
  });

  // Cargar subcuentas al montar el componente
   useEffect(() => {
      async function fetchSubaccounts() {
        try {
          const { getSubAccountsForAgency } = await import("@/lib/queries2");
          const result = await getSubAccountsForAgency(agencyId);
          setSubaccounts(result || []);
        } catch (error) {
          setSubaccounts([]);
        }
      }
      if (agencyId) fetchSubaccounts();
    }, [agencyId]);
  

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
      // Preparar datos para enviar
      const providerData = {
        ...formData,
        agencyId,
        active: true,
      };

      let result;
      
      if (isEditing && provider) {
        // Usar el ID correcto del proveedor (puede estar en _id o id)
        const providerId = provider._id || provider.id;
        if (!providerId) {
          throw new Error('ID de proveedor no encontrado');
        }
        
        result = await updateProvider(providerId, providerData);
      } else {
        result = await createProvider(providerData);
      }

      if (result) {
        toast({
          title: isEditing ? 'Proveedor actualizado' : 'Proveedor creado',
          description: `El proveedor ${formData.name} ha sido ${isEditing ? 'actualizado' : 'creado'} exitosamente.`,
        });
        router.refresh();
        router.push(`/agency/${agencyId}/providers`);
      } else {
        throw new Error('Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error al guardar el proveedor:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Hubo un problema al guardar el proveedor. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proveedor *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
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

          <div className="space-y-2">
            <Label htmlFor="contactName">Persona de Contacto</Label>
            <Input
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
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
