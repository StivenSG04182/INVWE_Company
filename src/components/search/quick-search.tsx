"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Search, Filter, Grid, List, Eye, ShoppingCart } from "lucide-react"
import { getProducts } from "@/lib/queries2"

interface QuickSearchProps {
    agencyId: string
    onProductSelect?: (product: any) => void
}

export default function QuickSearch({ agencyId, onProductSelect }: QuickSearchProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showResults, setShowResults] = useState(false)

    // Realizar búsqueda rápida
    const performQuickSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([])
            setShowResults(false)
            return
        }

        try {
            setIsLoading(true)
            
            // Obtener productos y filtrar por búsqueda
            const products = await getProducts(agencyId)
            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.barcode?.includes(searchQuery)
            )

            setResults(filteredProducts.slice(0, 10)) // Limitar a 10 resultados
            setShowResults(true)
        } catch (error) {
            console.error("Error en búsqueda rápida:", error)
            toast({
                title: "Error",
                description: "No se pudo realizar la búsqueda",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [agencyId])

    // Manejar cambio en la búsqueda
    const handleSearchChange = (value: string) => {
        setQuery(value)
        if (value.trim()) {
            performQuickSearch(value)
        } else {
            setResults([])
            setShowResults(false)
        }
    }

    // Manejar selección de producto
    const handleProductSelect = (product: any) => {
        if (onProductSelect) {
            onProductSelect(product)
        }
        setShowResults(false)
        setQuery("")
        toast({
            title: "Producto seleccionado",
            description: product.name,
        })
    }

    // Cerrar resultados
    const closeResults = () => {
        setShowResults(false)
    }

    return (
        <div className="relative">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Search className="w-5 h-5" />
                        <span>Búsqueda Rápida</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <div className="flex space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar productos por nombre, SKU, código de barras..."
                                    value={query}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                    onFocus={() => {
                                        if (results.length > 0) setShowResults(true)
                                    }}
                                />
                                {isLoading && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                            >
                                {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                            </Button>
                        </div>

                        {/* Resultados de búsqueda */}
                        {showResults && results.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                                <div className="p-4 border-b">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={closeResults}
                                        >
                                            Cerrar
                                        </Button>
                                    </div>
                                </div>
                                
                                {viewMode === "grid" ? (
                                    <div className="p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {results.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() => handleProductSelect(product)}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            {product.images && product.images.length > 0 ? (
                                                                <img
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <span className="text-gray-400 text-xs">Sin imagen</span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-sm truncate">{product.name}</h4>
                                                            <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="font-bold text-green-600">
                                                                    ${product.price.toFixed(2)}
                                                                </span>
                                                                <Badge 
                                                                    variant={product.quantity > 0 ? "default" : "destructive"}
                                                                    className="text-xs"
                                                                >
                                                                    {product.quantity} en stock
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4">
                                        <div className="space-y-2">
                                            {results.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                                    onClick={() => handleProductSelect(product)}
                                                >
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">Sin imagen</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm truncate">{product.name}</h4>
                                                        <p className="text-xs text-gray-600">SKU: {product.sku}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-green-600 text-sm">
                                                            ${product.price.toFixed(2)}
                                                        </div>
                                                        <Badge 
                                                            variant={product.quantity > 0 ? "default" : "destructive"}
                                                            className="text-xs"
                                                        >
                                                            {product.quantity} en stock
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sin resultados */}
                        {showResults && results.length === 0 && !isLoading && query.trim() && (
                            <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                                <div className="p-4 text-center">
                                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-600">No se encontraron productos</p>
                                    <p className="text-sm text-gray-500">Intenta con otros términos de búsqueda</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Overlay para cerrar resultados al hacer clic fuera */}
            {showResults && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={closeResults}
                />
            )}
        </div>
    )
} 