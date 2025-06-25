"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Download, FileSpreadsheet, Loader2, Plus, Trash2, HelpCircle, AlertTriangle, X, Package, Warehouse, DollarSign, ImageIcon, Upload, CheckCircle, Info, Eye, FileText, Zap, RotateCcw, Settings } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { UploadButton } from "@/lib/uploadthing"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { createCategory, createProduct, getSubAccountsForAgency, getCategories } from "@/lib/queries2"
import * as XLSX from 'xlsx';

interface BulkProductFormProps {
    agencyId: string
    subaccountId?: string
}

interface ProductFields {
    name: string;
    sku: string;
    price: string;
    description: string;
    categoryId: string;
    brand: string;
    model: string;
    isActive: boolean;
    quantity: string;
    minStock: string;
    maxStock: string;
    location: string;
    unit: string;
    allowNegativeStock: boolean;
    barcode: string;
    supplierRef: string;
    gtin: string;
    weight: string;
    height: string;
    width: string;
    depth: string;
    countryOfOrigin: string;
    cost: string;
    taxRate: string;
    margin: string;
    suggestedPrice: string;
    supplierId: string;
    restockTime: string;
    minOrderQuantity: string;
    productImage: string;
}

const defaultProduct: ProductFields = {
    name: "",
    sku: "",
    price: "",
    description: "",
    categoryId: "",
    brand: "",
    model: "",
    isActive: true,
    quantity: "0",
    minStock: "",
    maxStock: "",
    location: "",
    unit: "unidad",
    allowNegativeStock: false,
    barcode: "",
    supplierRef: "",
    gtin: "",
    weight: "",
    height: "",
    width: "",
    depth: "",
    countryOfOrigin: "",
    cost: "",
    taxRate: "",
    margin: "",
    suggestedPrice: "",
    supplierId: "",
    restockTime: "",
    minOrderQuantity: "",
    productImage: "",
};

