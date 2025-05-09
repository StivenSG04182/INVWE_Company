import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Search, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProductService } from '@/lib/services/inventory-service'
import Link from 'next/link'

type Props = {
  params: { subaccountId: string }
}

const ProductsPage = async ({ params }: Props) => {
  const subaccountId = params.subaccountId;
  
  // Obtener productos de la subaccount específica
  let products = [];
  try {
    products = await ProductService.getProductsBySubaccount(subaccountId);
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Gestión de Productos</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/subaccount/${subaccountId}/products/bulk`}>
                <Upload className="mr-2 h-4 w-4" />
                Carga Masiva
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/subaccount/${subaccountId}/products/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Link>
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Administra tu catálogo de productos, precios y existencias
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              className="pl-8"
            />
          </div>
          <Button variant="outline">Filtrar</Button>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Catálogo de Productos</CardTitle>
            <CardDescription>
              Lista de todos los productos disponibles en tu inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nombre</th>
                    <th className="text-left py-3 px-4">SKU</th>
                    <th className="text-left py-3 px-4">Precio</th>
                    <th className="text-left py-3 px-4">Stock</th>
                    <th className="text-left py-3 px-4">Categoría</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id?.toString()} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4">{product.sku}</td>
                      <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                      <td className="py-3 px-4">{product.minStock || 'N/A'}</td>
                      <td className="py-3 px-4">Sin categoría</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/subaccount/${subaccountId}/products/edit/${product._id}`}>
                              Editar
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Inventario</CardTitle>
              <CardDescription>Estado general del inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md">
                  <p className="text-sm font-medium text-muted-foreground">Total de Productos</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm font-medium text-muted-foreground">Valor del Inventario</p>
                  <p className="text-2xl font-bold">
                    ${products.reduce((acc, product) => acc + (product.price * (product.minStock || 0)), 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm font-medium text-muted-foreground">Productos con Bajo Stock</p>
                  <p className="text-2xl font-bold">
                    {products.filter(product => product.minStock && product.minStock < 15).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  )
}

export default ProductsPage