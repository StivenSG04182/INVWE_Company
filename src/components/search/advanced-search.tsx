"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { 
    Search, 
    Filter, 
    Grid, 
    List, 
    Star, 
    ShoppingCart, 
    Eye,
    Download,
    SlidersHorizontal
} from "lucide-react"
import { getCategories, getProducts } from "@/lib/queries2"

interface AdvancedSearchProps {
    agencyId: string
}

export default function AdvancedSearch({ agencyId }: AdvancedSearchProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Estados para los filtros
    const [query, setQuery] = useState("")
    const [categoryId, setCategoryId] = useState("all")
    const [priceRange, setPriceRange] = useState([0, 1000])
    const [inStock, setInStock] = useState(true)
    const [hasDiscount, setHasDiscount] = useState(false)
    const [isExpiring, setIsExpiring] = useState(false)
    const [tags, setTags] = useState<string[]>([])
    const [sortBy, setSortBy] = useState<string>("name")
    const [sortOrder, setSortOrder] = useState<string>("asc")

    // Estados para los resultados
    const [results, setResults] = useState<any[]>([])
    const [totalResults, setTotalResults] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    // Estados para los datos de filtros
    const [categories, setCategories] = useState<any[]>([])
    const [availableTags, setAvailableTags] = useState<string[]>([])
    const [suggestions, setSuggestions] = useState<string[]>([])

    // Cargar categorías disponibles
    const loadAvailableTags = useCallback(async () => {
        try {
            // Obtener productos para extraer tags únicos
            const products = await getProducts(agencyId)
            const allTags = products.flatMap(product => product.tags || [])
            const uniqueTags = [...new Set(allTags)]
            setAvailableTags(uniqueTags)
        } catch (error) {
            console.error("Error cargando tags:", error)
        }
    }, [agencyId])

    // Cargar categorías
    const loadCategories = useCallback(async () => {
        try {
            const categoriesData = await getCategories(agencyId)
            setCategories(categoriesData)
        } catch (error) {
            console.error("Error cargando categorías:", error)
        }
    }, [agencyId])

    // Realizar búsqueda
    const performSearch = useCallback(async (searchParams: any) => {
        try {
            setIsLoading(true)
            
            // Obtener productos con filtros
            const products = await getProducts(agencyId)
            
            // Aplicar filtros
            let filteredProducts = products.filter(product => {
                // Filtro por búsqueda
                const matchesQuery = !searchParams.query || 
                    product.name.toLowerCase().includes(searchParams.query.toLowerCase()) ||
                    product.sku?.toLowerCase().includes(searchParams.query.toLowerCase()) ||
                    product.description?.toLowerCase().includes(searchParams.query.toLowerCase())

                // Filtro por categoría
                const matchesCategory = searchParams.categoryId === "all" || 
                    product.categoryId === searchParams.categoryId

                // Filtro por precio
                const matchesPrice = product.price >= searchParams.minPrice && 
                    product.price <= searchParams.maxPrice

                // Filtro por stock
                const matchesStock = !searchParams.inStock || (product.quantity || 0) > 0

                // Filtro por descuento
                const matchesDiscount = !searchParams.hasDiscount || 
                    (product.discount && product.discount > 0)

                // Filtro por tags
                const matchesTags = searchParams.tags.length === 0 || 
                    searchParams.tags.some((tag: string) => product.tags?.includes(tag))

                return matchesQuery && matchesCategory && matchesPrice && 
                       matchesStock && matchesDiscount && matchesTags
            })

            // Aplicar ordenamiento
            filteredProducts.sort((a, b) => {
                let aValue, bValue
                
                switch (searchParams.sortBy) {
                    case "name":
                        aValue = a.name.toLowerCase()
                        bValue = b.name.toLowerCase()
                        break
                    case "price":
                        aValue = a.price
                        bValue = b.price
                        break
                    case "stock":
                        aValue = a.quantity || 0
                        bValue = b.quantity || 0
                        break
                    case "created":
                        aValue = new Date(a.createdAt).getTime()
                        bValue = new Date(b.createdAt).getTime()
                        break
                    default:
                        aValue = a.name.toLowerCase()
                        bValue = b.name.toLowerCase()
                }

                if (searchParams.sortOrder === "asc") {
                    return aValue > bValue ? 1 : -1
                } else {
                    return aValue < bValue ? 1 : -1
                }
            })

            setResults(filteredProducts)
            setTotalResults(filteredProducts.length)
        } catch (error) {
            console.error("Error realizando búsqueda:", error)
            toast({
                title: "Error",
                description: "No se pudo realizar la búsqueda",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [agencyId])

    // Cargar sugerencias
    const loadSuggestions = useCallback(async (query: string) => {
        try {
            const products = await getProducts(agencyId)
            const suggestions = products
                .filter(product => 
                    product.name.toLowerCase().includes(query.toLowerCase()) ||
                    product.sku?.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5)
                .map(product => product.name)
            
            setSuggestions(suggestions)
        } catch (error) {
            console.error("Error cargando sugerencias:", error)
        }
    }, [agencyId])

    // Cargar datos iniciales y realizar búsqueda inicial
    useEffect(() => {
        if (agencyId) {
            loadAvailableTags()
            loadCategories()
            performSearch({
                query,
                categoryId,
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                inStock,
                hasDiscount,
                isExpiring,
                tags,
                sortBy: sortBy as any,
                sortOrder: sortOrder as any,
            })
        }
    }, [agencyId, loadAvailableTags, loadCategories, performSearch, searchParams, query, categoryId, priceRange, inStock, hasDiscount, isExpiring, tags, sortBy, sortOrder])

    // Cargar sugerencias al escribir
    useEffect(() => {
        if (query.length >= 2) {
            loadSuggestions(query)
        } else {
            setSuggestions([])
        }
    }, [query, loadSuggestions])

    // Manejar cambio de filtros
    const handleFilterChange = (filterName: string, value: any) => {
        switch (filterName) {
            case "query":
                setQuery(value)
                break
            case "categoryId":
                setCategoryId(value)
                break
            case "priceRange":
                setPriceRange(value)
                break
            case "inStock":
                setInStock(value)
                break
            case "hasDiscount":
                setHasDiscount(value)
                break
            case "isExpiring":
                setIsExpiring(value)
                break
            case "tags":
                setTags(value)
                break
            case "sortBy":
                setSortBy(value)
                break
            case "sortOrder":
                setSortOrder(value)
                break
        }
    }

    // Limpiar filtros
    const clearFilters = () => {
        setQuery("")
        setCategoryId("all")
        setPriceRange([0, 1000])
        setInStock(true)
        setHasDiscount(false)
        setIsExpiring(false)
        setTags([])
        setSortBy("name")
        setSortOrder("asc")
    }

    // Exportar resultados
    const exportResults = () => {
        const csvContent = [
            ["Nombre", "SKU", "Precio", "Stock", "Categoría", "Descripción"],
            ...results.map(product => [
                product.name,
                product.sku || "",
                product.price.toString(),
                product.quantity.toString(),
                product.Category?.name || "",
                product.description || ""
            ])
        ].map(row => row.join(",")).join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `busqueda_${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Búsqueda Avanzada</h1>
                <p className="text-gray-600">Encuentra productos con filtros avanzados</p>
            </div>

            {/* Barra de búsqueda principal */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Buscar productos por nombre, SKU o descripción..."
                        value={query}
                        onChange={(e) => handleFilterChange("query", e.target.value)}
                        className="pl-10 pr-4 py-3 text-lg"
                    />
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleFilterChange("query", suggestion)}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Filtros */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">Filtros</h2>
                        </div>
                        <Button variant="outline" onClick={clearFilters}>
                            Limpiar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Categoría */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Categoría</label>
                            <Select value={categoryId} onValueChange={(value) => handleFilterChange("categoryId", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las categorías" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las categorías</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Rango de precio */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Rango de Precio</label>
                            <div className="flex space-x-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange[0]}
                                    onChange={(e) => handleFilterChange("priceRange", [parseInt(e.target.value) || 0, priceRange[1]])}
                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange[1]}
                                    onChange={(e) => handleFilterChange("priceRange", [priceRange[0], parseInt(e.target.value) || 1000])}
                                />
                            </div>
                        </div>

                        {/* Ordenamiento */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Ordenar por</label>
                            <Select value={sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Nombre</SelectItem>
                                    <SelectItem value="price">Precio</SelectItem>
                                    <SelectItem value="stock">Stock</SelectItem>
                                    <SelectItem value="created">Fecha de creación</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Orden */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Orden</label>
                            <Select value={sortOrder} onValueChange={(value) => handleFilterChange("sortOrder", value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asc">Ascendente</SelectItem>
                                    <SelectItem value="desc">Descendente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Filtros adicionales */}
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="inStock"
                                    checked={inStock}
                                    onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                                    className="rounded"
                                />
                                <label htmlFor="inStock" className="text-sm">Solo en stock</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="hasDiscount"
                                    checked={hasDiscount}
                                    onChange={(e) => handleFilterChange("hasDiscount", e.target.checked)}
                                    className="rounded"
                                />
                                <label htmlFor="hasDiscount" className="text-sm">Con descuento</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isExpiring"
                                    checked={isExpiring}
                                    onChange={(e) => handleFilterChange("isExpiring", e.target.checked)}
                                    className="rounded"
                                />
                                <label htmlFor="isExpiring" className="text-sm">Por vencer</label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resultados */}
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold">
                            Resultados ({totalResults})
                        </h3>
                        {isLoading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportResults}>
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Grid/Lista de resultados */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {results.map((product) => (
                        <Card key={product.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <span className="text-gray-400">Sin imagen</span>
                                    )}
                                </div>
                                <h3 className="font-semibold mb-2 truncate">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-lg font-bold text-green-600">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                                        {product.quantity} en stock
                                    </Badge>
                                </div>
                                {product.discount > 0 && (
                                    <Badge variant="secondary" className="mb-2">
                                        -{product.discount}% descuento
                                    </Badge>
                                )}
                                <div className="flex space-x-2">
                                    <Button size="sm" className="flex-1">
                                        <Eye className="w-4 h-4 mr-1" />
                                        Ver
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <ShoppingCart className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {results.map((product) => (
                        <Card key={product.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
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
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">
                                            ${product.price.toFixed(2)}
                                        </div>
                                        <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                                            {product.quantity} en stock
                                        </Badge>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm">
                                            <Eye className="w-4 h-4 mr-1" />
                                            Ver
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            <ShoppingCart className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {results.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No se encontraron resultados
                    </h3>
                    <p className="text-gray-500">
                        Intenta ajustar los filtros de búsqueda
                    </p>
                </div>
            )}
        </div>
    )
}
