"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Search, Camera, X, CheckCircle, AlertCircle } from "lucide-react"
import { getProducts } from "@/lib/queries2"

interface BarcodeScannerProps {
    agencyId: string
    onProductFound?: (product: any) => void
}

export default function BarcodeScanner({ agencyId, onProductFound }: BarcodeScannerProps) {
    const [scanning, setScanning] = useState(false)
    const [barcode, setBarcode] = useState("")
    const [product, setProduct] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    // Buscar producto por código de barras
    const searchByBarcode = useCallback(async (code: string) => {
        try {
            setIsLoading(true)
            setError("")

            // Obtener todos los productos y filtrar por código de barras
            const products = await getProducts(agencyId)
            const foundProduct = products.find(p => p.barcode === code)

            if (foundProduct) {
                setProduct(foundProduct)
                if (onProductFound) {
                    onProductFound(foundProduct)
                }
                toast({
                    title: "Producto encontrado",
                    description: foundProduct.name,
                })
            } else {
                setProduct(null)
                setError("No se encontró ningún producto con este código de barras")
                toast({
                    title: "Producto no encontrado",
                    description: "El código de barras no corresponde a ningún producto registrado",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error buscando producto:", error)
            setError("Error al buscar el producto")
            toast({
                title: "Error",
                description: "No se pudo buscar el producto",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [agencyId, onProductFound])

    // Manejar envío del formulario
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (barcode.trim()) {
            searchByBarcode(barcode.trim())
        }
    }

    // Simular escaneo de código de barras
    const simulateScan = () => {
        setScanning(true)
        // Simular un código de barras de ejemplo
        const mockBarcode = "1234567890123"
        setBarcode(mockBarcode)
        
        setTimeout(() => {
            setScanning(false)
            searchByBarcode(mockBarcode)
        }, 1000)
    }

    // Limpiar resultados
    const clearResults = () => {
        setProduct(null)
        setBarcode("")
        setError("")
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Camera className="w-5 h-5" />
                        <span>Escáner de Código de Barras</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Ingresa o escanea el código de barras..."
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                disabled={!barcode.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={simulateScan}
                                disabled={scanning || isLoading}
                            >
                                {scanning ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Resultados */}
            {product && (
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <CardTitle className="text-green-800">Producto Encontrado</CardTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearResults}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                                <p className="text-gray-600 mb-2">SKU: {product.sku}</p>
                                <p className="text-gray-600 mb-2">Código: {product.barcode}</p>
                                {product.description && (
                                    <p className="text-gray-600 mb-4">{product.description}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-600 mb-2">
                                    ${product.price.toFixed(2)}
                                </div>
                                <Badge 
                                    variant={product.quantity > 0 ? "default" : "destructive"}
                                    className="mb-2"
                                >
                                    {product.quantity} en stock
                                </Badge>
                                {product.discount > 0 && (
                                    <Badge variant="secondary" className="ml-2">
                                        -{product.discount}% descuento
                                    </Badge>
                                )}
                                {product.Category && (
                                    <div className="text-sm text-gray-600 mt-2">
                                        Categoría: {product.Category.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <CardTitle className="text-red-800">Error</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-700">{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={clearResults}
                        >
                            Intentar de nuevo
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Instrucciones */}
            <Card>
                <CardHeader>
                    <CardTitle>Instrucciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>• Ingresa manualmente el código de barras en el campo de texto</p>
                        <p>• Usa el botón de cámara para simular un escaneo</p>
                        <p>• El sistema buscará automáticamente el producto en la base de datos</p>
                        <p>• Si el producto existe, se mostrarán todos sus detalles</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
