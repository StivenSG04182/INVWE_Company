import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"

export const NotesPanel = ({ agencyId }: { agencyId: string }) => {
    return (
        <>
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Notas Crédito/Débito</h2>
                <div className="flex gap-2">
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Nueva Nota Crédito
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Nueva Nota Débito
                    </Button>
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
                            <p className="text-2xl font-bold text-green-600">0</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Notas de Débito</h3>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <h3 className="text-sm font-medium text-muted-foreground">Valor Total</h3>
                            <p className="text-2xl font-bold">$0.00</p>
                        </div>
                    </div>

                    <div className="border rounded-md">
                        <div className="p-4 border-b">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                    <Input placeholder="Buscar nota..." className="w-full md:w-64" />
                                    <Select defaultValue="all">
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
                                    <Input type="date" className="w-full md:w-auto" />
                                    <Input type="date" className="w-full md:w-auto" />
                                </div>
                            </div>
                            <p className="text-center text-muted-foreground py-8">
                                No hay notas de crédito o débito registradas en el sistema.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
