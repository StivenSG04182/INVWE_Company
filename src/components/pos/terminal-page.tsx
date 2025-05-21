"use client"

import { useState, useEffect, useRef } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, BarChart3, Clock, Building, Store, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    const [selectedArea, setSelectedArea] = useState("")
    const [areas, setAreas] = useState([])
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
                const response = await fetch(`/api/agency/${agencyId}/subaccounts`, {
                    credentials: "include",
                })

                if (!response.ok) {
                    throw new Error(`Error en la respuesta de la API: ${response.status} ${response.statusText}`)
                }

                const result = await response.json()

                if (result.success) {
                    setSubaccounts(result.data || [])
                    // Si hay subaccounts, abrir el modal de selección
                    if (result.data && result.data.length > 0) {
                        setSubaccountModalOpen(true)
                    } else {
                        // Si no hay subaccounts, usar productos de la agencia
                        setUseAgencyProducts(true)
                        setSubaccountModalOpen(false)
                    }
                } else {
                    throw new Error(result.error || "Error desconocido al obtener subaccounts")
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

    // Función para guardar el carrito actual en la base de datos
    const saveCartState = async () => {
        // Solo guardar si hay productos en el carrito
        if (selectedProducts.length > 0) {
            try {
                const response = await fetch("/api/pos/saved-sales", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        agencyId,
                        subAccountId: selectedSubaccount || null,
                        areaId: selectedArea,
                        products: selectedProducts,
                        client: selectedClient,
                    }),
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
                const productData = products.find((p) => p.id === product.id)
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
                subAccountId: selectedSubaccount || null,
                areaId: selectedArea,
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

            // Enviar a la API
            const response = await fetch("/api/pos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(saleData),
            })

            const result = await response.json()

            if (result.success) {
                // Limpiar carrito
                clearCart()
                setCartOpen(false)

                // Mostrar mensaje de éxito
                toast.success("Venta procesada correctamente")

                // Actualizar la lista de productos para reflejar el nuevo stock
                loadProducts()

                // Generar factura si es necesario
                if (selectedClient.id) {
                    try {
                        // Crear factura
                        const invoiceResponse = await fetch("/api/billing/invoices", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
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
                            }),
                        })

                        const invoiceResult = await invoiceResponse.json()

                        if (invoiceResult.success) {
                            toast.success("Factura generada correctamente")

                            // Enviar factura por correo si hay email
                            if (selectedClient.email) {
                                await fetch(`/api/billing/invoices/${invoiceResult.data.id}/send-email`, {
                                    method: "POST",
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
            let url = `/api/pos/saved-sales?agencyId=${agencyId}`
            if (selectedArea) url += `&areaId=${selectedArea}`
            if (selectedSubaccount) url += `&subAccountId=${selectedSubaccount}`

            const response = await fetch(url, {
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error(`Error en la respuesta de la API: ${response.status} ${response.statusText}`)
            }

            const result = await response.json()

            if (result.success) {
                setSavedSales(result.data)
            } else {
                throw new Error(result.error || "Error desconocido al cargar ventas guardadas")
            }
        } catch (error) {
            console.error("Error al cargar ventas guardadas:", error)
            toast.error("Error al cargar ventas guardadas")
        }
    }

    // Función para eliminar una venta guardada
    const deleteSavedSale = async (id) => {
        try {
            const response = await fetch(`/api/pos/saved-sales?id=${id}`, {
                method: "DELETE",
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
    }, [agencyId, selectedArea, selectedSubaccount])

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
        const product = selectedProducts.find((p) => p.id === id)
        if (!product) return

        // Obtener datos actualizados del producto (stock actual)
        const productData = products.find((p) => p.id === id)
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
        // Si ya está en el carrito, removerlo (deseleccionar)
        if (selectedProducts2.includes(product.id)) {
            removeProduct(product.id)
            return
        }

        // Verificar si hay stock disponible antes de agregar al carrito
        if (product.stock <= 0) {
            toast.error(`No hay stock disponible de ${product.name}`)
            return
        }

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

    // Función para cargar productos desde la API según la selección de agencia o subcuenta
    const loadProducts = async () => {
        if (!agencyId) return

        try {
            setIsLoading(true)

            // Construir URL de la API con los parámetros de filtrado
            let url = `/api/pos/has-agency-access?`

            // Si estamos usando productos de la agencia, consultar por agencyId
            // Si estamos usando una subcuenta específica, consultar por subAccountId
            if (useAgencyProducts) {
                url += `agencyId=${agencyId}`
            } else if (selectedSubaccount) {
                // Asegurar que estamos usando el parámetro correcto para la API
                url += `agencyId=${agencyId}&subAccountId=${selectedSubaccount}`
                console.log("Usando subAccountId para filtrar productos:", selectedSubaccount)
            } else {
                // Si no hay selección, usar agencyId por defecto
                url += `agencyId=${agencyId}`
            }

            // Añadir filtros adicionales
            if (selectedCategory && selectedCategory !== "Todos") url += `&categoryId=${selectedCategory}`
            if (searchTerm) url += `&search=${searchTerm}`

            console.log("Cargando productos con URL:", url)

            // Realizar la petición a la API
            const response = await fetch(url, {
                credentials: "include", // Incluir cookies y credenciales de autenticación
                cache: "no-store", // Evitar caché
                next: { revalidate: 0 }, // Forzar revalidación en cada solicitud
            })

            if (!response.ok) {
                throw new Error(`Error en la respuesta de la API: ${response.status} ${response.statusText}`)
            }

            const result = await response.json()
            console.log("Respuesta de la API de productos:", result)

            if (!result.success) {
                throw new Error(result.error || "Error desconocido al obtener productos")
            }

            const productsData = result.data || []
            console.log("Datos de productos recibidos:", productsData.length)

            // Transformar los datos para el formato esperado por la UI
            const productsWithStock = productsData
                .map((product) => {
                    if (!product || typeof product !== "object") {
                        console.log("Producto inválido:", product)
                        return null
                    }

                    return {
                        id: product.id,
                        name: product.name,
                        price: Number.parseFloat(product.price),
                        sku: product.sku,
                        description: product.description,
                        stock: product.stock || 0,
                        categoryId: product.categoryId,
                        categoryName: product.categoryName || "Sin categoría",
                        images: product.images || [],
                        productImage: product.productImage || "",
                    }
                })
                .filter(Boolean)

            console.log("Productos procesados:", productsWithStock.length)
            setProducts(productsWithStock)
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
                            <DropdownMenuItem>{/* Placeholder for additional menu items */}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            {/* Placeholder for additional UI components */}
        </div>
    )
}

export default TerminalPage
