import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import { getAreas } from "@/lib/queries2"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Grid3X3, Plus, Search, Filter, Edit, Package, LayoutGrid, ArrowUpDown, Pencil, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AreasPage = async ({ params }: { params: { subaccountId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const subaccountId = params.subaccountId
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Obtener áreas usando queries2.ts
  let areas: any[] = []
  try {
    areas = await getAreas(user.Agency.id, subaccountId)
  } catch (error) {
    console.error("Error al cargar áreas:", error)
  }

  // Calcular estadísticas
  const totalAreas = areas.length

  // Simulación de datos para capacidad y ocupación
  const totalCapacity = 1000 // m²
  const totalOccupation = 350 // m²
  const occupationPercentage = Math.round((totalOccupation / totalCapacity) * 100)

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Áreas de Inventario</h1>
          <p className="text-muted-foreground">Configure y administre las diferentes ubicaciones de almacenamiento</p>
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
                <LayoutGrid className="h-4 w-4 mr-2" />
                Tipo de área
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Package className="h-4 w-4 mr-2" />
                Ocupación
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
              <DropdownMenuItem>Fecha de creación (más reciente)</DropdownMenuItem>
              <DropdownMenuItem>Fecha de creación (más antigua)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={`/agency/${user.Agency.id}/areas/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Área
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Áreas</p>
                <p className="text-2xl font-bold">{totalAreas}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Grid3X3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capacidad Total</p>
                <p className="text-2xl font-bold">{totalCapacity} m²</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ocupación</p>
                <p className="text-2xl font-bold">{occupationPercentage}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 mt-2">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${occupationPercentage}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar áreas por nombre o descripción..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[180px] justify-between">
                  <span>Tiendas</span>
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
                    className="ml-2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Seleccionar tiendas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="tienda-todas" />
                    <label
                      htmlFor="tienda-todas"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Todas las tiendas
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="subcuenta1" />
                    <label
                      htmlFor="subcuenta1"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Tienda 1
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="subcuenta2" />
                    <label
                      htmlFor="subcuenta2"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Tienda 2
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="subcuenta3" />
                    <label
                      htmlFor="subcuenta3"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Tienda 3
                    </label>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">
              <div className="flex items-center">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Cuadrícula
              </div>
            </TabsTrigger>
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
          </TabsList>
          <div className="text-sm text-muted-foreground">Mostrando {areas.length} áreas</div>
        </div>

        <TabsContent value="grid" className="mt-0">
          {areas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-10">
                <Grid3X3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium mb-2">No hay áreas registradas</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Cree su primera área para comenzar a organizar su inventario.
                </p>
                <Link href={`/agency/${user.Agency.id}/areas/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Área
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {areas.map((area: any) => (
                <Card key={area._id} className="overflow-hidden group">
                  <div className="relative aspect-video bg-muted/30 flex items-center justify-center">
                    {area.layout && area.layout.items && area.layout.items.length > 0 ? (
                      <div className="w-full h-full p-4 flex items-center justify-center">
                        <div className="relative w-full h-full border border-dashed border-muted-foreground/30 rounded-md">
                          {area.layout.items.map((item: any) => (
                            <div
                              key={item.id}
                              className="absolute border"
                              style={{
                                left: `${(item.x / 800) * 100}%`,
                                top: `${(item.y / 600) * 100}%`,
                                width: `${(item.width / 800) * 100}%`,
                                height: `${(item.height / 600) * 100}%`,
                                backgroundColor: item.color || "#94a3b8",
                                transform: `rotate(${item.rotation || 0}deg)`,
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Grid3X3 className="h-12 w-12 text-muted-foreground/30" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Link href={`/agency/${user.Agency!.id}/areas/${area._id}`}>
                        <Button size="sm" variant="secondary">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                      <Link href={`/agency/${user.Agency!.id}/stock?areaId=${area._id}`}>
                        <Button size="sm" variant="secondary">
                          <Package className="h-4 w-4 mr-2" />
                          Ver Stock
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium line-clamp-1">{area.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {new Date(area.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {area.description || "Sin descripción"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {areas.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10">
                  <Grid3X3 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No hay áreas registradas</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Cree su primera área para comenzar a organizar su inventario.
                  </p>
                  <Link href={`/agency/${user.Agency.id}/areas/new`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Área
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Descripción</TableHead>
                      <TableHead className="hidden md:table-cell">Fecha de Creación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {areas.map((area: any) => (
                      <TableRow key={area._id}>
                        <TableCell className="font-medium">{area.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{area.description || "Sin descripción"}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(area.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/agency/${user.Agency!.id}/areas/workspace?areaId=${area._id}`}>
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                            </Link>
                            <Link href={`/agency/${user.Agency!.id}/stock?areaId=${area._id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Stock
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AreasPage
