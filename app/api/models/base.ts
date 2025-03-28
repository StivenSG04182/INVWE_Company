import { BaseService } from "../base/BaseService"
import type { IProduct } from "@/types/models/store"

export class ProductService extends BaseService<IProduct> {
    protected entityName = "Product"

    async searchProducts(query: string): Promise<IProduct[]> {
        try {
            // Implementación real de búsqueda
            return []
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async updateStock(productId: string, quantity: number): Promise<IProduct> {
        try {
            // Implementación real de actualización de stock
            return {} as IProduct
        } catch (error) {
            throw this.handleError(error)
        }
    }
}

