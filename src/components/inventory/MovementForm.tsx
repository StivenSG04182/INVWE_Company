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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { getProducts, getAreas, getProviders, getSubAccounts } = await import('@/lib/queries2');
        
        const productsData = await getProducts(agencyId);
        setProducts(productsData || []);
        
        if (productId && productsData) {
          const selectedProd = productsData.find((p: any) => p.id === productId || p._id === productId);
          if (selectedProd) {
            setSelectedProduct(selectedProd);
          }
        }

        const areasData = await getAreas(agencyId);
        setAreas(areasData || []);

        if (type === 'entrada') {
          const providersData = await getProviders(agencyId);
          setProviders(providersData || []);
        }

        const subaccountsData = await getSubAccounts(agencyId);
        setSubaccounts(subaccountsData || []);
        
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
    
    if (name === 'productId') {
      const product = products.find((p) => p.id === value || p._id === value);
      setSelectedProduct(product || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.productId || !formData.areaId || !formData.subaccountId) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Por favor selecciona un producto, un área y una tienda para continuar.',
      });
      setIsLoading(false);
      return;
    }

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
      const { createMovement } = await import('@/lib/queries2');
      
      const movementData = {
        type: formData.type,
        productId: formData.productId,
        areaId: formData.areaId,
        quantity: Number(formData.quantity),
        providerId: formData.providerId || undefined,
        notes: formData.notes,
        date: new Date(),
        agencyId: agencyId,
        subaccountId: formData.subaccountId
      };
      
      const result = await createMovement(movementData);
      
      if (result) {
        toast({
          title: 'Movimiento registrado',
          description: `Se ha registrado correctamente la ${type} de productos.`,
        });
        router.refresh();
        router.push(`/agency/${agencyId}/movements`);
      }
    } catch (error: any) {
      console.error('Error al registrar movimiento:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Hubo un problema al registrar el movimiento. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

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