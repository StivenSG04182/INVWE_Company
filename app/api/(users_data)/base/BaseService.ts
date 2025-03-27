export abstract class BaseService<T> {
    protected abstract entityName: string

    async findAll(): Promise<T[]> {
        try {
            // Implementación real conectaría con una API o base de datos
            return [] as T[]
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async findById(id: string): Promise<T | null> {
        try {
            // Implementación real
            return null
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async create(data: Partial<T>): Promise<T> {
        try {
            // Implementación real
            return {} as T
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        try {
            // Implementación real
            return {} as T
        } catch (error) {
            throw this.handleError(error)
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            // Implementación real
            return true
        } catch (error) {
            throw this.handleError(error)
        }
    }

    protected handleError(error: any): Error {
        console.error(`Error in ${this.entityName} service:`, error)
        return new Error(`${this.entityName} operation failed`)
    }
}

