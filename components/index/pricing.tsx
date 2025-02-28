import { Check, BarChart3, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useTheme } from "next-themes"
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
import { useState } from "react"

const inventoryData = [
    { name: "Gratis", productos: 100, ventas: 50, inventario: 80 },
    { name: "Básico", productos: 500, ventas: 300, inventario: 400 },
    { name: "Premium", productos: 1000, ventas: 800, inventario: 900 },
    { name: "Enterprise", productos: 2000, ventas: 1500, inventario: 1800 },
]

const pricingOptions = {
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

export function Pricing() {
    const { theme } = useTheme()
    const [selectedOptions, setSelectedOptions] = useState({
        workers: 0,
        invoices: 0,
        stores: 0,
        support: 0,
        storage: 0
    })

    const calculateTotal = () => {
        return Object.keys(selectedOptions).reduce((total, key) => {
            return total + pricingOptions[key].options[selectedOptions[key]].price
        }, 0)
    }

    const handleOptionChange = (category, index) => {
        setSelectedOptions(prev => ({
            ...prev,
            [category]: index
        }))
    }

    return (
        <section id="pricing" className="py-24 relative">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Planes, Suscripción</h2>

                {/* Chart Section */}
                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-center mb-8">Comparativa de Capacidades</h3>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={inventoryData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="productos" fill="var(--chart-1)" name="Productos" />
                                <Bar dataKey="ventas" fill="var(--chart-2)" name="Ventas" />
                                <Bar dataKey="inventario" fill="var(--chart-3)" name="Inventario" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
                    {[
                        {
                            name: "Gratis",
                            price: "0 COP",
                            description: "Perfecto para pequeñas empresas",
                            features: [
                                "Máximo 10 trabajadores",
                                "1,000 facturaciones electrónicas",
                                "Creación máxima de 3 tiendas"
                            ],
                            limits: {
                                workers: 10,
                                invoices: 1000,
                                stores: 3
                            },
                            isPaid: false
                        },
                        {
                            name: "Básico",
                            price: "20,000 COP",
                            description: "Perfecto para medianas empresas",
                            features: [
                                "Máximo 30 trabajadores",
                                "10,000 facturaciones electrónicas",
                                "Creación máxima de 5 tiendas"
                            ],
                            limits: {
                                workers: 30,
                                invoices: 10000,
                                stores: 5
                            },
                            isPaid: true
                        },
                        {
                            name: "Premium",
                            price: "50,000 COP",
                            description: "Perfecto para grandes empresas",
                            features: [
                                "Máximo 50 trabajadores",
                                "100,000 facturaciones electrónicas",
                                "Creación máxima de 10 tiendas"
                            ],
                            limits: {
                                workers: 50,
                                invoices: 100000,
                                stores: 10
                            },
                            isPaid: true
                        },
                        {
                            name: "ENTERPRISE",
                            price: "Custom",
                            description: "Plan perfecto para armar tu plan",
                            features: [
                                "Empleados Ilimitados",
                                "Facturas Ilimitadas",
                                "Creación hasta 10 Sucursales diferentes"
                            ],
                            limits: {
                                workers: "custom",
                                invoices: "custom",
                                stores: "custom"
                            },
                            isPaid: true
                        }
                    ].map((plan, index) => (
                        <Card
                            key={index}
                            className={`border bg-gradient-to-b from-card/50 to-card/80 backdrop-blur-xl p-6 transition-all hover:scale-105 
                                       dark:shadow-[0_0_15px_rgba(206,158,80,0.3)] shadow-[0_0_15px_rgba(80,128,206,0.3)]`}
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <div className="text-3xl font-bold mb-4">
                                        {plan.price}
                                        <span className="text-sm text-muted-foreground">/mes</span>
                                    </div>
                                    <p className="text-muted-foreground mb-4 text-sm">{plan.description}</p>
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center text-sm">
                                                <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link href="/sign-in" className="mt-auto">
                                    <Button
                                        className="w-full bg-custom-blue hover:bg-custom-blue/90 dark:bg-custom-gold dark:hover:bg-custom-gold/90 dark:text-black"
                                        size="lg"
                                    >
                                        Comenzar
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
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
                                        <span className="text-2xl font-bold">{calculateTotal().toLocaleString()} COP</span>
                                    </div>
                                    <Button className="w-full bg-custom-blue hover:bg-custom-blue/90 dark:bg-custom-gold dark:hover:bg-custom-gold/90 dark:text-black" size="lg">
                                        Comenzar con Plan Personalizado
                                    </Button>
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
                                {[
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
                                ].map((row, index) => (
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
