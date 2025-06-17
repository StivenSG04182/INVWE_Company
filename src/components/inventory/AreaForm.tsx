'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSubAccountsForAgency, createArea } from '@/lib/queries2';

interface AreaFormProps {
  agencyId: string;
  isOpen: boolean;
  onClose: () => void;
  area?: {
    _id?: string;
    name: string;
    description?: string;
    subaccountId?: string;
  };
  isEditing?: boolean;
}

export default function AreaForm({ agencyId, isOpen, onClose, area, isEditing = false }: AreaFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subaccounts, setSubaccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: area?.name || '',
    description: area?.description || '',
    subaccountId: area?.subaccountId || '',
  });

  // Cargar tiendas al montar el componente
  useEffect(() => {
    const fetchSubaccounts = async () => {
      try {
        const subaccountsData = await getSubAccountsForAgency(agencyId);
        setSubaccounts(subaccountsData || []);
      } catch (error: any) {
        console.error('Error al cargar tiendas:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar las tiendas. Inténtalo de nuevo.',
        });
      }
    };

    if (isOpen) {
      fetchSubaccounts();
    }
  }, [agencyId, toast, isOpen]);

  // Reset form when opening modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: area?.name || '',
        description: area?.description || '',
        subaccountId: area?.subaccountId || '',
      });
    }
  }, [isOpen, area]);

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

    if (!formData.subaccountId) {
      toast({
        variant: 'destructive',
        title: 'Tienda requerida',
        description: 'Por favor selecciona una tienda para continuar.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const areaCreated = await createArea({ ...formData, agencyId });
      toast({
        title: isEditing ? 'Área actualizada' : 'Área creada',
        description: `El área ${formData.name} ha sido ${isEditing ? 'actualizada' : 'creada'} exitosamente.`,
      });
      router.refresh();
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Área' : 'Nueva Área'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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
              <Label htmlFor="subaccountId">Tienda *</Label>
              <Select
                value={formData.subaccountId}
                onValueChange={(value) => handleSelectChange('subaccountId', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tienda" />
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
                      No hay tiendas disponibles. Por favor, crea una tienda primero.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {subaccounts.length === 0 && (
                <p className="text-sm text-destructive mt-1">
                  No hay tiendas disponibles. Debes crear una tienda antes de continuar.
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}