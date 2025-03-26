"use client";

import * as React from "react";
import axios from "axios";
import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import { MenuIcon, Search, } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { menuSections } from "@/data/menu-items";
import { UserButton, useUser } from "@clerk/nextjs";
import { LogoUploadModal } from "./logo-upload-modal";
import { useCompany } from "@/hooks/use-company";
import { SettingsModal } from "./settings-modal";
import { NotificationPanel } from "./notification-modal";
import { useActiveMenu } from "@/hooks/use-active-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select";

export default function SidebarNavigation() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeItem, setActiveItem] = useActiveMenu("Overview");
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { user } = useUser();
    const { company, loading } = useCompany();
    const params = useParams();
    const companyName =
        typeof params.companyName === "string" ? params.companyName : "";
    const [isPending, startTransition] = useTransition();
    // Aquí almacenaremos solo las stores de la company actual
    const [stores, setStores] = useState([]);
    const containerRef = useRef(null);
    const iconSidebarRef = useRef<HTMLDivElement>(null);
    const expandablePanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Función para obtener las companies y extraer las stores de la company actual
        const fetchCompanies = async () => {
            try {
                const response = await axios.get("/api/companies/list");
                if (response.data && Array.isArray(response.data)) {
                    if (company && company._id) {
                        // Buscar la company cuyo _id coincida con el de la company actual
                        const matchedCompany = response.data.find(
                            (comp) => comp._id === company._id
                        );
                        if (matchedCompany && matchedCompany.stores) {
                            setStores(matchedCompany.stores);
                        } else {
                            setStores([]);
                        }
                    } else {
                        // Si no hay company seleccionada, dejamos stores vacías
                        setStores([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };

        fetchCompanies();

        // Función para detectar clics fuera del sidebar y cerrarlo
        const handleClickOutside = (event: MouseEvent) => {
            // Verificar si el clic fue fuera del sidebar de iconos y del panel expandible
            if (
                iconSidebarRef.current &&
                !iconSidebarRef.current.contains(event.target as Node) &&
                expandablePanelRef.current &&
                !expandablePanelRef.current.contains(event.target as Node)
            ) {
                // Si el clic fue fuera de ambos elementos, colapsar el sidebar
                setIsExpanded(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [company]);

    // Función para alternar el estado del sidebar
    const toggleSidebar = () => {
        setIsExpanded((prev) => !prev);
    };

    // Función para manejar el clic en un item del menú
    const handleItemClick = (label: string) => {
        startTransition(() => {
            setActiveItem(label);
            setIsExpanded(true);
        });
    };

    // Obtener todos los items del menú y sus subopciones para la búsqueda
    const allMenuItems = useMemo(() => {
        const items: Array<{
            mainOption: string;
            icon: React.ElementType;
            label: string;
            href?: string;
        }> = [];

        menuSections.forEach((section) => {
            section.items.forEach((menuItem) => {
                // Agregar item principal
                items.push({
                    mainOption: menuItem.label,
                    icon: menuItem.icon,
                    label: menuItem.label,
                    href: menuItem.href?.replace("[companyName]", companyName),
                });
                // Agregar submenús
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

    // Filtrar los items basándose en el query de búsqueda
    const filteredItems = useMemo(() => {
        if (!searchQuery) return [];
        return allMenuItems.filter(
            ({ label, mainOption }) =>
                label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mainOption.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, allMenuItems]);

    // Obtener el item activo para mostrar sus subopciones
    const activeMenuItem = menuSections
        .flatMap((section) => section.items)
        .find((item) => item.label === activeItem);

    // Separar items principales y de configuración
    const mainMenuItems = menuSections.slice(0, -1);
    const settingsSection = menuSections[menuSections.length - 1];

    return (
        <>
            <div className="flex h-screen">
                {/* Sidebar de iconos - siempre visible */}
                <div
                    ref={iconSidebarRef}
                    className="flex h-full w-16 flex-col bg-white shadow-md"
                >
                    {/* Contenedor de íconos principales */}
                    <div className="flex flex-col flex-1 justify-between min-h-screen">
                        {/* Contenedor interno para logo, búsqueda e íconos */}
                        <div className="flex flex-col h-full">
                            <div
                                className="flex items-center justify-center md:p-3 cursor-pointer hover:bg-gray-50"
                                onClick={() => setIsLogoModalOpen(true)}
                            >
                                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                                    <AvatarImage src="/placeholder.svg" alt="Company Logo" />
                                    <AvatarFallback>CN</AvatarFallback>
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

                            {/* Menú principal */}
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
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Iconos de configuración, perfil y notificaciones */}
                            <div className="flex flex-col items-center justify-center pb-2 space-y-1">
                                <NotificationPanel />
                                {settingsSection.items.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => setIsSettingsOpen(true)}
                                        className={cn(
                                            "flex h-10 w-10 mx-auto items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100",
                                            isSettingsOpen && "bg-gray-100 font-semibold text-gray-900"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5 " />
                                    </button>
                                ))}
                                <div className="relative h-10 w-10 mx-auto flex justify-center">
                                    <UserButton afterSignOutUrl="/" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel de contenido expandible */}
                <div
                    ref={expandablePanelRef}
                    className={cn(
                        "w-64 bg-white shadow-lg transition-all duration-300",
                        !isExpanded && "w-0 overflow-hidden"
                    )}
                >
                    <div className="flex h-full flex-col">
                        {/* Cabecera con búsqueda */}
                        <div className="flex h-16 items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-900">
                                    {loading ? "Loading..." : company?.name || "Company Name"}
                                </span>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
                            >
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

                        {/* Mostrar las stores de la company actual */}
                        <div className="px-4 py-4 border-t-2 border-b-2 border-solid border-gray-300">
                            <div className="relative">
                                <Select>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Seleccionar Tienda" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Tiendas</SelectLabel>
                                            {stores.map((store) => (
                                                <SelectItem key={store._id} value={store._id}>
                                                    {store.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Menú de navegación con subopciones */}
                        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
                            {searchQuery ? (
                                <div className="space-y-1">
                                    {filteredItems.map(({ mainOption, icon: Icon, label }, index) => (
                                        <button
                                            key={`${mainOption}-${label}-${index}`}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                        >
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
                        <SettingsModal
                            isOpen={isSettingsOpen}
                            onClose={() => setIsSettingsOpen(false)}
                        />
                    </div>
                </div>
            </div >
        </>
    );
}
