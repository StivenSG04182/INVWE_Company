import { BaseService } from "../base/BaseService"
import type { IOrder, OrderStatus, PaymentStatus } from "@/types/models/store"

export class OrderService extends BaseService<IOrder> {
    protected entityName = "Order"

    async updateStatus(orderId: string, status: OrderStatus): Promise<IOrder> {
        try {
            return await this.update(orderId, { status })
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<IOrder> {
        try {
            return await this.update(orderId, { paymentStatus: status })
        } catch (error) {
            throw this.handleError(error)
        }
    }
}

