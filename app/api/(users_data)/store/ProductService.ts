import { BaseService } from "../base/BaseService"
import type { IProduct } from "@/types/models/store"

export class ProductService extends BaseService<IProduct> {
    protected entityName = "Product"

    async searchProducts(query: string): Promise<IProduct[]> {
        try {
            const products = await this.findAll()
            return products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            )
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async updateStock(productId: string, quantity: number): Promise<IProduct> {
        try {
            const product = await this.findById(productId)
            if (!product) {
                throw new Error(`Product with id ${productId} not found`)
            }
            
            const updatedStock = product.stock + quantity
            if (updatedStock < 0) {
                throw new Error(`Cannot reduce stock below 0. Current stock: ${product.stock}, Requested change: ${quantity}`)
            }
            
            const updatedProduct = await this.update(productId, { 
                stock: updatedStock,
                status: updatedStock === 0 ? 'OUT_OF_STOCK' : product.status
            })
            
            return updatedProduct
        } catch (error) {
            throw this.handleError(error)
        }
    }
}

