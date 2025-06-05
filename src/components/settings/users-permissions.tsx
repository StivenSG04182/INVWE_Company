"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

interface UsersPermissionsProps {
    agencyId: string
}

const UsersPermissionsContent = ({ agencyId }: UsersPermissionsProps) => {
    const { toast } = useToast()
    const [teamMembers, setTeamMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState("")

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                // Aquí iría la lógica para obtener los miembros del equipo
                // Por ahora, usamos datos de ejemplo
                const mockTeamMembers = [
                    {
                        id: "1",
                        name: "Juan Pérez",
                        email: "juan@example.com",
                        role: "AGENCY_OWNER",
                        avatarUrl: null,
                        lastActive: new Date().toISOString(),
                        status: "active",
                    },
                    {
                        id: "2",
                        name: "María López",
                        email: "maria@example.com",
                        role: "AGENCY_ADMIN",
                        avatarUrl: null,
                        lastActive: new Date().toISOString(),
                        status: "active",
                    },
                    {
                        id: "3",
                        name: "Carlos Rodríguez",
                        email: "carlos@example.com",
                        role: "SUBACCOUNT_USER",
                        avatarUrl: null,
                        lastActive: new Date().toISOString(),
                        status: "active",
                    },
                    {
                        id: "4",
                        name: "Ana Martínez",
                        email: "ana@example.com",
                        role: "SUBACCOUNT_GUEST",
                        avatarUrl: null,
                        lastActive: new Date().toISOString(),
                        status: "active",
                    },
                ]

                setTeamMembers(mockTeamMembers)
                setLoading(false)
            } catch (error) {
                console.error("Error fetching team members:", error)
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los miembros del equipo.",
                    variant: "destructive",
                })
                setLoading(false)
            }
        }

        fetchTeamMembers()
    }, [toast])

    const filteredMembers = teamMembers.filter((member) => {
        const matchesSearch =
            searchTerm === "" ||
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRole = roleFilter === "" || member.role === roleFilter

        return matchesSearch && matchesRole
    })

    // Función auxiliar para obtener la clase CSS del badge según el rol
    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case "AGENCY_OWNER":
                return "bg-primary/20 text-primary"
            case "AGENCY_ADMIN":
                return "bg-blue-100 text-blue-800"
            case "SUBACCOUNT_USER":
                return "bg-green-100 text-green-800"
            case "SUBACCOUNT_GUEST":
                return "bg-yellow-100 text-yellow-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    // Función auxiliar para obtener la etiqueta del rol
    const getRoleLabel = (role: string) => {
        switch (role) {
            case "AGENCY_OWNER":
                return "Propietario"
            case "AGENCY_ADMIN":
                return "Administrador"
            case "SUBACCOUNT_USER":
                return "Usuario"
            case "SUBACCOUNT_GUEST":
                return "Invitado"
            default:
                return "Desconocido"
        }
    }

    // Función para formatear la fecha de último acceso
    const formatLastActive = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) return "Hace unos minutos"
        if (diffInHours === 1) return "Hace 1 hora"
        if (diffInHours < 24) return `Hace ${diffInHours} horas`

        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays === 1) return "Hace 1 día"
        if (diffInDays < 30) return `Hace ${diffInDays} días`

        return date.toLocaleDateString()
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Usuarios & Permisos</h2>
                <div className="flex gap-2">
                    <Button>Añadir Usuario</Button>
                    <Button variant="outline">Gestionar Roles</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>Administre los usuarios de su empresa y configure sus permisos de acceso.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Buscar usuarios..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-64"
                            />
                            <select
                                className="p-2 rounded-md border"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="">Todos los roles</option>
                                <option value="AGENCY_OWNER">Propietario</option>
                                <option value="AGENCY_ADMIN">Administrador</option>
                                <option value="SUBACCOUNT_USER">Usuario</option>
                                <option value="SUBACCOUNT_GUEST">Invitado</option>
                            </select>
                        </div>
                        <div>
                            <Button variant="ghost" size="icon">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"></path>
                                </svg>
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">Cargando usuarios...</div>
                    ) : (
                        <div className="border rounded-md overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="text-left p-3">Usuario</th>
                                        <th className="text-left p-3">Email</th>
                                        <th className="text-left p-3">Rol</th>
                                        <th className="text-left p-3">Estado</th>
                                        <th className="text-left p-3">Último Acceso</th>
                                        <th className="text-left p-3">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id} className="border-t">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                                                        {member.avatarUrl ? (
                                                            <Image
                                                                src={member.avatarUrl || "/placeholder.svg"}
                                                                alt={member.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-primary font-bold">{member.name?.charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <span>{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">{member.email}</td>
                                            <td className="p-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeClass(member.role)}`}>
                                                    {getRoleLabel(member.role)}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                    {member.status === "active" ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="p-3">{formatLastActive(member.lastActive)}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon">
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
                                                        >
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                        </svg>
                                                    </Button>
                                                    <Button variant="ghost" size="icon">
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
                                                        >
                                                            <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"></path>
                                                            <path d="M18 13v6"></path>
                                                            <path d="M15 16h6"></path>
                                                            <path d="M15 3l6 6"></path>
                                                            <path d="M21 3v6"></path>
                                                            <path d="M15 9h6"></path>
                                                        </svg>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive">
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
                                                        >
                                                            <path d="M3 6h18"></path>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-8">
                        <h3 className="font-medium text-lg mb-4">Roles y Permisos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border rounded-md p-4">
                                <h4 className="font-medium mb-2">Propietario</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Acceso completo a todas las funciones y configuraciones.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
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
                                            className="text-green-500"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>Gestión completa de la empresa</span>
                                    </li>
                                    <li className="flex items-center gap-2">
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
                                            className="text-green-500"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>Administración de usuarios y permisos</span>
                                    </li>
                                    <li className="flex items-center gap-2">
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
                                            className="text-green-500"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>Configuración de facturación</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="border rounded-md p-4">
                                <h4 className="font-medium mb-2">Administrador</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Acceso a la mayoría de funciones excepto configuraciones críticas.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
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
                                            className="text-green-500"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>Gestión de inventario y ventas</span>
                                    </li>
                                    <li className="flex items-center gap-2">
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
                                            className="text-green-500"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>Administración de usuarios</span>
                                    </li>
                                    <li className="flex items-center gap-2">
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
                                            className="text-red-500"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                        <span>Configuración de facturación</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default UsersPermissionsContent
