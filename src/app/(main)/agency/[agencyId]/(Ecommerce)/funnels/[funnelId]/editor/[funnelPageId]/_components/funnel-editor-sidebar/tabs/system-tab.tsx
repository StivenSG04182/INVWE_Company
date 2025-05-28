"use client"
import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Package,
    Search,
    ShoppingCart,
    Navigation,
    Link,
    MessageSquare,
    CreditCard,
    Filter,
    HelpCircle,
    Plus,
    Eye,
    Edit,
    Star,
    DollarSign,
    BarChart3,
    Users,
    Settings,
} from "lucide-react"

interface Product {
    id: string
    name: string
    description: string
    price: number
    image: string
    category: string
    stock: number
    rating: number
    isActive: boolean
}

interface SystemComponent {
    id: string
    name: string
    description: string
    icon: any
    category: "products" | "navigation" | "forms" | "commerce" | "utils"
    isAvailable: boolean
    requiresAuth?: boolean
}

type Props = {
    agencyId: string
}

const SystemTab = ({ agencyId }: Props) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)

    // Mock data - En producción esto vendría de la base de datos
    const mockProducts: Product[] = [
        {
            id: "1",
            name: "Laptop Gaming Pro",
            description: "Laptop de alto rendimiento para gaming",
            price: 1299.99,
            image: "/placeholder.svg?height=100&width=100",
            category: "Electronics",
            stock: 15,
            rating: 4.8,
            isActive: true,
        },
        {
            id: "2",
            name: "Smartphone Ultra",
            description: "Teléfono inteligente con cámara profesional",
            price: 899.99,
            image: "/placeholder.svg?height=100&width=100",
            category: "Electronics",
            stock: 32,
            rating: 4.6,
            isActive: true,
        },
        {
            id: "3",
            name: "Auriculares Inalámbricos",
            description: "Auriculares con cancelación de ruido",
            price: 199.99,
            image: "/placeholder.svg?height=100&width=100",
            category: "Audio",
            stock: 8,
            rating: 4.7,
            isActive: true,
        },
        {
            id: "4",
            name: "Camiseta Premium",
            description: "Camiseta de algodón orgánico",
            price: 29.99,
            image: "/placeholder.svg?height=100&width=100",
            category: "Clothing",
            stock: 50,
            rating: 4.3,
            isActive: true,
        },
    ]

    const systemComponents: SystemComponent[] = [
        {
            id: "product-grid",
            name: "Grilla de Productos",
            description: "Muestra productos en formato de grilla con filtros",
            icon: Package,
            category: "products",
            isAvailable: true,
        },
        {
            id: "product-card",
            name: "Tarjeta de Producto",
            description: "Tarjeta individual de producto con detalles",
            icon: ShoppingCart,
            category: "products",
            isAvailable: true,
        },
        {
            id: "product-filter",
            name: "Filtro de Productos",
            description: "Sistema de filtrado por categoría, precio, etc.",
            icon: Filter,
            category: "products",
            isAvailable: true,
        },
        {
            id: "inventory-manager",
            name: "Gestor de Inventario",
            description: "Panel para gestionar stock y productos",
            icon: BarChart3,
            category: "products",
            isAvailable: true,
            requiresAuth: true,
        },
        {
            id: "page-navigation",
            name: "Navegación entre Páginas",
            description: "Sistema de navegación con breadcrumbs",
            icon: Navigation,
            category: "navigation",
            isAvailable: true,
        },
        {
            id: "functional-links",
            name: "Enlaces Funcionales",
            description: "Enlaces que ejecutan acciones específicas",
            icon: Link,
            category: "navigation",
            isAvailable: true,
        },
        {
            id: "pqr-system",
            name: "Sistema PQR",
            description: "Peticiones, Quejas y Reclamos",
            icon: MessageSquare,
            category: "forms",
            isAvailable: true,
        },
        {
            id: "faq-component",
            name: "FAQ Interactivo",
            description: "Preguntas frecuentes con búsqueda",
            icon: HelpCircle,
            category: "forms",
            isAvailable: true,
        },
        {
            id: "pos-system",
            name: "Sistema POS",
            description: "Punto de venta integrado",
            icon: CreditCard,
            category: "commerce",
            isAvailable: true,
            requiresAuth: true,
        },
        {
            id: "shopping-cart",
            name: "Carrito de Compras",
            description: "Carrito con persistencia y checkout",
            icon: ShoppingCart,
            category: "commerce",
            isAvailable: true,
        },
        {
            id: "user-dashboard",
            name: "Dashboard de Usuario",
            description: "Panel de control para usuarios",
            icon: Users,
            category: "utils",
            isAvailable: true,
            requiresAuth: true,
        },
    ]

    useEffect(() => {
        // Simular carga de productos desde la base de datos
        setLoading(true)
        setTimeout(() => {
            setProducts(mockProducts)
            setLoading(false)
        }, 1000)
    }, [])

    const categories = [
        { id: "all", name: "Todos" },
        { id: "products", name: "Productos" },
        { id: "navigation", name: "Navegación" },
        { id: "forms", name: "Formularios" },
        { id: "commerce", name: "Comercio" },
        { id: "utils", name: "Utilidades" },
    ]

    const filteredComponents = systemComponents.filter((component) => {
        const matchesSearch =
            component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            component.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "all" || component.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const addComponentToCanvas = (componentId: string) => {
        // Aquí implementarías la lógica para agregar el componente al canvas
        console.log(`Adding component ${componentId} to canvas`)
    }

    const addProductToCanvas = (product: Product) => {
        // Aquí implementarías la lógica para agregar el producto al canvas
        console.log(`Adding product ${product.id} to canvas`)
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold mb-2">Componentes del Sistema</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Integra componentes funcionales y productos de tu base de datos
                </p>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar componentes o productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category.id)}
                                className="text-xs"
                            >
                                {category.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <Tabs defaultValue="components" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mx-6 mb-4">
                        <TabsTrigger value="components">Componentes</TabsTrigger>
                        <TabsTrigger value="products">Productos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="components" className="px-6 space-y-4">
                        <div className="grid gap-4">
                            {filteredComponents.map((component) => (
                                <Card key={component.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <component.icon className="h-6 w-6 text-primary" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-sm">{component.name}</h4>
                                                    {component.requiresAuth && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Requiere Auth
                                                        </Badge>
                                                    )}
                                                    {component.isAvailable ? (
                                                        <Badge className="text-xs bg-green-500">Disponible</Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="text-xs">
                                                            No Disponible
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-3">{component.description}</p>

                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => addComponentToCanvas(component.id)}
                                                        disabled={!component.isAvailable}
                                                        className="flex-1"
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        Agregar
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        Preview
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Settings className="h-3 w-3 mr-1" />
                                                        Config
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="products" className="px-6 space-y-4">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="text-sm text-muted-foreground mt-2">Cargando productos...</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredProducts.map((product) => (
                                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                                                    <img
                                                        src={product.image || "/placeholder.svg"}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium text-sm">{product.name}</h4>
                                                        <Badge variant="outline" className="text-xs">
                                                            {product.category}
                                                        </Badge>
                                                        {product.isActive ? (
                                                            <Badge className="text-xs bg-green-500">Activo</Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Inactivo
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-muted-foreground mb-2">{product.description}</p>

                                                    <div className="flex items-center gap-4 mb-3 text-xs">
                                                        <div className="flex items-center gap-1">
                                                            <DollarSign className="h-3 w-3" />
                                                            <span className="font-medium">${product.price}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Package className="h-3 w-3" />
                                                            <span>Stock: {product.stock}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span>{product.rating}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => addProductToCanvas(product)}
                                                            disabled={!product.isActive}
                                                            className="flex-1"
                                                        >
                                                            <Plus className="h-3 w-3 mr-1" />
                                                            Agregar
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            Ver
                                                        </Button>
                                                        <Button size="sm" variant="outline">
                                                            <Edit className="h-3 w-3 mr-1" />
                                                            Editar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </ScrollArea>
        </div>
    )
}

export default SystemTab
