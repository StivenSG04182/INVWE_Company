"use client"

import { Expand, Navigation, SquareDashedMousePointer, ArrowDownZA, Boxes, Clock, Search, /*BarChart2, Folder, Zap, Settings, Eye, */} from "lucide-react"
import Image from "next/image"
import { ProductProvider, useProducts } from "@/contexts/product-context"
import { ThreeWorkspace } from "@/components/area/ThreeWorkspace"


export default function ProductManagement() {
    return (
        <ProductProvider>
            <AreaContent />
        </ProductProvider>
    )
}

function AreaContent() {
    const { products, } = useProducts()
    /* const [showDetail, setShowDetail] = useState(false) */
    // Contador de productos por nivel de stock
    const stockCounts = {
        red: 0, // Crítico (<10%)
        yellow: 0, // Bajo (<50%)
        gray: 0, // Medio (=50%)
        green: 0, // Alto (>50%)
    }

    // Función para calcular el nivel de stock y actualizar contadores
    const calculateStockLevel = (stock: string, total: string) => {
        const stockPercent = (Number.parseInt(stock) / Number.parseInt(total)) * 100

        if (stockPercent < 10) {
            stockCounts.red++
            return "red"
        } else if (stockPercent < 50) {
            stockCounts.yellow++
            return "yellow"
        } else if (stockPercent === 50) {
            stockCounts.gray++
            return "gray"
        } else {
            stockCounts.green++
            return "green"
        }
    }

    // Convertir los productos del contexto al formato necesario para la visualización
    const productData = products.map(product => ({
        code: product.code || '',
        name: product.name,
        subtext: product.subtext,
        subtextColor: product.subtextColor,
        stock: String(product.stock),
        total: product.total || String(product.stock + 100),
        price: `$${product.price}`,
        image: product.imagen || "/placeholder.svg?height=40&width=40",
        color: product.color || "green",
    }));

    // Calcular niveles de stock para cada producto
    productData.forEach((product) => {
        calculateStockLevel(product.stock, product.total)
    })
    
    // Calcular el total de productos y artículos
    const totalProducts = products.length
    const totalItems = products.reduce((sum, product) => sum + product.stock, 0)

    return (
        <div className="flex h-screen bg-gray-50">

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white p-4 border-b flex items-center justify-between">
                    <div className="flex items-center space-x-4">

                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Gestión de Productos</h1>
                            <p className="text-sm text-gray-500">{totalProducts} Productos - {totalItems} Artículos</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-4 rounded-lg hover:bg-gray-500">
                                <Expand className="w-6 h-6 text-gray-900" />
                            </button>
                            <button className="p-4 rounded-lg hover:bg-gray-500">
                                <Navigation className="w-6 h-6 text-gray-900" />
                            </button>
                            <button className="p-4 rounded-lg hover:bg-gray-500">
                                <SquareDashedMousePointer className="w-6 h-6 text-gray-00" />
                            </button>
                            <button className="p-4 rounded-lg hover:bg-gray-500">
                                <ArrowDownZA className="w-6 h-6 text-gray-00" />
                            </button>
                            <button className="p-4 rounded-lg hover:bg-gray-500">
                                <Boxes className="w-6 h-6 text-gray-00" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm font-medium">Ver la lista</button>
                        <button className="p-2 rounded-lg hover:bg-gray-100">
                            <Clock className="w-5 h-5 text-gray-700" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100">
                            <Search className="w-5 h-5 text-gray-700" />
                        </button>
                        <button 
                            className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium"
                        >
                            Crear
                        </button>
                    </div>
                </header>

                {/* Content - No Scroll */}
                <div className="flex-1 p-6 flex">
                    {/* Grid Layout - Static */}
                    <div className="w-2/3 pr-6">
                        {/* Espacio para el área de trabajo interactiva con Three.js */}
                        <div className="bg-white rounded-lg shadow-sm p-4 h-full relative border border-gray-950">
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <ThreeWorkspace />
                            </div>

                            {/* Posicionamiento del detalle del producto */}
{/*                             <div className="absolute top-4 left-4 z-10">
                                {showDetail && <ProductDetailCard onClose={() => setShowDetail(false)} />}
                            </div> */}
                        </div>
                    </div>

                    {/* Product List - Scrollable */}
                    <div className="w-1/3 flex">
                        {/* Indicador de colores */}
                        <div className="mr-2 bg-white rounded-lg shadow-sm py-4 flex flex-col items-center justify-start">
                            <div className="flex flex-col space-y-6 px-2">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-red-500 mb-1"></div>
                                    <span className="text-xs font-medium">{stockCounts.red}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 mb-1"></div>
                                    <span className="text-xs font-medium">{stockCounts.yellow}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-gray-500 mb-1"></div>
                                    <span className="text-xs font-medium">{stockCounts.gray}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mb-1"></div>
                                    <span className="text-xs font-medium">{stockCounts.green}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-white rounded-lg shadow-sm h-full flex flex-col">
                            <div className="p-4 border-b">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Nombre del producto</span>
                                    <div className="flex space-x-12">
                                        <span>En stock</span>
                                        <span>Precio</span>
                                    </div>
                                </div>
                            </div>

                            {/* Lista con scroll */}
                            <div className="divide-y overflow-y-auto flex-1">
                                {productData.map((product, index) => (
                                    <ProductItem
                                        key={index}
                                        code={product.code}
                                        name={product.name}
                                        subtext={product.subtext}
                                        subtextColor={product.subtextColor}
                                        stock={product.stock}
                                        total={product.total}
                                        price={product.price}
                                        image={product.image}
                                        color={product.color}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            

        </div>
    )
}

/* function ProductDetailCard({ onClose }: { onClose: () => void }) {
    return (
        <div className="bg-white rounded-lg shadow-lg w-72">
            <div className="p-4 flex justify-between items-center">
                <div>
                    <h3 className="font-medium">Pennywort</h3>
                    <p className="text-xs text-gray-500">B3 ID: B214</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            <div className="px-4 pb-2">
                <div className="text-lg font-semibold">$12.23</div>
            </div>

            <div className="p-4 flex justify-center">
                <Image
                    src="/placeholder.svg?height=80&width=120"
                    alt="Pennywort"
                    width={120}
                    height={80}
                    className="object-cover rounded"
                />
            </div>

            <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">192</span>
                </div>
            </div>

            <div className="px-4 py-2 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">On shelf:</p>
                    <p className="text-sm font-medium">22/35 items</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Inventory:</p>
                    <p className="text-sm font-medium">196 items</p>
                </div>
            </div>

            <div className="w-full bg-gray-200 h-1 mt-2">
                <div className="bg-green-500 h-1 w-1/2"></div>
            </div>

            <div className="px-4 py-3 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Sales:</p>
                    <p className="text-sm font-medium">3213</p>
                </div>
                <div className="flex items-center text-green-500">
                    <span className="text-sm font-medium">9%</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>

            <div className="p-4 border-t">
                <button className="w-full py-2 flex items-center justify-center text-gray-600 hover:text-gray-800">
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">View detail</span>
                </button>
            </div>
        </div>
    )
} */

interface ProductItemProps {
    code: string
    name: string
    subtext?: string
    subtextColor?: string
    stock: string
    total: string
    price: string
    image: string
    color: string
}

function ProductItem({
    code,
    name,
    subtext,
    subtextColor = "gray",
    stock,
    total,
    price,
    image,
    color,
}: ProductItemProps) {
    const dotColors: Record<string, string> = {
        red: "bg-red-500",
        orange: "bg-orange-500",
        yellow: "bg-yellow-500",
        green: "bg-green-500",
        blue: "bg-blue-500",
    }

    const textColors: Record<string, string> = {
        gray: "text-gray-500",
        blue: "text-blue-500",
        green: "text-green-500",
        red: "text-red-500",
    }

    // Calcular el porcentaje de stock
    const stockNum = Number.parseInt(stock)
    const totalNum = Number.parseInt(total)
    const stockPercent = (stockNum / totalNum) * 100

    // Determinar el color del indicador de stock
    let stockIndicatorColor = ""
    if (stockPercent > 50) {
        stockIndicatorColor = "bg-green-500"
    } else if (stockPercent === 50) {
        stockIndicatorColor = "bg-gray-500" 
    } else if (stockPercent >= 10) {
        stockIndicatorColor = "bg-yellow-500"
    } else {
        stockIndicatorColor = "bg-red-500"
    }

    return (
        <div className="p-4 flex items-center">
            <div className="w-2 h-2 rounded-full mr-3 mt-1 self-start" style={{ backgroundColor: dotColors[color] }}></div>

            <div className="flex-1 flex items-center">
                {/* Indicador de nivel de stock */}
                <div className={`w-3 h-3 rounded-full mr-2 ${stockIndicatorColor}`}></div>

                <div className="w-10 h-10 rounded overflow-hidden mr-3">
                    <Image src={image || "/placeholder.svg"} alt={name} width={40} height={40} className="object-cover" />
                </div>

                <div>
                    <div className="flex items-center">
                        <span className="text-gray-500 text-sm mr-2">{code}</span>
                        <span className="font-medium">{name}</span>
                    </div>
                    {subtext && <p className={`text-sm ${textColors[subtextColor]}`}>{subtext}</p>}
                </div>
            </div>

            <div className="flex items-center space-x-12">
                <div className="text-right">
                    <div className="text-sm font-medium">
                        {stock} <span className="text-gray-400">/ {total}</span>
                    </div>
                    <div className="w-16 bg-gray-200 h-1 mt-1">
                        <div className="bg-blue-500 h-1" style={{ width: `${stockPercent}%` }}></div>
                    </div>
                </div>

                <div className="w-16 text-right">
                    <span className="font-medium">{price}</span>
                </div>
            </div>
        </div>
    )
}
