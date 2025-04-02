import { Home, Store, ShoppingCart, Users, Tag, KeyRound, Mail, Send, Inbox, Archive, CreditCard, FileText, BarChart, PieChart, TrendingUp, UserCog, Settings, FileChartColumn } from "lucide-react"
import type { MenuSection } from "@/app/api/client/types/sidebar"

export const menuSections: MenuSection[] = [
    {
        items: [
            {
                icon: Home,
                label: "Dashboard",
                submenu: [
                    { icon: BarChart, label: "Dashboard", href: "/inventory/[companyName]/dashboard" },
                    { icon: TrendingUp, label: "Análisis", href: "/inventory/[companyName]/analytics" },
                    { icon: Archive, label: "Actividad", href: "/inventory/[companyName]/activity" },  
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
                    { icon: Store, label: "Tiendas Físicas", href: "/inventory/[companyName]/stores" },
                    { icon: ShoppingCart, label: "E-Commerce", href: "/inventory/[companyName]/ecommerce" },
                    { icon: Tag, label: "Envíos", href: "/inventory/[companyName]/shipping" },
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
                    { icon: ShoppingCart, label: "Productos", href: "/inventory/[companyName]/products" },
                    { icon: Archive, label: "Stock", href: "/inventory/[companyName]/stock" },
                    { icon: FileText, label: "Movimientos", href: "/inventory/[companyName]/movements" },
                    { icon: KeyRound, label: "Proveedores", href: "/inventory/[companyName]/providers" },
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
                    { icon: BarChart, label: "Transacciones", href: "/inventory/[companyName]/sales" },
                    { icon: FileText, label: "Facturas", href: "/inventory/[companyName]/facturas" },
                    { icon: PieChart, label: "Notas Crédito/Débito", href: "/inventory/[companyName]/notes" },
                    { icon: Settings, label: "DIAN Config", href: "/inventory/[companyName]/dian" },
                    { icon: FileChartColumn, label: "Reportes", href: "/inventory/[companyName]/reportes"},
                    { icon: CreditCard, label: "Pagos", href: "/inventory/[companyName]/pagos"},
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
                    { icon: Users, label: "Empleados", href: "/inventory/[companyName]/employees" },
                    { icon: UserCog, label: "Horarios & Nómina", href: "/inventory/[companyName]/schedule" },
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
                    { icon: Users, label: "Clientes", href: "/inventory/[companyName]/clients" },
                    { icon: Mail, label: "CRM", href: "/inventory/[companyName]/crm" },
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
                    { icon: BarChart, label: "Ventas", href: "/inventory/[companyName]/sales" },
                    { icon: PieChart, label: "Inventario", href: "/inventory/[companyName]/inventory" },
                    { icon: TrendingUp, label: "Desempeño", href: "/inventory/[companyName]/performance" },
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
                    { icon: Send, label: "Campañas", href: "/inventory/[companyName]/campaigns" },
                    { icon: Inbox, label: "Bandeja de entrada", href: "/inventory/[companyName]/inbox" },
                    { icon: Archive, label: "Archivos", href: "/inventory/[companyName]/archives" },
                ],
            },
        ],
    }, 
]