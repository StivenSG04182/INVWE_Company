"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmployeeListProps {
    teamMembers: any[]
}

export function EmployeeList({ teamMembers }: EmployeeListProps) {
    const [searchQuery, setSearchQuery] = useState("")

    // Filtrar empleados según la búsqueda
    const filteredEmployees = teamMembers.filter(
        (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Traducir roles a español
    const translateRole = (role: string) => {
        switch (role) {
            case "AGENCY_OWNER":
                return "Propietario"
            case "AGENCY_ADMIN":
                return "Administrador"
            case "SUBACCOUNT_USER":
                return "Usuario"
            default:
                return "Invitado"
        }
    }

    // Obtener color de badge según rol
    const getRoleBadgeVariant = (role: string): "default" | "outline" | "secondary" | "destructive" => {
        switch (role) {
            case "AGENCY_OWNER":
                return "default"
            case "AGENCY_ADMIN":
                return "secondary"
            case "SUBACCOUNT_USER":
                return "outline"
            default:
                return "outline"
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Empleados</CardTitle>
                        <CardDescription>Gestione la información de sus {teamMembers.length} empleados</CardDescription>
                    </div>
                    <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Añadir
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar empleado..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={member.avatarUrl || "/placeholder.svg"} alt={member.name} />
                                            <AvatarFallback
                                                className={cn(
                                                    "text-white",
                                                    member.role === "AGENCY_OWNER"
                                                        ? "bg-primary"
                                                        : member.role === "AGENCY_ADMIN"
                                                            ? "bg-secondary"
                                                            : "bg-muted-foreground",
                                                )}
                                            >
                                                {member.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant={getRoleBadgeVariant(member.role)}>{translateRole(member.role)}</Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">No se encontraron empleados</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
