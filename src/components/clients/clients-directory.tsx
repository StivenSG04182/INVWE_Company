"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ClientService, ClientData } from "@/lib/services/client-service"
import { ClientStatus, ClientType } from "@prisma/client"
import {
    Search,
    MoreVertical,
    Edit,
    Trash2,
    UserPlus,
    Mail,
    Phone,
    Building2,
    User,
    Calendar,
    DollarSign,
    Loader2,
    AlertCircle,
} from "lucide-react"
import { Users } from "lucide-react" // Added import for Users

const ClientsDirectory = forwardRef(function ClientsDirectory({
    agencyId,
    subAccountId,
    onClientSelect,
}: {
    agencyId: string
    subAccountId?: string
    onClientSelect: (clientId: string) => void
}, ref) {
    // Exponer métodos al componente padre
    useImperativeHandle(ref, () => ({
        openAddClientDialog: () => setIsAddClientOpen(true)
    }));
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState("")
    const [clientType, setClientType] = useState("all")
    const [sortBy, setSortBy] = useState("name")
    const [isAddClientOpen, setIsAddClientOpen] = useState(false)
    const [isEditClientOpen, setIsEditClientOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [clients, setClients] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedClient, setSelectedClient] = useState<any>(null)
    
    const [formData, setFormData] = useState<ClientData>({
        name: "",
        type: ClientType.INDIVIDUAL,
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        notes: "",
        status: ClientStatus.ACTIVE,
    })

    // Cargar clientes desde la base de datos usando queries2.ts
    useEffect(() => {
        const loadClients = async () => {
            setIsLoading(true)
            try {
                // Importar la función getClients de queries2.ts
                const { getClients } = await import('@/lib/queries2')
                
                // Obtener los clientes reales de la base de datos
                const clientsData = await getClients(agencyId, subAccountId)
                setClients(clientsData)
            } catch (error) {
                console.error("Error cargando clientes:", error)
                toast({
                    title: "Error",
                    description: "Ocurrió un error al cargar los clientes",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadClients()
    }, [agencyId, subAccountId, toast])

    // Filter and sort clients
    const filteredClients = clients
        .filter((client) => {
            const matchesSearch =
                client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
            const matchesType = clientType === "all" || client.type === clientType

            return matchesSearch && matchesType
        })
        .sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name)
            } else if (sortBy === "recent") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
            return 0
        })

    const handleAddClient = async () => {
        try {
            // Validar campos obligatorios
            if (!formData.name || !formData.name.trim()) {
                toast({
                    title: "Error de validación",
                    description: "El nombre del cliente es obligatorio",
                    variant: "destructive",
                })
                return
            }

            if (!formData.email || !formData.email.trim()) {
                toast({
                    title: "Error de validación",
                    description: "El email del cliente es obligatorio",
                    variant: "destructive",
                })
                return
            }

            if (!formData.phone || !formData.phone.trim()) {
                toast({
                    title: "Error de validación",
                    description: "El teléfono del cliente es obligatorio",
                    variant: "destructive",
                })
                return
            }

            // Asegurarse de que todos los campos requeridos estén presentes
            const clientData: ClientData = {
                ...formData,
                // Asegurarse de que el tipo y estado estén correctamente definidos
                type: formData.type || ClientType.INDIVIDUAL,
                status: formData.status || ClientStatus.ACTIVE
            }
            
            try {
                // Importar la función createClient de queries2.ts
                const { createClient } = await import('@/lib/queries2')
                
                // Crear el cliente usando la función de queries2.ts
                const newClient = await createClient(agencyId, clientData, subAccountId)
                
                // Actualizar la lista de clientes
                setClients([newClient, ...clients])
                toast({
                    title: "Cliente creado",
                    description: "El cliente ha sido creado exitosamente",
                })
                resetForm()
                setIsAddClientOpen(false)
            } catch (error) {
                console.error("Error al crear el cliente:", error)
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "No se pudo crear el cliente",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error creando cliente (excepción):", error)
            toast({
                title: "Error",
                description: "Ocurrió un error al crear el cliente",
                variant: "destructive",
            })
        }
    }

    const handleEditClient = async () => {
        if (!selectedClient) return
        
        try {
            // Importar la función updateClient de queries2.ts
            const { updateClient } = await import('@/lib/queries2')
            
            // Actualizar el cliente usando la función de queries2.ts
            const updatedClient = await updateClient(selectedClient.id, formData)
            
            // Actualizar la lista de clientes
            setClients(clients.map(client => 
                client.id === selectedClient.id ? updatedClient : client
            ))
            
            toast({
                title: "Cliente actualizado",
                description: "El cliente ha sido actualizado exitosamente",
            })
            resetForm()
            setIsEditClientOpen(false)
        } catch (error) {
            console.error("Error actualizando cliente:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "No se pudo actualizar el cliente",
                variant: "destructive",
            })
        }
    }

    const handleDeleteClient = async () => {
        if (!selectedClient) return
        
        try {
            // Importar la función deleteClient de queries2.ts
            const { deleteClient } = await import('@/lib/queries2')
            
            // Eliminar el cliente usando la función de queries2.ts
            await deleteClient(selectedClient.id)
            
            // Actualizar la lista de clientes
            setClients(clients.filter(client => client.id !== selectedClient.id))
            
            toast({
                title: "Cliente eliminado",
                description: "El cliente ha sido eliminado exitosamente",
            })
            setIsDeleteConfirmOpen(false)
        } catch (error) {
            console.error("Error eliminando cliente:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "No se pudo eliminar el cliente",
                variant: "destructive",
            })
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            type: ClientType.INDIVIDUAL,
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
            notes: "",
            status: ClientStatus.ACTIVE,
            contactPerson: ""
        })
        setSelectedClient(null)
    }

    const openEditModal = (client: any) => {
        setSelectedClient(client)
        setFormData({
            name: client.name,
            type: client.type,
            email: client.email || "",
            phone: client.phone || "",
            address: client.address || "",
            city: client.city || "",
            state: client.state || "",
            zipCode: client.zipCode || "",
            country: client.country || "",
            notes: client.notes || "",
            status: client.status,
            contactPerson: client.type === ClientType.COMPANY ? client.contactPerson || "" : undefined,
        })
        setIsEditClientOpen(true)
    }

    const openDeleteConfirm = (client: any) => {
        setSelectedClient(client)
        setIsDeleteConfirmOpen(true)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(value || 0)
    }

    const formatDate = (dateString: string | Date) => {
        if (!dateString) return "N/A"
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("es-CO", { year: "numeric", month: "short", day: "numeric" }).format(date)
    }

    return (
        <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Total de Clientes</h3>
                            <p className="text-3xl font-bold">{clients.length}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Clientes Activos</h3>
                            <p className="text-3xl font-bold">{clients.filter((c) => c.status === "active").length}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Ventas Totales</h3>
                            <p className="text-3xl font-bold">
                                {formatCurrency(clients.reduce((sum, client) => sum + client.totalPurchases, 0))}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar cliente..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={clientType} onValueChange={setClientType}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Tipo de cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            <SelectItem value="individual">Persona Natural</SelectItem>
                            <SelectItem value="empresa">Empresa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Nombre</SelectItem>
                            <SelectItem value="recent">Más reciente</SelectItem>
                            <SelectItem value="purchases">Mayor compra</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                                <DialogDescription>
                                    Complete la información del cliente. Todos los campos marcados con * son obligatorios.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Nombre *
                                    </Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">
                                        Tipo *
                                    </Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value as ClientType })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Seleccione tipo de cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ClientType.INDIVIDUAL}>Persona Natural</SelectItem>
                                            <SelectItem value={ClientType.COMPANY}>Empresa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">
                                        Email *
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right">
                                        Teléfono *
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="address" className="text-right">
                                        Dirección
                                    </Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="city" className="text-right">
                                        Ciudad
                                    </Label>
                                    <Input
                                        id="city"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="state" className="text-right">
                                        Estado/Provincia
                                    </Label>
                                    <Input
                                        id="state"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="zipCode" className="text-right">
                                        Código Postal
                                    </Label>
                                    <Input
                                        id="zipCode"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="country" className="text-right">
                                        País
                                    </Label>
                                    <Input
                                        id="country"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="notes" className="text-right">
                                        Notas
                                    </Label>
                                    <Input
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="status" className="text-right">
                                        Estado
                                    </Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value as ClientStatus })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Seleccione estado del cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={ClientStatus.ACTIVE}>Activo</SelectItem>
                                            <SelectItem value={ClientStatus.INACTIVE}>Inactivo</SelectItem>
                                            <SelectItem value={ClientStatus.LEAD}>Prospecto</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {formData.type === ClientType.COMPANY && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="contactPerson" className="text-right">
                                            Persona de contacto
                                        </Label>
                                        <Input
                                            id="contactPerson"
                                            value={formData.contactPerson || ""}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddClientOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleAddClient}
                                    disabled={!formData.name}
                                >
                                    Guardar Cliente
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Diálogo de edición de cliente */}
             <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                        <DialogDescription>
                            Modifique la información del cliente. Todos los campos marcados con * son obligatorios.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                                Nombre *
                            </Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-type" className="text-right">
                                Tipo *
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as ClientType })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccione tipo de cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ClientType.INDIVIDUAL}>Persona Natural</SelectItem>
                                    <SelectItem value={ClientType.COMPANY}>Empresa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-email" className="text-right">
                                Email *
                            </Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-phone" className="text-right">
                                Teléfono *
                            </Label>
                            <Input
                                id="edit-phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-address" className="text-right">
                                Dirección
                            </Label>
                            <Input
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        {formData.type === ClientType.COMPANY && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-contactPerson" className="text-right">
                                    Persona de contacto
                                </Label>
                                <Input
                                    id="edit-contactPerson"
                                    value={formData.contactPerson || ""}
                                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-status" className="text-right">
                                Estado
                            </Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as ClientStatus })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccione estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ClientStatus.ACTIVE}>Activo</SelectItem>
                                    <SelectItem value={ClientStatus.INACTIVE}>Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditClientOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleEditClient}
                            disabled={!formData.name || !formData.email || !formData.phone}
                        >
                            Actualizar Cliente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo de confirmación de eliminación */}
             <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-4 py-4">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <div>
                            <p className="font-medium">{selectedClient?.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedClient?.email}</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteClient}>
                            Eliminar Cliente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tabla de clientes */}
             {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : filteredClients.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Dirección</TableHead>
                                    <TableHead className="text-right">Compras</TableHead>
                                    <TableHead>Última Compra</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => onClientSelect(client.id)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    {client.type === "empresa" ? (
                                                        <Building2 className="h-4 w-4 text-primary" />
                                                    ) : (
                                                        <User className="h-4 w-4 text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div>{client.name}</div>
                                                    {client.type === "empresa" && client.contactPerson && (
                                                        <div className="text-xs text-muted-foreground">Contacto: {client.contactPerson}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm">{client.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm">{client.phone}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">{client.address}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(client.totalPurchases)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {client.lastPurchase ? formatDate(client.lastPurchase) : "Sin compras"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={client.status === "active" ? "success" : "secondary"}>
                                                {client.status === "active" ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menú</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onClientSelect(client.id)
                                                        }}
                                                    >
                                                        <User className="h-4 w-4 mr-2" />
                                                        Ver perfil
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            openEditModal(client)
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            openDeleteConfirm(client)
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 border rounded-md bg-muted/20">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No hay clientes</h3>
                    <p className="text-muted-foreground text-center max-w-md mt-2">
                        No se encontraron clientes con los filtros actuales. Intente cambiar los criterios de búsqueda o agregue un
                        nuevo cliente.
                    </p>
                    <Button className="mt-4" onClick={() => setIsAddClientOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Agregar Cliente
                    </Button>
                </div>
            )}
        </div>
    )
})

export default ClientsDirectory;
