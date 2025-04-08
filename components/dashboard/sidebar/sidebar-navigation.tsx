"use client";

import * as React from "react";
import axios from "axios";
import { useState, useMemo, useEffect, useRef, useTransition } from "react";
import { MenuIcon, Search, ShoppingCart, } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { menuSections } from "@/data/menu-items";
import { UserButton } from "@clerk/nextjs";
import { LogoUploadModal } from "./logo-upload-modal";
import { useCompany } from "@/hooks/use-company";
import { SettingsPanel } from "./settings-modal";
import { NotificationPanel } from "./notification-modal";
import { useActiveMenu } from "@/hooks/use-active-menu";
import { useSidebarColor } from "@/hooks/use-sidebar-color";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select";

interface Company {
    _id?: string;
    name?: string;
    logo?: string;
    stores?: Array<{ _id: string; name: string }>;
}

export default function SidebarNavigation() {
    const [ShoppingCartQuery, setShoppingCartQuery] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const iconSidebarRef = useRef<HTMLDivElement>(null);
    const expandablePanelRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeItem, setActiveItem] = useActiveMenu("Overview");
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [, startTransition] = useTransition();
    const [stores, setStores] = useState<Array<{ _id: string, name: string }>>([]);
    const { company, loading } = useCompany();
    const params = useParams();
    const companyName =
        typeof params.companyName === "string" ? params.companyName : "";
    const { sidebarColor, sidebarPosition, sidebarDesign, iconSize, fontStyle, menuOrder } = useSidebarColor();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get("/api/control_login/companies/stores");
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
            const isInteractiveElement = [
                'A', 'BUTTON', 'INPUT', 'LI', 'LABEL', 
                'SELECT', 'OPTION', 'PATH', 'SVG'
            ].includes(target.tagName);
            const isInsideSidebar = (
                iconSidebarRef.current?.contains(target) ||
                expandablePanelRef.current?.contains(target) ||
                target.closest('[data-sidebar-content]') 
            );
            const isExcluded = target.closest('[data-exclude-close]');
            if (isExpanded && !isInsideSidebar && !isExcluded && !isInteractiveElement) {
                setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [company, isExpanded]);

    // Función para alternar la visibilidad del sidebar
    const toggleSidebar = () => {
        setIsExpanded(prev => {
            if (!prev && sidebarPosition === 'top') {
                setTimeout(() => window.scrollTo(0, 0), 300);
            }
            return !prev;
        });
    };

    // Manejador para cuando se selecciona un ítem del menú
    const handleItemClick = (label: string) => {
        startTransition(() => {
            // Si el ítem ya está activo, solo alternamos la expansión del sidebar
            if (activeItem === label) {
                setIsExpanded(prev => !prev);
            } else {
                const wasExpanded = isExpanded;

                // Cerramos temporalmente para cambiar el contenido
                if (wasExpanded) {
                    setIsExpanded(false);
                    // Usamos setTimeout para dar tiempo a la animación de cierre
                    setTimeout(() => {
                        setActiveItem(label);
                        setIsExpanded(true);
                    }, 300); // Tiempo de la transición en el CSS (duration-300)
                } else {
                    // Si estaba cerrado, simplemente activamos el nuevo ítem y expandimos
                    setActiveItem(label);
                    setIsExpanded(true);
                }
            }
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

    // Obtener todas las secciones del menú principal (mostrando todas las opciones disponibles)
    const mainMenuItems = menuSections;

    mainMenuItems.sort((a, b) => {
        const aIndex = a.items[0] && menuOrder.indexOf(a.items[0].label);
        const bIndex = b.items[0] && menuOrder.indexOf(b.items[0].label);

        // Si ambos elementos están en menuOrder, ordenar según su posición
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        // Si solo uno está en menuOrder, ese va primero
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        // Si ninguno está en menuOrder, mantener el orden original
        return 0;
    });

    // Función para obtener la clase de estilo de fuente según la configuración
    const getFontStyleClass = () => {
        switch (fontStyle) {
            case 'regular': return 'font-normal';
            case 'medium': return 'font-medium';
            case 'semibold': return 'font-semibold';
            case 'bold': return 'font-bold';
            default: return 'font-normal';
        }
    };

    return (
        <>
            {/* Contenedor principal que ocupa toda la altura de la pantalla */}
            <div className={`${sidebarPosition === 'top' ? 'flex flex-col' : 'flex'} h-screen`}>
                {/* Barra lateral con iconos, siempre visible */}
                <div
                    ref={iconSidebarRef}
                    className={`${sidebarPosition === 'top' ? 'flex w-full h-16 flex-row shadow-md' : sidebarPosition === 'right' ? 'flex h-full w-16 flex-col shadow-md ml-auto' : 'flex h-full w-16 flex-col shadow-md'}`}
                    style={{
                        backgroundColor: sidebarColor,
                        transition: 'background-color 0.3s ease, width 0.3s ease, height 0.3s ease'
                    }}>
                    <div className={`${sidebarPosition === 'top' ? 'flex flex-row w-full justify-between items-center px-4' : 'flex flex-col flex-1 justify-between min-h-screen'}`}
                        style={{
                            width: sidebarDesign === 'compact' ? 'auto' : sidebarDesign === 'expanded' ? '100%' : 'auto'
                        }}
                    >
                        <div className={`${sidebarPosition === 'top' ? 'flex flex-row items-center' : 'flex flex-col h-full'}`}>
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
                            <div className={`${sidebarPosition === 'top' ? 'flex items-center justify-center h-10 ml-4' : 'flex items-center justify-center h-10'}`}>
                                {!isExpanded && (
                                    <button
                                        onClick={toggleSidebar}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
                                    >
                                        <MenuIcon className={`${iconSize === 'small' ? 'h-3 w-3' : iconSize === 'medium' ? 'h-4 w-4' : 'h-5 w-5'}`} />
                                    </button>
                                )}
                            </div>
                            {/* Sección de elementos principales del menú */}
                            <div className={`${sidebarPosition === 'top' ? 'flex flex-row items-center justify-center ml-4 space-x-2' : 'flex flex-col items-center justify-center flex-grow'}`}>
                                {mainMenuItems.map((section) =>
                                    section.items.map((item) => (
                                        <button
                                            key={item.label}
                                            onClick={() => handleItemClick(item.label)}
                                            className={cn(
                                                sidebarPosition === 'top' ? "mx-1 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100" : "mb-2 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100",
                                                activeItem === item.label
                                                    ? "bg-gray-100 font-semibold text-gray-900"
                                                    : sidebarColor.toLowerCase() === '#1f2937' ? "text-gray-200" : "text-gray-700"
                                            )}>
                                            <item.icon className={`h-5 w-5 ${activeItem === item.label || "hover:text-gray-900"} ${sidebarColor.toLowerCase() === '#ffffff' ? "text-gray-900" : activeItem === item.label ? "text-gray-900" : "text-white"}`} />
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Sección inferior con notificaciones y configuraciones */}
                            <div className={`${sidebarPosition === 'top' ? 'flex flex-row items-center justify-center space-x-2' : 'flex flex-col items-center justify-center pb-2 space-y-1'}`}>
                                <NotificationPanel />
                                <SettingsPanel />
                                <div className={`relative h-10 w-10 mx-auto flex justify-center rounded-lg ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
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
                        'shadow-lg transition-all duration-300 data-sidebar-content',
                        sidebarPosition === 'top' ? 'absolute h-64 w-full top-16' : 'relative',
                        sidebarPosition === 'right' ? 'ml-auto' : '',
                        !isExpanded && [
                            sidebarPosition === 'top' ? 'h-0' : 'w-0',
                            'overflow-hidden'
                        ],
                        sidebarColor.toLowerCase() === '#1f2937' ? 'bg-gray-800/90' : 'bg-white/90'
                    )}
                    style={{
                        filter: "brightness(1.05)",
                        zIndex: 50,
                        [sidebarPosition === 'right' ? 'right' : 'left']: 0
                    }}
                >
                    <div className={`flex ${sidebarPosition === 'top' ? 'flex-row' : 'flex-col'} h-full ${sidebarColor.toLowerCase() === '#1f2937' ? 'bg-gray-800/90' : 'bg-white/90'}`}>
                        {/* Cabecera con búsqueda */}
                        <div className={`flex h-16 items-center justify-between px-4 ${sidebarColor.toLowerCase() === '#1f2937' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <span className={`font-semibold ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-white' : 'text-gray-900'} whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]`} style={{ fontSize: '14px', transform: 'none', zoom: '1' }}>
                                    {loading ? "Loading..." : company?.name || "Company Name"}
                                </span>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg",
                                    "hover:bg-gray-100 transition-colors",
                                    sidebarPosition === 'top' ? "mx-1" : "mb-2",
                                    isExpanded
                                        ? "bg-gray-100 font-semibold text-gray-900"
                                        : sidebarColor.toLowerCase() === '#1f2937'
                                            ? "text-gray-200"
                                            : "text-gray-700"
                                )}
                            >
                                <MenuIcon className={cn(
                                    iconSize === 'small' ? 'h-3 w-3' :
                                        iconSize === 'medium' ? 'h-4 w-4' : 'h-5 w-5',
                                    sidebarColor.toLowerCase() === '#ffffff' && "text-gray-900"
                                )} />
                            </button>
                        </div>
                        <div className="px-4 py-3">
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-gray-300' : ''}`} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 ${sidebarColor.toLowerCase() === '#1f2937' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border border-black text-black'}`}
                                />
                            </div>
                        </div>
                        <div className={`px-4 py-4 border-t-2 border-b-2 border-solid ${sidebarColor.toLowerCase() === '#1f2937' ? 'border-gray-600' : 'border-gray-300'}`}>
                            <div className="relative">
                                <Select>
                                    <SelectTrigger className={`w-[220px] h-[40px] text-sm ${sidebarColor.toLowerCase() === '#1f2937' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`} data-exclude-close="true">
                                        <ShoppingCart className={sidebarColor.toLowerCase() === '#1f2937' ? 'text-gray-300' : ''} />
                                        <SelectValue
                                            placeholder="Seleccionar Tienda"
                                            value={ShoppingCartQuery}
                                            onChange={(e) => setShoppingCartQuery(e.target.value)}
                                            className="w-full" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className={`w-[220px] z-[9999] ${sidebarColor.toLowerCase() === '#1f2937' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
                                        side="bottom"
                                        align="start"
                                        position="popper"
                                        sideOffset={8}
                                        data-exclude-close="true">
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
                                            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
                                            style={{
                                                backgroundColor: sidebarColor.toLowerCase() === '#1f2937' ? "#374151" : "white",
                                                marginBottom: "4px"
                                            }}>
                                            <Icon className={`${iconSize === 'small' ? 'h-3 w-3' : iconSize === 'medium' ? 'h-4 w-4' : 'h-5 w-5'} ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-gray-300' : ''}`} />
                                            <span className={getFontStyleClass()}>{label}</span>
                                            <span className={`ml-auto text-xs ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-gray-400' : ''}`}>
                                                {mainOption}
                                            </span>
                                        </button>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <div className={`px-3 py-2 text-sm ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            No options found
                                        </div>
                                    )}
                                </div>
                            ) : (
                                activeMenuItem?.submenu && (
                                    <div className="py-3">
                                        <h2 className={`mb-2 px-4 text-xs font-semibold uppercase tracking-wider ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {activeItem}
                                        </h2>
                                        <div className="space-y-1">
                                            {activeMenuItem.submenu.map((subItem) => (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.href?.replace("[companyName]", companyName) || "#"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsExpanded(false);
                                                    }}
                                                    className={`group flex items-center rounded-lg px-4 py-2 text-sm ${getFontStyleClass()} ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-100'}`}
                                                    style={{
                                                        backgroundColor: sidebarColor.toLowerCase() === '#1f2937' ? "#374151" : "white",
                                                        marginBottom: "4px"
                                                    }}>
                                                    <subItem.icon className={`mr-3 ${iconSize === 'small' ? 'h-3 w-3' : iconSize === 'medium' ? 'h-4 w-4' : 'h-5 w-5'} ${sidebarColor.toLowerCase() === '#1f2937' ? 'text-gray-300 group-hover:text-gray-900' : ''}`} />
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
                <div className={`flex-1 overflow-y-auto p-3 ${sidebarPosition === 'top' ? 'mt-4' : ''}`}>
                    {/* Modal para subir el logo de la empresa */}
                    <LogoUploadModal
                        isOpen={isLogoModalOpen}
                        onClose={() => setIsLogoModalOpen(false)} />
                </div>
            </div >
        </>
    );
}