"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Building2,
    Plus,
    Search,
    Filter,
    ArrowUpDown,
    MoreHorizontal,
    Download,
    FileText,
    User,
    Mail,
    Phone,
    MapPin,
    Pencil,
    Package,
    ChevronDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import ProviderForm from "@/components/inventory/ProviderForm"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { getProviders, getSubAccountsForAgency } from "@/lib/queries2"

// Tipo para el proveedor
type Provider = {
    id: string
    name: string
    contactName: string | null
    email: string | null
    phone: string | null
    address: string | null
    active: boolean
    createdAt: Date | string
    agencyId: string
    subAccountId: string | null
}

// Props del componente
interface ProvidersPageProps {
    agencyId: string
}

const ProvidersPage = ({ agencyId }: ProvidersPageProps) => {
    const router = useRouter()
    // Estados para proveedores y subcuentas
    const [providers, setProviders] = useState<Provider[]>([])
    const [subaccounts, setSubaccounts] = useState<any[]>([])
    const [selectedStores, setSelectedStores] = useState<string[]>(["all"])
    const [filteredProviders, setFilteredProviders] = useState<Provider[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)

    // Estados para filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
    const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "date-newest" | "date-oldest">("name-asc")

    // Cargar datos iniciales
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true)
                const [subaccountsData, providersData] = await Promise.all([
                    getSubAccountsForAgency(agencyId),
                    getProviders(agencyId),
                ])

                setSubaccounts(subaccountsData || [])
                setProviders(providersData || [])
                setFilteredProviders(providersData || [])
            } catch (error) {
                console.error("Error al cargar datos:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudieron cargar los datos. Por favor, intente de nuevo.",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [agencyId])

    // Manejar la selección de tiendas
    const handleStoreSelection = (storeId: string) => {
        setSelectedStores((prev) => {
            let newSelection: string[]
            if (storeId === "all") {
                newSelection = prev.includes("all") ? [] : ["all", ...subaccounts.map((sa) => sa.id)]
            } else {
                if (prev.includes(storeId)) {
                    newSelection = prev.filter((id) => id !== storeId && id !== "all")
                } else {
                    newSelection = [...prev.filter((id) => id !== "all"), storeId]
                    if (newSelection.length === subaccounts.length) {
                        newSelection = ["all", ...newSelection]
                    }
                }
            }
            return newSelection
        })
    }

    // Efecto para filtrar proveedores
    useEffect(() => {
        if (selectedStores.length === 0 || selectedStores.includes("all")) {
            setFilteredProviders(providers)
        } else {
            const filtered = providers.filter((provider) => 
                provider.subAccountId && selectedStores.includes(provider.subAccountId)
            )
            setFilteredProviders(filtered)
        }
    }, [selectedStores, providers])

    // Funciones de exportación
    const handleExportToExcel = () => {
        console.log("Exportando a Excel...")
        toast({
            title: "Exportación a Excel",
            description: "Funcionalidad en desarrollo",
        })
    }

    const handleGenerateDirectory = () => {
        console.log("Generando directorio...")
        toast({
            title: "Generación de directorio",
            description: "Funcionalidad en desarrollo",
        })
    }

    const handleEditProvider = (provider: Provider) => {
        setSelectedProvider(provider)
        setIsProviderModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsProviderModalOpen(false)
        setSelectedProvider(null)
    }

    // Proveedores filtrados y ordenados
    const filteredAndSortedProviders = useMemo(() => {
        let filtered = filteredProviders

        // Filtrar por término de búsqueda
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (provider) =>
                    provider.name.toLowerCase().includes(searchLower) ||
                    provider.contactName?.toLowerCase().includes(searchLower) ||
                    provider.email?.toLowerCase().includes(searchLower) ||
                    provider.phone?.toLowerCase().includes(searchLower),
            )
        }

        // Filtrar por estado
        if (statusFilter === "active") {
            filtered = filtered.filter((provider) => provider.active)
        } else if (statusFilter === "inactive") {
            filtered = filtered.filter((provider) => !provider.active)
        }

        // Ordenar
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name-asc":
                    return a.name.localeCompare(b.name)
                case "name-desc":
                    return b.name.localeCompare(a.name)
                case "date-newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case "date-oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                default:
                    return 0
            }
        })

        return filtered
    }, [filteredProviders, searchTerm, statusFilter, sortBy])

    // Estadísticas calculadas
    const stats = useMemo(() => {
        const total = providers.length
        const active = providers.filter((p) => p.active).length
        const pendingOrders = 0 // Esto vendría de tu lógica de órdenes

        return { total, active, pendingOrders }
    }, [providers])

    return (
        <div className="container mx-auto p-6">
            {/* Header con título y acciones */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
                    <p className="text-muted-foreground">Administre sus proveedores, contactos y productos asociados</p>
                </div>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtrar
                                {statusFilter !== "all" && (
                                    <Badge variant="secondary" className="ml-2">
                                        {statusFilter === "active" ? "Activos" : "Inactivos"}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                                <DropdownMenuRadioItem value="all">Todos los proveedores</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="active">
                                    <Badge variant="outline" className="mr-2">Activos</Badge>
                                    Solo activos
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="inactive">
                                    <Badge variant="outline" className="mr-2">Inactivos</Badge>
                                    Solo inactivos
                                </DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                Ordenar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                                <DropdownMenuRadioItem value="name-asc">Nombre (A-Z)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="name-desc">Nombre (Z-A)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="date-newest">Fecha de registro (más reciente)</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="date-oldest">Fecha de registro (más antiguo)</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4 mr-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleExportToExcel}>
                                <Download className="h-4 w-4 mr-2" />
                                Exportar a Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleGenerateDirectory}>
                                <FileText className="h-4 w-4 mr-2" />
                                Generar directorio
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button size="sm" onClick={() => {
                        setSelectedProvider(null)
                        setIsProviderModalOpen(true)
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Proveedor
                    </Button>
                </div>
            </div>

            {/* Modal de Proveedor */}
            <ProviderForm
                agencyId={agencyId}
                isOpen={isProviderModalOpen}
                onClose={handleCloseModal}                provider={selectedProvider ? {
                    id: selectedProvider.id,
                    name: selectedProvider.name,
                    contactName: selectedProvider.contactName || undefined,
                    email: selectedProvider.email || undefined,
                    phone: selectedProvider.phone || undefined,
                    address: selectedProvider.address || undefined,
                    subAccountId: selectedProvider.subAccountId || undefined
                } : undefined}
                isEditing={!!selectedProvider}
            />

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total de Proveedores</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Proveedores Activos</p>
                                <p className="text-2xl font-bold">{stats.active}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Órdenes Pendientes</p>
                                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <Package className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Búsqueda y filtros */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar proveedores por nombre, contacto o email..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="min-w-[180px] justify-between">
                                    <span>
                                        {selectedStores.includes("all") ? "Todas las tiendas" : `${selectedStores.length} tienda(s)`}
                                    </span>
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Seleccionar tiendas</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <div className="p-2 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="tienda-todas"
                                            checked={selectedStores.includes("all")}
                                            onCheckedChange={() => handleStoreSelection("all")}
                                        />
                                        <label
                                            htmlFor="tienda-todas"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Todas las tiendas
                                        </label>
                                    </div>
                                    {subaccounts.map((subaccount) => (
                                        <div className="flex items-center space-x-2" key={subaccount.id}>
                                            <Checkbox
                                                id={`subcuenta-${subaccount.id}`}
                                                checked={selectedStores.includes(subaccount.id)}
                                                onCheckedChange={() => handleStoreSelection(subaccount.id)}
                                            />
                                            <label
                                                htmlFor={`subcuenta-${subaccount.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {subaccount.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Pestañas de visualización */}
            <Tabs defaultValue="cards" className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="cards">
                            <div className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-2"
                                >
                                    <rect width="7" height="7" x="3" y="3" rx="1" />
                                    <rect width="7" height="7" x="14" y="3" rx="1" />
                                    <rect width="7" height="7" x="14" y="14" rx="1" />
                                    <rect width="7" height="7" x="3" y="14" rx="1" />
                                </svg>
                                Tarjetas
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="table">
                            <div className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-2"
                                >
                                    <path d="M3 3h18v18H3z" />
                                    <path d="M3 9h18" />
                                    <path d="M3 15h18" />
                                    <path d="M9 3v18" />
                                    <path d="M15 3v18" />
                                </svg>
                                Tabla
                            </div>
                        </TabsTrigger>
                    </TabsList>
                    <div className="text-sm text-muted-foreground">
                        Mostrando {filteredAndSortedProviders.length} de {providers.length} proveedores
                        {searchTerm && <span className="ml-2">• Búsqueda: &quot;{searchTerm}&quot;</span>}
                    </div>
                </div>

                <TabsContent value="cards" className="mt-0">
                    {filteredAndSortedProviders.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-10">
                                <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-medium mb-2">
                                    {providers.length === 0 ? "No hay proveedores registrados" : "No se encontraron proveedores"}
                                </h3>
                                <p className="text-muted-foreground text-center mb-6">
                                    {providers.length === 0
                                        ? "Agregue su primer proveedor para comenzar a gestionar sus compras e inventario."
                                        : "Intente ajustar los filtros o el término de búsqueda."}
                                </p>
                                {providers.length === 0 && (
                                    <Button onClick={() => {
                                        setSelectedProvider(null)
                                        setIsProviderModalOpen(true)
                                    }}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nuevo Proveedor
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAndSortedProviders.map((provider) => (
                                <Card key={provider.id?.toString()} className="overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-medium text-lg">{provider.name}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {provider.createdAt
                                                        ? new Date(provider.createdAt).toLocaleDateString()
                                                        : "Fecha no disponible"}
                                                </p>
                                            </div>
                                            <Badge variant={provider.active ? "default" : "secondary"}>
                                                {provider.active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2">
                                                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span>{provider.contactName || "Sin contacto"}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span>{provider.email || "Sin email"}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span>{provider.phone || "Sin teléfono"}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span className="text-sm line-clamp-2">{provider.address || "Sin dirección"}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-6">
                                            <span className="text-sm text-muted-foreground">Sin órdenes pendientes</span>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditProvider(provider)}
                                            >
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="table" className="mt-0">
                    <Card>
                        <CardContent className="p-0">
                            {filteredAndSortedProviders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-10">
                                    <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-xl font-medium mb-2">
                                        {providers.length === 0 ? "No hay proveedores registrados" : "No se encontraron proveedores"}
                                    </h3>
                                    <p className="text-muted-foreground text-center mb-6">
                                        {providers.length === 0
                                            ? "Agregue su primer proveedor para comenzar a gestionar sus compras e inventario."
                                            : "Intente ajustar los filtros o el término de búsqueda."}
                                    </p>
                                    {providers.length === 0 && (
                                        <Button onClick={() => {
                                            setSelectedProvider(null)
                                            setIsProviderModalOpen(true)
                                        }}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Nuevo Proveedor
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead className="hidden md:table-cell">Contacto</TableHead>
                                            <TableHead className="hidden md:table-cell">Email/Teléfono</TableHead>
                                            <TableHead className="hidden lg:table-cell">Dirección</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAndSortedProviders.map((provider) => (
                                            <TableRow key={provider.id?.toString()}>
                                                <TableCell className="font-medium">{provider.name}</TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {provider.contactName || "—"}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div>{provider.email || "—"}</div>
                                                    <div className="text-sm text-muted-foreground">{provider.phone || "—"}</div>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell max-w-xs truncate">
                                                    {provider.address || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={provider.active ? "default" : "secondary"}>
                                                        {provider.active ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditProvider(provider)}
                                                        >
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            Editar
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ProvidersPage
