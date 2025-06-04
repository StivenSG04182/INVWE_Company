"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Receipt, FileX, FilePlus } from "lucide-react"
import Link from "next/link"

export const NotesPanel = ({ agencyId }: { agencyId: string }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const notes = []
    const creditNotes = 0
    const debitNotes = 0
    const totalCreditAmount = 0
    const totalDebitAmount = 0

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Notas Crédito/Débito</h2>
                    <p className="text-muted-foreground">Gestión de notas de crédito y débito conforme a la normativa DIAN</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href={`/agency/${agencyId}/finance/notes/new-credit`}>
                        <Button className="flex items-center gap-2">
                            <FilePlus className="h-4 w-4" />
                            Nueva Nota Crédito
                        </Button>
                    </Link>
                    <Link href={`/agency/${agencyId}/finance/notes/new-debit`}>
                        <Button variant="outline" className="flex items-center gap-2">
                            <FileX className="h-4 w-4" />
                            Nueva Nota Débito
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Estadísticas mejoradas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Notas de Crédito</p>
                                <p className="text-2xl font-bold text-green-600">{creditNotes}</p>
                                <p className="text-sm text-muted-foreground">${totalCreditAmount.toLocaleString("es-CO")}</p>
                            </div>
                            <FilePlus className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Notas de Débito</p>
                                <p className="text-2xl font-bold text-red-600">{debitNotes}</p>
                                <p className="text-sm text-muted-foreground">${totalDebitAmount.toLocaleString("es-CO")}</p>
                            </div>
                            <FileX className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Documentos</p>
                                <p className="text-2xl font-bold">{creditNotes + debitNotes}</p>
                            </div>
                            <Receipt className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Balance Neto</p>
                                <p
                                    className={`text-2xl font-bold ${totalCreditAmount - totalDebitAmount >= 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                    ${Math.abs(totalCreditAmount - totalDebitAmount).toLocaleString("es-CO")}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className={
                                    totalCreditAmount - totalDebitAmount >= 0
                                        ? "text-green-600 border-green-600"
                                        : "text-red-600 border-red-600"
                                }
                            >
                                {totalCreditAmount - totalDebitAmount >= 0 ? "Favor" : "Contra"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Gestión de Notas</CardTitle>
                            <CardDescription>Administre las notas de crédito y débito relacionadas con sus facturas</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                            Normativa DIAN 2024
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Filtros mejorados */}
                    <div className="space-y-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por número, cliente o factura referencia..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="credit">Notas de Crédito</SelectItem>
                                        <SelectItem value="debit">Notas de Débito</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="active">Activas</SelectItem>
                                        <SelectItem value="cancelled">Anuladas</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    type="date"
                                    className="w-auto"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    placeholder="Desde"
                                />
                                <Input
                                    type="date"
                                    className="w-auto"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    placeholder="Hasta"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="mb-4" />

                    {/* Tabla mejorada */}
                    <div className="border rounded-lg overflow-hidden">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Cargando notas...</p>
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="p-8 text-center">
                                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">No hay notas registradas</h3>
                                <p className="text-muted-foreground mb-4">
                                    Aún no se han creado notas de crédito o débito en el sistema.
                                </p>
                                <div className="flex justify-center gap-2">
                                    <Link href={`/agency/${agencyId}/finance/notes/new-credit`}>
                                        <Button size="sm">
                                            <FilePlus className="h-4 w-4 mr-2" />
                                            Crear Nota Crédito
                                        </Button>
                                    </Link>
                                    <Link href={`/agency/${agencyId}/finance/notes/new-debit`}>
                                        <Button variant="outline" size="sm">
                                            <FileX className="h-4 w-4 mr-2" />
                                            Crear Nota Débito
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Número</th>
                                            <th className="px-4 py-3 text-left font-medium">Tipo</th>
                                            <th className="px-4 py-3 text-left font-medium">Factura Ref.</th>
                                            <th className="px-4 py-3 text-left font-medium">Cliente</th>
                                            <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                            <th className="px-4 py-3 text-right font-medium">Monto</th>
                                            <th className="px-4 py-3 text-left font-medium">Estado</th>
                                            <th className="px-4 py-3 text-center font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>{/* Aquí se mapearán las notas cuando estén disponibles */}</tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
