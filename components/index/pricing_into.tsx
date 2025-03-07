import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import Link from "next/link" 
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState, useMemo, useCallback } from "react" // Added useMemo and useCallback for optimization

interface InventoryDataItem {
    name: string;
    productos: number;
    ventas: number;
    inventario: number;
}

interface PricingOption {
    value: number | string;
    price: number;
}

interface PricingCategory {
    name: string;
    options: PricingOption[];
}

interface PricingOptions {
    [key: string]: PricingCategory;
}

interface FeatureRow {
    feature: string;
    gratis: boolean | string;
    basico: boolean | string;
    premium: boolean | string;
    enterprise: boolean | string;
}

interface SelectedOptions {
    [key: string]: number;
}

// Data constants
const inventoryData: InventoryDataItem[] = [
    { name: "Gratis", productos: 100, ventas: 50, inventario: 80 },
    { name: "Básico", productos: 500, ventas: 300, inventario: 400 },
    { name: "Premium", productos: 1000, ventas: 800, inventario: 900 },
    { name: "Enterprise", productos: 2000, ventas: 1500, inventario: 1800 },
]

const pricingOptions: PricingOptions = {
    workers: {
        name: "Trabajadores",
        options: [
            { value: 10, price: 0 },
            { value: 30, price: 10000 },
            { value: 50, price: 20000 },
            { value: "Ilimitado", price: 50000 }
        ]
    },
    invoices: {
        name: "Facturaciones Electrónicas",
        options: [
            { value: 1000, price: 0 },
            { value: 10000, price: 5000 },
            { value: 100000, price: 15000 },
            { value: "Ilimitado", price: 30000 }
        ]
    },
    stores: {
        name: "Tiendas",
        options: [
            { value: 3, price: 0 },
            { value: 5, price: 5000 },
            { value: 10, price: 10000 },
            { value: "Personalizado", price: 25000 }
        ]
    },
    support: {
        name: "Soporte",
        options: [
            { value: "Comunidad", price: 0 },
            { value: "Email", price: 5000 },
            { value: "Prioritario", price: 15000 },
            { value: "Dedicado 24/7", price: 30000 }
        ]
    },
    storage: {
        name: "Almacenamiento",
        options: [
            { value: "500 MB", price: 0 },
            { value: "5 GB", price: 5000 },
            { value: "20 GB", price: 15000 },
            { value: "Personalizado", price: 30000 }
        ]
    }
}

