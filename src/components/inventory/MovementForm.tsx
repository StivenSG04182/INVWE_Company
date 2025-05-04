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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MovementFormProps {
  agencyId: string;
  type: 'entrada' | 'salida';
  productId?: string;
}

export default function MovementForm({ agencyId, type, productId }: MovementFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    type,
    productId: productId || '',
    areaId: '',
    quantity: 1,
    providerId: '',
    notes: '',
  });

  // Cargar datos necesarios
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar productos
        const productsRes = await fetch(`/api/inventory/${agencyId}?type=products`);
        const productsData = await productsRes.json();
        if (productsData.success) {
          setProducts(productsData.data);
        }

        // Cargar áreas
        const areasRes = await fetch(`/api/inventory/${agencyId}?type=areas`);
        const areasData = await areasRes.json();
        if (areasData.success) {
          setAreas(areasData.data);
        }

        // Cargar proveedores (solo para entradas)
        if (type === 'entrada') {
          const providersRes = await fetch(`/api/inventory/${agencyId}?type=providers`);
          const providersData = await providersRes.json();
          if (providersData.success) {
            setProviders(providersData.data);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los datos necesarios.',
        });
      }
    };

    fetchData();
  }, [agencyId, type, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) : value,
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

    try {
      const endpoint = `/api/inventory/${agencyId}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'movement',
          data: formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Movimiento registrado',
          description: `Se ha registrado correctamente la ${type} de productos.`,
        });
        router.refresh();
        router.push(`/agency/${agencyId}/movements`);
      } else {
        throw new Error(result.error || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Hubo un problema al registrar el movimiento. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {type === 'entrada' ? 'Registrar Entrada de Productos' : 'Registrar Salida de Productos'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productId">Producto *</Label>
            <Select
              value={formData.productId}
              onValueChange={(value) => handleSelectChange('productId', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name} - {product.sku}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="areaId">Área/Ubicación *</Label>
            <Select
              value={formData.areaId}
              onValueChange={(value) => handleSelectChange('areaId', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area._id} value={area._id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          {type === 'entrada' && (
            <div className="space-y-2">
              <Label htmlFor="providerId">Proveedor</Label>
              <Select
                value={formData.providerId}
                onValueChange={(value) => handleSelectChange('providerId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider._id} value={provider._id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Información adicional sobre este movimiento"
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
            {isLoading ? 'Guardando...' : 'Registrar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}