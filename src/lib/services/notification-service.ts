import { prisma } from "@/lib/prisma"
import { EventEmitter, InventoryEvents, POSEvents, NotificationEvents } from "@/lib/event-emitter"

// Servicio para gestión de notificaciones
export class NotificationService {
    constructor() {
        this.setupEventListeners()
    }

    // Configurar listeners para eventos del sistema
    setupEventListeners() {
        // Notificar cuando un producto está por vencer
        EventEmitter.on(InventoryEvents.PRODUCT_EXPIRING, async (data) => {
            const { product, daysRemaining, subAccountId } = data

            // Crear notificación en la base de datos
            await this.createNotification({
                notification: `El producto "${product.name}" vencerá en ${daysRemaining} días.`,
                agencyId: product.agencyId,
                subAccountId: subAccountId,
                userId: await this.getAdminUserId(product.agencyId),
                type: "EXPIRATION_WARNING",
                relatedId: product.id,
            })
        })

        // Notificar cuando el stock está por debajo del mínimo
        EventEmitter.on(InventoryEvents.STOCK_BELOW_MINIMUM, async (stock) => {
            await this.createNotification({
                notification: `El producto "${stock.Product.name}" está por debajo del stock mínimo.`,
                agencyId: stock.agencyId,
                subAccountId: stock.subAccountId,
                userId: await this.getAdminUserId(stock.agencyId),
                type: "LOW_STOCK",
                relatedId: stock.productId,
            })
        })

        // Notificar cuando se aplica un descuento
        EventEmitter.on(POSEvents.DISCOUNT_APPLIED, async (data) => {
            const { productId, productName, originalPrice, discountedPrice, discountPercentage } = data

            // Obtener información del producto para la notificación
            const product = await prisma.product.findUnique({
                where: { id: productId },
            })

            if (product) {
                await this.createNotification({
                    notification: `Descuento del ${discountPercentage}% aplicado al producto "${productName}". Precio: $${originalPrice.toFixed(2)} → $${discountedPrice.toFixed(2)}`,
                    agencyId: product.agencyId,
                    subAccountId: product.subAccountId,
                    userId: await this.getAdminUserId(product.agencyId),
                    type: "DISCOUNT_APPLIED",
                    relatedId: productId,
                })
            }
        })

        // Notificar cuando se completa una venta
        EventEmitter.on(POSEvents.SALE_COMPLETED, async (sale) => {
            await this.createNotification({
                notification: `Venta #${sale.saleNumber} completada por un total de $${sale.total.toFixed(2)}.`,
                agencyId: sale.agencyId,
                subAccountId: sale.subAccountId,
                userId: await this.getAdminUserId(sale.agencyId),
                type: "SALE_COMPLETED",
                relatedId: sale.id,
            })
        })
    }

    // Crear una notificación en la base de datos
    async createNotification(data: {
        notification: string
        agencyId: string
        subAccountId?: string
        userId: string
        type: string
        relatedId?: string
    }) {
        const notification = await prisma.notification.create({
            data: {
                notification: data.notification,
                agencyId: data.agencyId,
                subAccountId: data.subAccountId,
                userId: data.userId,
                type: data.type,
                relatedId: data.relatedId,
                isRead: false,
            },
        })

        // Emitir evento de notificación creada
        EventEmitter.emit(NotificationEvents.NOTIFICATION_CREATED, notification)

        return notification
    }

    // Marcar una notificación como leída
    async markAsRead(notificationId: string) {
        const notification = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        })

        // Emitir evento de notificación leída
        EventEmitter.emit(NotificationEvents.NOTIFICATION_READ, notification)

        return notification
    }

    // Obtener el ID de un usuario administrador para enviar notificaciones
    async getAdminUserId(agencyId: string) {
        const admin = await prisma.user.findFirst({
            where: {
                agencyId,
                role: "AGENCY_ADMIN",
            },
        })

        if (!admin) {
            // Si no hay admin, buscar cualquier usuario de la agencia
            const anyUser = await prisma.user.findFirst({
                where: { agencyId },
            })

            if (!anyUser) {
                throw new Error(`No se encontró ningún usuario para la agencia ${agencyId}`)
            }

            return anyUser.id
        }

        return admin.id
    }

    // Obtener notificaciones para un usuario
    static async getUserNotifications(userId: string, options?: { unreadOnly?: boolean; limit?: number }) {
        const where: any = { userId }

        if (options?.unreadOnly) {
            where.isRead = false
        }

        return prisma.notification.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: options?.limit || undefined,
        })
    }

    // Obtener el conteo de notificaciones no leídas
    static async getUnreadCount(userId: string) {
        return prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        })
    }
}

// Inicializar el servicio de notificaciones
export const notificationService = new NotificationService()
