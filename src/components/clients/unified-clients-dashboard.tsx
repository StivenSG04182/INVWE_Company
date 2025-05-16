"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    PlusCircle,
    Users,
    BarChart3,
    MessageSquare,
    Search,
    Filter,
    Download,
    UserPlus,
    PlusSquare,
} from "lucide-react"
import ClientsDirectory from "./clients-directory"
import CrmDashboard from "./crm-dashboard"
import PqrChat from "./pqr-chat"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export default function UnifiedClientsDashboard({ agencyId, user }: { agencyId: string; user: any }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Get the active tab from URL or default to "directory"
    const [activeTab, setActiveTab] = useState(() => {
        const tab = searchParams.get("tab")
        return tab && ["directory", "crm", "pqr"].includes(tab) ? tab : "directory"
    })

    // Get the selected client ID from URL if any
    const [selectedClientId, setSelectedClientId] = useState<string | null>(searchParams.get("clientId"))
    
    // Referencia para acceder al componente ClientsDirectory
    const clientsDirectoryRef = useRef<any>(null)

    // Mock client data for demonstration
    const [clients, setClients] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Update URL when tab changes
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set("tab", activeTab)
        if (selectedClientId) {
            newSearchParams.set("clientId", selectedClientId)
        } else {
            newSearchParams.delete("clientId")
        }

        router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false })
    }, [activeTab, selectedClientId, pathname, router, searchParams])

    useEffect(() => {
        // Simulate loading client data
        const loadClients = async () => {
            try {
                // In a real implementation, this would be an API call
                // await ClientService.getClients(agencyId)

                // Mock data for demonstration
                setTimeout(() => {
                    setClients([
                        {
                            id: "client1",
                            name: "Empresa ABC",
                            type: "empresa",
                            email: "contacto@empresaabc.com",
                            phone: "+57 300 123 4567",
                            address: "Calle 123 #45-67, Bogotá",
                            totalPurchases: 12500000,
                            lastPurchase: "2023-10-15",
                            status: "active",
                            contactPerson: "Juan Pérez",
                            createdAt: "2023-01-15",
                        },
                        {
                            id: "client2",
                            name: "María González",
                            type: "individual",
                            email: "maria.gonzalez@email.com",
                            phone: "+57 311 987 6543",
                            address: "Carrera 45 #12-34, Medellín",
                            totalPurchases: 3500000,
                            lastPurchase: "2023-09-28",
                            status: "active",
                            contactPerson: null,
                            createdAt: "2023-03-22",
                        },
                        {
                            id: "client3",
                            name: "Distribuidora XYZ",
                            type: "empresa",
                            email: "info@distribuidoraxyz.com",
                            phone: "+57 320 456 7890",
                            address: "Avenida 67 #89-12, Cali",
                            totalPurchases: 8750000,
                            lastPurchase: "2023-10-05",
                            status: "active",
                            contactPerson: "Ana Martínez",
                            createdAt: "2023-02-10",
                        },
                        {
                            id: "client4",
                            name: "Carlos Rodríguez",
                            type: "individual",
                            email: "carlos.rodriguez@email.com",
                            phone: "+57 315 234 5678",
                            address: "Calle 78 #23-45, Barranquilla",
                            totalPurchases: 1200000,
                            lastPurchase: "2023-08-17",
                            status: "inactive",
                            contactPerson: null,
                            createdAt: "2023-04-05",
                        },
                        {
                            id: "client5",
                            name: "Tecnología Moderna S.A.",
                            type: "empresa",
                            email: "contacto@tecnomodern.com",
                            phone: "+57 301 876 5432",
                            address: "Carrera 34 #56-78, Bogotá",
                            totalPurchases: 15800000,
                            lastPurchase: "2023-10-12",
                            status: "active",
                            contactPerson: "Laura Gómez",
                            createdAt: "2023-01-30",
                        },
                    ])
                    setIsLoading(false)
                }, 1000)
            } catch (error) {
                console.error("Error loading clients:", error)
                setIsLoading(false)
            }
        }

        loadClients()
    }, [agencyId])

    // Function to handle client selection
    const handleClientSelect = (clientId: string) => {
        setSelectedClientId(clientId)
        if (activeTab === "directory") {
            setActiveTab("crm")
        }
    }

    // Function to add a new client
    const handleAddClient = (clientData: any) => {
        const newClient = {
            id: `client${clients.length + 1}`,
            ...clientData,
            totalPurchases: 0,
            lastPurchase: null,
            status: "active",
            createdAt: new Date().toISOString().split("T")[0],
        }

        setClients([...clients, newClient])
        return newClient
    }

    const tabTitles = {
        directory: "Directorio de Clientes",
        crm: "CRM",
        pqr: "Comunicaciones y PQR",
    }

    const tabGradients = {
        directory: "from-blue-600 to-indigo-500",
        crm: "from-purple-600 to-pink-500",
        pqr: "from-green-600 to-teal-500",
    }

    const selectedClient = selectedClientId ? clients.find((client) => client.id === selectedClientId) : null

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Encabezado con título y acciones */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1
                        className={`text-3xl font-bold bg-gradient-to-r ${tabGradients[activeTab as keyof typeof tabGradients]} bg-clip-text text-transparent`}
                    >
                        {tabTitles[activeTab as keyof typeof tabTitles]}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {activeTab === "directory"
                            ? "Administre la información de sus clientes, historial y datos de contacto"
                            : activeTab === "crm"
                                ? "Gestione sus contactos, oportunidades de venta y seguimiento"
                                : "Comunicación directa con sus clientes y gestión de PQR"}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    {activeTab === "directory" && (
                        <Button className="flex items-center gap-2" onClick={() => {
                            // Acceder al componente hijo ClientsDirectory a través de la referencia
                            if (clientsDirectoryRef.current) {
                                clientsDirectoryRef.current.openAddClientDialog();
                            }
                        }}>
                            <UserPlus className="h-4 w-4" />
                            <span>Nuevo Cliente</span>
                        </Button>
                    )}

                    {activeTab === "crm" && (
                        <Button className="flex items-center gap-2" onClick={() => setActiveTab("crm")}>
                            <PlusSquare className="h-4 w-4" />
                            <span>Nueva Oportunidad</span>
                        </Button>
                    )}

                    {activeTab === "pqr" && (
                        <Button className="flex items-center gap-2" onClick={() => setActiveTab("pqr")}>
                            <PlusCircle className="h-4 w-4" />
                            <span>Nuevo Ticket</span>
                        </Button>
                    )}

                    <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Filtrar</span>
                    </Button>

                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>Exportar</span>
                    </Button>

                    <Button variant="outline" className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        <span className="hidden sm:inline">Buscar</span>
                    </Button>
                </div>
            </div>

            {/* Navegación principal */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="border-b">
                            <div className="flex overflow-x-auto scrollbar-hide">
                                <TabsList className="bg-transparent h-auto p-0 flex w-full justify-start">
                                    <TabsTrigger
                                        value="directory"
                                        className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none data-[state=active]:shadow-none"
                                    >
                                        <Users className="h-4 w-4" />
                                        <span className="hidden sm:inline">Directorio</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="crm"
                                        className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none data-[state=active]:shadow-none"
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                        <span className="hidden sm:inline">CRM</span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="pqr"
                                        className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none data-[state=active]:shadow-none"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        <span className="hidden sm:inline">Comunicaciones</span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </div>

                        <TabsContent value="directory" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
                            <ClientsDirectory
                                ref={clientsDirectoryRef}
                                agencyId={agencyId}
                                subAccountId={undefined}
                                onClientSelect={handleClientSelect}
                            />
                        </TabsContent>

                        <TabsContent value="crm" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
                            <CrmDashboard clients={clients} selectedClient={selectedClient} isLoading={isLoading} />
                        </TabsContent>

                        <TabsContent value="pqr" className="pt-4 focus-visible:outline-none focus-visible:ring-0">
                            <PqrChat clients={clients} selectedClient={selectedClient} isLoading={isLoading} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
