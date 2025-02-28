export interface CampaignsView {
    campaigns: {
        id: string
        name: string
        subject: string
        status: string
        sentDate: string
        openRate: number
        clickRate: number
        recipients: number
    }[]
    performance: {
        totalSent: number
        avgOpenRate: number
        avgClickRate: number
        bounceRate: number
    }
}

export interface InboxView {
    messages: {
        id: string
        from: string
        subject: string
        preview: string
        date: string
        isRead: boolean
        hasAttachments: boolean
        labels: string[]
    }[]
    folders: {
        name: string
        count: number
        icon: string
    }[]
    stats: {
        unread: number
        total: number
        starred: number
    }
}

export interface ArchivesView {
    archivedEmails: {
        id: string
        subject: string
        from: string
        to: string
        date: string
        size: string
        labels: string[]
    }[]
    storage: {
        used: string
        total: string
        percentage: number
    }
    filters: {
        dateRange: {
            start: string
            end: string
        }
        labels: string[]
    }
}

