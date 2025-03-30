/* export interface ProductsView {
    products: {
        id: string
        name: string
        price: number
        stock: number
        status: string
        category: string
        lastUpdated: string
        thumbnail: string
    }[]
    categories: {
        id: string
        name: string
        count: number
    }[]
    filters: {
        status: string[]
        category: string[]
        priceRange: {
            min: number
            max: number
        }
    }
}

export interface CustomersView {
    customers: {
        id: string
        name: string
        email: string
        totalOrders: number
        totalSpent: number
        lastOrder: string
        status: string
        avatar?: string
    }[]
    metrics: {
        totalCustomers: number
        activeCustomers: number
        newCustomers: number
        churnRate: number
    }
}

export interface DiscountsView {
    activeDiscounts: {
        id: string
        code: string
        type: string
        value: number
        usageLimit: number
        usageCount: number
        startDate: string
        endDate: string
        status: string
    }[]
    metrics: {
        totalDiscounts: number
        activeDiscounts: number
        totalSavings: number
        avgDiscount: number
    }
}

export interface LicensesView {
    licenses: {
        id: string
        key: string
        product: string
        customer: string
        issueDate: string
        expiryDate: string
        status: string
    }[]
    summary: {
        totalLicenses: number
        activeLicenses: number
        expiringLicenses: number
        revokedLicenses: number
    }
}

 */