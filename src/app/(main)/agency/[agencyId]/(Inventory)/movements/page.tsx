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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilteredMovements } from "@/components/inventory/filtered-movements"
import { MovementService, ProductService, AreaService } from "@/lib/services/inventory-service"

const MovementsPage = async ({ params }: { params: { agencyId: string } }) => {
  const user = await getAuthUserDetails()
  if (!user) return redirect("/sign-in")

  const agencyId = params.agencyId
  if (!user.Agency) {
    return redirect("/agency")
  }

  // Obtener datos reales de movimientos desde MongoDB
  const rawMovements = await MovementService.getMovements(agencyId)
  
  // Obtener productos y áreas para enriquecer los datos de movimientos
  const products = await ProductService.getProducts(agencyId)
  const areas = await AreaService.getAreas(agencyId)
  
  // Enriquecer los datos de movimientos con información de productos y áreas
  const movements = await Promise.all(rawMovements.map(async (movement) => {
    const product = products.find(p => p._id.toString() === movement.productId)
    const area = areas.find(a => a._id.toString() === movement.areaId)
    
    // Asegurar que el tipo de movimiento esté en minúsculas para coincidir con la interfaz del componente
    // En MongoDB puede estar como ENTRADA, SALIDA, TRANSFERENCIA (según el enum de Prisma)
    let movementType = movement.type.toLowerCase()
    if (movementType === 'entrada' || movementType === 'salida' || movementType === 'transferencia') {
      // El tipo ya está correcto
    } else if (movementType.includes('entrada') || movement.type === 'ENTRADA') {
      movementType = 'entrada'
    } else if (movementType.includes('salida') || movement.type === 'SALIDA') {
      movementType = 'salida'
    } else if (movementType.includes('transfer') || movement.type === 'TRANSFERENCIA') {
      movementType = 'transferencia'
    }
    
    return {
      ...movement,
      _id: movement._id.toString(),
      type: movementType,
      productName: product ? product.name : 'Producto desconocido',
      productSku: product ? product.sku : 'Sin SKU',
      areaName: area ? area.name : 'Área desconocida'
    }
  }))

  // Calcular estadísticas con los tipos normalizados
  const totalEntries = movements.filter((m) => m.type === "entrada").length
  const totalExits = movements.filter((m) => m.type === "salida").length
  const totalTransfers = movements.filter((m) => m.type === "transferencia").length
  
  // Obtener subcuentas del usuario actual
  const subAccounts = user.Agency?.SubAccount?.map(subaccount => ({
    id: subaccount.id,
    name: subaccount.name
  })) || []

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

      {/* Componente de movimientos filtrados */}
      {movements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <h3 className="text-xl font-medium mb-2">No hay movimientos registrados</h3>
            <p className="text-muted-foreground text-center mb-6">
              Comience registrando entradas, salidas o transferencias de productos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <FilteredMovements 
          agencyId={agencyId}
          movements={movements}
          areas={areas}
          subAccounts={subAccounts}
        />
      )}
    </div>
  )
}

export default MovementsPage
