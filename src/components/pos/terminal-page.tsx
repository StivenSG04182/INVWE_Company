"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { 
    Search, 
    ShoppingCart, 
    CreditCard, 
    User, 
    Filter, 
    Save, 
    Trash2, 
    Printer, 
    Mail, 
    Download,
    Plus,
    X,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { 
    getSubAccountsForAgency, 
    getAreasForPOS, 
    getCategoriesForPOS, 
    getProductsForPOS, 
    getClientsForPOS,
    processSale,
    saveSaleState,
    getSavedSales,
    deleteSavedSale,
    generateInvoice,
    sendInvoiceByEmail
} from "@/lib/queries2"

const TerminalPage = ({ params }: { params: { agencyId: string } }) => {
    const agencyId = params.agencyId
    const { userId } = useAuth()
    const [user, setUser] = useState<any>(null)

    // Redirigir si no hay usuario después de cargar los datos
    useEffect(() => {
        if (user === null) return // Aún cargando
        if (!user) redirect("/sign-in")
    }, [user])
    const [cartOpen, setCartOpen] = useState(false)
    const [newClientOpen, setNewClientOpen] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState<any[]>([])
    const [selectedClient, setSelectedClient] = useState<any>({
        name: "Cliente General",
        id: null,
    })
    const [paymentMethod, setPaymentMethod] = useState("")
    const [amountReceived, setAmountReceived] = useState("")
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [savedSalesOpen, setSavedSalesOpen] = useState(false)
    const [savedSales, setSavedSales] = useState<any[]>([])
    const [selectedProducts2, setSelectedProducts2] = useState<any[]>([]) // IDs de productos seleccionados

    // Estados para datos reales
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [areas, setAreas] = useState<any[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [subaccounts, setSubaccounts] = useState<any[]>([])
    const [selectedSubaccount, setSelectedSubaccount] = useState<string>("")
    const [selectedArea, setSelectedArea] = useState<string>("")
    const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    // Referencias
    const modalRef = useRef<HTMLDivElement>(null)

    // Cargar datos iniciales
    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true)
            
            // Cargar subcuentas, áreas, categorías y clientes en paralelo
            const [subaccountsData, areasData, categoriesData, clientsData] = await Promise.all([
                getSubAccountsForAgency(agencyId),
                getAreasForPOS(agencyId, selectedSubaccount),
                getCategoriesForPOS(agencyId, selectedSubaccount),
                getClientsForPOS(agencyId, selectedSubaccount)
            ])

            setSubaccounts(subaccountsData)
            setAreas(areasData)
            setCategories(categoriesData)
            setClients(clientsData)

            // Cargar productos
            await loadProducts()
        } catch (error) {
            console.error("Error cargando datos iniciales:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos iniciales",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }, [agencyId, selectedSubaccount])

    // Cargar productos
    const loadProducts = useCallback(async () => {
        try {
            const productsData = await getProductsForPOS(agencyId, {
                subAccountId: selectedSubaccount,
                categoryId: selectedCategory !== "Todos" ? selectedCategory : undefined,
                search: searchTerm
            })
            setProducts(productsData)
        } catch (error) {
            console.error("Error cargando productos:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los productos",
                variant: "destructive",
            })
        }
    }, [agencyId, selectedSubaccount, selectedCategory, searchTerm])

    // Cargar datos cuando cambien las dependencias
    useEffect(() => {
        loadInitialData()
    }, [loadInitialData])

    // Cargar productos cuando cambien los filtros
    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    // Función para guardar el estado del carrito
    const saveCartState = useCallback(async () => {
        if (selectedProducts.length === 0) return

        try {
            await saveSaleState({
                agencyId,
                subAccountId: selectedSubaccount,
                products: selectedProducts.map(product => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity,
                    subtotal: product.price * product.quantity
                })),
                client: selectedClient
            })

            toast({
                title: "Éxito",
                description: "Carrito guardado correctamente",
            })
        } catch (error) {
            console.error("Error guardando carrito:", error)
            toast({
                title: "Error",
                description: "No se pudo guardar el carrito",
                variant: "destructive",
            })
        }
    }, [agencyId, selectedSubaccount, selectedArea, selectedProducts, selectedClient])

    // Función para cargar ventas guardadas desde la API
    const loadSavedSales = useCallback(async () => {
        try {
            const savedSalesData = await getSavedSales(agencyId, {
                subAccountId: selectedSubaccount
            })
            setSavedSales(savedSalesData)
        } catch (error) {
            console.error("Error cargando ventas guardadas:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar las ventas guardadas",
                variant: "destructive",
            })
        }
    }, [agencyId, selectedSubaccount])

    // Función para eliminar una venta guardada
    const handleDeleteSavedSale = useCallback(async (id: string) => {
        try {
            await deleteSavedSale(id)
            await loadSavedSales() // Recargar la lista
            toast({
                title: "Éxito",
                description: "Venta guardada eliminada",
            })
        } catch (error) {
            console.error("Error eliminando venta guardada:", error)
            toast({
                title: "Error",
                description: "No se pudo eliminar la venta guardada",
                variant: "destructive",
            })
        }
    }, [loadSavedSales])

    // Función para procesar la venta
    const handleProcessSale = useCallback(async () => {
        if (selectedProducts.length === 0) {
            toast({
                title: "Error",
                description: "No hay productos en el carrito",
                variant: "destructive",
            })
            return
        }

        if (!paymentMethod) {
            toast({
                title: "Error",
                description: "Seleccione un método de pago",
                variant: "destructive",
            })
            return
        }

        try {
            const total = selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0)

            // Procesar la venta
            const saleResult = await processSale({
                agencyId,
                subAccountId: selectedSubaccount,
                areaId: selectedArea,
                products: selectedProducts.map(product => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: product.quantity
                })),
                client: selectedClient,
                paymentMethod,
                total
            })

            // Generar factura si es necesario
            if (selectedClient.id) {
                try {
                    const invoiceResult = await generateInvoice({
                        agencyId,
                        subAccountId: selectedSubaccount,
                        customerId: selectedClient.id,
                        items: selectedProducts.map(product => ({
                            productId: product.id,
                            description: product.name,
                            quantity: product.quantity,
                            unitPrice: product.price,
                            subtotal: product.price * product.quantity
                        })),
                        subtotal: total,
                        tax: total * 0.19, // 19% IVA
                        total: total * 1.19
                    })

                    if (invoiceResult.success && invoiceResult.data.Customer?.email) {
                        // Enviar factura por email
                        await sendInvoiceByEmail(invoiceResult.data.id)
                    }
                } catch (invoiceError) {
                    console.error("Error generando factura:", invoiceError)
                }
            }

            // Limpiar carrito
            setSelectedProducts([])
            setSelectedClient({ name: "Cliente General", id: null })
            setPaymentMethod("")
            setAmountReceived("")
            setCartOpen(false)

            toast({
                title: "Éxito",
                description: `Venta procesada: ${saleResult.saleNumber}`,
            })

            // Recargar productos para actualizar stock
            await loadProducts()
        } catch (error) {
            console.error("Error procesando venta:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error procesando la venta",
                variant: "destructive",
            })
        }
    }, [agencyId, selectedSubaccount, selectedArea, selectedProducts, selectedClient, paymentMethod, loadProducts])

    // Manejar clic fuera del modal para cerrarlo
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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
    }, [cartOpen, newClientOpen, selectedProducts, saveCartState])

    // Agregar producto al carrito
    const addToCart = useCallback((product: any) => {
        const existingProduct = selectedProducts.find(p => p.id === product.id)
        
        if (existingProduct) {
            setSelectedProducts(prev => 
                prev.map(p => 
                    p.id === product.id 
                        ? { ...p, quantity: p.quantity + 1 }
                        : p
                )
            )
        } else {
            setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }])
        }

        toast({
            title: "Producto agregado",
            description: `${product.name} agregado al carrito`,
        })
    }, [selectedProducts])

    // Remover producto del carrito
    const removeFromCart = useCallback((productId: string) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== productId))
    }, [])

    // Actualizar cantidad en el carrito
    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        setSelectedProducts(prev => 
            prev.map(p => 
                p.id === productId 
                    ? { ...p, quantity }
                    : p
            )
        )
    }, [removeFromCart])

    // Calcular total del carrito
    const cartTotal = selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0)

    // Filtrar productos
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.barcode?.includes(searchTerm)
        const matchesCategory = selectedCategory === "Todos" || product.categoryId === selectedCategory
        return matchesSearch && matchesCategory
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-lg">Cargando terminal POS...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Panel izquierdo - Productos */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Terminal POS</h1>
                            <p className="text-gray-600">Punto de Venta</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => setFiltersOpen(!filtersOpen)}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filtros
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSavedSalesOpen(true)
                                    loadSavedSales()
                                }}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Ventas Guardadas
                            </Button>
                            <Button
                                onClick={() => setCartOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Carrito ({selectedProducts.length})
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                {filtersOpen && (
                    <div className="bg-white border-b p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tienda</label>
                                <Select value={selectedSubaccount} onValueChange={setSelectedSubaccount}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las tiendas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas las tiendas</SelectItem>
                                        {subaccounts.map(subaccount => (
                                            <SelectItem key={subaccount.id} value={subaccount.id}>
                                                {subaccount.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Área</label>
                                <Select value={selectedArea} onValueChange={setSelectedArea}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las áreas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas las áreas</SelectItem>
                                        {areas.map(area => (
                                            <SelectItem key={area.id} value={area.id}>
                                                {area.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Categoría</label>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas las categorías" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Todos">Todas las categorías</SelectItem>
                                        {categories.map(category => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Buscar</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Buscar productos..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grid de productos */}
                <div className="flex-1 p-4 overflow-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {filteredProducts.map((product) => (
                            <Card
                                key={product.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => addToCart(product)}
                            >
                                <CardContent className="p-4">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <span className="text-gray-500 text-xs">Sin imagen</span>
                                            )}
                                        </div>
                                        <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
                                        <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-green-600">
                                                ${product.price.toFixed(2)}
                                            </span>
                                            <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                                                {product.quantity} en stock
                                            </Badge>
                                        </div>
                                        {product.discount > 0 && (
                                            <div className="mt-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    -{product.discount}% descuento
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal del carrito */}
            {cartOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div ref={modalRef} className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Carrito de Compras</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        saveCartState()
                                        setCartOpen(false)
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <div className="p-6">
                                {selectedProducts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">El carrito está vacío</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedProducts.map((product) => (
                                            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{product.name}</h3>
                                                    <p className="text-sm text-gray-500">${product.price.toFixed(2)} c/u</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="w-8 text-center">{product.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                                    >
                                                        +
                                                    </Button>
                                                    <span className="font-medium w-20 text-right">
                                                        ${(product.price * product.quantity).toFixed(2)}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFromCart(product.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedProducts.length > 0 && (
                            <div className="p-6 border-t bg-gray-50">
                                <div className="space-y-4">
                                    {/* Cliente */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Cliente</label>
                                        <div className="flex space-x-2">
                                            <Select
                                                value={selectedClient.id || ""}
                                                onValueChange={(value) => {
                                                    const client = clients.find(c => c.id === value)
                                                    setSelectedClient(client || { name: "Cliente General", id: null })
                                                }}
                                            >
                                                <SelectTrigger className="flex-1">
                                                    <SelectValue placeholder="Seleccionar cliente" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="">Cliente General</SelectItem>
                                                    {clients.map(client => (
                                                        <SelectItem key={client.id} value={client.id}>
                                                            {client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setNewClientOpen(true)}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Método de pago */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Método de Pago</label>
                                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar método de pago" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="efectivo">Efectivo</SelectItem>
                                                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                                                <SelectItem value="transferencia">Transferencia</SelectItem>
                                                <SelectItem value="pse">PSE</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total:</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>

                                    {/* Botones */}
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={saveCartState}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Guardar
                                        </Button>
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            onClick={handleProcessSale}
                                        >
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Procesar Venta
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de ventas guardadas */}
            {savedSalesOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Ventas Guardadas</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSavedSalesOpen(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 overflow-auto max-h-[60vh]">
                            {savedSales.length === 0 ? (
                                <div className="text-center py-8">
                                    <Save className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No hay ventas guardadas</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {savedSales.map((sale) => (
                                        <div key={sale.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium">
                                                        Cliente: {sale.client?.name || "Cliente General"}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {sale.products?.length || 0} productos - Total: ${sale.total?.toFixed(2) || "0.00"}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Guardado: {new Date(sale.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (sale.products) {
                                                                setSelectedProducts(sale.products)
                                                                setSelectedClient(sale.client || { name: "Cliente General", id: null })
                                                                setSavedSalesOpen(false)
                                                                setCartOpen(true)
                                                            }
                                                        }}
                                                    >
                                                        Cargar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteSavedSale(sale.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de nuevo cliente */}
            {newClientOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Nuevo Cliente</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setNewClientOpen(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre</label>
                                    <Input placeholder="Nombre del cliente" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Input type="email" placeholder="email@ejemplo.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                                    <Input placeholder="+57 300 123 4567" />
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setNewClientOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button className="flex-1">
                                        Crear Cliente
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TerminalPage
