import {
    Home,
    Store,
    ShoppingCart,
    Users,
    Tag,
    KeyRound,
    Mail,
    Send,
    Inbox,
    Archive,
    FileText,
    BarChart,
    PieChart,
    TrendingUp,
    Paintbrush,
    Palette,
    Layout,
    Settings,
    Shield,
    Bell,
} from "lucide-react"
import type { MenuSection } from "@/types/sidebar"

export const menuSections: MenuSection[] = [
    {
        items: [
            {
                icon: Home,
                label: "Overview",
                submenu: [
                    { icon: BarChart, label: "Dashboard", href: "/overview/dashboard" },
                    { icon: TrendingUp, label: "Analytics", href: "/overview/analytics" },
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: Store,
                label: "Store",
                submenu: [
                    { icon: ShoppingCart, label: "Products", href: "/store/products" },
                    { icon: Users, label: "Customers", href: "/store/customers" },
                    { icon: Tag, label: "Discounts", href: "/store/discounts" },
                    { icon: KeyRound, label: "Licenses", href: "/store/licenses" },
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: Mail,
                label: "Emails",
                submenu: [
                    { icon: Send, label: "Campaigns", href: "/emails/campaigns" },
                    { icon: Inbox, label: "Inbox", href: "/emails/inbox" },
                    { icon: Archive, label: "Archives", href: "/emails/archives" },
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: FileText,
                label: "Reports",
                submenu: [
                    { icon: BarChart, label: "Sales Reports", href: "/reports/sales" },
                    { icon: PieChart, label: "Analytics", href: "/reports/analytics" },
                    { icon: TrendingUp, label: "Performance", href: "/reports/performance" },
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: Paintbrush,
                label: "Design",
                submenu: [
                    { icon: Palette, label: "Themes", href: "/design/themes" },
                    { icon: Layout, label: "Templates", href: "/design/templates" },
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: Settings,
                label: "Settings",
                submenu: [
                    { icon: Shield, label: "Security", href: "/settings/security" },
                    { icon: Bell, label: "Notifications", href: "/settings/notifications" },
                    { icon: Users, label: "Team", href: "/settings/team" },
                ],
            },
        ],
    },
]

