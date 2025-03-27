import type { IEntity } from "./base"

export interface IEmailCampaign extends IEntity {
    name: string
    subject: string
    content: string
    status: CampaignStatus
    scheduledFor?: Date
    sentAt?: Date
    recipients: IRecipient[]
    statistics: ICampaignStatistics
}

export interface IRecipient {
    email: string
    name?: string
    status: RecipientStatus
    openedAt?: Date
    clickedAt?: Date
}

export interface ICampaignStatistics {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
}

export interface IEmailTemplate extends IEntity {
    name: string
    subject: string
    content: string
    category: TemplateCategory
    variables: string[]
}

export interface IEmailMessage extends IEntity {
    from: string
    to: string
    subject: string
    content: string
    status: MessageStatus
    threadId?: string
}

export enum CampaignStatus {
    DRAFT = "DRAFT",
    SCHEDULED = "SCHEDULED",
    SENDING = "SENDING",
    SENT = "SENT",
    CANCELLED = "CANCELLED",
}

export enum RecipientStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    OPENED = "OPENED",
    CLICKED = "CLICKED",
    BOUNCED = "BOUNCED",
    UNSUBSCRIBED = "UNSUBSCRIBED",
}

export enum TemplateCategory {
    MARKETING = "MARKETING",
    TRANSACTIONAL = "TRANSACTIONAL",
    NOTIFICATION = "NOTIFICATION",
}

export enum MessageStatus {
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED",
}

