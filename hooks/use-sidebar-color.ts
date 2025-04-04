'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SidebarPosition = 'left' | 'right' | 'top';
export type SidebarDesign = 'compact' | 'expanded';
export type IconSize = 'small' | 'medium' | 'large';
export type FontStyle = 'regular' | 'medium' | 'semibold' | 'bold';

interface SidebarColorState {
    sidebarColor: string;
    brightness: number;
    sidebarPosition: SidebarPosition;
    sidebarDesign: SidebarDesign;
    iconSize: IconSize;
    fontStyle: FontStyle;
    menuOrder: string[];
    setSidebarColor: (color: string) => void;
    setBrightness: (value: number) => void;
    setSidebarPosition: (position: SidebarPosition) => void;
    setSidebarDesign: (design: SidebarDesign) => void;
    setIconSize: (size: IconSize) => void;
    setFontStyle: (style: FontStyle) => void;
    setMenuOrder: (order: string[]) => void;
    toggleMenuItemVisibility: (item: string) => void;
}

export const useSidebarColor = create<SidebarColorState>(
    persist(
        (set, get) => ({
            sidebarColor: '#ffffff',
            brightness: 1.1,
            sidebarPosition: 'left',
            sidebarDesign: 'compact',
            iconSize: 'medium',
            fontStyle: 'regular',
            menuOrder: [
                'Dashboard', 
                'Tienda & E-Commerce', 
                'Inventario', 
                'Ventas & Facturación', 
                'Personal & RRHH', 
                'Clientes & CRM', 
                'Reportes & Analíticas'
            ],
            setSidebarColor: (color: string) => set({ sidebarColor: color }),
            setBrightness: (value: number) => set({ brightness: value }),
            setSidebarPosition: (position: SidebarPosition) => set({ sidebarPosition: position }),
            setSidebarDesign: (design: SidebarDesign) => set({ sidebarDesign: design }),
            setIconSize: (size: IconSize) => set({ iconSize: size }),
            setFontStyle: (style: FontStyle) => set({ fontStyle: style }),
            setMenuOrder: (order: string[]) => set({ menuOrder: order }),
            toggleMenuItemVisibility: (item: string) => {
                // Modificamos esta función para que no elimine elementos del menuOrder
                // En su lugar, mantenemos todos los elementos y respetamos el orden establecido
                // Esta función ahora es un placeholder que no modifica el menuOrder
                // para evitar que se oculten elementos del menú
                console.log(`Visibilidad de ${item} no modificada - Función deshabilitada`);
                // Mantenemos el menuOrder sin cambios
            }
        }),
        {
            name: 'sidebar-color-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);