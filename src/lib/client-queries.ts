"use server";

import { db } from "./db";
import { saveActivityLogsNotification } from "./queries";
import { revalidatePath } from 'next/cache';

// Obtiene todos los clientes de una agencia
export const getClients = async (agencyId: string, subAccountId?: string) => {
    return await db.client.findMany({
        where: { 
            agencyId,
            ...(subAccountId ? { subAccountId } : {})
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// Obtiene un cliente por ID con todas sus relaciones
export const getClientById = async (clientId: string) => {
    return await db.client.findUnique({
        where: {
            id: clientId
        },
        include: {
            Opportunities: {
                include: {
                    AssignedUser: true
                }
            },
            Cases: {
                include: {
                    AssignedUser: true
                }
            },
            PQRs: {
                include: {
                    AssignedUser: true
                }
            }
        }
    });
};

// Obtiene clientes de una agencia
export const getClientsByAgency = async (agencyId: string) => {
    return await db.client.findMany({
        where: {
            agencyId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// Crea un nuevo cliente
export const createClient = async (agencyId: string, data: any, subAccountId?: string) => {
    // Validar datos requeridos
    if (!data.name) {
        throw new Error("El nombre del cliente es obligatorio");
    }

    const client = await db.client.create({
        data: {
            name: data.name,
            rut: data.rut,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            notes: data.notes,
            type: data.type || "INDIVIDUAL",
            status: data.status || "ACTIVE",
            agencyId: agencyId,
            subAccountId: subAccountId || null,
            taxId: data.taxId,
            taxIdType: data.taxIdType,
            fiscalRegime: data.fiscalRegime,
            fiscalResponsibility: data.fiscalResponsibility,
            economicActivity: data.economicActivity,
            legalRepresentative: data.legalRepresentative,
        },
    });

    await saveActivityLogsNotification({
        agencyId,
        description: `Cliente creado: ${data.name}`,
        subaccountId: subAccountId,
    });

    revalidatePath(`/agency/${agencyId}/(Customers)/clients`);
    if (subAccountId) {
        revalidatePath(`/subaccount/${subAccountId}/(Customers)/clients`);
    }

    return client;
};

// Actualiza un cliente existente
export const updateClient = async (clientId: string, data: any) => {
    // Validar que el cliente exista
    const existingClient = await db.client.findUnique({
        where: { id: clientId },
    });

    if (!existingClient) {
        throw new Error("Cliente no encontrado");
    }

    const client = await db.client.update({
        where: { id: clientId },
        data: {
            name: data.name,
            rut: data.rut,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            country: data.country,
            notes: data.notes,
            type: data.type,
            status: data.status,
            // Datos fiscales
            taxId: data.taxId,
            taxIdType: data.taxIdType,
            fiscalRegime: data.fiscalRegime,
            fiscalResponsibility: data.fiscalResponsibility,
            economicActivity: data.economicActivity,
            legalRepresentative: data.legalRepresentative,
        },
    });

    await saveActivityLogsNotification({
        agencyId: existingClient.agencyId,
        description: `Cliente actualizado: ${data.name}`,
        subaccountId: existingClient.subAccountId || undefined,
    });

    revalidatePath(`/agency/${existingClient.agencyId}/(Customers)/clients`);
    if (existingClient.subAccountId) {
        revalidatePath(`/subaccount/${existingClient.subAccountId}/(Customers)/clients`);
    }

    return client;
};

// Elimina un cliente
export const deleteClient = async (clientId: string) => {
    const clientToDelete = await db.client.findUnique({
        where: { id: clientId },
    });

    if (!clientToDelete) {
        throw new Error("Cliente no encontrado");
    }

    const client = await db.client.delete({
        where: { id: clientId },
    });

    await saveActivityLogsNotification({
        agencyId: clientToDelete.agencyId,
        description: `Cliente eliminado: ${clientToDelete.name}`,
        subaccountId: clientToDelete.subAccountId || undefined,
    });

    revalidatePath(`/agency/${clientToDelete.agencyId}/(Customers)/clients`);
    if (clientToDelete.subAccountId) {
        revalidatePath(`/subaccount/${clientToDelete.subAccountId}/(Customers)/clients`);
    }

    return client;
};

// Filtra clientes por estado
export const getClientsByStatus = async (agencyId: string, status: string, subAccountId?: string) => {
    return await db.client.findMany({
        where: {
            agencyId,
            status: status as any,
            ...(subAccountId ? { subAccountId } : {})
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
};

// Filtra clientes por tipo
export const getClientsByType = async (agencyId: string, type: string, subAccountId?: string) => {
    return await db.client.findMany({
        where: {
            agencyId,
            type: type as any,
            ...(subAccountId ? { subAccountId } : {})
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
};

// Busca clientes
export const searchClients = async (agencyId: string, searchTerm: string, subAccountId?: string) => {
    return await db.client.findMany({
        where: {
            agencyId,
            ...(subAccountId ? { subAccountId } : {}),
            OR: [
                { name:  { contains: searchTerm, mode: 'insensitive' } },
                { rut:   { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { phone: { contains: searchTerm, mode: 'insensitive' } },
            ],
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
};

// FUNCIONES PARA PQRs

// Obtiene todos los PQRs de un cliente
export const getPQRsByClient = async (clientId: string) => {
    return await db.pQR.findMany({
        where: {
            clientId
        },
        include: {
            AssignedUser: true,
            Client: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// Crea un nuevo PQR
export const createPQR = async (data: any) => {
    // Validar datos requeridos
    if (!data.title || !data.description || !data.clientId) {
        throw new Error("Título, descripción y cliente son obligatorios");
    }

    const client = await db.client.findUnique({
        where: { id: data.clientId },
    });

    if (!client) {
        throw new Error("Cliente no encontrado");
    }

    // Validar que el tipo sea uno de los valores permitidos en el enum PQRType
    const validTypes = ["PETITION", "COMPLAINT", "CLAIM"];
    const pqrType = data.type && validTypes.includes(data.type) ? data.type : "PETITION";

    // Validar que el status sea uno de los valores permitidos en el enum PQRStatus
    const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    const pqrStatus = data.status && validStatuses.includes(data.status) ? data.status : "PENDING";

    const pqr = await db.pQR.create({
        data: {
            title: data.title,
            description: data.description,
            type: pqrType,
            status: pqrStatus,
            priority: data.priority || "MEDIUM",
            dueDate: data.dueDate,
            clientId: data.clientId,
            assignedUserId: data.assignedUserId,
            agencyId: client.agencyId,
            subAccountId: client.subAccountId,
        },
    });


    // Registrar actividad
    await saveActivityLogsNotification({
        agencyId: client.agencyId,
        description: `PQR creado para cliente ${client.name}: ${data.title}`,
        subaccountId: client.subAccountId || undefined,
    });

    revalidatePath(`/agency/${client.agencyId}/(Customers)/clients`);
    if (client.subAccountId) {
        revalidatePath(`/subaccount/${client.subAccountId}/(Customers)/clients`);
    }

    return pqr;
};

// Actualiza un PQR existente
export const updatePQR = async (pqrId: string, data: any) => {
    // Validar que el PQR exista
    const existingPQR = await db.pQR.findUnique({
        where: { id: pqrId },
        include: { Client: true }
    });

    if (!existingPQR) {
        throw new Error("PQR no encontrado");
    }

    // Validar que el tipo sea uno de los valores permitidos en el enum PQRType
    const validTypes = ["PETITION", "COMPLAINT", "CLAIM"];
    const pqrType = data.type && validTypes.includes(data.type) ? data.type : existingPQR.type;

    // Validar que el status sea uno de los valores permitidos en el enum PQRStatus
    const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    const pqrStatus = data.status && validStatuses.includes(data.status) ? data.status : existingPQR.status;

    const pqr = await db.pQR.update({
        where: { id: pqrId },
        data: {
            title: data.title,
            description: data.description,
            type: pqrType,
            status: pqrStatus,
            priority: data.priority,
            dueDate: data.dueDate,
            assignedUserId: data.assignedUserId,
        },
    });

    // Registrar actividad
    await saveActivityLogsNotification({
        agencyId: existingPQR.agencyId,
        description: `PQR actualizado: ${data.title}`,
        subaccountId: existingPQR.subAccountId || undefined,
    });

    revalidatePath(`/agency/${existingPQR.agencyId}/(Customers)/clients`);
    if (existingPQR.subAccountId) {
        revalidatePath(`/subaccount/${existingPQR.subAccountId}/(Customers)/clients`);
    }

    return pqr;
};

// FUNCIONES PARA OPORTUNIDADES

// Obtiene todas las oportunidades de un cliente
export const getOpportunitiesByClient = async (clientId: string) => {
    return await db.opportunity.findMany({
        where: {
            clientId
        },
        include: {
            AssignedUser: true,
            Client: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// Crea una nueva oportunidad
export const createOpportunity = async (data: any) => {
    // Validar datos requeridos
    if (!data.title || !data.clientId) {
        throw new Error("Título y cliente son obligatorios");
    }

    const client = await db.client.findUnique({
        where: { id: data.clientId },
    });

    if (!client) {
        throw new Error("Cliente no encontrado");
    }

    const opportunity = await db.opportunity.create({
        data: {
            title: data.title,
            description: data.description,
            value: data.value || 0,
            status: data.status || "NEW",
            priority: data.priority || "MEDIUM",
            dueDate: data.dueDate,
            clientId: data.clientId,
            assignedUserId: data.assignedUserId,
            agencyId: client.agencyId,
            subAccountId: client.subAccountId,
        },
    });

    // Registrar actividad
    await saveActivityLogsNotification({
        agencyId: client.agencyId,
        description: `Oportunidad creada para cliente ${client.name}: ${data.title}`,
        subaccountId: client.subAccountId || undefined,
    });

    revalidatePath(`/agency/${client.agencyId}/(Customers)/clients`);
    if (client.subAccountId) {
        revalidatePath(`/subaccount/${client.subAccountId}/(Customers)/clients`);
    }

    return opportunity;
};

// Actualiza una oportunidad existente
export const updateOpportunity = async (opportunityId: string, data: any) => {
    // Validar que la oportunidad exista
    const existingOpportunity = await db.opportunity.findUnique({
        where: { id: opportunityId },
        include: { Client: true }
    });

    if (!existingOpportunity) {
        throw new Error("Oportunidad no encontrada");
    }

    const opportunity = await db.opportunity.update({
        where: { id: opportunityId },
        data: {
            title: data.title,
            description: data.description,
            value: data.value,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate,
            assignedUserId: data.assignedUserId,
        },
    });

    // Registrar actividad
    await saveActivityLogsNotification({
        agencyId: existingOpportunity.agencyId,
        description: `Oportunidad actualizada: ${data.title}`,
        subaccountId: existingOpportunity.subAccountId || undefined,
    });

    revalidatePath(`/agency/${existingOpportunity.agencyId}/(Customers)/clients`);
    if (existingOpportunity.subAccountId) {
        revalidatePath(`/subaccount/${existingOpportunity.subAccountId}/(Customers)/clients`);
    }

    return opportunity;
};

// FUNCIONES PARA CASOS

// Obtiene todos los casos de un cliente
export const getCasesByClient = async (clientId: string) => {
    return await db.case.findMany({
        where: {
            clientId
        },
        include: {
            AssignedUser: true,
            Client: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

// Crea un nuevo caso
export const createCase = async (data: any) => {
    // Validar datos requeridos
    if (!data.title || !data.clientId) {
        throw new Error("Título y cliente son obligatorios");
    }

    const client = await db.client.findUnique({
        where: { id: data.clientId },
    });

    if (!client) {
        throw new Error("Cliente no encontrado");
    }

    const caseData = await db.case.create({
        data: {
            title: data.title,
            description: data.description,
            status: data.status || "OPEN",
            priority: data.priority || "MEDIUM",
            dueDate: data.dueDate,
            clientId: data.clientId,
            assignedUserId: data.assignedUserId,
            agencyId: client.agencyId,
            subAccountId: client.subAccountId,
        },
    });

    // Registrar actividad
    await saveActivityLogsNotification({
        agencyId: client.agencyId,
        description: `Caso creado para cliente ${client.name}: ${data.title}`,
        subaccountId: client.subAccountId || undefined,
    });

    revalidatePath(`/agency/${client.agencyId}/(Customers)/clients`);
    if (client.subAccountId) {
        revalidatePath(`/subaccount/${client.subAccountId}/(Customers)/clients`);
    }

    return caseData;
};

// Actualiza un caso existente
export const updateCase = async (caseId: string, data: any) => {
    // Validar que el caso exista
    const existingCase = await db.case.findUnique({
        where: { id: caseId },
        include: { Client: true }
    });

    if (!existingCase) {
        throw new Error("Caso no encontrado");
    }

    const caseData = await db.case.update({
        where: { id: caseId },
        data: {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate,
            assignedUserId: data.assignedUserId,
        },
    });

    // Registrar actividad
    await saveActivityLogsNotification({
        agencyId: existingCase.agencyId,
        description: `Caso actualizado: ${data.title}`,
        subaccountId: existingCase.subAccountId || undefined,
    });

    revalidatePath(`/agency/${existingCase.agencyId}/(Customers)/clients`);
    if (existingCase.subAccountId) {
        revalidatePath(`/subaccount/${existingCase.subAccountId}/(Customers)/clients`);
    }

    return caseData;
};

// FUNCIONES PARA COMUNICACIÓN CON CLIENTES

// Estructura para mensajes
type MessageData = {
    pqrId: string;
    content: string;
    sender: string;
    timestamp?: Date;
    agentName?: string;
};

// Guarda un mensaje en la base de datos
export const saveMessage = async (data: MessageData) => {
    // Validar datos requeridos
    if (!data.pqrId || !data.content || !data.sender) {
        throw new Error("ID de PQR, contenido y remitente son obligatorios");
    }

    // Obtener el PQR para verificar que existe
    const pqr = await db.pQR.findUnique({
        where: { id: data.pqrId },
        include: { Client: true }
    });

    if (!pqr) {
        throw new Error("PQR no encontrado");
    }

    // Crear el mensaje en la base de datos
    const message = await (db as any).message.create({
        data: {
            content: data.content,
            sender: data.sender,
            timestamp: data.timestamp || new Date(),
            agentName: data.agentName,
            pqrId: data.pqrId,
            read: false,
        },
    });

    // Actualizar la fecha de última actualización del PQR
    await db.pQR.update({
        where: { id: data.pqrId },
        data: {
            updatedAt: new Date(),
        },
    });

    // Registrar actividad
    await saveActivityLogsNotification({
        agencyId: pqr.agencyId,
        description: `Nuevo mensaje en PQR: ${pqr.title}`,
        subaccountId: pqr.subAccountId || undefined,
    });

    // Si el mensaje es de un agente, enviarlo por WhatsApp Business Cloud al cliente
    if (data.sender === 'agent' && pqr.Client?.phone) {
        try {
            // Importación dinámica para evitar problemas de dependencia circular
            const { WhatsAppBusinessService } = await import('./services/whatsapp-business-service');
            
            // Verificar si el cliente puede recibir mensajes de WhatsApp
            const whatsappCheck = await WhatsAppBusinessService.canReceiveWhatsApp(pqr.Client.id);
            
            if (whatsappCheck.success && whatsappCheck.canReceive) {
                await WhatsAppBusinessService.sendMessage({
                    to: whatsappCheck.phone || pqr.Client.phone,
                    text: data.content,
                    pqrId: data.pqrId,
                    agentName: data.agentName
                });
                console.log(`Mensaje enviado a WhatsApp Business: ${pqr.Client.phone}`);
            }
        } catch (error) {
            console.error('Error al enviar mensaje a WhatsApp Business:', error);
            // No interrumpimos el flujo si falla el envío a WhatsApp
        }
    }

    revalidatePath(`/agency/${pqr.agencyId}/(Customers)/clients`);
    if (pqr.subAccountId) {
        revalidatePath(`/subaccount/${pqr.subAccountId}/(Customers)/clients`);
    }

    return message;
};


// Obtiene todos los mensajes de un PQR
export const getMessagesByPQR = async (pqrId: string) => {
    return await (db as any).message.findMany({
        where: {
            pqrId
        },
        orderBy: {
            timestamp: 'asc'
        }
    });
};

// Envía un mensaje por WhatsApp Business Cloud
export const sendWhatsAppMessage = async (pqrId: string, message: string, agentName?: string) => {
    try {
        // Obtener el PQR para acceder a la información del cliente
        const pqr = await db.pQR.findUnique({
            where: { id: pqrId },
            include: { Client: true }
        });

        if (!pqr || !pqr.Client) {
            throw new Error("PQR o cliente no encontrado");
        }

        const clientPhone = pqr.Client.phone;
        
        if (!clientPhone) {
            throw new Error("El cliente no tiene número de teléfono registrado");
        }

        // Importar el servicio de WhatsApp Business Cloud
        const { WhatsAppBusinessService } = await import('./services/whatsapp-business-service');
        
        // Verificar si el cliente puede recibir mensajes de WhatsApp
        const whatsappCheck = await WhatsAppBusinessService.canReceiveWhatsApp(pqr.Client.id);
        
        if (!whatsappCheck.success || !whatsappCheck.canReceive) {
            throw new Error("El cliente no puede recibir mensajes de WhatsApp");
        }
        
        // Guardar el mensaje en la base de datos
        // Nota: saveMessage ya se encargará de enviar el mensaje a WhatsApp Business
        const savedMessage = await saveMessage({
            pqrId,
            content: message,
            sender: "agent",
            timestamp: new Date(),
            agentName: agentName || "Sistema"
        });

        return {
            success: true,
            message: "Mensaje enviado correctamente",
            data: savedMessage
        };
    } catch (error) {
        console.error("Error al enviar mensaje de WhatsApp Business:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Error al enviar mensaje de WhatsApp Business",
            error
        };
    }
};

// Configura las credenciales de WhatsApp Business Cloud para una agencia
export const configureWhatsAppBusiness = async (agencyId: string, credentials: {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookVerifyToken?: string;
}) => {
    try {
        // Importar el servicio de WhatsApp Business Cloud
        const { WhatsAppBusinessService } = await import('./services/whatsapp-business-service');
        
        // Guardar las credenciales
        const result = await WhatsAppBusinessService.saveCredentials(agencyId, credentials);
        
        if (!result.success) {
            throw new Error(result.message);
        }
        
        // Registrar actividad
        await saveActivityLogsNotification({
            agencyId,
            description: `Configuración de WhatsApp Business actualizada`,
        });
        
        revalidatePath(`/agency/${agencyId}/settings`);
        
        return result;
    } catch (error) {
        console.error("Error al configurar WhatsApp Business:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Error al configurar WhatsApp Business",
            error
        };
    }
};

// Procesa un webhook de WhatsApp Business Cloud
export const processWhatsAppWebhook = async (body: any, agencyId: string) => {
    try {
        // Importar el servicio de WhatsApp Business Cloud
        const { WhatsAppBusinessService } = await import('./services/whatsapp-business-service');
        
        // Procesar el webhook
        const result = await WhatsAppBusinessService.processWebhook(body, agencyId);
        
        return result;
    } catch (error) {
        console.error("Error al procesar webhook de WhatsApp Business:", error);
        return {
            success: false,
            message: "Error al procesar webhook de WhatsApp Business",
            error
        };
    }
};

// Verifica un webhook de WhatsApp Business Cloud
export const verifyWhatsAppWebhook = async (
    mode: string,
    token: string,
    challenge: string,
    agencyId: string
) => {
    try {
        // Importar el servicio de WhatsApp Business Cloud
        const { WhatsAppBusinessService } = await import('./services/whatsapp-business-service');
        
        // Verificar el webhook
        const result = await WhatsAppBusinessService.verifyWebhook(mode, token, challenge, agencyId);
        
        return result;
    } catch (error) {
        console.error("Error al verificar webhook de WhatsApp Business:", error);
        return {
            success: false,
            message: "Error al verificar webhook de WhatsApp Business",
        };
    }
};

// Envía un mensaje por correo electrónico
export const sendEmailMessage = async (pqrId: string, subject: string, message: string) => {
    try {
        // Obtener el PQR para acceder a la información del cliente
        const pqr = await db.pQR.findUnique({
            where: { id: pqrId },
            include: { Client: true }
        });

        if (!pqr || !pqr.Client) {
            throw new Error("PQR o cliente no encontrado");
        }

        const clientEmail = pqr.Client.email;
        
        if (!clientEmail) {
            throw new Error("El cliente no tiene correo electrónico registrado");
        }

        // Aquí iría la integración con un servicio de correo electrónico
        // Por ahora, simulamos el envío
        console.log(`Enviando correo a ${clientEmail}:\nAsunto: ${subject}\nMensaje: ${message}`);
        
        // Guardar el mensaje en la base de datos
        const savedMessage = await saveMessage({
            pqrId,
            content: message,
            sender: "agent",
            timestamp: new Date(),
            agentName: "Sistema (Email)"
        });

        return {
            success: true,
            message: "Correo enviado correctamente",
            data: savedMessage
        };
    } catch (error) {
        console.error("Error al enviar correo electrónico:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Error al enviar correo electrónico",
            error
        };
    }
};

// FUNCIONES PARA FACTURAS

// Obtiene una factura por ID con todas sus relaciones
export const getInvoiceById = async (agencyId: string, invoiceId: string) => {
    try {
        return await db.invoice.findUnique({
            where: {
                id: invoiceId,
                agencyId: agencyId,
            },
            include: {
                Customer: true,
                Items: {
                    include: {
                        Product: true,
                    },
                },
                Payments: true,
                Taxes: {
                    include: {
                        Tax: true,
                    },
                },
                SubAccount: true,
            },
        });
    } catch (error) {
        console.error("Error al obtener factura:", error);
        throw error;
    }
};

// Obtiene productos activos para facturación
export const getActiveProductsForInvoicing = async (agencyId: string) => {
    try {
        return await db.product.findMany({
            where: {
                agencyId: agencyId,
                active: true,
            },
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                discount: true,
                discountStartDate: true,
                discountEndDate: true,
                discountMinimumPrice: true,
            },
        });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        throw error;
    }
};

// Obtiene impuestos de una agencia
export const getTaxesForAgency = async (agencyId: string) => {
    try {
        return await db.tax.findMany({
            where: {
                agencyId: agencyId,
            },
            select: {
                id: true,
                name: true,
                rate: true,
            },
        });
    } catch (error) {
        console.error("Error al obtener impuestos:", error);
        throw error;
    }
};

// Obtiene configuración DIAN de una agencia
export const getDianConfigForAgency = async (agencyId: string) => {
    try {
        return await db.dianConfig.findUnique({
            where: { agencyId: agencyId },
        });
    } catch (error) {
        console.error("Error al obtener configuración DIAN:", error);
        throw error;
    }
};

// FUNCIONES PARA PAGOS

// Obtiene un pago por ID con todas sus relaciones
export const getPaymentById = async (agencyId: string, paymentId: string) => {
    try {
        return await db.payment.findUnique({
            where: {
                id: paymentId,
                agencyId: agencyId,
            },
            include: {
                Invoice: {
                    include: {
                        Customer: true,
                        Items: true,
                    },
                },
                SubAccount: true,
            },
        });
    } catch (error) {
        console.error("Error al obtener pago:", error);
        throw error;
    }
};

// FUNCIONES PARA TRANSACCIONES

// Obtiene una transacción por ID con todas sus relaciones
export const getTransactionById = async (agencyId: string, transactionId: string) => {
    try {
        return await db.sale.findUnique({
            where: {
                id: transactionId,
                agencyId: agencyId,
            },
            include: {
                Customer: true,
                Cashier: true,
                Area: true,
                Items: {
                    include: {
                        Product: true,
                    },
                },
                SubAccount: true,
            },
        });
    } catch (error) {
        console.error("Error al obtener transacción:", error);
        throw error;
    }
};