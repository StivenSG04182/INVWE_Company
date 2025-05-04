import React from 'react';
import { getAuthUserDetails } from '@/lib/queries';
import { redirect } from 'next/navigation';
import { ProductService } from '@/lib/services/inventory-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const ProductsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails();
  if (!user) return redirect('/sign-in');

  const agencyId = params.agencyId;
  if (!user.Agency) {
    return redirect('/agency');
  }
  
  // Obtener productos de MongoDB
  let products = [];
  try {
    products = await ProductService.getProducts(agencyId);
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <Link href={`/agency/${agencyId}/products/new`}>
          <Button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80">
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Catálogo de Productos</h2>
          <p className="text-muted-foreground">
            Administre su inventario de productos, categorías y precios desde este panel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Total de Productos</h3>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Categorías</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="bg-background p-4 rounded-md border">
            <h3 className="font-medium">Productos Activos</h3>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
        </div>

        <div className="mt-8 border rounded-md">
          {products.length === 0 ? (
            <div className="p-4 border-b bg-muted/40">
              <p className="text-center text-muted-foreground">
                No hay productos registrados. Comience creando su primer producto.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left">Imagen</th>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">SKU</th>
                    <th className="px-4 py-2 text-left">Precio</th>
                    <th className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product._id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-2">
                        {product.images && product.images.length > 0 ? (
                          <div className="relative w-12 h-12">
                            <Image 
                              src={product.images[0]} 
                              alt={product.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Sin imagen</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">{product.sku}</td>
                      <td className="px-4 py-2">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <Link href={`/agency/${agencyId}/products/${product._id}`}>
                            <Button variant="outline" size="sm">Editar</Button>
                          </Link>
                          <Link href={`/agency/${agencyId}/products/${product._id}/stock`}>
                            <Button variant="outline" size="sm">Stock</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;