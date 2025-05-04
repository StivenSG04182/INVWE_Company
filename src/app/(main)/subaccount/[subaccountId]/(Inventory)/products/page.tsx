import BlurPage from '@/components/global/blur-page'
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/db'

type Props = {
  params: { subaccountId: string }
}

const ProductsPage = async ({ params }: Props) => {
  // En un sistema real, aquí se obtendrían los productos de la base de datos
  // Por ahora, usaremos datos de ejemplo
  const exampleProducts = [
    {
      id: '1',
      name: 'Producto Ejemplo 1',
      sku: 'SKU001',
      price: 19.99,
      stock: 25,
      category: 'Categoría A',
    },
    {
      id: '2',
      name: 'Producto Ejemplo 2',
      sku: 'SKU002',
      price: 29.99,
      stock: 15,
      category: 'Categoría B',
    },
    {
      id: '3',
      name: 'Producto Ejemplo 3',
      sku: 'SKU003',
      price: 39.99,
      stock: 10,
      category: 'Categoría A',
    },
  ]

  return (
    <BlurPage>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Gestión de Productos</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
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
                  {exampleProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4">{product.sku}</td>
                      <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                      <td className="py-3 px-4">{product.stock}</td>
                      <td className="py-3 px-4">{product.category}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Editar</Button>
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
                  <p className="text-2xl font-bold">{exampleProducts.length}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm font-medium text-muted-foreground">Valor del Inventario</p>
                  <p className="text-2xl font-bold">
                    ${exampleProducts.reduce((acc, product) => acc + (product.price * product.stock), 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm font-medium text-muted-foreground">Productos con Bajo Stock</p>
                  <p className="text-2xl font-bold">
                    {exampleProducts.filter(product => product.stock < 15).length}
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