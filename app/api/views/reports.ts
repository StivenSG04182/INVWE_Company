/* export interface SalesReportView {
    summary: {
        totalSales: number
        totalOrders: number
        avgOrderValue: number
        refundRate: number
    }
    trends: {
        daily: {
            date: string
            sales: number
            orders: number
        }[]
        weekly: {
            week: string
            sales: number
            orders: number
        }[]
        monthly: {
            month: string
            sales: number
            orders: number
        }[]
    }
    topProducts: {
        id: string
        name: string
        sales: number
        revenue: number
        growth: number
    }[]
}

export interface AnalyticsReportView {
    traffic: {
        source: string
        users: number
        newUsers: number
        sessions: number
        bounceRate: number
        avgSessionDuration: number
    }[]
    behavior: {
        pageViews: number
        uniquePageViews: number
        avgTimeOnPage: number
        bounceRate: number
        exitRate: number
    }
    conversion: {
        rate: number
        completions: number
        abandonmentRate: number
        avgValuePerConversion: number
    }
}

export interface PerformanceReportView {
    metrics: {
        uptime: number
        responseTime: number
        errorRate: number
        requestsPerMinute: number
    }
    resources: {
        cpu: {
            usage: number
            available: number
        }
        memory: {
            usage: number
            available: number
        }
        storage: {
            usage: number
            available: number
        }
    }
    errors: {
        timestamp: string
        type: string
        message: string
        count: number
    }[]
}

 */