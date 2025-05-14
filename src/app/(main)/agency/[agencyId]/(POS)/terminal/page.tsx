"use client"

import { useState, useEffect, useRef } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    ShoppingCart,
    DollarSign,
    CreditCard,
    Package,
    User,
    Plus,
    Minus,
    Trash2,
    Receipt,
    Save,
    Calculator,
    Search,
    BarChart3,
    Clock,
    Filter,
    UserPlus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, FileText } from "lucide-react"
import { toast } from "sonner"
import { getAuthUserDetails } from "@/lib/queries"

const TerminalPage = ({ params }: { params: { agencyId: string } }) => {
    const agencyId = params.agencyId
    const [user, setUser] = useState(null)
    
    // Redirigir si no hay usuario después de cargar los datos
    useEffect(() => {
        if (user === null) return; // Aún cargando
        if (!user) redirect("/sign-in");
    }, [user])
    const [cartOpen, setCartOpen] = useState(false)
    const [newClientOpen, setNewClientOpen] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [selectedClient, setSelectedClient] = useState({
        name: "Cliente General",
        id: null,
    })
    const [paymentMethod, setPaymentMethod] = useState("")
    const [amountReceived, setAmountReceived] = useState("")
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [savedSalesOpen, setSavedSalesOpen] = useState(false)
    const [savedSales, setSavedSales] = useState([])
    const [selectedProducts2, setSelectedProducts2] = useState([]) // IDs de productos seleccionados
    
    // Estados para datos reales
    const [products, setProducts] = useState([])
    const [clients, setClients] = useState([])
    const [categories, setCategories] = useState([{ id: "Todos", name: "Todos" }])
    const [subcuentas, setSubcuentas] = useState(["Todas"])
    const [selectedArea, setSelectedArea] = useState("")
    const [areas, setAreas] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("Todos")

    // Referencia para detectar clics fuera del modal
    const modalRef = useRef(null)

    // Cargar datos del usuario autenticado
    useEffect(() => {
        const loadUser = async () => {
            try {
                // Obtener detalles del usuario autenticado
                const userDetails = await getAuthUserDetails()
                setUser(userDetails)
            } catch (error) {
                console.error("Error loading user:", error)
            }
        }

        loadUser()
    }, [])

    // Guardar el estado del carrito cuando se cierra
    useEffect(() => {
        // Cargar carrito guardado al iniciar
        const savedCart = localStorage.getItem("savedCart")
        if (savedCart) {
            try {
                setSelectedProducts(JSON.parse(savedCart))
            } catch (e) {
                console.error("Error parsing saved cart", e)
            }
        }
    }, [])

    // Función para guardar el carrito actual en la base de datos
    const saveCartState = async () => {
        // Solo guardar si hay productos en el carrito
        if (selectedProducts.length > 0) {
            try {
                const response = await fetch('/api/pos/saved-sales', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        agencyId,
                        areaId: selectedArea,
                        products: selectedProducts,
                        client: selectedClient
                    })
                })

                const result = await response.json()

                if (result.success) {
                    toast.success("Venta guardada correctamente")
                    // Actualizar la lista de ventas guardadas
                    loadSavedSales()
                } else {
                    console.error("Error guardando venta:", result.error)
                    toast.error("Error al guardar la venta")
                }
            } catch (error) {
                console.error("Error saving cart:", error)
                toast.error("Error al guardar la venta")
            }
        }
    }

    // Función para procesar la venta
    const [isProcessing, setIsProcessing] = useState(false)

    const processSale = async () => {
        if (selectedProducts.length === 0) return

        // Verificar que haya un área seleccionada
        if (!selectedArea) {
            toast.error("Debes seleccionar un área para procesar la venta")
            return
        }

        try {
            setIsProcessing(true)

            // Verificar stock disponible antes de procesar
            for (const product of selectedProducts) {
                const productData = products.find(p => p.id === product.id)
                if (!productData) {
                    toast.error(`Producto no encontrado: ${product.name}`)
                    setIsProcessing(false)
                    return
                }

                if (productData.stock < product.quantity) {
                    toast.error(`Stock insuficiente para ${product.name}. Disponible: ${productData.stock}`)
                    setIsProcessing(false)
                    return
                }
            }

            // Preparar datos para la API
            const saleData = {
                agencyId,
                areaId: selectedArea,
                products: selectedProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    quantity: p.quantity
                })),
                client: selectedClient,
                paymentMethod: paymentMethod || "CASH",
                total: total
            }

            // Enviar a la API
            const response = await fetch('/api/pos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(saleData)
            })

            const result = await response.json()

            if (result.success) {
                // Limpiar carrito
                clearCart()
                setCartOpen(false)

                // Mostrar mensaje de éxito
                toast.success("Venta procesada correctamente")

                // Actualizar la lista de productos para reflejar el nuevo stock
                const loadProducts = async () => {
                    try {
                        let url = `/api/pos?agencyId=${agencyId}`
                        if (selectedArea) url += `&areaId=${selectedArea}`
                        if (selectedCategory && selectedCategory !== "Todos") url += `&categoryId=${selectedCategory}`
                        if (searchTerm) url += `&search=${searchTerm}`

                        const response = await fetch(url)
                        const result = await response.json()

                        if (result.success) {
                            const productsWithStock = result.data.map(product => ({
                                id: product.id,
                                name: product.name,
                                price: parseFloat(product.price),
                                sku: product.sku,
                                description: product.description,
                                stock: product.stock,
                                categoryId: product.categoryId,
                                categoryName: product.categoryName || "Sin categoría",
                                images: product.images || []
                            }))
                            setProducts(productsWithStock)
                        }
                    } catch (error) {
                        console.error("Error actualizando productos:", error)
                    }
                }

                loadProducts()

                // Generar factura si es necesario
                if (selectedClient.id) {
                    try {
                        // Crear factura
                        const invoiceResponse = await fetch('/api/billing/invoices', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                agencyId,
                                customerId: selectedClient.id,
                                items: selectedProducts.map(p => ({
                                    productId: p.id,
                                    description: p.name,
                                    quantity: p.quantity,
                                    unitPrice: p.price,
                                    subtotal: p.subtotal
                                })),
                                subtotal: subtotal,
                                tax: iva,
                                total: total,
                                notes: `Venta POS - ${new Date().toLocaleDateString()}`
                            })
                        })

                        const invoiceResult = await invoiceResponse.json()

                        if (invoiceResult.success) {
                            toast.success("Factura generada correctamente")

                            // Enviar factura por correo si hay email
                            if (selectedClient.email) {
                                await fetch(`/api/billing/invoices/${invoiceResult.data.id}/send-email`, {
                                    method: 'POST'
                                })
                                toast.success(`Factura enviada a ${selectedClient.email}`)
                            }
                        }
                    } catch (error) {
                        console.error("Error generando factura:", error)
                        toast.error("Error al generar la factura")
                    }
                }
            } else {
                toast.error(result.error || "Error al procesar la venta")
            }
        } catch (error) {
            console.error("Error processing sale:", error)
            toast.error("Error al procesar la venta")
        } finally {
            setIsProcessing(false)
        }
    }


    // Función para cargar una venta guardada
    const loadSavedSale = (sale) => {
        setSelectedProducts(sale.products)
        setSelectedProducts2(sale.products.map((p) => p.id))
        setSelectedClient(sale.client || { name: "Cliente General", id: null })
        setSavedSalesOpen(false)
        setCartOpen(true)
    }

    // Función para cargar ventas guardadas desde la API
    const loadSavedSales = async () => {
        try {
            const response = await fetch(`/api/pos/saved-sales?agencyId=${agencyId}${selectedArea ? `&areaId=${selectedArea}` : ''}`)
            const result = await response.json()

            if (result.success) {
                setSavedSales(result.data)
            } else {
                console.error("Error cargando ventas guardadas:", result.error)
                toast.error("Error al cargar ventas guardadas")
            }
        } catch (error) {
            console.error("Error fetching saved sales:", error)
            toast.error("Error al cargar ventas guardadas")
        }
    }

    // Función para eliminar una venta guardada
    const deleteSavedSale = async (id) => {
        try {
            const response = await fetch(`/api/pos/saved-sales?id=${id}`, {
                method: 'DELETE'
            })

            const result = await response.json()

            if (result.success) {
                toast.success("Venta eliminada correctamente")
                setSavedSales((prev) => prev.filter((sale) => sale.id !== id))
            } else {
                console.error("Error eliminando venta:", result.error)
                toast.error("Error al eliminar la venta")
            }
        } catch (error) {
            console.error("Error deleting saved sale:", error)
            toast.error("Error al eliminar la venta")
        }
    }
    
    // Cargar ventas guardadas al iniciar o cuando cambia el área seleccionada
    useEffect(() => {
        if (agencyId && selectedArea) {
            loadSavedSales()
        }
    }, [agencyId, selectedArea])

    // Manejar clic fuera del modal para cerrarlo
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                if (cartOpen) {
                    saveCartState()
                    setCartOpen(false)
                }
                if (newClientOpen) {
                    setNewClientOpen(false)
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [cartOpen, newClientOpen, selectedProducts])

    // Calcular totales
    const subtotal = selectedProducts.reduce((sum, product) => sum + product.subtotal, 0)
    const iva = subtotal * 0.19
    const total = subtotal + iva

    // Función para actualizar cantidad de producto
    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return

        // Obtener el producto del carrito
        const product = selectedProducts.find(p => p.id === id)
        if (!product) return

        // Obtener datos actualizados del producto (stock actual)
        const productData = products.find(p => p.id === id)
        if (!productData) return

        // Verificar si hay suficiente stock
        if (newQuantity > productData.stock) {
            toast.error(`Solo hay ${productData.stock} unidades disponibles de ${product.name}`)
            return
        }

        setSelectedProducts((prev) =>
            prev.map((product) =>
                product.id === id
                    ? {
                        ...product,
                        quantity: newQuantity,
                        subtotal: product.price * newQuantity,
                        stock: productData.stock, // Actualizar el stock disponible
                    }
                    : product,
            ),
        )
    }

    // Función para eliminar producto
    const removeProduct = (id) => {
        setSelectedProducts((prev) => prev.filter((product) => product.id !== id))
        setSelectedProducts2((prev) => prev.filter((productId) => productId !== id))
    }

    // Función para vaciar carrito
    const clearCart = () => {
        setSelectedProducts([])
        setSelectedProducts2([])
    }

    // Función para seleccionar o deseleccionar un producto
    const toggleProductSelection = (product) => {
        // Verificar si hay stock disponible
        if (!selectedProducts2.includes(product.id) && product.stock <= 0) {
            toast.error(`No hay stock disponible de ${product.name}`)
            return
        }

        // Si ya está en el carrito, removerlo (deseleccionar)
        if (selectedProducts2.includes(product.id)) {
            removeProduct(product.id)
        } else {
            // Verificar que haya un área seleccionada
            if (!selectedArea) {
                toast.error("Debes seleccionar un área para agregar productos")
                return
            }

            // Agregar nuevo producto
            setSelectedProducts((prev) => [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    quantity: 1,
                    subtotal: Number(product.price),
                    stock: product.stock, // Guardar el stock disponible
                },
            ])
            setSelectedProducts2((prev) => [...prev, product.id])
        }
    }

    // Aquí se utilizan las funciones definidas anteriormente

    // Cargar productos desde la API
    useEffect(() => {
        const loadProducts = async () => {
            if (!agencyId) return

            try {
                setIsLoading(true)
                // Construir URL con parámetros de filtro
                let url = `/api/pos?agencyId=${agencyId}`
                if (selectedArea) url += `&areaId=${selectedArea}`
                if (selectedCategory && selectedCategory !== "Todos") url += `&categoryId=${selectedCategory}`
                if (searchTerm) url += `&search=${searchTerm}`

                const response = await fetch(url)
                const result = await response.json()

                if (result.success) {
                    // Transformar los datos para incluir el stock disponible
                    const productsWithStock = result.data.map(product => ({
                        id: product.id,
                        name: product.name,
                        price: parseFloat(product.price),
                        sku: product.sku,
                        description: product.description,
                        stock: product.stock,
                        categoryId: product.categoryId,
                        categoryName: product.categoryName || "Sin categoría",
                        images: product.images || []
                    }))
                    setProducts(productsWithStock)
                } else {
                    console.error("Error loading products:", result.error)
                    toast.error("Error al cargar productos")
                }
            } catch (error) {
                console.error("Error fetching products:", error)
                toast.error("Error al cargar productos")
            } finally {
                setIsLoading(false)
            }
        }

        loadProducts()
    }, [agencyId, selectedArea, selectedCategory, searchTerm])

    // Cargar categorías de productos
    useEffect(() => {
        const loadCategories = async () => {
            if (!agencyId) return

            try {
                const response = await fetch(`/api/inventory/categories?agencyId=${agencyId}`)
                const result = await response.json()

                if (result.success) {
                    const categoryList = [{ id: "Todos", name: "Todos" }, ...result.data.map(cat => ({ id: cat.id, name: cat.name }))]
                    setCategories(categoryList)
                }
            } catch (error) {
                console.error("Error loading categories:", error)
            }
        }

        loadCategories()
    }, [agencyId])

    // Cargar áreas de inventario
    useEffect(() => {
        const loadAreas = async () => {
            if (!agencyId) return

            try {
                const response = await fetch(`/api/inventory/areas?agencyId=${agencyId}`)
                const result = await response.json()

                if (result.success && result.data.length > 0) {
                    setAreas(result.data)
                    setSelectedArea(result.data[0].id) // Seleccionar la primera área por defecto
                }
            } catch (error) {
                console.error("Error loading areas:", error)
            }
        }

        loadAreas()
    }, [agencyId])

    // Cargar clientes
    useEffect(() => {
        const loadClients = async () => {
            if (!agencyId) return

            try {
                const response = await fetch(`/api/contacts?agencyId=${agencyId}`)
                const result = await response.json()

                if (result.success) {
                    setClients([{ id: null, name: "Cliente General" }, ...result.data])
                }
            } catch (error) {
                console.error("Error loading clients:", error)
            }
        }

        loadClients()
    }, [agencyId])


    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Terminal POS</h1>
                    <p className="text-muted-foreground">Gestiona ventas en tiempo real</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/agency/${agencyId}/cash-closing`}>
                        <Button variant="outline" size="sm">
                            <Clock className="h-4 w-4 mr-2" />
                            Cierre de Caja
                        </Button>
                    </Link>
                    <Link href={`/agency/${agencyId}/sales-pos`}>
                        <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Historial de Ventas
                        </Button>
                    </Link>

                    {/* Botón de carrito con contador */}
                    <Button variant="outline" size="sm" className="relative" onClick={() => setCartOpen(true)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Carrito
                        {selectedProducts.length > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                                {selectedProducts.length}
                            </Badge>
                        )}
                    </Button>

                    {/* Botón de menú de tres puntos */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSavedSalesOpen(true)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Ventas guardadas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Panel de búsqueda de productos con filtros */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <CardTitle className="text-lg">Productos</CardTitle>
                            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar productos..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="icon" onClick={() => setFiltersOpen(!filtersOpen)}>
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Filtros expandibles */}
                        {filtersOpen && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <Label htmlFor="subcuenta">Subcuenta</Label>
                                    <Select defaultValue={selectedArea} onValueChange={setSelectedArea}>
                                        <SelectTrigger id="area">
                                            <SelectValue placeholder="Seleccionar área" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas.map((area) => (
                                                <SelectItem key={area.id} value={area.id}>
                                                    {area.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="categoria">Categoría</Label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger id="categoria">
                                            <SelectValue placeholder="Seleccionar categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id || category} value={category.id || category}>
                                                    {category.name || category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="ordenar">Ordenar por</Label>
                                    <Select defaultValue="nombre">
                                        <SelectTrigger id="ordenar">
                                            <SelectValue placeholder="Ordenar por" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="nombre">Nombre</SelectItem>
                                            <SelectItem value="precio-asc">Precio: Menor a Mayor</SelectItem>
                                            <SelectItem value="precio-desc">Precio: Mayor a Menor</SelectItem>
                                            <SelectItem value="stock">Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="all">Todos</TabsTrigger>
                                <TabsTrigger value="favorites">Favoritos</TabsTrigger>
                                <TabsTrigger value="recent">Recientes</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="w-full">
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <span className="ml-3">Cargando productos...</span>
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                        <h3 className="text-xl font-medium mb-2">No se encontraron productos</h3>
                                        <p className="text-muted-foreground text-center">Intenta con otros filtros o agrega productos al inventario.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {products.map((product) => (
                                            <Card
                                                key={product.id}
                                                className={`cursor-pointer transition-colors ${selectedProducts2.includes(product.id)
                                                    ? "bg-primary/10 border-primary relative after:content-['✓'] after:absolute after:top-2 after:right-2 after:bg-primary after:text-primary-foreground after:size-6 after:flex after:items-center after:justify-center after:rounded-full after:text-xs"
                                                    : "hover:bg-muted/50"
                                                    }`}
                                                onClick={() => toggleProductSelection(product)}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                                                        {product.productImage ? (
                                                            <img
                                                                src={product.productImage}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover rounded-md"
                                                            />
                                                        ) : (
                                                            <Package className="h-8 w-8 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                                    <p className="text-xs text-muted-foreground truncate">{product.categoryName || "Sin categoría"}</p>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <p className="text-sm font-bold">${Number(product.price).toLocaleString()}</p>
                                                        <Badge
                                                            variant={product.stock <= 0 ? "destructive" : product.stock <= (product.minStock || 5) ? "secondary" : "outline"}
                                                            className="text-xs"
                                                        >
                                                            {product.stock <= 0 ? "Sin stock" : `Stock: ${product.stock}`}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="favorites" className="w-full">
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-xl font-medium mb-2">No hay productos favoritos</h3>
                                    <p className="text-muted-foreground text-center mb-6">
                                        Marca productos como favoritos para acceder rápidamente a ellos.
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="recent" className="w-full">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {products.slice(0, 2).map((product) => (
                                        <Card
                                            key={product.id}
                                            className={`cursor-pointer transition-colors ${selectedProducts2.includes(product.id)
                                                ? "bg-primary/10 border-primary relative after:content-['✓'] after:absolute after:top-2 after:right-2 after:bg-primary after:text-primary-foreground after:size-6 after:flex after:items-center after:justify-center after:rounded-full after:text-xs"
                                                : "hover:bg-muted/50"
                                                }`}
                                            onClick={() => toggleProductSelection(product)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                                                    {product.productImage ? (
                                                        <img
                                                            src={product.productImage}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover rounded-md"
                                                        />
                                                    ) : (
                                                        <Package className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                                <p className="text-xs text-muted-foreground truncate">{product.categoryName || "Sin categoría"}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-sm font-bold">${Number(product.price).toLocaleString()}</p>
                                                    <Badge
                                                        variant={product.stock <= 0 ? "destructive" : product.stock <= (product.minStock || 5) ? "secondary" : "outline"}
                                                        className="text-xs"
                                                    >
                                                        {product.stock <= 0 ? "Sin stock" : `Stock: ${product.stock}`}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Carrito */}
            <Dialog open={cartOpen} onOpenChange={setCartOpen}>
                <DialogContent className="sm:max-w-[800px]" ref={modalRef}>
                    <DialogHeader>
                        <DialogTitle>Carrito de Compra</DialogTitle>
                        <DialogDescription>Productos seleccionados para la venta actual</DialogDescription>
                    </DialogHeader>

                    {/* Lista de productos en el carrito */}
                    <div className="rounded-md border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="py-3 px-4 text-left font-medium">Producto</th>
                                        <th className="py-3 px-4 text-left font-medium">Precio</th>
                                        <th className="py-3 px-4 text-left font-medium">Cantidad</th>
                                        <th className="py-3 px-4 text-left font-medium">Subtotal</th>
                                        <th className="py-3 px-4 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center text-muted-foreground">
                                                No hay productos en el carrito
                                            </td>
                                        </tr>
                                    ) : (
                                        selectedProducts.map((product) => (
                                            <tr key={product.id} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-4 font-medium">{product.name}</td>
                                                <td className="py-3 px-4">${product.price.toLocaleString()}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center">{product.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-medium">${product.subtotal.toLocaleString()}</td>
                                                <td className="py-3 px-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => removeProduct(product.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sección de Cliente */}
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Cliente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{selectedClient.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedClient.id ? `ID: ${selectedClient.id}` : "Sin identificación"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Select
                                        onValueChange={(value) => {
                                            const client = clients.find((c) => c.id.toString() === value)
                                            if (client) {
                                                setSelectedClient({
                                                    name: client.name,
                                                    id: client.id,
                                                })
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((client) => (
                                                <SelectItem key={client.id} value={client.id.toString()}>
                                                    {client.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button variant="outline" size="icon" onClick={() => setNewClientOpen(true)}>
                                        <UserPlus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sección de Método de Pago */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Método de Pago</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <Button
                                        variant={paymentMethod === "efectivo" ? "default" : "outline"}
                                        className="flex flex-col h-auto py-3"
                                        onClick={() => setPaymentMethod("efectivo")}
                                    >
                                        <DollarSign className="h-5 w-5 mb-1" />
                                        <span>Efectivo</span>
                                    </Button>
                                    <Button
                                        variant={paymentMethod === "tarjeta" ? "default" : "outline"}
                                        className="flex flex-col h-auto py-3"
                                        onClick={() => setPaymentMethod("tarjeta")}
                                    >
                                        <CreditCard className="h-5 w-5 mb-1" />
                                        <span>Tarjeta</span>
                                    </Button>
                                </div>
                                {paymentMethod === "efectivo" && (
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-muted-foreground">Monto recibido:</span>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                className="max-w-[120px]"
                                                value={amountReceived}
                                                onChange={(e) => setAmountReceived(e.target.value)}
                                            />
                                            <Button variant="ghost" size="sm">
                                                <Calculator className="h-4 w-4 mr-2" />
                                                Calcular
                                            </Button>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Cambio:</span>
                                            <span>
                                                ${amountReceived ? Math.max(Number.parseInt(amountReceived) - total, 0).toLocaleString() : 0}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resumen de venta */}
                    <div className="space-y-3 mt-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Descuento</span>
                            <span>$0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">IVA (19%)</span>
                            <span>${iva.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>${total.toLocaleString()}</span>
                        </div>
                    </div>

                    <DialogFooter className="flex justify-between">
                        <div className="flex gap-2">
                            <Button variant="outline" className="text-destructive" onClick={clearCart}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Vaciar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    saveCartState()
                                    setCartOpen(false)
                                }}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                            </Button>
                        </div>
                        <Button
                            disabled={selectedProducts.length === 0 || !paymentMethod || isProcessing}
                            onClick={processSale}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Receipt className="h-4 w-4 mr-2" />
                                    Finalizar Venta
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal para Nuevo Cliente */}
            <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Nuevo Cliente</DialogTitle>
                        <DialogDescription>Ingresa los datos del nuevo cliente</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre completo</Label>
                            <Input id="name" placeholder="Nombre del cliente" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="document">Documento de identidad</Label>
                            <Input id="document" placeholder="Número de documento" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" placeholder="Número de teléfono" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input id="email" placeholder="Correo electrónico" type="email" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewClientOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => {
                                // Aquí iría la lógica para crear un nuevo cliente
                                setSelectedClient({
                                    name: "Nuevo Cliente",
                                    id: Date.now(), // ID temporal
                                })
                                setNewClientOpen(false)
                            }}
                        >
                            Guardar Cliente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Ventas Guardadas */}
            <Dialog open={savedSalesOpen} onOpenChange={setSavedSalesOpen}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Ventas Guardadas</DialogTitle>
                        <DialogDescription>
                            Ventas que no se completaron y fueron guardadas para continuar más tarde
                        </DialogDescription>
                    </DialogHeader>

                    {/* Lista de ventas guardadas */}
                    <div className="rounded-md border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="py-3 px-4 text-left font-medium">Fecha</th>
                                        <th className="py-3 px-4 text-left font-medium">Productos</th>
                                        <th className="py-3 px-4 text-left font-medium">Total</th>
                                        <th className="py-3 px-4 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savedSales.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center text-muted-foreground">
                                                No hay ventas guardadas
                                            </td>
                                        </tr>
                                    ) : (
                                        savedSales.map((sale) => (
                                            <tr key={sale.id} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-4">{sale.date}</td>
                                                <td className="py-3 px-4">{sale.items} productos</td>
                                                <td className="py-3 px-4 font-medium">${sale.total.toLocaleString()}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => loadSavedSale(sale)}>
                                                            Cargar
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive"
                                                            onClick={() => deleteSavedSale(sale.id)}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSavedSalesOpen(false)}>
                            Cerrar
                        </Button>
                        <Button
                            onClick={() => {
                                loadSavedSales()
                            }}
                        >
                            Actualizar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TerminalPage
