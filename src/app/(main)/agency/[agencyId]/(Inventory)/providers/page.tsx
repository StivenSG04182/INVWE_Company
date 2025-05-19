import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Building2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Download,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Package,
} from "lucide-react"
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
import { ProviderService } from "@/lib/services/inventory-service"


const ProvidersPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }


  // Calcular estadísticas
  const totalProviders = providers.length
  const activeProviders = providers.filter((p) => p.active === true).length
  
  // Nota: pendingOrders no está en el modelo de datos actual, se podría implementar
  // en el futuro consultando los movimientos pendientes relacionados con cada proveedor
  const pendingOrders = 0

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
          <p className="text-muted-foreground">Administre sus proveedores, contactos y productos asociados</p>
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
                <Badge variant="outline" className="mr-2">
                  Activos
                </Badge>
                Solo activos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Badge variant="outline" className="mr-2">
                  Inactivos
                </Badge>
                Solo inactivos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Package className="h-4 w-4 mr-2" />
                Con órdenes pendientes
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
              <DropdownMenuItem>Fecha de registro (más reciente)</DropdownMenuItem>
              <DropdownMenuItem>Fecha de registro (más antiguo)</DropdownMenuItem>
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
                Generar directorio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={`/agency/${agencyId}/providers/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Proveedores</p>
                <p className="text-2xl font-bold">{totalProviders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Proveedores Activos</p>
                <p className="text-2xl font-bold">{activeProviders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Órdenes Pendientes</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar proveedores por nombre, contacto o email..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="min-w-[180px] justify-between">
                  <span>Subcuentas</span>
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
                <DropdownMenuLabel>Seleccionar subcuentas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="subcuenta-todas" />
                    <label
                      htmlFor="subcuenta-todas"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Todas las subcuentas
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="subcuenta1" />
                    <label
                      htmlFor="subcuenta1"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subcuenta 1
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="subcuenta2" />
                    <label
                      htmlFor="subcuenta2"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subcuenta 2
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="subcuenta3" />
                    <label
                      htmlFor="subcuenta3"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subcuenta 3
                    </label>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
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
          <div className="text-sm text-muted-foreground">Mostrando {providers.length} proveedores</div>
        </div>

        <TabsContent value="cards" className="mt-0">
          {providers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-10">
                <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-medium mb-2">No hay proveedores registrados</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Agregue su primer proveedor para comenzar a gestionar sus compras e inventario.
                </p>
                <Link href={`/agency/${agencyId}/providers/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Proveedor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <Card key={provider._id?.toString()} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{provider.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : 'Fecha no disponible'}
                        </p>
                      </div>
                      <Badge variant={provider.active ? "default" : "secondary"}>
                        {provider.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{provider.contactName || "Sin contacto"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{provider.email || "Sin email"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{provider.phone || "Sin teléfono"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm line-clamp-2">{provider.address || "Sin dirección"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <span className="text-sm text-muted-foreground">Sin órdenes pendientes</span>

                      <Link href={`/agency/${agencyId}/providers/${provider._id?.toString()}`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <Card>
            <CardContent className="p-0">
              {providers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10">
                  <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No hay proveedores registrados</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Agregue su primer proveedor para comenzar a gestionar sus compras e inventario.
                  </p>
                  <Link href={`/agency/${agencyId}/providers/new`}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Proveedor
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Contacto</TableHead>
                      <TableHead className="hidden md:table-cell">Email/Teléfono</TableHead>
                      <TableHead className="hidden lg:table-cell">Dirección</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((provider) => (
                      <TableRow key={provider._id?.toString()}>
                        <TableCell className="font-medium">{provider.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{provider.contactName || "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>{provider.email || "—"}</div>
                          <div className="text-sm text-muted-foreground">{provider.phone || "—"}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell max-w-xs truncate">
                          {provider.address || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={provider.active ? "default" : "secondary"}>
                            {provider.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/agency/${agencyId}/providers/${provider._id?.toString()}`}>
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
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

export default ProvidersPage
