'use client'

import { useState, useMemo, useEffect } from 'react'
import { Funnel, Product, ProductCategory } from '@prisma/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  getAuthUserDetails,
  getProducts,
  getCategories,
} from '@/lib/queries2'

interface FunnelProductsTableProps {
  defaultData: Funnel
}

export default function FunnelProductsTable({
  defaultData,
}: FunnelProductsTableProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    JSON.parse(defaultData.liveProducts || '[]')
  )

  const [products, setProducts] = useState<
    Array<Product & { Category: ProductCategory | null }>
  >([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Obtener productos y categorías al montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = await getAuthUserDetails()
        const fetchedProducts = await getProducts(defaultData.id, auth.agencyId)
        const fetchedCategories = await getCategories(auth.agencyId)

        setProducts(fetchedProducts)
        setCategories(fetchedCategories)
      } catch (err) {
        console.error('Error al cargar productos o categorías', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [defaultData.id])

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchMatch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())

      const categoryMatch =
        categoryFilter === 'all' || product.categoryId === categoryFilter

      const priceMatch =
        (!priceRange.min || Number(product.price) >= Number(priceRange.min)) &&
        (!priceRange.max || Number(product.price) <= Number(priceRange.max))

      return searchMatch && categoryMatch && priceMatch
    })
  }, [products, search, categoryFilter, priceRange])

  // Manejar selección de productos
  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSelection = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]

      // TODO: Actualizar en la base de datos
      return newSelection
    })
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <p>Cargando productos...</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center p-4">
        <p>No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Total productos: {products.length} | Filtrados: {filteredProducts.length}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-1/3"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 items-center md:w-1/3">
          <Input
            placeholder="Precio min"
            type="number"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, min: e.target.value }))
            }
          />
          <span>-</span>
          <Input
            placeholder="Precio max"
            type="number"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, max: e.target.value }))
            }
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={false} />
            </TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={() => handleProductSelect(product.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {product.description}
                  </span>
                </div>
              </TableCell>
              <TableCell>{product.Category?.name || 'Sin categoría'}</TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell>${Number(product.price).toFixed(2)}</TableCell>
              <TableCell>{product.quantity || 0}</TableCell>
              <TableCell>
                <Badge variant={product.active ? 'default' : 'secondary'}>
                  {product.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
