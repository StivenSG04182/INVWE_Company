import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { StockService, ProductService, AreaService } from "@/lib/services/inventory-service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Download,
  FileText,
  DollarSign,
  AlertTriangle,
  Layers,
  Plus,
  Minus,
  Eye,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

const StockPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Obtener datos de stock, productos y áreas de MongoDB
  let stocks = []
  let products = []
  let areas = []
  let totalItems = 0
  let totalValue = 0
  let lowStockItems = 0

  try {
    // Obtener stock
    stocks = await StockService.getStocks(agencyId)

    // Obtener productos y áreas para mostrar nombres
    products = await ProductService.getProducts(agencyId)
    areas = await AreaService.getAreas(agencyId)

    // Calcular estadísticas
    totalItems = stocks.reduce((sum: number, item: any) => sum + item.quantity, 0)

    // Calcular valor total del inventario
    const productsMap = new Map(products.map((p: any) => [p._id.toString(), p]))
    totalValue = stocks.reduce((sum: number, item: any) => {
      const product = productsMap.get(item.productId)
      return sum + (product ? product.price * item.quantity : 0)
    }, 0)

    // Contar productos bajo mínimo
    lowStockItems = stocks.filter((item: any) => {
      const product = productsMap.get(item.productId)
      return product && product.minStock && item.quantity <= product.minStock
    }).length
  } catch (error) {
    console.error("Error al cargar datos de inventario:", error)
  }

  // Crear mapas para buscar nombres de productos y áreas
  const productsMap = new Map(products.map((p: any) => [p._id.toString(), p]))
  const areasMap = new Map(areas.map((a: any) => [a._id.toString(), a]))

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Stock</h1>
          <p className="text-muted-foreground">Visualice y gestione el stock disponible de todos sus productos</p>
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
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Bajo mínimo
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Badge variant="outline" className="mr-2">
                  Sin stock
                </Badge>
                Sin existencias
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
              <DropdownMenuItem>Cantidad (menor a mayor)</DropdownMenuItem>
              <DropdownMenuItem>Cantidad (mayor a menor)</DropdownMenuItem>
              <DropdownMenuItem>Valor (menor a mayor)</DropdownMenuItem>
              <DropdownMenuItem>Valor (mayor a menor)</DropdownMenuItem>
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
                <Download className="h-4 w-4 mr-2" />
                Exportar a Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Generar reporte
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Registrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/agency/${agencyId}/movements/entrada`}>
                <DropdownMenuItem>
                  <ArrowDownToLine className="h-4 w-4 mr-2 text-green-500" />
                  Registrar Entrada
                </DropdownMenuItem>
              </Link>
              <Link href={`/agency/${agencyId}/movements/salida`}>
                <DropdownMenuItem>
                  <ArrowUpFromLine className="h-4 w-4 mr-2 text-red-500" />
                  Registrar Salida
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total en Inventario</p>
                <p className="text-2xl font-bold">{totalItems} unidades</p>
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
                <p className="text-sm font-medium text-muted-foreground">Valor del Inventario</p>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Productos Bajo Mínimo</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por producto o ubicación..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas las ubicaciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {areas.map((area: any) => (
                <SelectItem key={area._id} value={area._id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado de stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="low">Bajo mínimo</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="zero">Sin existencias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="table">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                  <path d="M9 3v18" />
                  <path d="M15 3v18" />
                </svg>
                Tabla
              </div>
            </TabsTrigger>
            <TabsTrigger value="cards">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
                Tarjetas
              </div>
            </TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">Mostrando {stocks.length} registros</div>
        </div>

        <TabsContent value="table" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {stocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10">
                  <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No hay registros de stock disponibles</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Agregue productos al inventario para comenzar a gestionar su stock.
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/agency/${agencyId}/movements/entrada`}>
                      <Button>
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        Registrar Entrada
                      </Button>
                    </Link>
                    <Link href={`/agency/${agencyId}/products/new`}>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Producto
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Imagen</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks.map((stock: any) => {
                      const product = productsMap.get(stock.productId)
                      const area = areasMap.get(stock.areaId)
                      const isLowStock = product && product.minStock && stock.quantity <= product.minStock

                      return (
                        <TableRow key={stock._id}>
                          <TableCell>
                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted/30">
                              {product && product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0] || "/placeholder.svg"}
                                  alt={product?.name || "Producto"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Package className="h-6 w-6 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{product ? product.name : "Producto desconocido"}</div>
                            <div className="text-xs text-muted-foreground">{product ? product.sku : "—"}</div>
                          </TableCell>
                          <TableCell>{area ? area.name : "Área desconocida"}</TableCell>
                          <TableCell className="text-center font-medium">
                            {stock.quantity}
                            {product && product.minStock && (
                              <div className="flex items-center justify-center mt-1">
                                <div className="w-16 bg-muted rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${isLowStock ? "bg-red-500" : "bg-green-500"}`}
                                    style={{
                                      width: `${Math.min(100, (stock.quantity / product.minStock) * 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            ${product ? (product.price * stock.quantity).toFixed(2) : "0.00"}
                          </TableCell>
                          <TableCell>
                            {isLowStock ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Bajo mínimo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Layers className="h-4 w-4 mr-2" />
                                    Acciones
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <Link
                                    href={`/agency/${agencyId}/movements/entrada?productId=${stock.productId}&areaId=${stock.areaId}`}
                                  >
                                    <DropdownMenuItem>
                                      <Plus className="h-4 w-4 mr-2 text-green-500" />
                                      Registrar Entrada
                                    </DropdownMenuItem>
                                  </Link>
                                  <Link
                                    href={`/agency/${agencyId}/movements/salida?productId=${stock.productId}&areaId=${stock.areaId}`}
                                  >
                                    <DropdownMenuItem>
                                      <Minus className="h-4 w-4 mr-2 text-red-500" />
                                      Registrar Salida
                                    </DropdownMenuItem>
                                  </Link>
                                  <DropdownMenuSeparator />
                                  <Link href={`/agency/${agencyId}/products/${stock.productId}`}>
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Ver Producto
                                    </DropdownMenuItem>
                                  </Link>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="mt-0">
          {stocks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-10">
                <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium mb-2">No hay registros de stock disponibles</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Agregue productos al inventario para comenzar a gestionar su stock.
                </p>
                <div className="flex gap-2">
                  <Link href={`/agency/${agencyId}/movements/entrada`}>
                    <Button>
                      <ArrowDownToLine className="h-4 w-4 mr-2" />
                      Registrar Entrada
                    </Button>
                  </Link>
                  <Link href={`/agency/${agencyId}/products/new`}>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Producto
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stocks.map((stock: any) => {
                const product = productsMap.get(stock.productId)
                const area = areasMap.get(stock.areaId)
                const isLowStock = product && product.minStock && stock.quantity <= product.minStock

                return (
                  <Card key={stock._id} className="overflow-hidden">
                    <div className="relative aspect-square bg-muted/30">
                      {product && product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product?.name || "Producto"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                        <div className="text-white font-medium truncate">
                          {product ? product.name : "Producto desconocido"}
                        </div>
                        <div className="text-xs text-white/70 truncate">{product ? product.sku : "—"}</div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline">
                          <Layers className="h-3 w-3 mr-1" />
                          {area ? area.name : "Área desconocida"}
                        </Badge>
                        <div className="text-lg font-bold">
                          {stock.quantity} <span className="text-sm font-normal">unidades</span>
                        </div>
                      </div>

                      {product && product.minStock && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Stock mínimo: {product.minStock}</span>
                            <span>{Math.round((stock.quantity / product.minStock) * 100)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${isLowStock ? "bg-red-500" : "bg-green-500"}`}
                              style={{
                                width: `${Math.min(100, (stock.quantity / product.minStock) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Valor:{" "}
                          <span className="font-medium">
                            ${product ? (product.price * stock.quantity).toFixed(2) : "0.00"}
                          </span>
                        </div>
                        {isLowStock ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Bajo mínimo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Normal
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-1 mt-4">
                        <Link
                          href={`/agency/${agencyId}/movements/entrada?productId=${stock.productId}&areaId=${stock.areaId}`}
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <Plus className="h-4 w-4 mr-1" />
                            Entrada
                          </Button>
                        </Link>
                        <Link
                          href={`/agency/${agencyId}/movements/salida?productId=${stock.productId}&areaId=${stock.areaId}`}
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full">
                            <Minus className="h-4 w-4 mr-1" />
                            Salida
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StockPage
