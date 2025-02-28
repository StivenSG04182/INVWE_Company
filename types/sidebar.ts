import type { LucideIcon } from "lucide-react"

export interface SubMenuItem {
    icon: LucideIcon
    label: string
    href?: string
    shortcut?: string
}

export interface MenuItem {
    icon: LucideIcon
    label: string
    href?: string
    submenu?: SubMenuItem[]
}

export interface MenuSection {
    title?: string
    items: MenuItem[]
}

