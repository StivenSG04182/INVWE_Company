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
        // Cargar datos reales de clientes
        const loadClients = async () => {
            try {
                setIsLoading(true)
                // Importar la función getClients de client-queries.ts
                const { getClients } = await import('@/lib/client-queries')
                
                // Obtener los clientes reales de la base de datos
                const clientsData = await getClients(agencyId)
                
                // Establecer los clientes obtenidos en el estado
                setClients(clientsData)
                setIsLoading(false)
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

    // Function to add a new client using real database function
    const handleAddClient = async (clientData: any) => {
        try {
            // Importar la función createClient de client-queries.ts
            const { createClient } = await import('@/lib/client-queries')
            
            // Crear el cliente usando la función real
            const newClient = await createClient(agencyId, clientData)
            
            // Actualizar la lista de clientes
            setClients([...clients, newClient])
            return newClient
        } catch (error) {
            console.error("Error al crear cliente:", error)
            return null
        }
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
