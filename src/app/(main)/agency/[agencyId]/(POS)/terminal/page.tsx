"use client"

import { useState, useEffect, useRef } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getProductsForPOS, processSale as processSaleQuery, saveSaleState, getSavedSales as getSavedSalesQuery, deleteSavedSale as deleteSavedSaleQuery, getCategoriesForPOS, getClientsForPOS, getSubAccountsForAgency, generateInvoice, sendInvoiceByEmail } from "@/lib/queries2"
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
    Building,
    Store,
    RefreshCw,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select"
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
import { useAuth } from "@clerk/nextjs"
import Image from "next/image"


const TerminalPage = ({ params }: { params: { agencyId: string } }) => {
    const agencyId = params.agencyId
    const { userId } = useAuth()
    const [user, setUser] = useState(null)

    // Redirigir si no hay usuario después de cargar los datos
    useEffect(() => {
        if (user === null) return // Aún cargando
        if (!user) redirect("/sign-in")
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
    const [subaccounts, setSubaccounts] = useState([])
    const [selectedSubaccount, setSelectedSubaccount] = useState("")
    // Se eliminó la referencia a áreas para simplificar el flujo de venta
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("Todos")

    // Estado para el modal de selección de subaccount
    const [subaccountModalOpen, setSubaccountModalOpen] = useState(true)
    const [useAgencyProducts, setUseAgencyProducts] = useState(false)

    // Estado para el modal de creación de productos
    const [productFormOpen, setProductFormOpen] = useState(false)

    // Referencia para detectar clics fuera del modal
    const modalRef = useRef(null)

    // Cargar datos del usuario autenticado
    useEffect(() => {
        const loadUser = async () => {
            try {
                // Usar useAuth hook en lugar de auth() del servidor
                setUser(userId ? { id: userId } : null)
            } catch (error) {
                console.error("Error loading user:", error)
            }
        }

        loadUser()
    }, [userId])

    // Cargar subaccounts de la agencia
    useEffect(() => {
        const loadSubaccounts = async () => {
            if (!agencyId) return

            try {
                // Obtener subcuentas directamente usando la función del servidor
                const subaccountsData = await getSubAccountsForAgency(agencyId)
                
                // Asegurarse de que las subcuentas se carguen correctamente
                console.log("Subcuentas cargadas:", subaccountsData)
                setSubaccounts(subaccountsData || [])
                
                // Si hay subaccounts, abrir el modal de selección
                if (subaccountsData && subaccountsData.length > 0) {
                    setSubaccountModalOpen(true)
                } else {
                    // Si no hay subaccounts, usar productos de la agencia
                    setUseAgencyProducts(true)
                    setSubaccountModalOpen(false)
                }
            } catch (error) {
                console.error("Error al cargar subaccounts:", error)
                toast.error("Error al cargar subcuentas. Usando productos de la agencia.")
                // En caso de error, usar productos de la agencia
                setUseAgencyProducts(true)
                setSubaccountModalOpen(false)
            }
        }

        loadSubaccounts()
    }, [agencyId])

    // Se eliminó la carga de áreas para simplificar el flujo de venta

    // Cargar categorías para filtrado
    useEffect(() => {
        const loadCategories = async () => {
            if (!agencyId) return

            try {
                // Usar la función de queries2.ts para obtener categorías
                const categoriesData = await getCategoriesForPOS(agencyId, selectedSubaccount || undefined)
                // Añadir la opción "Todos" al inicio
                setCategories([{ id: "Todos", name: "Todos" }, ...categoriesData])
            } catch (error) {
                console.error("Error al cargar categorías:", error)
                toast.error("Error al cargar categorías de productos")
            }
        }

        loadCategories()
    }, [agencyId, selectedSubaccount])

    // Cargar clientes para selección
    useEffect(() => {
        const loadClients = async () => {
            if (!agencyId) return

            try {
                // Usar la función de queries2.ts para obtener clientes
                const clientsData = await getClientsForPOS(agencyId, selectedSubaccount || undefined)
                setClients(clientsData)
            } catch (error) {
                console.error("Error al cargar clientes:", error)
                toast.error("Error al cargar lista de clientes")
            }
        }

        loadClients()
    }, [agencyId, selectedSubaccount])

    // Función para guardar el carrito actual en la base de datos usando la función de queries2.ts
    const saveCartState = async () => {
        // Solo guardar si hay productos en el carrito
        if (selectedProducts.length > 0) {
            try {
                // Preparar datos para la función
                const cartData = {
                    agencyId,
                    subAccountId: selectedSubaccount || null,
                    products: selectedProducts,
                    client: selectedClient,
                }

                // Usar la función de queries2.ts para guardar el carrito
                const result = await saveSaleState(cartData)

                if (result) {
                    toast.success("Venta guardada correctamente")
                    // Actualizar la lista de ventas guardadas
                    loadSavedSales()
                }
            } catch (error) {
                console.error("Error saving cart:", error)
                toast.error(error.message || "Error al guardar la venta")
            }
        }
    }

    // Función para procesar la venta utilizando la función de queries2.ts
    const [isProcessing, setIsProcessing] = useState(false)

    const processSale = async () => {
        if (selectedProducts.length === 0) return

        // Se eliminó la validación de área seleccionada

        try {
            setIsProcessing(true)

            // Verificar cantidad disponible antes de procesar
            for (const product of selectedProducts) {
                const productData = products.find((p) => p.id === product.id)
                if (!productData) {
                    toast.error(`Producto no encontrado: ${product.name}`)
                    setIsProcessing(false)
                    return
                }

                if (productData.quantity < product.quantity) {
                    toast.error(`Cantidad insuficiente para ${product.name}. Disponible: ${productData.quantity}`)
                    setIsProcessing(false)
                    return
                }
            }

            // Preparar datos para la función de procesamiento
            const saleData = {
                agencyId,
                subAccountId: selectedSubaccount || null,
                products: selectedProducts.map((p) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    quantity: p.quantity,
                })),
                client: selectedClient,
                paymentMethod: paymentMethod || "CASH",
                total: total,
            }

            // Usar la función de queries2.ts para procesar la venta
            const result = await processSaleQuery(saleData)

            if (result) {
                // Limpiar carrito
                clearCart()
                setCartOpen(false)

                // Mostrar mensaje de éxito
                toast.success("Venta procesada correctamente")

                // Actualizar la lista de productos para reflejar la nueva cantidad
                loadProducts()

                // Generar factura si es necesario
                if (selectedClient.id) {
                    try {
                        // Crear factura usando la función del servidor
                        const invoiceResult = await generateInvoice({
                            agencyId,
                            subAccountId: selectedSubaccount || null,
                            customerId: selectedClient.id,
                            items: selectedProducts.map((p) => ({
                                productId: p.id,
                                description: p.name,
                                quantity: p.quantity,
                                unitPrice: p.price,
                                subtotal: p.subtotal,
                            })),
                            subtotal: subtotal,
                            tax: iva,
                            total: total,
                            notes: `Venta POS - ${new Date().toLocaleDateString()}`,
                        })

                        if (invoiceResult.success) {
                            toast.success("Factura generada correctamente")

                            // Enviar factura por correo si hay email
                            if (selectedClient.email) {
                                const emailResult = await sendInvoiceByEmail(invoiceResult.data.id)
                                if (emailResult.success) {
                                    toast.success(`Factura enviada a ${selectedClient.email}`)
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Error generando factura:", error)
                        toast.error("Error al generar la factura")
                    }
                }
            }
        } catch (error) {
            console.error("Error processing sale:", error)
            toast.error(error.message || "Error al procesar la venta")
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

    // Función para cargar ventas guardadas usando la función de queries2.ts
    const loadSavedSales = async () => {
        try {
            // Preparar opciones para la consulta
            const options: {
                subAccountId?: string;
            } = {}

            if (selectedSubaccount) options.subAccountId = selectedSubaccount

            // Usar la función de queries2.ts para obtener ventas guardadas
            const savedSalesData = await getSavedSalesQuery(agencyId, options)
            setSavedSales(savedSalesData)
        } catch (error) {
            console.error("Error al cargar ventas guardadas:", error)
            toast.error(error.message || "Error al cargar ventas guardadas")
        }
    }

    // Función para eliminar una venta guardada usando la función de queries2.ts
    const deleteSavedSale = async (id) => {
        try {
            // Usar la función de queries2.ts para eliminar la venta guardada
            const result = await deleteSavedSaleQuery(id)
            
            if (result && result.success) {
                toast.success("Venta eliminada correctamente")
                setSavedSales((prev) => prev.filter((sale) => sale.id !== id))
            }
        } catch (error) {
            console.error("Error deleting saved sale:", error)
            toast.error(error.message || "Error al eliminar la venta")
        }
    }

    // Cargar ventas guardadas al iniciar
    useEffect(() => {
        if (agencyId) {
            loadSavedSales()
        }
    }, [agencyId, selectedSubaccount])

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
        // Validar cantidad mínima
        if (newQuantity < 1) return

        // Obtener datos del producto del inventario
        const productData = products.find((p) => p.id === id);
        if (!productData) return;

        // Obtener el producto del carrito
        const product = selectedProducts.find((p) => p.id === id)
        if (!product) return

        // Verificar si hay suficiente cantidad
        if (newQuantity > productData.quantity) {
            toast.error(`Cantidad insuficiente: solo hay ${productData.quantity} unidades disponibles de ${product.name}`);
            return;
        }

        // Actualizar el producto en el carrito
        setSelectedProducts((prev) =>
            prev.map((product) =>
                product.id === id
                    ? {
                        ...product,
                        quantity: newQuantity,
                        subtotal: product.price * newQuantity,
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

    // Función para obtener el nombre de la categoría por su ID
    const getCategoryName = (categoryId: string) => {
        // Convertir a string para asegurar una comparación consistente
        const category = categories.find(cat => String(cat.id) === String(categoryId))
        return category ? category.name : "Sin categoría"
    }

    // Función para seleccionar o deseleccionar un producto
    const toggleProductSelection = (product) => {
        // Si ya está en el carrito, removerlo (deseleccionar)
        if (selectedProducts2.includes(product.id)) {
            removeProduct(product.id)
            return
        }

        // Se eliminó la validación de área seleccionada

        // Agregar nuevo producto - Se eliminó la restricción de quantity=0
        setSelectedProducts((prev) => [
            ...prev,
            {
                id: product.id,
                name: product.name,
                price: Number(product.price) || 0,
                quantity: 1,
                subtotal: Number(product.price) || 0,
            },
        ])
        setSelectedProducts2((prev) => [...prev, product.id])

        // Mostrar confirmación de producto agregado
        toast.success(`${product.name} agregado al carrito`)
    }

    // Función para cargar productos utilizando la función de queries2.ts
    const loadProducts = async () => {
        if (!agencyId) return

        try {
            setIsLoading(true)

            // Preparar opciones para la consulta
            const options: {
                subAccountId?: string;
                categoryId?: string;
                search?: string;
            } = {}

            // Si estamos usando una subcuenta específica, incluirla en las opciones
            if (!useAgencyProducts && selectedSubaccount) {
                options.subAccountId = selectedSubaccount
                console.log("Usando subAccountId para filtrar productos:", selectedSubaccount)
            }

            // Añadir filtros adicionales
            if (selectedCategory && selectedCategory !== "Todos") options.categoryId = selectedCategory
            if (searchTerm) options.search = searchTerm

            console.log("Cargando productos con opciones:", options)

            // Usar la función de queries2.ts para obtener productos
            const productsData = await getProductsForPOS(agencyId, options)
            console.log("Datos de productos recibidos:", productsData.length)

            // Transformar los datos para el formato esperado por la UI
            const productsWithQuantity = productsData
                .map((product) => {
                    if (!product || typeof product !== "object") {
                        console.log("Producto inválido:", product)
                        return null
                    }

                    return {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        sku: product.sku,
                        price: Number(product.price),
                        cost: product.cost ? Number(product.cost) : "",
                        quantity: Number(product.quantity) || 0,
                        categoryId: product.categoryId,
                        categoryName: product.Category?.name || "Sin categoría",
                        unit: product.unit || "",
                        tags: product.tags || [],
                        model: product.model || "",
                        brand: product.brand || "",
                        images: product.images || [],
                        productImage: product.productImage || "",
                        discount: Number(product.discount) || 0,
                        discountStartDate: product.discountStartDate || null,
                        discountEndDate: product.discountEndDate || null,
                        discountMinimumPrice: product.discountMinimumPrice ? Number(product.discountMinimumPrice) : "",
                        taxRate: Number(product.taxRate) || 0,
                        supplierId: product.supplierId || null,
                        isReturnable: product.isReturnable || false,
                        isActive: product.active !== false,
                        expirationDate: product.expirationDate || null,
                        serialNumber: product.serialNumber || "",
                    }
                })
                .filter(Boolean)

            console.log("Productos procesados:", productsWithQuantity.length)
            setProducts(productsWithQuantity)
        } catch (error) {
            console.error("Error cargando productos:", error)
            toast.error("Error al cargar productos: " + (error instanceof Error ? error.message : "Error desconocido"))
        } finally {
            setIsLoading(false)
        }
    }

    // Cargar productos cuando cambian los filtros o la subaccount
    useEffect(() => {
        if (agencyId && (selectedSubaccount || useAgencyProducts)) {
            loadProducts()
        }
    }, [agencyId, selectedSubaccount, selectedCategory, searchTerm, useAgencyProducts])

    // Función para cambiar la subaccount y actualizar la consulta de productos
    const handleSubaccountChange = (subaccountId) => {
        // Si seleccionamos "Usar productos de la agencia"
        if (subaccountId === "agency") {
            setUseAgencyProducts(true)
            setSelectedSubaccount("")
            // Al seleccionar agencia, la consulta se hará con agencyId
        } else {
            setUseAgencyProducts(false)
            setSelectedSubaccount(subaccountId)
            // Al seleccionar una subcuenta, la consulta se hará con subAccountId
        }

        // Limpiar carrito al cambiar de subaccount
        clearCart()

        // Cerrar el modal
        setSubaccountModalOpen(false)
    }

    // Función para manejar la creación exitosa de un producto
    const handleProductCreated = () => {
        setProductFormOpen(false)
        toast.success("Producto creado correctamente. Actualizando lista...")
        loadProducts()
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Terminal POS</h1>
                    <p className="text-muted-foreground">Gestiona ventas en tiempo real</p>
                </div>
                <div className="flex gap-2">
                    {/* Selector de Subaccount */}
                    <Select value={useAgencyProducts ? "agency" : selectedSubaccount} onValueChange={handleSubaccountChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar subcuenta" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="agency">
                                <div className="flex items-center">
                                    <Building className="h-4 w-4 mr-2" />
                                    <span>Agencia (Todos)</span>
                                </div>
                            </SelectItem>
                            {subaccounts.map((subaccount) => (
                                <SelectItem key={subaccount.id} value={subaccount.id}>
                                    <div className="flex items-center">
                                        <Store className="h-4 w-4 mr-2" />
                                        <span>{subaccount.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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
                            <DropdownMenuItem onClick={() => setSubaccountModalOpen(true)}>
                                <Store className="h-4 w-4 mr-2" />
                                Cambiar subcuenta
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => loadProducts()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Actualizar productos
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setProductFormOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear producto de prueba
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Indicador de subcuenta activa */}
            <div className="mb-4 p-2 bg-muted rounded-md flex items-center justify-between">
                <div className="flex items-center">
                    {useAgencyProducts ? (
                        <>
                            <Building className="h-5 w-5 mr-2 text-primary" />
                            <span className="font-medium">Mostrando productos de toda la agencia</span>
                        </>
                    ) : (
                        <>
                            <Store className="h-5 w-5 mr-2 text-primary" />
                            <span className="font-medium">
                                Subcuenta: {subaccounts.find((s) => s.id === selectedSubaccount)?.name || "No seleccionada"}
                            </span>
                        </>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSubaccountModalOpen(true)}>
                        Cambiar
                    </Button>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
                                        <p className="text-muted-foreground text-center mb-6">
                                            No hay productos disponibles. Crea algunos productos para comenzar.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        {products.map((product) => (
                                            <Card
                                                key={product.id}
                                                className={`transition-colors cursor-pointer ${selectedProducts2.includes(product.id)
                                                    ? "bg-primary/10 border-primary relative after:content-['✓'] after:absolute after:top-2 after:right-2 after:bg-primary after:text-primary-foreground after:size-6 after:flex after:items-center after:justify-center after:rounded-full after:text-xs"
                                                    : "hover:bg-muted/50"
                                                }`}
                                                onClick={() => toggleProductSelection(product)}
                                            >
                                                {/* Primer CardContent */}
                                                <CardContent className="p-0">
                                                    <div className="relative aspect-square">
                                                        {product.productImage || (product.images && product.images.length > 0) ? (
                                                            <Image
                                                                src={product.productImage || product.images[0] || "/placeholder.svg"}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full bg-muted">
                                                                <Package className="h-12 w-12 text-muted-foreground/50" />
                                                            </div>
                                                        )}

                                                        <div className="absolute top-2 left-2">
                                                            <Badge
                                                                variant={product.quantity > 0 ? "default" : "destructive"}
                                                                className={`px-2 py-1 ${product.quantity > 0 ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                                                            >
                                                                {product.quantity > 0 ? `Disponible: ${product.quantity}` : "Sin Stock"}
                                                            </Badge>
                                                        </div>

                                                        {product.discount > 0 && (
                                                            <div className="absolute top-2 right-2">
                                                                <Badge variant="default" className="bg-green-600 hover:bg-green-700 px-2 py-1">
                                                                    {product.discount}% descuento
                                                                </Badge>
                                                            </div>
                                                        )}

                                                        {product.expirationDate &&
                                                            new Date(product.expirationDate) < new Date(new Date().setMonth(new Date().getMonth() + 3)) && (
                                                                <div className="absolute bottom-2 right-2">
                                                                    <Badge variant="destructive" className="px-2 py-1">
                                                                        Vence: {new Date(product.expirationDate).toLocaleDateString()}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                    </div>
                                                </CardContent> {/* ← Cierre del primer CardContent */}

                                                {/* Segundo CardContent */}
                                                <CardContent className="p-4">
                                                    <div className="mb-2">
                                                        <h3 className="font-medium truncate">{product.name}</h3>
                                                        <p className="text-xs text-muted-foreground truncate">{product.description || "Sin descripción"}</p>
                                                        {(product.brand || product.model) && (
                                                            <p className="text-xs mt-1">
                                                                {product.brand && <span className="font-medium">{product.brand}</span>}
                                                                {product.brand && product.model && <span> - </span>}
                                                                {product.model && <span>{product.model}</span>}
                                                            </p>
                                                        )}
                                                        {product.serialNumber && (
                                                            <p className="text-xs mt-1">
                                                                <span className="font-medium">S/N:</span> {product.serialNumber}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-sm">
                                                            <span className="font-medium">
                                                                ${typeof product.price === "number" ? product.price.toFixed(2) : "0.00"}
                                                            </span>
                                                            {product.discount > 0 && (
                                                                <span className="text-xs text-muted-foreground line-through ml-1">
                                                                    $
                                                                    {typeof product.price === "number"
                                                                        ? (product.price / (1 - (product.discount || 0) / 100)).toFixed(2)
                                                                        : "0.00"}
                                                                </span>
                                                            )}
                                                            {product.cost && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    Costo: ${typeof product.cost === "number" ? product.cost.toFixed(2) : "0.00"}
                                                                </div>
                                                            )}
                                                            {product.discount > 0 && product.discountStartDate && product.discountEndDate && (
                                                                <div className="text-xs text-green-600">
                                                                    {new Date(product.discountStartDate).toLocaleDateString()} -{" "}
                                                                    {new Date(product.discountEndDate).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Quantity:</span>{" "}
                                                            <span className="font-medium">
                                                                {product.quantity || 0} {product.unit || ""}
                                                            </span>
                                                        </div>
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
                                            className={`transition-colors cursor-pointer ${
                                                selectedProducts2.includes(product.id)
                                                    ? "bg-primary/10 border-primary relative after:content-['✓'] after:absolute after:top-2 after:right-2 after:bg-primary after:text-primary-foreground after:size-6 after:flex after:items-center after:justify-center after:rounded-full after:text-xs"
                                                    : "hover:bg-muted/50"
                                            }`}
                                            onClick={() => toggleProductSelection(product)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center">
                                                    {product.productImage ? (
                                                        <Image
                                                            src={product.productImage || "/placeholder.svg"}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover rounded-md"
                                                        />
                                                    ) : (
                                                        <Package className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {product.categoryName || "Sin categoría"}
                                                </p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-sm font-bold">${Number(product.price).toLocaleString()}</p>
                                                    <Badge
                                                        variant={product.quantity <= 0 ? "destructive" : "default"}
                                                        className="text-xs"
                                                    >
                                                        {product.quantity <= 0 ? "Sin cantidad" : `Cantidad: ${product.quantity}`}
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

            {/* Modal de Selección de Subaccount */}
            <Dialog
                open={subaccountModalOpen}
                onOpenChange={(open) => {
                    // Solo permitir cerrar el modal si ya hay una subaccount seleccionada o se está usando la agencia
                    if (!open && !selectedSubaccount && !useAgencyProducts) {
                        return
                    }
                    setSubaccountModalOpen(open)
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Seleccionar Subcuenta</DialogTitle>
                        <DialogDescription>
                            Selecciona la subcuenta para cargar sus productos o usa los productos de toda la agencia.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 gap-3">
                            <Button
                                variant={useAgencyProducts ? "default" : "outline"}
                                className="flex items-center justify-start h-auto py-3 px-4"
                                onClick={() => handleSubaccountChange("agency")}
                            >
                                <Building className="h-5 w-5 mr-3" />
                                <div className="text-left">
                                    <div className="font-medium">Usar productos de la agencia</div>
                                    <div className="text-sm text-muted-foreground">Mostrar todos los productos de la agencia</div>
                                </div>
                            </Button>

                            <Separator className="my-2" />

                            {subaccounts.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">No hay subcuentas disponibles</div>
                            ) : (
                                subaccounts.map((subaccount) => (
                                    <Button
                                        key={subaccount.id}
                                        variant={selectedSubaccount === subaccount.id ? "default" : "outline"}
                                        className="flex items-center justify-start h-auto py-3 px-4"
                                        onClick={() => handleSubaccountChange(subaccount.id)}
                                    >
                                        <Store className="h-5 w-5 mr-3" />
                                        <div className="text-left">
                                            <div className="font-medium">{subaccount.name}</div>
                                            <div className="text-sm text-muted-foreground">{subaccount.address || "Sin dirección"}</div>
                                        </div>
                                    </Button>
                                ))
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setSubaccountModalOpen(false)} disabled={!selectedSubaccount && !useAgencyProducts}>
                            Continuar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                            if (value === "new-client") {
                                                setNewClientOpen(true)
                                                return
                                            }
                                            
                                            const client = clients.find((c) => c.id && c.id.toString() === value)
                                            if (client) {
                                                setSelectedClient({
                                                    name: client.name,
                                                    id: client.id,
                                                    email: client.email,
                                                    phone: client.phone,
                                                    address: client.address
                                                })
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general" className="font-medium">
                                                Cliente General
                                            </SelectItem>
                                            <SelectItem value="new-client" className="text-primary font-medium">
                                                <div className="flex items-center">
                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                    Crear Nuevo Cliente
                                                </div>
                                            </SelectItem>
                                            <SelectSeparator />
                                            {clients.length > 0 ? (
                                                clients.map((client) => (
                                                    <SelectItem key={client.id || "general"} value={client.id ? client.id.toString() : "general"}>
                                                        <div>
                                                            <span>{client.name}</span>
                                                            {client.email && (
                                                                <span className="text-xs text-muted-foreground block">{client.email}</span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="py-2 px-2 text-sm text-muted-foreground">No hay clientes registrados</div>
                                            )}
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
                                        variant={paymentMethod === "CASH" ? "default" : "outline"}
                                        className="flex flex-col h-auto py-3"
                                        onClick={() => setPaymentMethod("CASH")}
                                    >
                                        <DollarSign className="h-5 w-5 mb-1" />
                                        <span>Efectivo</span>
                                    </Button>
                                    <Button
                                        variant={paymentMethod === "CREDIT_CARD" ? "default" : "outline"}
                                        className="flex flex-col h-auto py-3"
                                        onClick={() => setPaymentMethod("CREDIT_CARD")}
                                    >
                                        <CreditCard className="h-5 w-5 mb-1" />
                                        <span>Tarjeta</span>
                                    </Button>
                                </div>
                                {paymentMethod === "CASH" && (
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
                        <Button disabled={selectedProducts.length === 0 || !paymentMethod || isProcessing} onClick={processSale}>
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
