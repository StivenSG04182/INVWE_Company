export interface PageContent {
    title: string
    description: string
    stats?: {
        label: string
        value: string | number
        change?: number
    }[]
    content?: {
        title: string
        description: string
    }[]
}

export interface ContentMap {
    [key: string]: PageContent
}

