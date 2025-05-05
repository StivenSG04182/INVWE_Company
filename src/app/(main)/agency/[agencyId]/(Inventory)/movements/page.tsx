import { getAuthUserDetails } from "@/lib/queries"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  MoreHorizontal,
  ArrowLeftRight,
  FileText,
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

const MovementsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Simulación de datos para la demostración
  const movements = [
    {
      _id: "mov1",
      type: "entrada",
      productName: "Camiseta Algodón",
      productSku: "CAM-001",
      areaName: "Almacén Principal",
      quantity: 50,
      date: new Date(2023, 5, 15),
      providerName: "Textiles XYZ",
      notes: "Reposición de stock mensual",
    },
    {
      _id: "mov2",
      type: "salida",
      productName: "Pantalón Vaquero",
      productSku: "PAN-002",
      areaName: "Tienda Centro",
      quantity: 10,
      date: new Date(2023, 5, 16),
      notes: "Venta en tienda",
    },
    {
      _id: "mov3",
      type: "entrada",
      productName: "Zapatillas Deportivas",
      productSku: "ZAP-003",
      areaName: "Almacén Principal",
      quantity: 25,
      date: new Date(2023, 5, 17),
      providerName: "Calzados Deportivos S.A.",
      notes: "Nuevo modelo temporada verano",
    },
  ]

  // Calcular estadísticas
  const totalEntries = movements.filter((m) => m.type === "entrada").length
  const totalExits = movements.filter((m) => m.type === "salida").length
  const totalTransfers = movements.filter((m) => m.type === "transferencia").length

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
          <p className="text-muted-foreground">Registro de entradas, salidas y transferencias de productos</p>
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
                <ArrowDownToLine className="h-4 w-4 mr-2 text-green-500" />
                Entradas
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArrowUpFromLine className="h-4 w-4 mr-2 text-red-500" />
                Salidas
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArrowLeftRight className="h-4 w-4 mr-2 text-blue-500" />
                Transferencias
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Periodo
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filtrar por fecha</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Hoy</DropdownMenuItem>
              <DropdownMenuItem>Última semana</DropdownMenuItem>
              <DropdownMenuItem>Último mes</DropdownMenuItem>
              <DropdownMenuItem>Último trimestre</DropdownMenuItem>
              <DropdownMenuItem>Personalizado...</DropdownMenuItem>
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
                Nuevo Movimiento
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
              <Link href={`/agency/${agencyId}/movements/transferencia`}>
                <DropdownMenuItem>
                  <ArrowLeftRight className="h-4 w-4 mr-2 text-blue-500" />
                  Registrar Transferencia
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
                <p className="text-sm font-medium text-muted-foreground">Entradas</p>
                <p className="text-2xl font-bold">{totalEntries}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowDownToLine className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Salidas</p>
                <p className="text-2xl font-bold">{totalExits}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowUpFromLine className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transferencias</p>
                <p className="text-2xl font-bold">{totalTransfers}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowLeftRight className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por producto, área o notas..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de movimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="salida">Salidas</SelectItem>
              <SelectItem value="transferencia">Transferencias</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="w-[180px]" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10">
              <ArrowLeftRight className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium mb-2">No hay movimientos registrados</h3>
              <p className="text-muted-foreground text-center mb-6">
                Registre entradas y salidas de productos para comenzar a llevar un control de su inventario.
              </p>
              <div className="flex gap-2">
                <Link href={`/agency/${agencyId}/movements/entrada`}>
                  <Button variant="default">
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Registrar Entrada
                  </Button>
                </Link>
                <Link href={`/agency/${agencyId}/movements/salida`}>
                  <Button variant="outline">
                    <ArrowUpFromLine className="h-4 w-4 mr-2" />
                    Registrar Salida
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="hidden lg:table-cell">Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement._id}>
                    <TableCell>
                      <Badge
                        variant={
                          movement.type === "entrada"
                            ? "default"
                            : movement.type === "salida"
                              ? "destructive"
                              : "outline"
                        }
                        className="flex items-center gap-1 w-fit"
                      >
                        {movement.type === "entrada" && <ArrowDownToLine className="h-3 w-3" />}
                        {movement.type === "salida" && <ArrowUpFromLine className="h-3 w-3" />}
                        {movement.type === "transferencia" && <ArrowLeftRight className="h-3 w-3" />}
                        <span className="capitalize">{movement.type}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{movement.productName}</div>
                      <div className="text-xs text-muted-foreground">{movement.productSku}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{movement.areaName}</TableCell>
                    <TableCell className="font-medium">
                      {movement.quantity} {movement.type === "entrada" ? "+" : "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{movement.date.toLocaleDateString()}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground truncate max-w-xs">
                      {movement.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MovementsPage
