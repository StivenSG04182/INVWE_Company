import { db } from "@/lib/db";
import { ClientStatus, ClientType } from "@prisma/client";

export interface ClientData {
    name: string;
    rut: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    notes?: string;
    type: ClientType;
    status?: ClientStatus;
    contactPerson?: string;
}

export interface ClientSearchParams {
    searchTerm?: string;
    type?: ClientType;
    status?: ClientStatus;
    sortBy?: string;
    limit?: number;
}

export const ClientService = {
    /**
     * Obtiene todos los clientes de una agencia
     */
    async getClients(agencyId: string, subAccountId?: string) {
        try {
            const clients = await db.client.findMany({
                where: {
                    agencyId,
                    ...(subAccountId ? { subAccountId } : {}),
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            return { success: true, data: clients };
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            return { success: false, error: "Error al obtener clientes" };
        }
    },

    /**
     * Busca clientes con filtros avanzados
     */
    async searchClients(agencyId: string, params: ClientSearchParams, subAccountId?: string) {
        try {
            const { searchTerm, type, status, sortBy = "name", limit } = params;

            const clients = await db.client.findMany({
                where: {
                    agencyId,
                    ...(subAccountId ? { subAccountId } : {}),
                    ...(type ? { type } : {}),
                    ...(status ? { status } : {}),
                    ...(searchTerm ? {
                        OR: [
                            { name: { contains: searchTerm, mode: "insensitive" } },
                            { email: { contains: searchTerm, mode: "insensitive" } },
                            { phone: { contains: searchTerm, mode: "insensitive" } },
                        ],
                    } : {}),
                },
                orderBy: {
                    ...(sortBy === "recent" ? { createdAt: "desc" } :
                        sortBy === "name" ? { name: "asc" } :
                            { createdAt: "desc" }),
                },
                ...(limit ? { take: limit } : {}),
            });

            return { success: true, data: clients };
        } catch (error) {
            console.error("Error al buscar clientes:", error);
            return { success: false, error: "Error al buscar clientes" };
        }
    },

    /**
     * Obtiene un cliente por su ID
     */
    async getClientById(clientId: string) {
        try {
            const client = await db.client.findUnique({
                where: {
                    id: clientId,
                },
            });
            return { success: true, data: client };
        } catch (error) {
            console.error("Error al obtener cliente:", error);
            return { success: false, error: "Error al obtener cliente" };
        }
    },

    /**
     * Crea un nuevo cliente
     */
    async createClient(agencyId: string, data: ClientData, subAccountId?: string) {
        console.log("[ClientService.createClient] Iniciando creación de cliente con:", { agencyId, data, subAccountId });
        try {
            console.log("[ClientService.createClient] Preparando datos para crear cliente en la base de datos");
            const client = await db.client.create({
                data: {
                    agencyId,
                    ...data,
                    ...(subAccountId ? { subAccountId } : {}),
                },
            });
            console.log("[ClientService.createClient] Cliente creado exitosamente:", client);
            return { success: true, data: client };
        } catch (error) {
            console.error("[ClientService.createClient] Error al crear cliente:", error);
            // Mostrar más detalles del error para diagnóstico
            if (error instanceof Error) {
                console.error("[ClientService.createClient] Mensaje de error:", error.message);
                console.error("[ClientService.createClient] Stack trace:", error.stack);
            }
            return { success: false, error: "Error al crear cliente" };
        }
    },

    /**
     * Actualiza un cliente existente
     */
    async updateClient(clientId: string, data: Partial<ClientData>) {
        try {
            const client = await db.client.update({
                where: {
                    id: clientId,
                },
                data,
            });
            return { success: true, data: client };
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            return { success: false, error: "Error al actualizar cliente" };
        }
    },

    /**
     * Elimina un cliente
     */
    async deleteClient(clientId: string) {
        try {
            await db.client.delete({
                where: {
                    id: clientId,
                },
            });
            return { success: true };
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
            return { success: false, error: "Error al eliminar cliente" };
        }
    },

    /**
     * Cambia el estado de un cliente (activo/inactivo)
     */
    async changeClientStatus(clientId: string, status: ClientStatus) {
        try {
            const client = await db.client.update({
                where: {
                    id: clientId,
                },
                data: {
                    status,
                },
            });
            return { success: true, data: client };
        } catch (error) {
            console.error("Error al cambiar estado del cliente:", error);
            return { success: false, error: "Error al cambiar estado del cliente" };
        }
    },

    /**
     * Obtiene estadísticas básicas de clientes
     */
    async getClientStats(agencyId: string, subAccountId?: string) {
        try {
            const totalClients = await db.client.count({
                where: {
                    agencyId,
                    ...(subAccountId ? { subAccountId } : {}),
                },
            });

            const activeClients = await db.client.count({
                where: {
                    agencyId,
                    ...(subAccountId ? { subAccountId } : {}),
                    status: ClientStatus.ACTIVE,
                },
            });

            const individualClients = await db.client.count({
                where: {
                    agencyId,
                    ...(subAccountId ? { subAccountId } : {}),
                    type: ClientType.INDIVIDUAL,
                },
            });

            const companyClients = await db.client.count({
                where: {
                    agencyId,
                    ...(subAccountId ? { subAccountId } : {}),
                    type: ClientType.COMPANY,
                },
            });

            return {
                success: true,
                data: {
                    total: totalClients,
                    active: activeClients,
                    inactive: totalClients - activeClients,
                    individual: individualClients,
                    company: companyClients
                }
            };
        } catch (error) {
            console.error("Error al obtener estadísticas de clientes:", error);
            return { success: false, error: "Error al obtener estadísticas de clientes" };
        }
    },
};