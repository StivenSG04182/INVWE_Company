"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Search, Calendar, Eye, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FilteredMovementsProps {
    agencyId: string
    movements: any[]
    areas: any[]
    subAccounts: any[]
}

export default function FilteredMovements({ agencyId, movements, areas, subAccounts }: FilteredMovementsProps) {
    const router = useRouter()

    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [areaFilter, setAreaFilter] = useState("")
    const [dateFilter, setDateFilter] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Filtrar movimientos
    const filteredMovements = movements.filter((movement) => {
        const matchesSearch =
            searchTerm === "" ||
            movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (movement.productSku && movement.productSku.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (movement.notes && movement.notes.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesType = typeFilter === "" || movement.type === typeFilter

        const matchesArea = areaFilter === "" || movement.areaId === areaFilter

        // Filtrar por fecha
        let matchesDate = true
        if (dateFilter) {
            const movementDate = new Date(movement.createdAt).toISOString().split("T")[0]

            if (dateFilter === "today") {
                const today = new Date().toISOString().split("T")[0]
                matchesDate = movementDate === today
            } else if (dateFilter === "week") {
                const oneWeekAgo = new Date()
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
                matchesDate = new Date(movement.createdAt) >= oneWeekAgo
            } else if (dateFilter === "month") {
                const oneMonthAgo = new Date()
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
                matchesDate = new Date(movement.createdAt) >= oneMonthAgo
            }
        }

        return matchesSearch && matchesType && matchesArea && matchesDate
    })

    // Paginación
    const totalPages = Math.ceil(filteredMovements.length / itemsPerPage)
    const paginatedMovements = filteredMovements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    // Actualizar página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, typeFilter, areaFilter, dateFilter])

    // Obtener el icono según el tipo de movimiento
    const getMovementIcon = (type: string) => {
        switch (type) {
            case "entrada":
                return <ArrowDownToLine className="h-4 w-4 text-green-500" />
            case "salida":
                return <ArrowUpFromLine className="h-4 w-4 text-red-500" />
            case "transferencia":
                return <ArrowLeftRight className="h-4 w-4 text-blue-500" />
            default:
                return null
        }
    }

    // Obtener la variante de badge según el tipo de movimiento
    const getMovementBadgeVariant = (type: string) => {
        switch (type) {
            case "entrada":
                return "success"
            case "salida":
                return "destructive"
            case "transferencia":
                return "outline"
            default:
                return "default"
        }
    }

    // Formatear fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar movimientos..."
                            className="w-full md:w-[300px] pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Todos los tipos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todos los tipos</SelectItem>
                            <SelectItem value="entrada">Entradas</SelectItem>
                            <SelectItem value="salida">Salidas</SelectItem>
                            <SelectItem value="transferencia">Transferencias</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={areaFilter} onValueChange={setAreaFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Todas las áreas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Todas las áreas</SelectItem>
                            {areas.map((area) => (
                                <SelectItem key={area._id.toString()} value={area._id.toString()}>
                                    {area.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Todas las fechas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las fechas</SelectItem>
                            <SelectItem value="today">Hoy</SelectItem>
                            <SelectItem value="week">Última semana</SelectItem>
                            <SelectItem value="month">Último mes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Movimientos de Inventario</CardTitle>
                    <CardDescription>{filteredMovements.length} movimientos encontrados</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredMovements.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No se encontraron movimientos</h3>
                            <p className="text-muted-foreground mb-6">
                                No hay movimientos que coincidan con los criterios de búsqueda.
                            </p>
                            <Button asChild>
                                <Link href={`/agency/${agencyId}/(Inventory)?tab=movement&type=entrada`}>
                                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                                    Registrar Entrada
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-center">Cantidad</TableHead>
                                            <TableHead>Ubicación</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedMovements.map((movement) => (
                                            <TableRow key={movement._id.toString()}>
                                                <TableCell>
                                                    <Badge
                                                        variant={getMovementBadgeVariant(movement.type)}
                                                        className="flex items-center gap-1 w-fit"
                                                    >
                                                        {getMovementIcon(movement.type)}
                                                        {movement.type === "entrada"
                                                            ? "Entrada"
                                                            : movement.type === "salida"
                                                                ? "Salida"
                                                                : "Transferencia"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {movement.productName}
                                                    <div className="text-xs text-muted-foreground">SKU: {movement.productSku || "—"}</div>
                                                </TableCell>
                                                <TableCell className="text-center">{movement.quantity}</TableCell>
                                                <TableCell>{movement.areaName}</TableCell>
                                                <TableCell>{formatDate(movement.createdAt)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/agency/${agencyId}/(Inventory)/movements/${movement._id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem asChild>
                                                                    <Link
                                                                        href={`/agency/${agencyId}/(Inventory)?tab=product&productId=${movement.productId}`}
                                                                    >
                                                                        Ver Producto
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/agency/${agencyId}/areas/workspace?areaId=${movement.areaId}`}>
                                                                        Ver Área
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <Pagination className="mt-4">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink isActive={page === currentPage} onClick={() => setCurrentPage(page)}>
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
