"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Download, FileSpreadsheet, FileIcon as FilePdf, FileJson, CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface DataExportProps {
    agencyId: string
    products: any[]
    stocks: any[]
    areas: any[]
}

export default function DataExport({ agencyId, products, stocks, areas }: DataExportProps) {
    const { toast } = useToast()
    const [exportFormat, setExportFormat] = useState<string>("excel")
    const [exportType, setExportType] = useState<string>("inventory")
    const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
        name: true,
        sku: true,
        price: true,
        cost: true,
        quantity: true,
        category: true,
        area: true,
        minStock: true,
        maxStock: true,
        lastUpdated: true,
    })
    const [dateRange, setDateRange] = useState<{
        from: Date | undefined
        to: Date | undefined
    }>({
        from: undefined,
        to: undefined,
    })
    const [isExporting, setIsExporting] = useState<boolean>(false)

    // Función para manejar cambios en los campos seleccionados
    const handleFieldChange = (field: string, checked: boolean) => {
        setSelectedFields((prev) => ({
            ...prev,
            [field]: checked,
        }))
    }

    // Función para seleccionar/deseleccionar todos los campos
    const handleSelectAll = (checked: boolean) => {
        const newFields = { ...selectedFields }
        Object.keys(newFields).forEach((key) => {
            newFields[key] = checked
        })
        setSelectedFields(newFields)
    }

    // Función para exportar datos
    const handleExport = async () => {
        // Validar que al menos un campo esté seleccionado
        if (!Object.values(selectedFields).some((selected) => selected)) {
            toast({
                title: "Error",
                description: "Debe seleccionar al menos un campo para exportar",
                variant: "destructive",
            })
            return
        }

        setIsExporting(true)

        try {
            // Preparar los datos según el tipo de exportación
            let dataToExport: any[] = []

            if (exportType === "inventory") {
                // Agrupar stocks por producto
                const stocksByProduct = stocks.reduce((acc, stock) => {
                    const productId = stock.productId
                    if (!acc[productId]) {
                        acc[productId] = []
                    }
                    acc[productId].push(stock)
                    return acc
                }, {})

                // Preparar datos de inventario
                dataToExport = products.map((product) => {
                    const productStocks = stocksByProduct[product.id || product._id] || []
                    const totalQuantity = productStocks.reduce((sum, stock) => sum + stock.quantity, 0)

                    // Obtener áreas donde está el producto
                    const productAreas = productStocks
                        .map((stock) => {
                            const area = areas.find((a) => a.id === stock.areaId || a._id === stock.areaId)
                            return area ? area.name : "Área desconocida"
                        })
                        .join(", ")

                    return {
                        name: product.name,
                        sku: product.sku || "N/A",
                        price: product.price || 0,
                        cost: product.cost || 0,
                        quantity: totalQuantity,
                        category: product.categoryName || "Sin categoría",
                        area: productAreas,
                        minStock: product.minStock || 0,
                        maxStock: product.maxStock || 0,
                        lastUpdated: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : "N/A",
                    }
                })
            } else if (exportType === "movements") {
                // Aquí iría la lógica para exportar movimientos
                // Por ahora usamos datos de ejemplo
                dataToExport = [
                    {
                        date: "2023-05-15",
                        type: "entrada",
                        product: "Producto A",
                        quantity: 10,
                        area: "Almacén Principal",
                        user: "Admin",
                    },
                    {
                        date: "2023-05-16",
                        type: "salida",
                        product: "Producto B",
                        quantity: 5,
                        area: "Tienda",
                        user: "Vendedor",
                    },
                ]
            }

            // Filtrar los campos seleccionados
            dataToExport = dataToExport.map((item) => {
                const filteredItem: Record<string, any> = {}
                Object.keys(selectedFields).forEach((field) => {
                    if (selectedFields[field] && item[field] !== undefined) {
                        filteredItem[field] = item[field]
                    }
                })
                return filteredItem
            })

            // Simular la exportación según el formato
            let blob: Blob
            let fileName: string

            switch (exportFormat) {
                case "excel":
                    // En un entorno real, aquí usaríamos una librería como xlsx para generar el archivo Excel
                    // Por ahora, simulamos con un CSV
                    const headers = Object.keys(dataToExport[0] || {}).join(",")
                    const csvRows = dataToExport.map((row) => Object.values(row).join(","))
                    const csvContent = [headers, ...csvRows].join("\n")
                    blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
                    fileName = `inventario_${format(new Date(), "yyyy-MM-dd")}.csv`
                    break

                case "pdf":
                    // En un entorno real, aquí usaríamos una librería como jsPDF para generar el PDF
                    // Por ahora, simulamos con un texto plano
                    blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
                    fileName = `inventario_${format(new Date(), "yyyy-MM-dd")}.json`
                    break

                case "json":
                    blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
                    fileName = `inventario_${format(new Date(), "yyyy-MM-dd")}.json`
                    break

                default:
                    throw new Error("Formato de exportación no soportado")
            }

            // Crear un enlace de descarga
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", fileName)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast({
                title: "Exportación completada",
                description: `Los datos han sido exportados en formato ${exportFormat.toUpperCase()}`,
            })
        } catch (error) {
            console.error("Error al exportar datos:", error)
            toast({
                title: "Error",
                description: "No se pudieron exportar los datos. Inténtelo de nuevo.",
                variant: "destructive",
            })
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                        <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <CardTitle>Exportación de Datos</CardTitle>
                        <CardDescription>Exporta datos de inventario en diferentes formatos</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base">Tipo de Datos</Label>
                                <RadioGroup value={exportType} onValueChange={setExportType} className="flex flex-col space-y-1 mt-2">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="inventory" id="inventory" />
                                        <Label htmlFor="inventory">Inventario Actual</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="movements" id="movements" />
                                        <Label htmlFor="movements">Movimientos de Stock</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div>
                                <Label className="text-base">Formato de Exportación</Label>
                                <RadioGroup
                                    value={exportFormat}
                                    onValueChange={setExportFormat}
                                    className="grid grid-cols-3 gap-4 mt-2"
                                >
                                    <div className="flex flex-col items-center space-y-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                                        <FileSpreadsheet className="h-8 w-8 text-green-600" />
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="excel" id="excel" />
                                            <Label htmlFor="excel">Excel</Label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                                        <FilePdf className="h-8 w-8 text-red-600" />
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="pdf" id="pdf" />
                                            <Label htmlFor="pdf">PDF</Label>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                                        <FileJson className="h-8 w-8 text-blue-600" />
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="json" id="json" />
                                            <Label htmlFor="json">JSON</Label>
                                        </div>
                                    </div>
                                </RadioGroup>
                            </div>

                            {exportType === "movements" && (
                                <div>
                                    <Label className="text-base">Rango de Fechas</Label>
                                    <div className="flex flex-col space-y-2 mt-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "justify-start text-left font-normal",
                                                        !dateRange.from && "text-muted-foreground",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateRange.from ? (
                                                        dateRange.to ? (
                                                            <>
                                                                {format(dateRange.from, "P", { locale: es })} -{" "}
                                                                {format(dateRange.to, "P", { locale: es })}
                                                            </>
                                                        ) : (
                                                            format(dateRange.from, "P", { locale: es })
                                                        )
                                                    ) : (
                                                        "Seleccionar fechas"
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    initialFocus
                                                    mode="range"
                                                    defaultMonth={dateRange.from}
                                                    selected={dateRange}
                                                    onSelect={setDateRange}
                                                    numberOfMonths={2}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">Campos a Exportar</Label>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleSelectAll(true)}>
                                            Seleccionar todos
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleSelectAll(false)}>
                                            Deseleccionar todos
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {exportType === "inventory" ? (
                                        <>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="name"
                                                    checked={selectedFields.name}
                                                    onCheckedChange={(checked) => handleFieldChange("name", !!checked)}
                                                />
                                                <Label htmlFor="name">Nombre</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="sku"
                                                    checked={selectedFields.sku}
                                                    onCheckedChange={(checked) => handleFieldChange("sku", !!checked)}
                                                />
                                                <Label htmlFor="sku">SKU</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="price"
                                                    checked={selectedFields.price}
                                                    onCheckedChange={(checked) => handleFieldChange("price", !!checked)}
                                                />
                                                <Label htmlFor="price">Precio</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="cost"
                                                    checked={selectedFields.cost}
                                                    onCheckedChange={(checked) => handleFieldChange("cost", !!checked)}
                                                />
                                                <Label htmlFor="cost">Costo</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="quantity"
                                                    checked={selectedFields.quantity}
                                                    onCheckedChange={(checked) => handleFieldChange("quantity", !!checked)}
                                                />
                                                <Label htmlFor="quantity">Cantidad</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="category"
                                                    checked={selectedFields.category}
                                                    onCheckedChange={(checked) => handleFieldChange("category", !!checked)}
                                                />
                                                <Label htmlFor="category">Categoría</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="area"
                                                    checked={selectedFields.area}
                                                    onCheckedChange={(checked) => handleFieldChange("area", !!checked)}
                                                />
                                                <Label htmlFor="area">Ubicación</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="minStock"
                                                    checked={selectedFields.minStock}
                                                    onCheckedChange={(checked) => handleFieldChange("minStock", !!checked)}
                                                />
                                                <Label htmlFor="minStock">Stock Mínimo</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="maxStock"
                                                    checked={selectedFields.maxStock}
                                                    onCheckedChange={(checked) => handleFieldChange("maxStock", !!checked)}
                                                />
                                                <Label htmlFor="maxStock">Stock Máximo</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="lastUpdated"
                                                    checked={selectedFields.lastUpdated}
                                                    onCheckedChange={(checked) => handleFieldChange("lastUpdated", !!checked)}
                                                />
                                                <Label htmlFor="lastUpdated">Última Actualización</Label>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="date" checked={true} onCheckedChange={(checked) => { }} disabled />
                                                <Label htmlFor="date">Fecha</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="type" checked={true} onCheckedChange={(checked) => { }} disabled />
                                                <Label htmlFor="type">Tipo de Movimiento</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="product" checked={true} onCheckedChange={(checked) => { }} disabled />
                                                <Label htmlFor="product">Producto</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="quantity" checked={true} onCheckedChange={(checked) => { }} disabled />
                                                <Label htmlFor="quantity">Cantidad</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="area" checked={true} onCheckedChange={(checked) => { }} disabled />
                                                <Label htmlFor="area">Área</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="user" checked={true} onCheckedChange={(checked) => { }} disabled />
                                                <Label htmlFor="user">Usuario</Label>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleExport} disabled={isExporting}>
                            {isExporting ? (
                                "Exportando..."
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar Datos
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
