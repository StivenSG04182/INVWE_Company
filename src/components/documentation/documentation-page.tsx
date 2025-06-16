"use client"

import {
  LayoutDashboard,
  Package,
  Store,
  Grid,
  Truck,
  Users,
  BookIcon as AddressBook,
  Wallet,
  BarChart,
  ShoppingCart,
  Calendar,
  Terminal,
  Building2,
  Settings,
} from "lucide-react"
import { DocumentationLayout } from "./documentation-layout"
import type { LucideIcon } from "lucide-react"

interface DocumentationSection {
  id: string
  title: string
  icon: LucideIcon
  description: string
  content: string
  color: string
}

const documentationSections: DocumentationSection[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    description: "Panel de control principal con indicadores clave y estadísticas.",
    content: "dashboard",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "inventario",
    title: "Inventario",
    icon: Package,
    description: "Gestión completa de productos, stock y movimientos.",
    content: "inventario",
    color: "bg-green-100 text-green-600",
  },
  {
    id: "tiendas",
    title: "Tiendas",
    icon: Store,
    description: "Creación y gestión de tiendas y sucursales.",
    content: "tiendas",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "areas",
    title: "Áreas",
    icon: Grid,
    description: "Organización y gestión de áreas de almacenamiento.",
    content: "areas",
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: "proveedores",
    title: "Proveedores",
    icon: Truck,
    description: "Gestión de proveedores y relaciones comerciales.",
    content: "proveedores",
    color: "bg-red-100 text-red-600",
  },
  {
    id: "clientes",
    title: "Clientes",
    icon: Users,
    description: "Gestión de clientes, CRM y atención al cliente.",
    content: "clientes",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "contactos",
    title: "Contactos",
    icon: AddressBook,
    description: "Directorio de equipo y gestión de contactos.",
    content: "contactos",
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: "finanzas",
    title: "Finanzas",
    icon: Wallet,
    description: "Gestión financiera y facturación electrónica.",
    content: "finanzas",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "reportes",
    title: "Reportes",
    icon: BarChart,
    description: "Análisis y reportes del sistema.",
    content: "reportes",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    id: "ventas",
    title: "Ventas",
    icon: ShoppingCart,
    description: "Sistema POS y gestión de ventas.",
    content: "ventas",
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: "horarios",
    title: "Horarios",
    icon: Calendar,
    description: "Gestión de horarios y nómina.",
    content: "horarios",
    color: "bg-lime-100 text-lime-600",
  },
  {
    id: "terminal",
    title: "Terminal POS",
    icon: Terminal,
    description: "Sistema de punto de venta en tiempo real.",
    content: "terminal",
    color: "bg-violet-100 text-violet-600",
  },
  {
    id: "equipo",
    title: "Equipo",
    icon: Users,
    description: "Gestión de usuarios y permisos del sistema.",
    content: "equipo",
    color: "bg-rose-100 text-rose-600",
  },
  {
    id: "agencia",
    title: "Agencia",
    icon: Building2,
    description: "Configuración y gestión de la agencia.",
    content: "agencia",
    color: "bg-teal-100 text-teal-600",
  },
  {
    id: "configuracion",
    title: "Configuración",
    icon: Settings,
    description: "Configuración general del sistema.",
    content: "configuracion",
    color: "bg-slate-100 text-slate-600",
  },
]

export default function DocumentationPage() {
  return <DocumentationLayout sections={documentationSections} initialSection="dashboard" />
}