export function Pricing_into() {
    const { theme } = useTheme()
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
        workers: 0,
        invoices: 0,
        stores: 0,
        support: 0,
        storage: 0
    })

    // Memoized calculation for better performance
    const totalPrice = useMemo(() => {
        return Object.keys(selectedOptions).reduce((total, key) => {
            return total + pricingOptions[key].options[selectedOptions[key]].price
        }, 0)
    }, [selectedOptions])

    // Optimized with useCallback to prevent unnecessary re-renders
    const handleOptionChange = useCallback((category: string, index: number) => {
        setSelectedOptions(prev => ({
            ...prev,
            [category]: index
        }))
    }, [])

    return (
        <section id="pricing" className="py-24 relative">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Planes</h2>
                {/* Chart Section */}
                {/* Chart Section - Enhanced for dark mode */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-center mb-8">Comparativa de Capacidades</h3>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={inventoryData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'} 
                                />
                                <XAxis 
                                    dataKey="name" 
                                    stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'}
                                />
                                <YAxis 
                                    stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                        borderColor: theme === 'dark' ? 'rgba(80, 80, 80, 0.9)' : 'rgba(200, 200, 200, 0.9)',
                                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'
                                    }}
                                />
                                <Bar 
                                    dataKey="productos" 
                                    fill={theme === 'dark' ? '#6366f1' : '#4f46e5'} 
                                    name="Productos" 
                                />
                                <Bar 
                                    dataKey="ventas" 
                                    fill={theme === 'dark' ? '#ec4899' : '#db2777'} 
                                    name="Ventas" 
                                />
                                <Bar 
                                    dataKey="inventario" 
                                    fill={theme === 'dark' ? '#14b8a6' : '#0d9488'} 
                                    name="Inventario" 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Custom Plan Builder - Similar to the image */}
                <div className="mt-24 max-w-7xl mx-auto bg-card/50 backdrop-blur-xl p-8 rounded-lg border shadow-lg">
                    <h3 className="text-2xl font-bold mb-8">Construye tu Plan Personalizado</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left side - Space for future 3D animation */}
                        <div className="hidden lg:flex items-center justify-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg min-h-[400px]">
                            <div className="text-center">
                                <p className="text-muted-foreground">Espacio reservado para animación 3D</p>
                                <p className="text-xs text-muted-foreground mt-2">(Three.js se implementará próximamente)</p>
                            </div>
                        </div>

                        {/* Right side - Custom pricing options */}
                        <div>
                            <div className="space-y-6">
                                {Object.keys(pricingOptions).map((category) => (
                                    <div key={category} className="space-y-2">
                                        <h4 className="font-medium">{pricingOptions[category].name}</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            {pricingOptions[category].options.map((option, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleOptionChange(category, idx)}
                                                    className={`p-2 text-sm rounded-md border transition-all ${selectedOptions[category] === idx
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'bg-background hover:bg-muted'}`}
                                                >
                                                    <div>{option.value}</div>
                                                    <div className="font-semibold">{option.price.toLocaleString()} COP</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-6 border-t mt-8">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-medium">Total Mensual:</span>
                                        <span className="text-2xl font-bold">{totalPrice.toLocaleString()} COP</span>
                                    </div>
                                    <Link 
                                        href={{
                                            pathname: "/enterprise",
                                            query: {
                                                plan: JSON.stringify({
                                                    selectedOptions: Object.keys(selectedOptions).reduce((acc, key) => ({
                                                        ...acc,
                                                        [key]: {
                                                            name: pricingOptions[key].name,
                                                            value: pricingOptions[key].options[selectedOptions[key]].value,
                                                            price: pricingOptions[key].options[selectedOptions[key]].price
                                                        }
                                                    }), {}),
                                                    totalPrice
                                                })
                                            }
                                        }} 
                                        className="mt-auto"
                                    >
                                        <Button className="w-full bg-custom-blue hover:bg-custom-blue/90 dark:bg-custom-gold dark:hover:bg-custom-gold/90 dark:text-black" size="lg">
                                            Comenzar con Plan Personalizado
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="mt-24 max-w-7xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8">Comparación de Características</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Característica</TableHead>
                                    <TableHead className="text-center">Gratis</TableHead>
                                    <TableHead className="text-center">Básico</TableHead>
                                    <TableHead className="text-center">Premium</TableHead>
                                    <TableHead className="text-center">Enterprise</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Extracted feature rows as a constant for better maintainability */}
                                {useMemo(() => [
                                    {
                                        feature: "Base de datos dedicada",
                                        gratis: true,
                                        basico: true,
                                        premium: true,
                                        enterprise: true
                                    },
                                    {
                                        feature: "API ilimitada",
                                        gratis: true,
                                        basico: true,
                                        premium: true,
                                        enterprise: true
                                    },
                                    {
                                        feature: "Tamaño de base de datos",
                                        gratis: "500 MB",
                                        basico: "5 GB",
                                        premium: "20 GB",
                                        enterprise: "Personalizado"
                                    },
                                    {
                                        feature: "Configuración avanzada",
                                        gratis: false,
                                        basico: true,
                                        premium: true,
                                        enterprise: true
                                    },
                                    {
                                        feature: "Copias de seguridad automáticas",
                                        gratis: false,
                                        basico: "7 días",
                                        premium: "14 días",
                                        enterprise: "Personalizado"
                                    },
                                    {
                                        feature: "Recuperación de punto en el tiempo",
                                        gratis: false,
                                        basico: "7 días",
                                        premium: "14 días",
                                        enterprise: "28 días"
                                    },
                                    {
                                        feature: "Soporte técnico",
                                        gratis: "Comunidad",
                                        basico: "Email",
                                        premium: "Prioritario",
                                        enterprise: "Dedicado 24/7"
                                    },
                                    {
                                        feature: "Usuarios simultáneos",
                                        gratis: "5",
                                        basico: "15",
                                        premium: "30",
                                        enterprise: "Ilimitado"
                                    },
                                    {
                                        feature: "Reportes avanzados",
                                        gratis: false,
                                        basico: true,
                                        premium: true,
                                        enterprise: true
                                    },
                                    {
                                        feature: "Integración con otros sistemas",
                                        gratis: false,
                                        basico: "Básica",
                                        premium: "Avanzada",
                                        enterprise: "Personalizada"
                                    }
                                ], []).map((row: FeatureRow, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{row.feature}</TableCell>
                                        <TableCell className="text-center">
                                            {typeof row.gratis === 'boolean' ? (
                                                row.gratis ?
                                                    <Check className="h-5 w-5 text-green-500 mx-auto" /> :
                                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                            ) : row.gratis}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {typeof row.basico === 'boolean' ? (
                                                row.basico ?
                                                    <Check className="h-5 w-5 text-green-500 mx-auto" /> :
                                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                            ) : row.basico}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {typeof row.premium === 'boolean' ? (
                                                row.premium ?
                                                    <Check className="h-5 w-5 text-green-500 mx-auto" /> :
                                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                            ) : row.premium}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {typeof row.enterprise === 'boolean' ? (
                                                row.enterprise ?
                                                    <Check className="h-5 w-5 text-green-500 mx-auto" /> :
                                                    <X className="h-5 w-5 text-red-500 mx-auto" />
                                            ) : row.enterprise}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </section>
    )
}
