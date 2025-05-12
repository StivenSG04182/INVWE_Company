import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { ProductService, CategoryService } from "@/lib/services/inventory-service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Tag,
  Layers,
  ShoppingBag,
  Edit,
  BarChart3,
  Download,
  Upload,
  MoreHorizontal,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilteredProducts } from "@/components/inventory/filtered-products"

const ProductsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Obtener productos de MongoDB
  let products = []
  let categories = []
  try {
    // Importar el serializador para convertir objetos MongoDB a objetos planos
    const { serializeMongoArray } = await import('@/lib/serializers')
    
    // Obtener y serializar productos y categorías
    const rawProducts = await ProductService.getProducts(agencyId)
    const rawCategories = await CategoryService.getCategories(agencyId)
    
    // Serializar para eliminar métodos y propiedades no serializables
    products = serializeMongoArray(rawProducts)
    categories = serializeMongoArray(rawCategories)
  } catch (error) {
    console.error("Error al cargar datos:", error)
  }

  // Obtener subcuentas de la agencia
  const subAccounts = user.Agency.SubAccount || []

  // Calcular estadísticas
  const totalProducts = products.length
  const activeProducts = products.length
  const totalCategories = categories.length

  // Calcular valor total del inventario
  const inventoryValue = products.reduce((total: number, product: any) => {
    return total + (product.price || 0)
  }, 0)

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          <p className="text-muted-foreground">Administra tu catálogo de productos e inventario</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Layers className="h-4 w-4 mr-2" />
                Stock bajo
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Más vendidos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Ordenar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Nombre (A-Z)</DropdownMenuItem>
              <DropdownMenuItem>Nombre (Z-A)</DropdownMenuItem>
              <DropdownMenuItem>Precio (menor a mayor)</DropdownMenuItem>
              <DropdownMenuItem>Precio (mayor a menor)</DropdownMenuItem>
              <DropdownMenuItem>Stock (menor a mayor)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Importar productos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Exportar productos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver reportes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-2">
            <Link href={`/agency/${agencyId}/products/bulk`}>
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Carga Masiva
              </Button>
            </Link>
            <Link href={`/agency/${agencyId}/products/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Productos</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorías</p>
                <p className="text-2xl font-bold">{totalCategories}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Tag className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productos Activos</p>
                <p className="text-2xl font-bold">{activeProducts}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Inventario</p>
                <p className="text-2xl font-bold">${inventoryValue.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Componente de productos filtrados */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium mb-2">No hay productos registrados</h3>
            <p className="text-muted-foreground text-center mb-6">
              Comience creando su primer producto para gestionar su inventario.
            </p>
            <Link href={`/agency/${agencyId}/products/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <FilteredProducts 
          agencyId={agencyId}
          products={products}
          categories={categories}
          subAccounts={subAccounts}
        />
      )}
    </div>
  )
}

export default ProductsPage
