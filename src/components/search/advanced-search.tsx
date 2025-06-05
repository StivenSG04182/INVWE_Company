"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, X, Tag, BarChart4, ArrowUpDown } from "lucide-react"
import Image from "next/image"
import type { SearchFilter } from "@/lib/services/search-service"

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
    const [results, setResults] = useState([])
    const [totalResults, setTotalResults] = useState(0)
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [suggestions, setSuggestions] = useState([])
    const [categories, setCategories] = useState([])
    const [availableTags, setAvailableTags] = useState([])
    const [newTag, setNewTag] = useState("")

    // Cargar categorías y etiquetas disponibles
    useEffect(() => {
        loadCategories()
        loadAvailableTags()

        // Cargar filtros desde URL si existen
        const queryParam = searchParams.get("query")
        if (queryParam) {
            setQuery(queryParam)
            performSearch({
                query: queryParam,
                categoryId: searchParams.get("categoryId") || "all",
                inStock: searchParams.get("inStock") === "true",
                hasDiscount: searchParams.get("hasDiscount") === "true",
                isExpiring: searchParams.get("isExpiring") === "true",
                sortBy: (searchParams.get("sortBy") as any) || "name",
                sortOrder: (searchParams.get("sortOrder") as any) || "asc",
            })
        }
    }, [agencyId])

    // Cargar sugerencias al escribir
    useEffect(() => {
        if (query.length >= 2) {
            loadSuggestions(query)
        } else {
            setSuggestions([])
        }
    }, [query])

    const loadCategories = async () => {
        try {
            const response = await fetch(`/api/inventory/${agencyId}?type=categories`)
            const result = await response.json()

            if (result.success) {
                setCategories(result.data)
            }
        } catch (error) {
            console.error("Error al cargar categorías:", error)
        }
    }

    const loadAvailableTags = async () => {
        try {
            // Aquí podrías tener un endpoint específico para obtener todas las etiquetas
            // Por ahora, usamos un conjunto de etiquetas de ejemplo
            setAvailableTags([
                "Oferta",
                "Nuevo",
                "Popular",
                "Destacado",
                "Temporada",
                "Limitado",
                "Exclusivo",
                "Importado",
                "Nacional",
                "Ecológico",
            ])
        } catch (error) {
            console.error("Error al cargar etiquetas:", error)
        }
    }

    const loadSuggestions = async (query: string) => {
        try {
            const response = await fetch(`/api/search/${agencyId}?type=suggest&query=${encodeURIComponent(query)}`)
            const result = await response.json()

            if (result.success) {
                setSuggestions(result.data)
            }
        } catch (error) {
            console.error("Error al cargar sugerencias:", error)
        }
    }

    const performSearch = async (filter: SearchFilter) => {
        try {
            setIsLoading(true)

            // Construir URL con los filtros
            let url = `/api/search/${agencyId}?type=advanced`

            if (filter.query) url += `&query=${encodeURIComponent(filter.query)}`
            if (filter.categoryId) url += `&categoryId=${filter.categoryId}`
            if (filter.minPrice !== undefined) url += `&minPrice=${filter.minPrice}`
            if (filter.maxPrice !== undefined) url += `&maxPrice=${filter.maxPrice}`
            if (filter.inStock) url += `&inStock=true`
            if (filter.hasDiscount) url += `&hasDiscount=true`
            if (filter.isExpiring) url += `&isExpiring=true`
            if (filter.tags && filter.tags.length > 0) url += `&tags=${filter.tags.join(",")}`
            if (filter.sortBy) url += `&sortBy=${filter.sortBy}`
            if (filter.sortOrder) url += `&sortOrder=${filter.sortOrder}`

            // Paginación
            const limit = 20
            const offset = (page - 1) * limit
            url += `&limit=${limit}&offset=${offset}`

            const response = await fetch(url)
            const result = await response.json()

            if (result.success) {
                setResults(result.data.results)
                setTotalResults(result.data.total)
            }
        } catch (error) {
            console.error("Error al realizar búsqueda:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = () => {
        // Actualizar URL con los filtros
        const params = new URLSearchParams()
        if (query) params.set("query", query)
        if (categoryId) params.set("categoryId", categoryId)
        if (inStock) params.set("inStock", "true")
        if (hasDiscount) params.set("hasDiscount", "true")
        if (isExpiring) params.set("isExpiring", "true")
        if (tags.length > 0) params.set("tags", tags.join(","))
        params.set("sortBy", sortBy)
        params.set("sortOrder", sortOrder)

        router.push(`?${params.toString()}`)

        // Realizar búsqueda
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

        router.push("")
    }

    const addTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag])
            setNewTag("")
        }
    }

    const removeTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag))
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Búsqueda Avanzada</CardTitle>
                    <CardDescription>Encuentra productos con filtros específicos</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Barra de búsqueda principal */}
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar productos por nombre, SKU o descripción..."
                                className="pl-8"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />

                            {/* Sugerencias de búsqueda */}
                            {suggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-md">
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="px-4 py-2 hover:bg-muted cursor-pointer"
                                            onClick={() => {
                                                setQuery(suggestion)
                                                setSuggestions([])
                                            }}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Filtro por categoría */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Categoría</label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las categorías" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filtro por rango de precios */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Rango de precios</label>
                                <div className="pt-4 px-2">
                                    <Slider value={priceRange} min={0} max={1000} step={10} onValueChange={setPriceRange} />
                                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                                        <span>${priceRange[0]}</span>
                                        <span>${priceRange[1]}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Filtro por ordenamiento */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ordenar por</label>
                                <div className="flex gap-2">
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="name">Nombre</SelectItem>
                                            <SelectItem value="price">Precio</SelectItem>
                                            <SelectItem value="stock">Stock</SelectItem>
                                            <SelectItem value="createdAt">Fecha de creación</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                    >
                                        <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Filtros adicionales */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="inStock"
                                    checked={inStock}
                                    onCheckedChange={(checked) => setInStock(checked as boolean)}
                                />
                                <label htmlFor="inStock" className="text-sm font-medium">
                                    Solo productos en stock
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hasDiscount"
                                    checked={hasDiscount}
                                    onCheckedChange={(checked) => setHasDiscount(checked as boolean)}
                                />
                                <label htmlFor="hasDiscount" className="text-sm font-medium">
                                    Con descuento
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isExpiring"
                                    checked={isExpiring}
                                    onCheckedChange={(checked) => setIsExpiring(checked as boolean)}
                                />
                                <label htmlFor="isExpiring" className="text-sm font-medium">
                                    Por vencer
                                </label>
                            </div>
                        </div>

                        {/* Filtro por etiquetas */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Etiquetas</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                        <Tag className="h-3 w-3" />
                                        {tag}
                                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Select value={newTag} onValueChange={setNewTag}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Seleccionar etiqueta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTags.map((tag) => (
                                            <SelectItem key={tag} value={tag}>
                                                {tag}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="button" onClick={addTag} disabled={!newTag}>
                                    Añadir
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-between pt-2">
                            <Button variant="outline" onClick={clearFilters}>
                                Limpiar filtros
                            </Button>
                            <Button onClick={handleSearch}>
                                <Search className="h-4 w-4 mr-2" />
                                Buscar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resultados de búsqueda */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Resultados</CardTitle>
                            <CardDescription>{isLoading ? "Buscando..." : `${totalResults} productos encontrados`}</CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <BarChart4 className="h-4 w-4 mr-2" />
                                Ver como gráfico
                            </Button>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtros aplicados (
                                {
                                    [
                                        query && "búsqueda",
                                        categoryId !== "all" && "categoría",
                                        inStock && "en stock",
                                        hasDiscount && "con descuento",
                                        isExpiring && "por vencer",
                                        tags.length > 0 && "etiquetas",
                                    ].filter(Boolean).length
                                }
                                )
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-8">
                            <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                            <h3 className="mt-4 text-lg font-medium">No se encontraron resultados</h3>
                            <p className="text-muted-foreground">Intenta con otros términos de búsqueda o ajusta los filtros</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {results.map((product) => (
                                <Card key={product.id} className="overflow-hidden">
                                    <div className="aspect-video relative bg-muted">
                                        {product.images && product.images.length > 0 ? (
                                            <Image
                                                src={product.images[0] || "/placeholder.svg"}
                                                alt={product.name}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">Sin imagen</div>
                                        )}

                                        {/* Badges */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                                            {product.hasActiveDiscount && <Badge className="bg-green-600">Descuento</Badge>}
                                            {product.isExpiring && (
                                                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                                                    Por vencer
                                                </Badge>
                                            )}
                                            {product.isLowStock && <Badge variant="destructive">Stock bajo</Badge>}
                                        </div>
                                    </div>

                                    <CardContent className="p-4">
                                        <h3 className="font-medium line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{product.sku}</p>

                                        <div className="flex justify-between items-center mt-2">
                                            <span className="font-bold">${product.price.toFixed(2)}</span>
                                            <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                                        </div>

                                        {product.tags && product.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {product.tags.slice(0, 3).map((tag, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {product.tags.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{product.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Paginación */}
                    {totalResults > 0 && (
                        <div className="flex justify-center mt-6">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page * 20 >= totalResults}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
