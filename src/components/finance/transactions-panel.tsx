import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, FileDown } from "lucide-react"

export const TransactionsPanel = ({ agencyId }: { agencyId: string }) => {
    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Transacciones</h2>
                <div className="flex gap-2">
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Nueva Transacción
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <FileDown className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Historial de Transacciones</CardTitle>
                    <CardDescription>
                        Registro de todas las operaciones financieras relacionadas con ventas, compras y ajustes de inventario.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Ingresos (Este Mes)</h3>
                            <p className="text-2xl font-bold text-green-600">$0.00</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Gastos (Este Mes)</h3>
                            <p className="text-2xl font-bold text-red-600">$0.00</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
                            <p className="text-2xl font-bold">$0.00</p>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <div className="p-4 border-b">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <Input placeholder="Buscar transacción..." className="w-full md:w-64" />
                                    <Select defaultValue="all">
                                        <SelectTrigger className="w-full md:w-40">
                                            <SelectValue placeholder="Tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los tipos</SelectItem>
                                            <SelectItem value="venta">Ventas</SelectItem>
                                            <SelectItem value="compra">Compras</SelectItem>
                                            <SelectItem value="ajuste">Ajustes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Input type="date" className="w-full md:w-auto" />
                                    <Input type="date" className="w-full md:w-auto" />
                                </div>
                            </div>
                            <p className="text-center text-muted-foreground py-8">No hay transacciones registradas en el sistema.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
