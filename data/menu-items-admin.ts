import { Home, Store, ShoppingCart, Users, Tag, KeyRound, Mail, Send, Inbox, Archive, CreditCard, FileText, BarChart, PieChart, TrendingUp, UserCog, Layout, Settings, FileChartColumn } from "lucide-react"
import type { MenuSection } from "@/app/api/client/types/sidebar"

export const menuSections: MenuSection[] = [
    {
        items: [
            {
                icon: Home,
                label: "Dashboard",
                submenu: [
                    { icon: BarChart, label: "Dashboard", href: "/inventory/dashboard" },
                    { icon: TrendingUp, label: "Análisis", href: "/inventory/analytics" },
                    { icon: Archive, label: "Actividad", href: "/inventory/activity" },  
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: Store,
                label: "Tienda & E-Commerce",
                submenu: [
                    { icon: Store, label: "Tiendas Físicas", href: "/inventory/stores" },
                    { icon: ShoppingCart, label: "E-Commerce", href: "/admin/ecommerce" },
                    { icon: Tag, label: "Envíos", href: "/inventory/shipping" },
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: ShoppingCart,
                label: "Inventario", 
                submenu: [
                    { icon: ShoppingCart, label: "Productos", href: "/inventory/products" },
                    { icon: Archive, label: "Stock", href: "/inventory/stock" },
                    { icon: FileText, label: "Movimientos", href: "/inventory/movements" },
                    { icon: KeyRound, label: "Proveedores", href: "/inventory/providers" },
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: BarChart,
                label: "Ventas & Facturación", 
                submenu: [
                    { icon: BarChart, label: "Transacciones", href: "/inventory/sales" },
                    { icon: FileText, label: "Facturas", href: "/inventory/facturas" },
                    { icon: PieChart, label: "Notas Crédito/Débito", href: "/inventory/notes" },
                    { icon: Settings, label: "DIAN Config", href: "/inventory/dian" },
                    { icon: FileChartColumn, label: "Reportes", href: "/inventory/reportes"},
                    { icon: CreditCard, label: "Pagos", href: "/inventory/pagos"},
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: Users,
                label: "Personal & RRHH", 
                submenu: [
                    { icon: Users, label: "Empleados", href: "/inventory/employees" },
                    { icon: UserCog, label: "Horarios & Nómina", href: "/inventory/schedule" },
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: Users,
                label: "Clientes & CRM", 
                submenu: [
                    { icon: Users, label: "Clientes", href: "/inventory/clients" },
                    { icon: Mail, label: "CRM", href: "/inventory/crm" },
                ],
            },
        ],
    },
    {
        items: [
            {
                icon: FileText,
                label: "Reportes & Analíticas", 
                submenu: [
                    { icon: BarChart, label: "Ventas", href: "/inventory/sales" },
                    { icon: PieChart, label: "Inventario", href: "/inventory/inventory" },
                    { icon: TrendingUp, label: "Desempeño", href: "/inventory/performance" },
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
                    { icon: Send, label: "Campañas", href: "/inventory/campaigns" },
                    { icon: Inbox, label: "Bandeja de entrada", href: "/inventory/inbox" },
                    { icon: Archive, label: "Archivos", href: "/inventory/archives" },
                ],
            },
        ],
    }, 
    {
        items: [
            {
                icon: Settings,
                label: "Configuración & Administración", 
                submenu: [
                    { icon: Settings, label: "Empresa", href: "/inventory/company" },
                    { icon: UserCog, label: "Usuarios y Roles", href: "/inventory/users" },
                    { icon: KeyRound, label: "Subscripciones", href: "/inventory/subscriptions" },
                    { icon: Layout, label: "Integraciones", href: "/inventory/integrations" },
                ],
            },
        ],
    }
]