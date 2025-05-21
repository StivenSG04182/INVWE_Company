// Sistema de eventos para comunicación entre módulos
type EventCallback = (data: any) => void

class EventEmitterClass {
    private events: Record<string, EventCallback[]> = {}

    // Registrar un listener para un evento
    on(event: string, callback: EventCallback) {
        if (!this.events[event]) {
            this.events[event] = []
        }
        this.events[event].push(callback)

        return () => this.off(event, callback)
    }

    // Eliminar un listener
    off(event: string, callback: EventCallback) {
        if (!this.events[event]) return
        this.events[event] = this.events[event].filter((cb) => cb !== callback)
    }

    // Emitir un evento con datos
    emit(event: string, data: any) {
        if (!this.events[event]) return
        this.events[event].forEach((callback) => {
            try {
                callback(data)
            } catch (error) {
                console.error(`Error en listener de evento ${event}:`, error)
            }
        })
    }

    // Emitir un evento y esperar a que todos los listeners se completen
    async emitAsync(event: string, data: any) {
        if (!this.events[event]) return

        const promises = this.events[event].map((callback) => {
            try {
                const result = callback(data)
                return result instanceof Promise ? result : Promise.resolve(result)
            } catch (error) {
                console.error(`Error en listener de evento ${event}:`, error)
                return Promise.reject(error)
            }
        })

        return Promise.all(promises)
    }

    // Obtener todos los eventos registrados
    getRegisteredEvents() {
        return Object.keys(this.events)
    }

    // Obtener el número de listeners para un evento
    getListenerCount(event: string) {
        return this.events[event]?.length || 0
    }
}

// Exportar una única instancia para toda la aplicación
export const EventEmitter = new EventEmitterClass()

// Definir tipos de eventos para mejorar la integración
export const InventoryEvents = {
    PRODUCT_CREATED: "product:created",
    PRODUCT_UPDATED: "product:updated",
    PRODUCT_DELETED: "product:deleted",
    STOCK_UPDATED: "stock:updated",
    STOCK_BELOW_MINIMUM: "stock:below-minimum",
    PRODUCT_EXPIRING: "product:expiring",
    MOVEMENT_CREATED: "movement:created",
}

export const POSEvents = {
    SALE_COMPLETED: "sale:completed",
    SALE_CANCELLED: "sale:cancelled",
    DISCOUNT_APPLIED: "discount:applied",
    CART_UPDATED: "cart:updated",
}

export const NotificationEvents = {
    NOTIFICATION_CREATED: "notification:created",
    NOTIFICATION_READ: "notification:read",
}
