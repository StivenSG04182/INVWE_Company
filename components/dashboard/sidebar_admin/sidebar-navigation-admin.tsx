"use client";

import * as React from "react";
import axios from "axios";
import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import { MenuIcon, Search, } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { menuSections } from "@/data/menu-items-admin";
import { UserButton } from "@clerk/nextjs";
import { LogoUploadModal } from "../sidebar/logo-upload-modal";
import { useCompany } from "@/hooks/use-company";
import { SettingsPanelAdmin } from "../sidebar_admin/settings-modal-admin";
import { NotificationPanelAdmin } from "../sidebar_admin/notification-modal-admin";
import { useActiveMenu } from "@/hooks/use-active-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select";

interface Company {
    _id?: string;
    name?: string;
    logo?: string;
    stores?: Array<{ _id: string; name: string }>;
}

export default function SidebarNavigationAdminAdmin() {
    // Estados para controlar la expansión y visibilidad del sidebar
    const [isExpanded, setIsExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeItem, setActiveItem] = useActiveMenu("Overview");
    // Estados para controlar la visibilidad de los modales
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

    // Hooks para acceder a la información del usuario y la compañía
    const { company, loading } = useCompany();
    const params = useParams();
    const companyName =
        typeof params.companyName === "string" ? params.companyName : "";

    // Estado y refs para la gestión de la interfaz
    const [, startTransition] = useTransition();
    const [stores, setStores] = useState<Array<{ _id: string, name: string }>>([]);
    const iconSidebarRef = useRef<HTMLDivElement>(null);
    const expandablePanelRef = useRef<HTMLDivElement>(null);

    // Efecto para cargar las tiendas y manejar clics fuera del sidebar
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get("/api/companies/list");
                if (response.data && Array.isArray(response.data)) {
                    if (company && company._id) {
                        const matchedCompany = response.data.find(
                            (comp) => comp._id === company._id
                        );
                        if (matchedCompany && matchedCompany.stores) {
                            setStores(matchedCompany.stores);
                        } else {
                            setStores([]);
                        }
                    } else {
                        setStores([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };
        fetchCompanies();
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
    }, [company]);


    // Función para alternar la expansión del sidebar
    const toggleSidebar = () => {
        setIsExpanded((prev) => !prev);
    };

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
                    href: menuItem.href?.replace("[companyName]", companyName),
                });
                if (menuItem.submenu) {
                    menuItem.submenu.forEach((subItem) => {
                        items.push({
                            mainOption: menuItem.label,
                            icon: subItem.icon,
                            label: subItem.label,
                            href: subItem.href?.replace("[companyName]", companyName),
                        });
                    });
                }
            });
        });
        return items;
    }, [companyName]);


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
                    className="flex h-full w-16 flex-col bg-white shadow-md">
                    <div className="flex flex-col flex-1 justify-between min-h-screen">
                        <div className="flex flex-col h-full">
                            <div
                                className="flex items-center justify-center md:p-3 cursor-pointer hover:bg-gray-50"
                                onClick={() => setIsLogoModalOpen(true)}>
                                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                                    <AvatarImage
                                        src={(company as Company)?.logo || "/placeholder.svg"}
                                        alt="Company Logo"
                                    />
                                    <AvatarFallback>
                                        {company?.name?.charAt(0).toUpperCase() || "CN"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex items-center justify-center h-10">
                                {!isExpanded && (
                                    <button
                                        onClick={() => setIsExpanded(true)}
                                        className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        <Search className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
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
                        "w-64 bg-white shadow-lg transition-all duration-300",
                        !isExpanded && "w-0 overflow-hidden"
                    )}>
                    <div className="flex h-full flex-col">
                        {/* Cabecera con búsqueda */}
                        <div className="flex h-16 items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]" style={{ fontSize: '14px', transform: 'none', zoom: '1' }}>
                                    {loading ? "Loading..." : company?.name || "Company Name"}
                                </span>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="rounded-lg p-2 text-gray-700 hover:bg-gray-100">
                                <MenuIcon className="h-5 w-5" />
                            </button>
                        </div>
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
                        <div className="px-4 py-4 border-t-2 border-b-2 border-solid border-gray-300">
                            <div className="relative">
                                <Select>
                                    <SelectTrigger className="w-[220px] h-[40px] text-sm" data-exclude-close="true">
                                        <SelectValue placeholder="Seleccionar Tienda" />
                                    </SelectTrigger>
                                    <SelectContent className="w-[220px] z-[9999]" side="bottom" align="start" position="popper" sideOffset={8} data-exclude-close="true">
                                        <SelectGroup>
                                            <SelectLabel>Tiendas</SelectLabel>
                                            {stores.map((store) => (
                                                <SelectItem key={store._id} value={store._id} data-exclude-close="true">
                                                    {(store as { name?: string })?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Navegación principal con resultados de búsqueda o submenú */}
                        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
                            {searchQuery ? (
                                <div className="space-y-1">
                                    {filteredItems.map(({ mainOption, icon: Icon, label }, index) => (
                                        <button
                                            key={`${mainOption}-${label}-${index}`}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
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
                                                    href={subItem.href?.replace("[companyName]", companyName) || "#"}
                                                    onClick={() => setIsExpanded(true)}
                                                    className="group flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
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
                {/* Área principal y modales */}
                <div className="flex-1 overflow-y-auto p-3">
                    {/* Modal para subir el logo de la empresa */}
                    <LogoUploadModal
                        isOpen={isLogoModalOpen}
                        onClose={() => setIsLogoModalOpen(false)} />
                </div>
            </div >
        </>
    );
}