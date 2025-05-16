import { db } from "@/lib/db";
import { ClientStatus, ClientType } from "@prisma/client";

export interface ClientData {
    name: string;
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
        try {
            const client = await db.client.create({
                data: {
                    agencyId,
                    ...data,
                    ...(subAccountId ? { subAccountId } : {}),
                },
            });
            return { success: true, data: client };
        } catch (error) {
            console.error("Error al crear cliente:", error);
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
};