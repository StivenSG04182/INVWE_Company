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
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [subaccounts, setSubaccounts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    type,
    productId: productId || '',
    areaId: '',
    quantity: '',
    providerId: '',
    notes: '',
    subaccountId: '',
  });

  // Cargar productos, áreas, proveedores y subcuentas al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar productos
        const productsResponse = await fetch(`/api/inventory/${agencyId}?type=products`, {
          credentials: 'include',
        });
        const productsData = await productsResponse.json();
        if (productsData.success) {
          setProducts(productsData.data || []);
          
          // Si hay un productId preseleccionado, buscar sus detalles
          if (productId) {
            const selectedProd = productsData.data?.find((p: any) => p.id === productId || p._id === productId);
            if (selectedProd) {
              setSelectedProduct(selectedProd);
            }
          }
        }

        // Cargar áreas
        const areasResponse = await fetch(`/api/inventory/${agencyId}?type=areas`, {
          credentials: 'include',
        });
        const areasData = await areasResponse.json();
        if (areasData.success) {
          setAreas(areasData.data || []);
        }

        // Cargar proveedores (solo para entradas)
        if (type === 'entrada') {
          const providersResponse = await fetch(`/api/inventory/${agencyId}?type=providers`, {
            credentials: 'include',
          });
          const providersData = await providersResponse.json();
          if (providersData.success) {
            setProviders(providersData.data || []);
          }
        }

        // Cargar subcuentas
        const subaccountsResponse = await fetch(`/api/agency/${agencyId}/subaccounts`, {
          credentials: 'include',
        });
        const subaccountsData = await subaccountsResponse.json();
        if (subaccountsData.success) {
          setSubaccounts(subaccountsData.data || []);
        } else {
          console.error('Error al cargar subcuentas:', subaccountsData.error);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudieron cargar los datos necesarios. Inténtalo de nuevo.',
        });
      }
    };

    fetchData();
  }, [agencyId, type, productId, toast]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) || '' : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Si se selecciona un producto, actualizar el estado selectedProduct
    if (name === 'productId') {
      const product = products.find((p) => p.id === value || p._id === value);
      setSelectedProduct(product || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar que se hayan seleccionado producto, área y subcuenta
    if (!formData.productId || !formData.areaId || !formData.subaccountId) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Por favor selecciona un producto, un área y una subcuenta para continuar.',
      });
      setIsLoading(false);
      return;
    }

    // Validar que la cantidad sea un número positivo
    const quantity = Number(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        variant: 'destructive',
        title: 'Cantidad inválida',
        description: 'Por favor ingresa una cantidad válida mayor a cero.',
      });
      setIsLoading(false);
      return;
    }

    // Para salidas, verificar que haya suficiente stock
    if (type === 'salida' && selectedProduct) {
      const areaStock = selectedProduct.stocks?.find((s: any) => s.areaId === formData.areaId);
      const stockQuantity = areaStock ? areaStock.quantity : 0;
      
      if (quantity > stockQuantity) {
        toast({
          variant: 'destructive',
          title: 'Stock insuficiente',
          description: `Solo hay ${stockQuantity} unidades disponibles en esta área.`,
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      const endpoint = `/api/inventory/${agencyId}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'movement',
          data: { ...formData, agencyId },
        }),
        credentials: 'include', // Incluir cookies y credenciales de autenticación
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

  // Verificar si hay stock disponible para el producto seleccionado en el área seleccionada
  const getStockInfo = () => {
    if (!selectedProduct || !formData.areaId || type !== 'salida') return null;
    
    const areaStock = selectedProduct.stocks?.find((s: any) => s.areaId === formData.areaId);
    const stockQuantity = areaStock ? areaStock.quantity : 0;
    
    return {
      available: stockQuantity,
      isLow: stockQuantity < (selectedProduct.minStock || 5)
    };
  };
  
  const stockInfo = getStockInfo();

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
            <Label htmlFor="productId">Producto *</Label>
            <Select
              value={formData.productId}
              onValueChange={(value) => handleSelectChange('productId', value)}
              required
              disabled={!!productId} // Deshabilitar si ya viene preseleccionado
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.length > 0 ? (
                  products.map((product) => (
                    <SelectItem key={product.id || product._id} value={product.id || product._id}>
                      {product.name} {product.sku ? `(${product.sku})` : ''}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-products" disabled>
                    No hay productos disponibles. Por favor, crea un producto primero.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="areaId">Área *</Label>
            <Select
              value={formData.areaId}
              onValueChange={(value) => handleSelectChange('areaId', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areas.length > 0 ? (
                  areas.map((area) => (
                    <SelectItem key={area.id || area._id} value={area.id || area._id}>
                      {area.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-areas" disabled>
                    No hay áreas disponibles. Por favor, crea un área primero.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {type === 'salida' && stockInfo && (
            <Alert variant={stockInfo.isLow ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Stock disponible en esta área: <strong>{stockInfo.available}</strong> unidades
              </AlertDescription>
            </Alert>
          )}

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
                  <SelectItem value="">Sin proveedor</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id || provider._id} value={provider.id || provider._id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Observaciones o detalles adicionales"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}