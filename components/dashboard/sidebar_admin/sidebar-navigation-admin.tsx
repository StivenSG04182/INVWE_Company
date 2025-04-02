"use client";

import * as React from "react";
import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { Search, } from "lucide-react";
import { cn } from "@/lib/utils";
import { menuSections } from "@/data/menu-items-admin";
import { UserButton } from "@clerk/nextjs";
import { SettingsPanelAdmin } from "./settings-modal-admin";
import { NotificationPanelAdmin } from "./notification-modal-admin";
import { useActiveMenu } from "@/hooks/use-active-menu-admin";
import { useSidebarColor } from "@/hooks/use-sidebar-color";


export default function SidebarNavigation() {
    // Estados para controlar la expansión y visibilidad del sidebar
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeItem, setActiveItem] = useActiveMenu("Overview");
    // Estados para controlar la visibilidad de los modales
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

    // Hooks para acceder a la información del usuario y la compañía
    const { company, loading } = useCompany();
    const params = useParams();
    const companyName =
        typeof params.companyName === "string" ? params.companyName : "";
        
    // Hook para acceder al color del sidebar
    const { sidebarColor } = useSidebarColor();

    // Estado y refs para la gestión de la interfaz
    const [, startTransition] = useTransition();
    const iconSidebarRef = useRef<HTMLDivElement>(null);
    const expandablePanelRef = useRef<HTMLDivElement>(null);

    // Efecto para cargar las tiendas y manejar clics fuera del sidebar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const isSelectElement = target.closest('[data-exclude-close]');
            const isSelectContent = target.closest('[role="listbox"]');
            if (
                iconSidebarRef.current &&
                !iconSidebarRef.current.contains(event.target as Node) &&
                expandablePanelRef.current &&
                !expandablePanelRef.current.contains(event.target as Node) &&
                !isSelectElement &&
                !isSelectContent
            ) {
                setIsExpanded(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    // Manejador para cuando se selecciona un ítem del menú
    const handleItemClick = (label: string) => {
        startTransition(() => {
            setActiveItem(label);
            setIsExpanded(true);
        });
    };

    // Memorización de todos los ítems del menú para optimizar el rendimiento
    const allMenuItems = useMemo(() => {
        const items: Array<{
            mainOption: string;
            icon: React.ElementType;
            label: string;
            href?: string;
        }> = [];

        menuSections.forEach((section) => {
            section.items.forEach((menuItem) => {
                items.push({
                    mainOption: menuItem.label,
                    icon: menuItem.icon,
                    label: menuItem.label,
                    href: menuItem.href
                });
                if (menuItem.submenu) {
                    menuItem.submenu.forEach((subItem) => {
                        items.push({
                            mainOption: menuItem.label,
                            icon: subItem.icon,
                            label: subItem.label,
                            href: subItem.href
                        });
                    });
                }
            });
        });
        return items;
    }, []);

    // Memorización de los ítems filtrados según la búsqueda
    const filteredItems = useMemo(() => {
        if (!searchQuery) return [];
        return allMenuItems.filter(
            ({ label, mainOption }) =>
                label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mainOption.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allMenuItems]);

    // Obtención del ítem activo y separación de las secciones principales y de configuración
    const activeMenuItem = menuSections
        .flatMap((section) => section.items)
        .find((item) => item.label === activeItem);

    const mainMenuItems = menuSections.slice(0, -1);

    return (
        <>
            {/* Contenedor principal que ocupa toda la altura de la pantalla */}
            <div className="flex h-screen">
                    {/* Barra lateral con iconos, siempre visible */}
                    <div
                        ref={iconSidebarRef}
                        className="flex h-full w-16 flex-col shadow-md"
                        style={{ backgroundColor: sidebarColor }}>
                        <div className="flex flex-col flex-1 justify-between min-h-screen">
                            <div className="flex flex-col h-full">

                                {/* Sección de elementos principales del menú */}
                                <div className="flex flex-col items-center justify-center flex-grow ">
                                    {mainMenuItems.map((section) =>
                                        section.items.map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={() => handleItemClick(item.label)}
                                                className={cn(
                                                    "mb-2 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100",
                                                    activeItem === item.label
                                                        ? "bg-gray-100 font-semibold text-gray-900"
                                                        : "text-gray-700"
                                                )}>
                                                <item.icon className="h-5 w-5" />
                                            </button>
                                        ))
                                    )}
                                </div>

                                {/* Sección inferior con notificaciones y configuraciones */}
                                <div className="flex flex-col items-center justify-center pb-2 space-y-1">
                                    <NotificationPanelAdmin />
                                    <SettingsPanelAdmin />
                                    <div className="relative h-10 w-10 mx-auto flex justify-center">
                                        <UserButton afterSignOutUrl="/" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Panel expandible que muestra detalles del menú */}
                    <div
                        ref={expandablePanelRef}
                        className={cn(
                            "w-64 shadow-lg transition-all duration-300",
                            !isExpanded && "w-0 overflow-hidden"
                        )}
                        style={{ 
                            backgroundColor: sidebarColor,
                            filter: "brightness(1.1)" // Versión más clara del mismo color para el panel expandible
                        }}>
                        <div className="flex h-full flex-col">
                            {/* Cabecera con búsqueda */}
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
                            {/* Navegación principal con resultados de búsqueda o submenú */}
                            <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
                                {searchQuery ? (
                                    <div className="space-y-1">
                                        {filteredItems.map(({ mainOption, icon: Icon, label }, index) => (
                                            <button
                                                key={`${mainOption}-${label}-${index}`}
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                                style={{
                                                    backgroundColor: `${sidebarColor}`,
                                                    filter: "brightness(1.25)", // Versión más clara para los resultados de búsqueda
                                                    marginBottom: "4px"
                                                }}>
                                                <Icon className="h-5 w-5" />
                                                <span>{label}</span>
                                                <span className="ml-auto text-xs font-normal text-gray-500">
                                                    {mainOption}
                                                </span>
                                            </button>
                                        ))}
                                        {filteredItems.length === 0 && (
                                            <div className="px-3 py-2 text-sm text-gray-500">
                                                No options found
                                            </div>
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
                                                        href={subItem.href || "#"}
                                                        className="group flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                                        style={{
                                                            backgroundColor: `${sidebarColor}`,
                                                            filter: "brightness(1.25)", // Versión más clara para las subopciones
                                                            marginBottom: "4px"
                                                        }}>
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
                    {/* area principal de modal */}
                </div >
            </>
        );
}

