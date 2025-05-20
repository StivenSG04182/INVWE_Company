"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Eye, FileText } from "lucide-react"
import Link from "next/link"

export const NotesPanel = ({ agencyId }: { agencyId: string }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    
    // En el futuro, estos datos vendrán de la API
    const notes = []
    const creditNotes = 0
    const debitNotes = 0
    const totalAmount = 0
    
    // Cuando se implemente la API para notas, agregaremos un useEffect similar a los otros componentes
    // useEffect(() => {
    //     const fetchNotes = async () => {
    //         setIsLoading(true)
    //         try {
    //             const notesData = await getNotes({ agencyId })
    //             setNotes(notesData)
    //         } catch (error) {
    //             console.error("Error al cargar notas:", error)
    //         } finally {
    //             setIsLoading(false)
    //         }
    //     }
    //     
    //     fetchNotes()
    // }, [agencyId])

    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Notas Crédito/Débito</h2>
                <div className="flex gap-2">
                    <Link href={`/agency/${agencyId}/finance/notes/new-credit`}>
                        <Button className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Nueva Nota Crédito
                        </Button>
                    </Link>
                    <Link href={`/agency/${agencyId}/finance/notes/new-debit`}>
                        <Button variant="outline" className="flex items-center gap-2">
                            <PlusCircle className="h-4 w-4" />
                            Nueva Nota Débito
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Gestión de Notas</CardTitle>
                    <CardDescription>
                        Administre las notas de crédito y débito relacionadas con sus facturas y transacciones.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Notas de Crédito</h3>
                            <p className="text-2xl font-bold text-green-600">{creditNotes}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Notas de Débito</h3>
                            <p className="text-2xl font-bold">{debitNotes}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Valor Total</h3>
                            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <div className="p-4 border-b">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <Input 
                                        placeholder="Buscar nota..." 
                                        className="w-full md:w-64" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Select 
                                        defaultValue="all"
                                        onValueChange={(value) => setTypeFilter(value)}
                                    >
                                        <SelectTrigger className="w-full md:w-40">
                                            <SelectValue placeholder="Tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los tipos</SelectItem>
                                            <SelectItem value="credito">Notas de Crédito</SelectItem>
                                            <SelectItem value="debito">Notas de Débito</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Input 
                                        type="date" 
                                        className="w-full md:w-auto" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                    <Input 
                                        type="date" 
                                        className="w-full md:w-auto" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {isLoading ? (
                                <p className="text-center text-muted-foreground py-8">Cargando notas...</p>
                            ) : notes.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No hay notas de crédito o débito registradas en el sistema.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-4 py-2 text-left">Número</th>
                                                <th className="px-4 py-2 text-left">Tipo</th>
                                                <th className="px-4 py-2 text-left">Factura Ref.</th>
                                                <th className="px-4 py-2 text-left">Cliente</th>
                                                <th className="px-4 py-2 text-left">Fecha</th>
                                                <th className="px-4 py-2 text-left">Monto</th>
                                                <th className="px-4 py-2 text-left">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Aquí se mapearán las notas cuando estén disponibles */}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
