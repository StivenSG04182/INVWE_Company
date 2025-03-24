"use client"

import type React from "react"
import { useState, useMemo, useEffect, useRef, useTransition } from "react"
import { MenuIcon, Search } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { menuSections } from "@/data/menu-items"
import { UserButton, useUser } from "@clerk/nextjs"
import { LogoUploadModal } from "./logo-upload-modal"
import { useCompany } from "@/hooks/use-company"
import { SettingsModal } from "./settings-modal"
import { useActiveMenu } from "@/hooks/use-active-menu"
import { SelectorStores } from "./selectStores"

export default function SidebarNavigation() {
    const [isExpanded, setIsExpanded] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeItem, setActiveItem] = useActiveMenu("Overview")
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const { company, loading } = useCompany()
    const params = useParams()
    const companyName = typeof params.companyName === "string" ? params.companyName : ""
    const [isPending, startTransition] = useTransition()
    const iconSidebarRef = useRef<HTMLDivElement>(null)
    const expandablePanelRef = useRef<HTMLDivElement>(null)
    const selectorStoresRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const selectElement = target.parentElement?.closest('[role="combobox"], [role="listbox"], [role="option"]');
            const isClickInside = 
                iconSidebarRef.current?.contains(target) ||
                expandablePanelRef.current?.contains(target) ||
                selectorStoresRef.current?.contains(target) ||
                selectElement !== null;

            if (isExpanded && !isClickInside) {
                setIsExpanded(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isExpanded])


    const handleItemClick = (label: string) => {
        startTransition(() => {
            setActiveItem(label)
            setIsExpanded(true)
        })
    }

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded)
    }

    // Filtrar los items basándose en el query de búsqueda
    const filteredItems = useMemo(() => {
        if (!searchQuery) return []
        return menuSections
            .flatMap(section => section.items)
            .filter(item =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(item => ({
                label: item.label,
                icon: item.icon,
                mainOption: item.submenu?.[0]?.label || ''
            }))
    }, [searchQuery, menuSections])

    // Obtener el item activo para mostrar sus subopciones
    const activeMenuItem = menuSections
        .flatMap((section) => section.items)
        .find((item) => item.label === activeItem)

    // Separar items principales y de configuración
    const mainMenuItems = menuSections.slice(0, -1)
    const settingsSection = menuSections[menuSections.length - 1]

    return (
        <>
            <div className="flex h-screen">
                {/* Sidebar de iconos - siempre visible */}
                <div ref={iconSidebarRef} className="flex h-full w-16 flex-col justify-between bg-white shadow-md">
                    <div className="flex flex-col">
                        {/* Logo de la compañía (excepción: no oculta el sidebar) */}
                        <div
                            className="flex h-16 items-center justify-center cursor-pointer hover:bg-gray-50"
                            onClick={() => setIsLogoModalOpen(true)}
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg" alt="Company Logo" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </div>
                        <LogoUploadModal
                            isOpen={isLogoModalOpen}
                            onClose={() => setIsLogoModalOpen(false)}
                            onUpload={async (file) => {
                                // TODO: Implementar funcionalidad de subida del logo
                                console.log("Uploading file:", file)
                            }}
                            companyName="Company"
                        />

                        {/* Icono de búsqueda cuando el sidebar está colapsado */}
                        <div className="flex h-16 items-center justify-center">
                            {!isExpanded && (
                                <button onClick={() => setIsExpanded(true)} className="rounded-lg p-2 text-gray-700 hover:bg-gray-100">
                                    <Search className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Iconos del menú principal - al hacer clic se oculta el sidebar */}
                        <div className="flex flex-1 flex-col items-center justify-center py-4 mt-[35vh] -translate-y-1/2">
                            {mainMenuItems.map((section) =>
                                section.items.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => handleItemClick(item.label)}
                                        className={cn(
                                            "mb-2 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100",
                                            activeItem === item.label ? "bg-gray-100 font-semibold text-gray-900" : "text-gray-700"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Iconos de configuración y perfil (excepción: no ocultan el sidebar) */}
                    <div className="flex flex-col items-center py-4 space-y-2">
                        {settingsSection.items.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => setIsSettingsOpen(true)}
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100",
                                    isSettingsOpen && "bg-gray-100 font-semibold text-gray-900"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                            </button>
                        ))}
                        <div className="relative h-10 w-6.5">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
                {/* Panel de contenido expandible */}
                <div
                    ref={expandablePanelRef}
                    className={cn("w-64 bg-white shadow-lg transition-all duration-300", !isExpanded && "w-0 overflow-hidden")}
                >
                    <div className="flex h-full flex-col">
                        {/* Cabecera con búsqueda */}
                        <div className="flex h-16 items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-900">
                                    {loading ? "Loading..." : company?.name || "Company Name"}
                                </span>
                            </div>
                            <button onClick={toggleSidebar} className="rounded-lg p-2 text-gray-700 hover:bg-gray-100">
                                <MenuIcon className="h-5 w-5" />
                            </button>
                        </div>
                        {/* Búsqueda global */}
                        <div className="px-4 py-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                                />
                            </div>
                        </div>

                        {/* selector de tiendas */}
                        <div ref={selectorStoresRef}>
                            <SelectorStores />
                        </div>

                        {/* Menú de navegación con subopciones */}
                        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
                            {searchQuery ? (
                                // Mostrar resultados de búsqueda
                                <div className="space-y-1">
                                    {filteredItems.map(({ mainOption, icon: Icon, label }, index) => (
                                        <button
                                            key={`${mainOption}-${label}-${index}`}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{label}</span>
                                            <span className="ml-auto text-xs font-normal text-gray-500">{mainOption}</span>
                                        </button>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
                                    )}
                                </div>
                            ) : (
                                activeMenuItem?.submenu && (
                                    <div className="py-3">
                                        <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            {activeItem}
                                        </h2>
                                        <div className="space-y-1">
                                            {activeMenuItem.submenu.map((subItem) => (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.href?.replace("[companyName]", companyName) || "#"}
                                                    onClick={() => setIsExpanded(true)}
                                                    className="group flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                                >
                                                    <subItem.icon className="mr-3 h-5 w-5" />
                                                    {subItem.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
                        </nav>
                    </div>
                </div>
                {/* Área de contenido */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div>
                        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                    </div>
                </div>
            </div>
        </>
    )
}
