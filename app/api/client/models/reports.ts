/* import type { IEntity } from "./base"

export interface IReport extends IEntity {
    type: ReportType
    dateRange: DateRange
    data: Record<string, unknown>
    format: ReportFormat
    status: ReportStatus
    generatedBy: string
}

export interface ISalesReport extends IReport {
    data: {
        totalSales: number
        totalOrders: number
        averageOrderValue: number
        topProducts: ITopProduct[]
        salesByPeriod: ISalesByPeriod[]
    }
}

export interface IAnalyticsReport extends IReport {
    data: {
        visitors: number
        pageViews: number
        bounceRate: number
        averageSessionDuration: number
        topPages: IPageAnalytics[]
        trafficSources: ITrafficSource[]
    }
}

export interface IPerformanceReport extends IReport {
    data: {
        uptime: number
        responseTime: number
        errorRate: number
        serverMetrics: IServerMetrics
        alerts: IAlert[]
    }
}

export interface ITopProduct {
    productId: string
    name: string
    quantity: number
    revenue: number
}

export interface ISalesByPeriod {
    period: string
    sales: number
    orders: number
}

export interface IPageAnalytics {
    path: string
    views: number
    uniqueVisitors: number
    averageTimeOnPage: number
}

export interface ITrafficSource {
    source: string
    visitors: number
    percentage: number
}

export interface IServerMetrics {
    cpu: number
    memory: number
    disk: number
    network: number
}

export interface IAlert {
    type: AlertType
    message: string
    timestamp: Date
    severity: AlertSeverity
}

export interface DateRange {
    startDate: Date
    endDate: Date
}

export enum ReportType {
    SALES = "SALES",
    ANALYTICS = "ANALYTICS",
    PERFORMANCE = "PERFORMANCE",
    CUSTOM = "CUSTOM",
}

export enum ReportFormat {
    PDF = "PDF",
    CSV = "CSV",
    EXCEL = "EXCEL",
    JSON = "JSON",
}

export enum ReportStatus {
    PENDING = "PENDING",
    GENERATING = "GENERATING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

export enum AlertType {
    SYSTEM = "SYSTEM",
    SECURITY = "SECURITY",
    PERFORMANCE = "PERFORMANCE",
}

export enum AlertSeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL",
}

 */