export default function BulkProductForm({ agencyId, subaccountId }: BulkProductFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [subaccounts, setSubaccounts] = useState<any[]>([])
    const [selectedSubaccount, setSelectedSubaccount] = useState(subaccountId || "")
    const [activeTab, setActiveTab] = useState("manual")
    const [excelData, setExcelData] = useState<any[]>([])
    const [manualProducts, setManualProducts] = useState<ProductFields[]>([defaultProduct])
    const [categories, setCategories] = useState<any[]>([])
    const [newCategory, setNewCategory] = useState("")
    const [excelFile, setExcelFile] = useState<File | null>(null)
    const [excelHeaders, setExcelHeaders] = useState<string[]>([])
    const [excelPreview, setExcelPreview] = useState<any[]>([])
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
    const [requiredFieldsOnly, setRequiredFieldsOnly] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const subaccountsData = await getSubAccountsForAgency(agencyId)
                if (subaccountsData) {
                    setSubaccounts(subaccountsData)
                }
                const categoriesData = await getCategories(agencyId)
                if (categoriesData) {
                    setCategories(categoriesData)
                }

            } catch (error) {
                console.error("Error al cargar datos:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudieron cargar los datos necesarios. Inténtalo de nuevo.",
                })
            }
        }

        fetchData()
    }, [agencyId, toast])

    const handleAddProduct = () => {
        setManualProducts([
            ...manualProducts,
            {
                name: "",
                sku: "",
                price: "",
                description: "",
                categoryId: "",
                brand: "",
                model: "",
                isActive: true,
                quantity: "0",
                minStock: "",
                maxStock: "",
                location: "",
                unit: "unidad",
                allowNegativeStock: false,
                barcode: "",
                supplierRef: "",
                gtin: "",
                weight: "",
                height: "",
                width: "",
                depth: "",
                countryOfOrigin: "",
                cost: "",
                taxRate: "",
                margin: "",
                suggestedPrice: "",
                supplierId: "",
                restockTime: "",
                minOrderQuantity: "",
                productImage: "",
            },
        ])
    }

    const handleRemoveProduct = (index: number) => {
        const updatedProducts = [...manualProducts]
        updatedProducts.splice(index, 1)
        setManualProducts(updatedProducts)
    }

    const handleProductChange = (index: number, field: string, value: string | boolean) => {
        const updatedProducts = [...manualProducts]
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]:
                field === "price" || field === "cost" || field === "minStock" || field === "quantity"
                    ? typeof value === "string"
                        ? Number(value)
                        : value
                    : value,
        }
        setManualProducts(updatedProducts)
    }

    const handleCreateCategory = async () => {
        if (!newCategory.trim()) return

        try {
            const result = await createCategory({
                name: newCategory,
                agencyId,
                subaccountId: selectedSubaccount,
            })

            if (result) {
                toast({
                    title: "Categoría creada",
                    description: `La categoría ${newCategory} ha sido creada exitosamente.`,
                })
                setCategories([...categories, result])
                setNewCategory("")
            } else {
                throw new Error("Error al crear la categoría")
            }
        } catch (error) {
            console.error("Error al crear categoría:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Hubo un problema al crear la categoría. Inténtalo de nuevo.",
            })
        }
    }

    const downloadTemplateXLSX = () => {
        const worksheetData = [
            ["INFORMACIÓN BÁSICA", "", "", "", "", "", "",
                "INFORMACIÓN DE INVENTARIO", "", "", "", "",
                "CÓDIGOS Y REFERENCIAS", "", "",
                "INFORMACIÓN FÍSICA", "", "", "", "",
                "INFORMACIÓN COMERCIAL", "", "", "",
                "INFORMACIÓN DE PROVEEDOR", "", ""],

            ["Nombre del Producto", "SKU", "Precio", "Descripción", "Categoría", "Marca", "Modelo",
                "Cantidad Inicial", "Stock Mínimo", "Stock Máximo", "Ubicación", "Unidad de Medida",
                "Código de Barras", "Referencia Proveedor", "GTIN/EAN",
                "Peso (kg)", "Alto (cm)", "Ancho (cm)", "Profundidad (cm)", "País de Origen",
                "Costo", "% Impuesto", "% Margen", "Precio Sugerido",
                "ID Proveedor", "Tiempo Reposición (días)", "Cantidad Mínima Pedido"],

            ["Nombre comercial*", "Código único*", "Precio venta*", "Descripción detallada",
                "ID categoría", "Nombre marca", "Referencia modelo",
                "Cantidad inicial", "Alerta stock bajo", "Límite máximo", "Código ubicación", "ej: unidad/kg/l",
                "8-14 dígitos", "Código proveedor", "Código global",
                "Peso total", "Altura", "Anchura", "Profundidad", "Código país",
                "Precio compra", "ej: 19", "ej: 25", "PVP recomendado",
                "ID del sistema", "Tiempo entrega", "Lote mínimo"],

            ["Smartphone XYZ Pro", "SP-XYZ-001", "599.99", "Teléfono inteligente última generación",
                "1", "TechBrand", "XYZ-2025",
                "50", "10", "100", "BOD-A-001", "unidad",
                "7501234567890", "PROV-001-XYZ", "8412345678901",
                "0.180", "15.2", "7.5", "0.8", "CN",
                "450.00", "19", "25", "649.99",
                "PROV001", "15", "10"]
        ];

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        worksheet['!cols'] = worksheetData[1].map(() => ({ wch: 20 }));
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

        for (let C = range.s.c; C <= range.e.c; C++) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
            if (cell) {
                cell.s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4F46E5" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }
        }

        for (let C = range.s.c; C <= range.e.c; C++) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: 1, c: C })];
            if (cell) {
                cell.s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "E5E7EB" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Productos');
        XLSX.writeFile(workbook, 'plantilla_productos.xlsx');
    };


    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

                    const headers = jsonData[1] as string[];
                    setExcelHeaders(headers);

                    const initialMapping: Record<string, string> = {};
                    headers.forEach((header: string) => {
                        switch (header) {
                            case "Nombre del Producto": initialMapping[header] = "name"; break;
                            case "SKU": initialMapping[header] = "sku"; break;
                            case "Precio": initialMapping[header] = "price"; break;
                            case "Descripción": initialMapping[header] = "description"; break;
                            case "Categoría": initialMapping[header] = "categoryId"; break;
                            case "Código de Barras": initialMapping[header] = "barcode"; break;
                            default: initialMapping[header] = "";
                        }
                    });
                    setColumnMapping(initialMapping);

                    const preview: Record<string, string>[] = [];
                    for (let i = 3; i < Math.min(jsonData.length, 8); i++) {
                        if (Array.isArray(jsonData[i]) && jsonData[i].length) {
                            const row: Record<string, string> = {};
                            headers.forEach((header, index) => {
                                row[header] = jsonData[i][index]?.toString() || "";
                            });
                            preview.push(row);
                        }
                    }
                    setExcelPreview(preview);
                    setExcelFile(file);

                    toast({
                        title: "Archivo cargado",
                        description: "El archivo se ha cargado correctamente.",
                    });
                } catch (error) {
                    console.error("Error al procesar el archivo:", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Error al procesar el archivo. Asegúrate de que sea un archivo Excel válido.",
                    });
                } finally {
                    setIsUploading(false);
                }
            };

            reader.onerror = () => {
                setIsUploading(false);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Error al leer el archivo.",
                });
            };

            reader.readAsArrayBuffer(file);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let productsToSubmit: ProductFields[] = [];

            if (activeTab === "manual") {
                // Validar cada producto
                for (const product of manualProducts) {
                    const errors = validateProduct(product);
                    if (errors.length > 0) {
                        throw new Error(`Errores en producto ${product.name || 'sin nombre'}:\n${errors.join('\n')}`);
                    }
                }

                productsToSubmit = manualProducts;
            } else {
                if (!excelFile) {
                    throw new Error("Debes seleccionar un archivo Excel")
                }

                const requiredFields = ["name", "sku", "price"]
                const mappedFields = Object.values(columnMapping)
                const missingRequiredFields = requiredFields.filter((field) => !mappedFields.includes(field))

                if (missingRequiredFields.length > 0) {
                    throw new Error(`Faltan campos requeridos: ${missingRequiredFields.join(", ")}`)
                }

                productsToSubmit = excelPreview.map((row) => {
                    const product: ProductFields = {
                        ...defaultProduct,
                        name: "",
                        sku: "",
                        price: "",
                        description: "",
                        categoryId: "",
                        brand: "",
                        model: "",
                        isActive: true,
                        quantity: "0",
                        minStock: "",
                        maxStock: "",
                        location: "",
                        unit: "unidad",
                        allowNegativeStock: false,
                        barcode: "",
                        supplierRef: "",
                        gtin: "",
                        weight: "",
                        height: "",
                        width: "",
                        depth: "",
                        countryOfOrigin: "",
                        cost: "",
                        taxRate: "",
                        margin: "",
                        suggestedPrice: "",
                        supplierId: "",
                        restockTime: "",
                        minOrderQuantity: "",
                        productImage: "",
                    }

                    Object.entries(columnMapping).forEach(([header, productField]) => {
                        if (productField && row[header] !== undefined) {
                            const typedField = productField as keyof ProductFields;
                            if (["price", "cost", "minStock", "quantity"].includes(productField)) {
                                (product[typedField] as string) = String(Number.parseFloat(row[header]) || 0);
                            } else {
                                (product[typedField] as string) = String(row[header]);
                            }
                        }
                    })

                    return product
                })
            }

            const createdProducts: Awaited<ReturnType<typeof createProduct>>[] = []
            for (const productData of productsToSubmit) {
                try {
                    const productWithAgencyId = {
                        ...productData,
                        agencyId
                    }

                    const result = await createProduct(productWithAgencyId)
                    if (result) {
                        createdProducts.push(result)
                    }
                } catch (productError) {
                    console.error("Error al crear producto individual:", productError)
                }
            }

            if (createdProducts.length > 0) {
                toast({
                    title: "Productos creados",
                    description: `Se han creado ${createdProducts.length} de ${productsToSubmit.length} productos exitosamente.`,
                })
                router.refresh()

                if (subaccountId) {
                    router.push(`/subaccount/${subaccountId}/products`)
                } else {
                    router.push(`/agency/${agencyId}/products`)
                }
            } else {
                throw new Error("No se pudo crear ningún producto")
            }
        } catch (error: any) {
            console.error("Error al guardar productos:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Hubo un problema al guardar los productos. Inténtalo de nuevo.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const validateProduct = (product: ProductFields) => {
        const errors: string[] = [];

        if (!product.name) errors.push("El nombre es requerido");
        if (!product.sku) errors.push("El SKU es requerido");
        if (!product.price || Number(product.price) <= 0) errors.push("El precio debe ser mayor a 0");

        const numericFields = ["price", "cost", "weight", "minStock", "maxStock"];
        numericFields.forEach(field => {
            if (product[field] && isNaN(Number(product[field]))) {
                errors.push(`${field} debe ser un número válido`);
            }
        });

        if (product.minStock && product.maxStock) {
            if (Number(product.minStock) > Number(product.maxStock)) {
                errors.push("El stock mínimo no puede ser mayor al stock máximo");
            }
        }

        if (product.barcode && !/^[0-9]{8,14}$/.test(product.barcode)) {
            errors.push("El código de barras debe tener entre 8 y 14 dígitos");
        }

        return errors;
    };

    return (
        <div className="container max-w-6xl mx-auto pb-10">
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <h1 className="text-2xl font-bold">Carga Masiva de Productos</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            Selección de Tienda
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                                            <HelpCircle className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">
                                            Todos los productos creados se asignarán a esta tienda. Es un campo obligatorio.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </CardTitle>
                        <CardDescription>Selecciona la tienda donde se crearán los productos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="subaccountId">Tienda *</Label>
                            <Select
                                value={selectedSubaccount}
                                onValueChange={setSelectedSubaccount}
                                required
                                disabled={!!subaccountId} // Deshabilitar si ya viene un subaccountId
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tienda" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subaccounts.length > 0 ? (
                                        subaccounts.map((subaccount) => (
                                            <SelectItem key={subaccount.id} value={subaccount.id}>
                                                {subaccount.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-subaccounts" disabled>
                                            No hay tiendas disponibles. Por favor, crea una tienda primero.
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {subaccounts.length === 0 && (
                                <p className="text-sm text-destructive mt-1">
                                    No hay tiendas disponibles. Debes crear una tienda antes de continuar.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="manual">Carga Manual</TabsTrigger>
                        <TabsTrigger value="excel">Carga por Excel</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual">
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Carga Manual de Productos</CardTitle>
                                        <CardDescription>Ingresa los datos de cada producto manualmente</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Switch id="required-only" checked={requiredFieldsOnly} onCheckedChange={setRequiredFieldsOnly} />
                                            <Label htmlFor="required-only">Solo campos requeridos</Label>
                                        </div>
                                        <Button type="button" onClick={handleAddProduct} size="sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Añadir Producto
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Gestión de Categorías Mejorada */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-medium">Gestión de Categorías</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    placeholder="Nueva categoría"
                                                    value={newCategory}
                                                    onChange={(e) => setNewCategory(e.target.value)}
                                                    className="w-48"
                                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleCreateCategory}
                                                    disabled={!newCategory.trim()}
                                                >
                                                    Crear
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <ScrollArea className="h-[700px]">
                                        {manualProducts.map((product, index) => (
                                            <div key={index} className="mb-6 relative border rounded-lg p-4 bg-card">
                                                {/* Header del Producto */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={product.isActive ? "default" : "secondary"}>
                                                            Producto {index + 1}
                                                        </Badge>
                                                        {product.name && (
                                                            <span className="text-sm text-muted-foreground font-medium">
                                                                {product.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Label htmlFor={`active-${index}`} className="text-sm">Activo</Label>
                                                        <Switch
                                                            id={`active-${index}`}
                                                            checked={product.isActive}
                                                            onCheckedChange={(checked) => handleProductChange(index, "isActive", checked)}
                                                        />
                                                        {manualProducts.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveProduct(index)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Campos Básicos Siempre Visibles */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`name-${index}`} className="text-sm font-medium">
                                                            Nombre del Producto *
                                                        </Label>
                                                        <Input
                                                            id={`name-${index}`}
                                                            value={product.name}
                                                            onChange={(e) => handleProductChange(index, "name", e.target.value)}
                                                            placeholder="Ej: Laptop HP Pavilion"
                                                            required
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`sku-${index}`} className="text-sm font-medium">
                                                            SKU *
                                                        </Label>
                                                        <Input
                                                            id={`sku-${index}`}
                                                            value={product.sku}
                                                            onChange={(e) => handleProductChange(index, "sku", e.target.value)}
                                                            placeholder="Ej: LAP-HP-001"
                                                            required
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`price-${index}`} className="text-sm font-medium">
                                                            Precio de Venta *
                                                        </Label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                                            <Input
                                                                id={`price-${index}`}
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={product.price}
                                                                onChange={(e) => handleProductChange(index, "price", e.target.value)}
                                                                placeholder="0.00"
                                                                required
                                                                className="pl-8"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Campos Adicionales Condicionales */}
                                                {!requiredFieldsOnly && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`category-${index}`} className="text-sm font-medium">
                                                                Categoría
                                                            </Label>
                                                            <Select
                                                                value={product.categoryId}
                                                                onValueChange={(value) => handleProductChange(index, "categoryId", value)}
                                                            >
                                                                <SelectTrigger id={`category-${index}`}>
                                                                    <SelectValue placeholder="Seleccionar categoría" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="no-category">Sin categoría</SelectItem>
                                                                    {categories.map((category) => (
                                                                        <SelectItem key={category.id} value={category.id}>
                                                                            {category.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`brand-${index}`} className="text-sm font-medium">
                                                                Marca
                                                            </Label>
                                                            <Input
                                                                id={`brand-${index}`}
                                                                value={product.brand || ""}
                                                                onChange={(e) => handleProductChange(index, "brand", e.target.value)}
                                                                placeholder="Ej: HP, Samsung, Apple"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`quantity-${index}`} className="text-sm font-medium">
                                                                Cantidad Inicial
                                                            </Label>
                                                            <Input
                                                                id={`quantity-${index}`}
                                                                type="number"
                                                                min="0"
                                                                value={product.quantity}
                                                                onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Accordion para Información Detallada */}
                                                {!requiredFieldsOnly && (
                                                    <Accordion type="single" collapsible className="w-full">
                                                        {/* Información del Producto */}
                                                        <AccordionItem value="product-details">
                                                            <AccordionTrigger className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Package className="h-4 w-4" />
                                                                    Detalles del Producto
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`model-${index}`} className="text-sm font-medium">
                                                                            Modelo
                                                                        </Label>
                                                                        <Input
                                                                            id={`model-${index}`}
                                                                            value={product.model || ""}
                                                                            onChange={(e) => handleProductChange(index, "model", e.target.value)}
                                                                            placeholder="Ej: Pavilion 15-eh1xxx"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`barcode-${index}`} className="text-sm font-medium">
                                                                            Código de Barras
                                                                        </Label>
                                                                        <Input
                                                                            id={`barcode-${index}`}
                                                                            value={product.barcode}
                                                                            onChange={(e) => handleProductChange(index, "barcode", e.target.value)}
                                                                            placeholder="Ej: 123456789012"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2 md:col-span-2">
                                                                        <Label htmlFor={`description-${index}`} className="text-sm font-medium">
                                                                            Descripción
                                                                        </Label>
                                                                        <Textarea
                                                                            id={`description-${index}`}
                                                                            value={product.description}
                                                                            onChange={(e) => handleProductChange(index, "description", e.target.value)}
                                                                            placeholder="Describe las características principales del producto..."
                                                                            rows={3}
                                                                            className="resize-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>

                                                        {/* Inventario y Stock */}
                                                        <AccordionItem value="inventory-stock">
                                                            <AccordionTrigger className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Warehouse className="h-4 w-4" />
                                                                    Inventario y Stock
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`minStock-${index}`} className="text-sm font-medium">
                                                                            Stock Mínimo
                                                                        </Label>
                                                                        <Input
                                                                            id={`minStock-${index}`}
                                                                            type="number"
                                                                            min="0"
                                                                            value={product.minStock}
                                                                            onChange={(e) => handleProductChange(index, "minStock", e.target.value)}
                                                                            placeholder="5"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`maxStock-${index}`} className="text-sm font-medium">
                                                                            Stock Máximo
                                                                        </Label>
                                                                        <Input
                                                                            id={`maxStock-${index}`}
                                                                            type="number"
                                                                            min="0"
                                                                            value={product.maxStock || ""}
                                                                            onChange={(e) => handleProductChange(index, "maxStock", e.target.value)}
                                                                            placeholder="100"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`unit-${index}`} className="text-sm font-medium">
                                                                            Unidad de Medida
                                                                        </Label>
                                                                        <Select
                                                                            value={product.unit || "unidad"}
                                                                            onValueChange={(value) => handleProductChange(index, "unit", value)}
                                                                        >
                                                                            <SelectTrigger id={`unit-${index}`}>
                                                                                <SelectValue placeholder="Seleccionar unidad" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="unidad">Unidad</SelectItem>
                                                                                <SelectItem value="kg">Kilogramo</SelectItem>
                                                                                <SelectItem value="g">Gramo</SelectItem>
                                                                                <SelectItem value="l">Litro</SelectItem>
                                                                                <SelectItem value="ml">Mililitro</SelectItem>
                                                                                <SelectItem value="m">Metro</SelectItem>
                                                                                <SelectItem value="cm">Centímetro</SelectItem>
                                                                                <SelectItem value="caja">Caja</SelectItem>
                                                                                <SelectItem value="paquete">Paquete</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>

                                                        {/* Información Financiera */}
                                                        <AccordionItem value="financial-info">
                                                            <AccordionTrigger className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <DollarSign className="h-4 w-4" />
                                                                    Información Financiera
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`cost-${index}`} className="text-sm font-medium">
                                                                            Costo de Compra
                                                                        </Label>
                                                                        <div className="relative">
                                                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">$</span>
                                                                            <Input
                                                                                id={`cost-${index}`}
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0"
                                                                                value={product.cost}
                                                                                onChange={(e) => handleProductChange(index, "cost", e.target.value)}
                                                                                placeholder="0.00"
                                                                                className="pl-8"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`taxRate-${index}`} className="text-sm font-medium">
                                                                            Impuesto (%)
                                                                        </Label>
                                                                        <div className="relative">
                                                                            <Input
                                                                                id={`taxRate-${index}`}
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0"
                                                                                max="100"
                                                                                value={product.taxRate || ""}
                                                                                onChange={(e) => handleProductChange(index, "taxRate", e.target.value)}
                                                                                placeholder="19"
                                                                                className="pr-8"
                                                                            />
                                                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor={`margin-${index}`} className="text-sm font-medium">
                                                                            Margen (%)
                                                                        </Label>
                                                                        <div className="relative">
                                                                            <Input
                                                                                id={`margin-${index}`}
                                                                                type="number"
                                                                                step="0.01"
                                                                                min="0"
                                                                                value={product.margin || ""}
                                                                                onChange={(e) => handleProductChange(index, "margin", e.target.value)}
                                                                                placeholder="30"
                                                                                className="pr-8"
                                                                            />
                                                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">%</span>
                                                                        </div>
                                                                    </div>
                                                                    {/* Calculadora de Margen */}
                                                                    {product.cost && product.price && (
                                                                        <div className="md:col-span-2 lg:col-span-3">
                                                                            <div className="bg-muted p-3 rounded-md">
                                                                                <div className="flex items-center justify-between text-sm">
                                                                                    <span>Margen calculado:</span>
                                                                                    <span className="font-medium">
                                                                                        {((Number(product.price) - Number(product.cost)) / Number(product.price) * 100).toFixed(2)}%
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center justify-between text-sm mt-1">
                                                                                    <span>Ganancia por unidad:</span>
                                                                                    <span className="font-medium">
                                                                                        ${(Number(product.price) - Number(product.cost)).toFixed(2)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>

                                                        {/* Imagen del Producto */}
                                                        <AccordionItem value="product-image">
                                                            <AccordionTrigger className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <ImageIcon className="h-4 w-4" />
                                                                    Imagen del Producto
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="p-4">
                                                                    <div className="space-y-4">
                                                                        <Label className="text-sm font-medium">Imagen del Producto</Label>
                                                                        <div className="flex items-center gap-4">
                                                                            {product.productImage ? (
                                                                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                                                                                    <Image
                                                                                        src={product.productImage}
                                                                                        alt={product.name || "Producto"}
                                                                                        fill
                                                                                        className="object-cover"
                                                                                    />
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="destructive"
                                                                                        size="sm"
                                                                                        className="absolute top-2 right-2 p-1 h-auto"
                                                                                        onClick={() => handleProductChange(index, "productImage", "")}
                                                                                    >
                                                                                        <X className="h-3 w-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-32 h-32 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center">
                                                                                    <div className="text-center">
                                                                                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                                                        <p className="text-xs text-muted-foreground">Sin imagen</p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex-1">
                                                                                <UploadButton
                                                                                    endpoint="media"
                                                                                    onUploadBegin={() => {
                                                                                        setIsUploading(true)
                                                                                        toast({
                                                                                            title: "Subiendo imagen",
                                                                                            description: "Por favor espere mientras se sube la imagen...",
                                                                                        })
                                                                                    }}
                                                                                    onClientUploadComplete={(res) => {
                                                                                        setIsUploading(false)
                                                                                        if (res && res.length > 0) {
                                                                                            handleProductChange(index, "productImage", res[0].url)
                                                                                            toast({
                                                                                                title: "Imagen subida",
                                                                                                description: "La imagen se ha subido correctamente.",
                                                                                            })
                                                                                        }
                                                                                    }}
                                                                                    onUploadError={(error: Error) => {
                                                                                        setIsUploading(false)
                                                                                        console.error("Error de carga:", error)
                                                                                        toast({
                                                                                            variant: "destructive",
                                                                                            title: "Error al subir imagen",
                                                                                            description: error.message,
                                                                                        })
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                )}
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>


                    <TabsContent value="excel">
                        <Card>
                            <CardHeader>
                                <CardTitle>Carga por Archivo Excel</CardTitle>
                                <CardDescription>Sube un archivo Excel con los datos de tus productos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
                                        <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                                        <p className="mb-2 text-sm text-muted-foreground text-center">
                                            Arrastra y suelta tu archivo Excel aquí, o haz clic para seleccionarlo
                                        </p>
                                        <Input
                                            type="file"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileUpload}
                                            className="max-w-xs"
                                        />
                                        <div className="mt-4">
                                            <Button type="button" variant="outline" size="sm" onClick={downloadTemplateXLSX}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Descargar Plantilla Excel
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-muted p-4 rounded-md">
                                        <h3 className="text-sm font-medium mb-2">Instrucciones:</h3>
                                        <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                                            <li>El archivo debe estar en formato Excel (.xlsx, .xls).</li>
                                            <li>La primera fila debe contener los encabezados.</li>
                                            <li>Los campos obligatorios son: nombre, sku y precio.</li>
                                            <li>Utiliza la plantilla descargable como guía.</li>
                                            <li>Asegúrate de mapear correctamente las columnas.</li>
                                        </ul>
                                    </div>

                                    {excelFile ? (
                                        <div className="flex items-center">
                                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />
                                            Archivo: {excelFile.name}
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                            Selecciona un archivo Excel
                                        </div>
                                    )}

                                    {excelFile && excelHeaders.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">Mapeo de Campos</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Asigna cada columna de tu archivo Excel a un campo del producto. Los campos marcados con * son obligatorios.
                                            </p>

                                            {/* ... resto del código de mapeo ... */}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <Card>
                    <CardFooter>
                        <Button
                            type="submit"
                            disabled={
                                isLoading ||
                                !excelFile ||
                                excelPreview.length === 0 ||
                                !Object.values(columnMapping).includes("name") ||
                                !Object.values(columnMapping).includes("sku") ||
                                !Object.values(columnMapping).includes("price")
                            }
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>Importar {excelPreview.length} Productos</>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
