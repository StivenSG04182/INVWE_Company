"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    BarChart,
    Building2,
    Calendar,
    ChevronRight,
    Clock,
    DollarSign,
    FileText,
    Mail,
    MapPin,
    Phone,
    PieChart,
    PlusSquare,
    User,
    Users,
} from "lucide-react"

export default function CrmDashboard({
    clients,
    selectedClient,
    isLoading,
}: {
    clients: any[] // Ahora recibe clientes reales de la base de datos
    selectedClient: any
    isLoading: boolean
}) {
    const [activeTab, setActiveTab] = useState("overview")
    const [filterStatus, setFilterStatus] = useState("all")

    // Usar oportunidades reales del cliente seleccionado
    // Si no hay oportunidades reales, usamos un array vacío
    const opportunities = selectedClient?.Opportunities || []
    
    // Función para crear una nueva oportunidad
    const handleCreateOpportunity = async (opportunityData: any) => {
        if (!selectedClient) return null
        
        try {
            // Importar la función createOpportunity de client-queries.ts
            const { createOpportunity } = await import('@/lib/client-queries')
            
            // Añadir el ID del cliente a los datos
            const data = {
                ...opportunityData,
                clientId: selectedClient.id
            }
            
            // Crear la oportunidad usando la función real
            const newOpportunity = await createOpportunity(data)
            
            // Actualizar el cliente seleccionado con la nueva oportunidad
            if (selectedClient && selectedClient.Opportunities) {
                selectedClient.Opportunities = [...selectedClient.Opportunities, newOpportunity]
            }
            
            return newOpportunity
        } catch (error) {
            console.error("Error al crear oportunidad:", error)
            return null
        }
    }

    // Filter opportunities by status if needed
    const filteredOpportunities = opportunities.filter((opp) => {
        if (filterStatus === "all") return true
        return opp.status?.toLowerCase() === filterStatus
    })

    // Ya no necesitamos filtrar por cliente, ya que opportunities ya contiene solo las del cliente seleccionado
    const clientOpportunities = opportunities

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(value)
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "short", day: "numeric" }).format(date)
    }

    const getStageName = (status: string) => {
        const statusNames: Record<string, string> = {
            new: "Nuevo",
            qualified: "Calificado",
            proposal: "Propuesta",
            negotiation: "Negociación",
            won: "Ganado",
            lost: "Perdido",
        }
        return statusNames[status?.toLowerCase()] || status
    }

    const getStageColor = (status: string) => {
        const statusColors: Record<string, string> = {
            new: "bg-blue-500",
            qualified: "bg-purple-500",
            proposal: "bg-amber-500",
            negotiation: "bg-green-500",
            won: "bg-emerald-500",
            lost: "bg-red-500",
        }
        return statusColors[status?.toLowerCase()] || "bg-gray-500"
    }

    const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            new: "outline",
            qualified: "secondary",
            proposal: "secondary",
            negotiation: "default",
            won: "default",
            lost: "destructive",
        }
        return statusVariants[status?.toLowerCase()] || "outline"
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {selectedClient ? (
                <div className="space-y-6">
                    {/* Cliente seleccionado */}
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    {selectedClient.type === "empresa" ? (
                                        <Building2 className="h-8 w-8 text-primary" />
                                    ) : (
                                        <User className="h-8 w-8 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
                                    <p className="text-muted-foreground">
                                        {selectedClient.type === "empresa" ? "Empresa" : "Persona Natural"}
                                        {selectedClient.type === "empresa" &&
                                            selectedClient.contactPerson &&
                                            ` • Contacto: ${selectedClient.contactPerson}`}
                                    </p>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedClient.email}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedClient.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedClient.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Compras Totales</p>
                                    <p className="text-2xl font-bold">{formatCurrency(selectedClient.totalPurchases)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Ver Historial
                                    </Button>
                                    <Button size="sm">
                                        <PlusSquare className="h-4 w-4 mr-2" />
                                        Nueva Oportunidad
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pestañas de información del cliente */}
                    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="overview">Resumen</TabsTrigger>
                            <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
                            <TabsTrigger value="history">Historial</TabsTrigger>
                            <TabsTrigger value="notes">Notas</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base font-medium">Información General</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Cliente desde:</dt>
                                                <dd>{formatDate(selectedClient.createdAt)}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Última compra:</dt>
                                                <dd>{selectedClient.lastPurchase ? formatDate(selectedClient.lastPurchase) : "Sin compras"}</dd>
                                            </div>
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">Estado:</dt>
                                                <dd>
                                                    <Badge variant={selectedClient.status === "active" ? "success" : "secondary"}>
                                                        {selectedClient.status === "active" ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </dd>
                                            </div>
                                        </dl>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base font-medium">Oportunidades</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Abiertas:</span>
                                                <span className="font-medium">
                                                    {clientOpportunities.filter((o) => o.stage !== "closed" && o.stage !== "lost").length}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Cerradas:</span>
                                                <span className="font-medium">
                                                    {clientOpportunities.filter((o) => o.stage === "closed").length}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Valor potencial:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        clientOpportunities
                                                            .filter((o) => o.stage !== "lost")
                                                            .reduce((sum, opp) => sum + opp.value, 0),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button variant="ghost" size="sm" className="w-full justify-start">
                                            <ChevronRight className="h-4 w-4 mr-2" />
                                            Ver todas
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base font-medium">Actividad Reciente</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-2">
                                                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center mt-0.5">
                                                    <Mail className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Correo enviado</p>
                                                    <p className="text-xs text-muted-foreground">Hace 2 días</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5">
                                                    <Phone className="h-4 w-4 text-green-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Llamada realizada</p>
                                                    <p className="text-xs text-muted-foreground">Hace 5 días</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button variant="ghost" size="sm" className="w-full justify-start">
                                            <ChevronRight className="h-4 w-4 mr-2" />
                                            Ver historial
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>

                            {clientOpportunities.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Oportunidades Activas</CardTitle>
                                        <CardDescription>Oportunidades de venta en curso con este cliente</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {clientOpportunities
                                                .filter((opp) => opp.stage !== "closed" && opp.stage !== "lost")
                                                .map((opportunity) => (
                                                    <div
                                                        key={opportunity.id}
                                                        className="flex flex-col sm:flex-row justify-between gap-4 p-4 border rounded-lg"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`h-3 w-3 rounded-full ${getStageColor(opportunity.status)}`}></div>
                                                <h3 className="font-medium">{opportunity.title}</h3>
                                                <Badge variant={getBadgeVariant(opportunity.status)}>
                                                    {getStageName(opportunity.status)}
                                                </Badge>
                                                            </div>
                                                            <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                    <span>{formatCurrency(Number(opportunity.value))}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span>Cierre: {opportunity.dueDate ? formatDate(opportunity.dueDate) : 'No definido'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span>Asignado a: {opportunity.AssignedUser?.name || 'Sin asignar'}</span>
                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end justify-center">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium">{opportunity.probability}%</span>
                                                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-primary"
                                                                        style={{ width: `${opportunity.probability}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="opportunities" className="space-y-4">
                            <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div>
                                            <CardTitle>Oportunidades</CardTitle>
                                            <CardDescription>Gestione las oportunidades de venta con este cliente</CardDescription>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="gap-1"
                                            onClick={() => {
                                                if (!selectedClient) return;
                                                // Aquí se podría abrir un modal para crear una nueva oportunidad
                                                const opportunityData = {
                                                    title: `Nueva oportunidad para ${selectedClient.name}`,
                                                    description: "Descripción de la oportunidad",
                                                    value: 0,
                                                    status: "NEW",
                                                    priority: "MEDIUM",
                                                    clientId: selectedClient.id
                                                };
                                                handleCreateOpportunity(opportunityData);
                                            }}
                                        >
                                            <PlusSquare className="h-4 w-4" />
                                            Nueva Oportunidad
                                        </Button>
                                    </CardHeader>
                                <CardContent className="pt-4">
                                    {clientOpportunities.length > 0 ? (
                                        <div className="space-y-4">
                                            {clientOpportunities.map((opportunity) => (
                                                <div
                                                    key={opportunity.id}
                                                    className="flex flex-col sm:flex-row justify-between gap-4 p-4 border rounded-lg"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-3 w-3 rounded-full ${getStageColor(opportunity.stage)}`}></div>
                                                            <h3 className="font-medium">{opportunity.title}</h3>
                                                            <Badge variant={getBadgeVariant(opportunity.stage)}>
                                                                {getStageName(opportunity.stage)}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                                <span>{formatCurrency(opportunity.value)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                <span>Cierre: {formatDate(opportunity.expectedCloseDate)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-4 w-4 text-muted-foreground" />
                                                                <span>Asignado a: {opportunity.assignedTo}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                                <span>Creado: {formatDate(opportunity.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end justify-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">{opportunity.probability}%</span>
                                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary"
                                                                    style={{ width: `${opportunity.probability}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 mt-2">
                                                            <Button variant="outline" size="sm">
                                                                Editar
                                                            </Button>
                                                            <Button size="sm">Avanzar</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-medium">Sin oportunidades</h3>
                                            <p className="text-muted-foreground text-center max-w-md mt-2">
                                                No hay oportunidades de venta registradas para este cliente. Cree una nueva oportunidad para
                                                comenzar el seguimiento.
                                            </p>
                                            <Button className="mt-4">
                                                <PlusSquare className="h-4 w-4 mr-2" />
                                                Nueva Oportunidad
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Historial de Interacciones</CardTitle>
                                    <CardDescription>Registro de todas las interacciones con este cliente</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative pl-6 border-l">
                                        <div className="space-y-6">
                                            <div className="relative">
                                                <div className="absolute -left-[25px] h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                    <Mail className="h-3 w-3 text-blue-500" />
                                                </div>
                                                <div className="mb-1">
                                                    <h4 className="text-sm font-medium">Correo enviado: Propuesta comercial</h4>
                                                    <p className="text-xs text-muted-foreground">15 de octubre, 2023 - 10:30 AM</p>
                                                </div>
                                                <p className="text-sm">Se envió propuesta comercial para renovación de contrato anual.</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-[25px] h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center">
                                                    <Phone className="h-3 w-3 text-green-500" />
                                                </div>
                                                <div className="mb-1">
                                                    <h4 className="text-sm font-medium">Llamada realizada: Seguimiento</h4>
                                                    <p className="text-xs text-muted-foreground">12 de octubre, 2023 - 3:45 PM</p>
                                                </div>
                                                <p className="text-sm">
                                                    Llamada de seguimiento para discutir términos de renovación. Cliente interesado en ampliar
                                                    servicios.
                                                </p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -left-[25px] h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center">
                                                    <Users className="h-3 w-3 text-purple-500" />
                                                </div>
                                                <div className="mb-1">
                                                    <h4 className="text-sm font-medium">Reunión: Presentación inicial</h4>
                                                    <p className="text-xs text-muted-foreground">5 de octubre, 2023 - 9:00 AM</p>
                                                </div>
                                                <p className="text-sm">
                                                    Reunión inicial para presentar servicios y discutir necesidades del cliente.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full">
                                        Cargar más
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notas</CardTitle>
                                    <CardDescription>Notas internas sobre este cliente</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">Preferencias del cliente</h4>
                                                <span className="text-xs text-muted-foreground">15 de octubre, 2023</span>
                                            </div>
                                            <p className="text-sm">
                                                Cliente prefiere comunicación por correo electrónico. Interesado principalmente en servicios
                                                premium.
                                            </p>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">Información de contacto adicional</h4>
                                                <span className="text-xs text-muted-foreground">10 de octubre, 2023</span>
                                            </div>
                                            <p className="text-sm">
                                                Contacto secundario: María López, Asistente Administrativa. Tel: +57 311 234 5678
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button variant="outline">Ver todas</Button>
                                    <Button>Agregar nota</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            ) : (
                <>
                    {/* Métricas principales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Contactos</h3>
                                    <p className="text-3xl font-bold">{clients.length}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-purple-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Oportunidades</h3>
                                    <p className="text-3xl font-bold">{opportunities.length}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <BarChart className="h-6 w-6 text-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Valor Potencial</h3>
                                    <p className="text-3xl font-bold">
                                        {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.value, 0))}
                                    </p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Embudo de ventas */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>Embudo de Ventas</CardTitle>
                                <CardDescription>Seguimiento de oportunidades por etapa</CardDescription>
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por etapa" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las etapas</SelectItem>
                                    <SelectItem value="prospect">Prospectos</SelectItem>
                                    <SelectItem value="qualified">Calificados</SelectItem>
                                    <SelectItem value="proposal">Propuestas</SelectItem>
                                    <SelectItem value="negotiation">Negociación</SelectItem>
                                    <SelectItem value="closed">Cerrados</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
                                {["prospect", "qualified", "proposal", "negotiation", "closed"].map((stage) => {
                                    const stageOpportunities = opportunities.filter((opp) => opp.stage === stage)
                                    const stageValue = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0)
                                    const stageCount = stageOpportunities.length
                                    const stagePercentage = Math.round((stageCount / opportunities.length) * 100) || 0

                                    return (
                                        <div key={stage} className="flex flex-col items-center p-4 border rounded-lg">
                                            <div className={`h-3 w-3 rounded-full ${getStageColor(stage)} mb-2`}></div>
                                            <h4 className="font-medium text-center">{getStageName(stage)}</h4>
                                            <p className="text-2xl font-bold mt-2">{stageCount}</p>
                                            <p className="text-sm text-muted-foreground">{formatCurrency(stageValue)}</p>
                                            <Progress value={stagePercentage} className="h-1 w-full mt-2" />
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="space-y-4">
                                {filteredOpportunities.length > 0 ? (
                                    filteredOpportunities.map((opportunity) => {
                                        const client = clients.find((c) => c.id === opportunity.clientId)

                                        return (
                                            <div
                                                key={opportunity.id}
                                                className="flex flex-col sm:flex-row justify-between gap-4 p-4 border rounded-lg"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-3 w-3 rounded-full ${getStageColor(opportunity.stage)}`}></div>
                                                        <h3 className="font-medium">{opportunity.title}</h3>
                                                        <Badge variant={getBadgeVariant(opportunity.stage)}>
                                                            {getStageName(opportunity.stage)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback className="text-xs">
                                                                {client?.type === "empresa" ? (
                                                                    <Building2 className="h-3 w-3" />
                                                                ) : (
                                                                    <User className="h-3 w-3" />
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">{client?.name || "Cliente desconocido"}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                            <span>{formatCurrency(opportunity.value)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <span>Cierre: {formatDate(opportunity.expectedCloseDate)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span>Asignado a: {opportunity.assignedTo}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end justify-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">{opportunity.probability}%</span>
                                                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary" style={{ width: `${opportunity.probability}%` }}></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <Button variant="outline" size="sm">
                                                            Editar
                                                        </Button>
                                                        <Button size="sm">Avanzar</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium">Sin oportunidades</h3>
                                        <p className="text-muted-foreground text-center max-w-md mt-2">
                                            No hay oportunidades de venta registradas con los filtros actuales. Intente cambiar los filtros o
                                            cree una nueva oportunidad.
                                        </p>
                                        <Button className="mt-4">
                                            <PlusSquare className="h-4 w-4 mr-2" />
                                            Nueva Oportunidad
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Análisis de ventas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribución por Etapa</CardTitle>
                                <CardDescription>Valor de oportunidades por etapa del embudo</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="h-60 flex items-center justify-center bg-muted/20 rounded-md">
                                    <PieChart className="h-16 w-16 text-muted-foreground/50" />
                                    <span className="ml-4 text-muted-foreground">Gráfico de distribución por etapa</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Rendimiento de Ventas</CardTitle>
                                <CardDescription>Análisis de oportunidades ganadas vs perdidas</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="h-60 flex items-center justify-center bg-muted/20 rounded-md">
                                    <BarChart className="h-16 w-16 text-muted-foreground/50" />
                                    <span className="ml-4 text-muted-foreground">Gráfico de rendimiento de ventas</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
