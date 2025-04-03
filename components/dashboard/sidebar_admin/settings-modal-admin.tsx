"use client";
import { useEffect, useState } from "react";
import { Settings, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { toast } from "sonner"
import { ArcColorPicker } from "@/components/ui/arc-color-picker";
import { useSidebarColor } from "@/hooks/use-sidebar-color";

const subscriptionPlans = [
    {
        name: "Gratis",
        price: "0 COP",
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
    }
]

export function SettingsPageAdmin({ hasNewNotification = false, hasNewMessage = false }) {
    return (
        <div className="relative">
            <Settings className="h-4 w-4" />
            {(hasNewNotification || hasNewMessage) && (
                <span className={cn(
                    "absolute -top-1 -right-1 h-2 w-2 rounded-full",
                    hasNewMessage ? "bg-blue-500" : "bg-red-500"
                )} />
            )}
        </div>
    );
}

export function SettingsPanelAdmin() {
    const [selectedColor, setSelectedColor] = useState("#f6d365");
    const [grainIntensity, setGrainIntensity] = useState(50);
    const [selectedPosition, setSelectedPosition] = useState('left');
    const [notifications, setNotifications] = useState([]);
    const [, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const companyId = searchParams.get("companyId");
    const [isLoading, setIsLoading] = useState(false);
    const handleSubscription = async (plan: typeof subscriptionPlans[0]) => {
        try {
            setIsLoading(true)

            if (plan.isPaid) {
                // Redirect to payment gateway
                router.push(`/payment?companyId=${companyId}&plan=${plan.name}`)
                return
            }

            // For free plan, create subscription directly
            const response = await axios.post("/api/client/sett_noti/subscription", {
                companyId,
                plan: plan.name,
                limits: plan.limits
            })

            router.push(`/${response.data.companyName}/${response.data.storeId}`)
            toast.success("Suscripción activada exitosamente")
        } catch {
            toast.error("Error al activar la suscripción")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const res = await fetch("/api/client/sett_noti/settings?category=all");
                const data = await res.json();
                if (data.notifications) setNotifications(data.notifications);
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex h-10 w-10 items-center justify-center text-gray-700 hover:bg-gray-300">
                    <SettingsPageAdmin hasNewNotification={notifications.length > 0} />
                </button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-6xl max-h-6xl p-4 h-auto min-h-[450px] overflow-y-auto" closeButton={false}>
                <DialogTitle className="sr-only">Configuraciones</DialogTitle>
                <Tabs defaultValue="all" className="w-full h-full flex flex-col">
                    <TabsList className="flex w-full items-center justify-between space-x-2 shrink-0">
                        <TabsTrigger value="templates">Estilos</TabsTrigger>
                        <TabsTrigger value="themes">Color Sidebar</TabsTrigger>
                        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                        <TabsTrigger value="subscriptions">Suscripción</TabsTrigger>
                    </TabsList>
                    <div className="border-t border-solid border-gray-400 flex-grow pb-20 pt-20 mt-4">
                        <TabsContent value="subscriptions" className="space-y-2 h-full">
                            <div className="text-center mb-16">
                                <h1 className="text-4xl font-bold mb-4">Elige tu Plan</h1>
                                <p className="text-xl text-muted-foreground">
                                    Selecciona el plan que mejor se adapte a tus necesidades
                                </p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {subscriptionPlans.map((plan) => (
                                    <Card
                                        key={plan.name}
                                        className="border-solid border-gray-400 border bg-gradient-to-b from-card/50 to-card/80 backdrop-blur-xl p-6 transition-all hover:scale-105 dark:shadow-[0_0_15px_rgba(206,158,80,0.3)] shadow-[0_0_15px_rgba(80,128,206,0.3)]">
                                        <div className="flex flex-col h-full justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                                <div className="text-3xl font-bold mb-4">
                                                    {plan.price}
                                                    <span className="text-sm text-muted-foreground">/mes</span>
                                                </div>
                                                <ul className="space-y-3 mb-6">
                                                    {plan.features.map((feature, featureIndex) => (
                                                        <li key={featureIndex} className="flex items-center text-sm">
                                                            <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                                                            <span>{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <Button
                                                className="w-full bg-custom-blue hover:bg-custom-blue/90 dark:bg-custom-gold dark:hover:bg-custom-gold/90 dark:text-black"
                                                size="lg"
                                                onClick={() => handleSubscription(plan)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Procesando...' : 'Comenzar'}
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="templates" className="space-y-4 h-full">

                        </TabsContent>
                        <TabsContent value="themes" className="space-y-4 h-full">
                            <h2 className="text-2xl font-bold mb-6 text-center">Color del Sidebar</h2>
                            <p className="text-muted-foreground mb-4 text-center">Selecciona un color para personalizar la barra lateral</p>
                            
                            {/* Contenedor principal con dos columnas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Columna izquierda: Selector de color */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold mb-4">Selector de Color</h3>
                                    <ArcColorPicker
                                        selectedColor={selectedColor}
                                        setSelectedColor={setSelectedColor}
                                        grainIntensity={grainIntensity}
                                        setGrainIntensity={setGrainIntensity}
                                    />
                                </div>
                                
                                {/* Columna derecha: Vista previa */}
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
                                    <div className="border rounded-lg overflow-hidden h-[300px] relative">
                                        {/* Simulación de la estructura de la página */}
                                        {selectedPosition === 'top' ? (
                                            <div className="flex flex-col h-full">
                                                {/* Sidebar arriba simulado */}
                                                <div 
                                                    className="h-16 w-full flex flex-row items-center justify-center px-4 shadow-md" 
                                                    style={{ backgroundColor: selectedColor || '#f6d365' }}
                                                >
                                                    {/* Iconos simulados en horizontal */}
                                                    <div className="flex space-x-4">
                                                        {[1, 2, 3, 4, 5].map((item) => (
                                                            <div key={item} className="w-8 h-8 rounded-full bg-white/20"></div>
                                                        ))}
                                                        <div className="ml-auto flex space-x-4">
                                                            <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                                            <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Contenido simulado */}
                                                <div className="flex-1 bg-gray-100 p-4">
                                                    <div className="h-8 bg-white rounded-md mb-4"></div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : selectedPosition === 'right' ? (
                                            <div className="flex h-full">
                                                {/* Contenido simulado */}
                                                <div className="flex-1 bg-gray-100 p-4">
                                                    <div className="h-8 bg-white rounded-md mb-4"></div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                    </div>
                                                </div>
                                                {/* Sidebar derecho simulado */}
                                                <div 
                                                    className="w-16 h-full flex flex-col items-center py-4 shadow-md" 
                                                    style={{ backgroundColor: selectedColor || '#f6d365' }}
                                                >
                                                    {/* Iconos simulados */}
                                                    {[1, 2, 3, 4, 5].map((item) => (
                                                        <div key={item} className="w-8 h-8 rounded-full bg-white/20 mb-4"></div>
                                                    ))}
                                                    <div className="mt-auto">
                                                        <div className="w-8 h-8 rounded-full bg-white/20 mb-4"></div>
                                                        <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex h-full">
                                                {/* Sidebar izquierdo simulado (por defecto) */}
                                                <div 
                                                    className="w-16 h-full flex flex-col items-center py-4 shadow-md" 
                                                    style={{ backgroundColor: selectedColor || '#f6d365' }}
                                                >
                                                    {/* Iconos simulados */}
                                                    {[1, 2, 3, 4, 5].map((item) => (
                                                        <div key={item} className="w-8 h-8 rounded-full bg-white/20 mb-4"></div>
                                                    ))}
                                                    <div className="mt-auto">
                                                        <div className="w-8 h-8 rounded-full bg-white/20 mb-4"></div>
                                                        <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                                    </div>
                                                </div>
                                                {/* Contenido simulado */}
                                                <div className="flex-1 bg-gray-100 p-4">
                                                    <div className="h-8 bg-white rounded-md mb-4"></div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                        <div className="h-24 bg-white rounded-md"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Contenedor para opciones de posición del sidebar */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold mb-4">Posición del Sidebar</h3>
                                    <div className="flex justify-center space-x-4 flex-wrap">
                                        <button 
                                            className={`p-4 border rounded-lg hover:bg-gray-100 transition-colors ${selectedPosition === 'left' ? 'ring-2 ring-blue-500' : ''}`}
                                            onClick={() => {
                                                setSelectedPosition('left');
                                                toast.info("Sidebar a la izquierda seleccionado");
                                            }}
                                        >
                                            <div className="flex h-20 w-32 border rounded overflow-hidden">
                                                <div className="w-1/4 bg-gray-300"></div>
                                                <div className="w-3/4 bg-white"></div>
                                            </div>
                                            <p className="mt-2 text-sm font-medium">Izquierda</p>
                                        </button>
                                        <button 
                                            className={`p-4 border rounded-lg hover:bg-gray-100 transition-colors ${selectedPosition === 'right' ? 'ring-2 ring-blue-500' : ''}`}
                                            onClick={() => {
                                                setSelectedPosition('right');
                                                toast.info("Sidebar a la derecha seleccionado");
                                            }}
                                        >
                                            <div className="flex h-20 w-32 border rounded overflow-hidden">
                                                <div className="w-3/4 bg-white"></div>
                                                <div className="w-1/4 bg-gray-300"></div>
                                            </div>
                                            <p className="mt-2 text-sm font-medium">Derecha</p>
                                        </button>
                                        <button 
                                            className={`p-4 border rounded-lg hover:bg-gray-100 transition-colors mt-4 ${selectedPosition === 'top' ? 'ring-2 ring-blue-500' : ''}`}
                                            onClick={() => {
                                                setSelectedPosition('top');
                                                toast.info("Sidebar arriba seleccionado");
                                            }}
                                        >
                                            <div className="flex flex-col h-20 w-32 border rounded overflow-hidden">
                                                <div className="h-1/4 w-full bg-gray-300"></div>
                                                <div className="h-3/4 w-full bg-white"></div>
                                            </div>
                                            <p className="mt-2 text-sm font-medium">Arriba</p>
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-lg font-semibold mb-4">Aplicar Cambios</h3>
                                    <p className="text-sm text-gray-500 mb-4">Aplica los cambios de color y posición al sidebar de tu aplicación.</p>
                                    <div className="flex justify-center">
                                        <Button
                                            onClick={() => {
                                                const sidebarColor = useSidebarColor.getState();
                                                sidebarColor.setSidebarColor(selectedColor);
                                                sidebarColor.setSidebarPosition(selectedPosition);
                                                toast.success("Configuración del sidebar actualizada");
                                            }}
                                            className="bg-custom-blue hover:bg-custom-blue/90 dark:bg-custom-gold dark:hover:bg-custom-gold/90 dark:text-black"
                                        >
                                            Aplicar Cambios
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
