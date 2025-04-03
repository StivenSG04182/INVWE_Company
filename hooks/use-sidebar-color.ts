'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SidebarPosition = 'left' | 'right' | 'top';

interface SidebarColorState {
    sidebarColor: string;
    brightness: number;
    sidebarPosition: SidebarPosition;
    setSidebarColor: (color: string) => void;
    setBrightness: (value: number) => void;
    setSidebarPosition: (position: SidebarPosition) => void;
}

export const useSidebarColor = create<SidebarColorState>(
    persist(
        (set) => ({
            sidebarColor: '#ffffff',
            brightness: 1.1,
            sidebarPosition: 'left',
            setSidebarColor: (color: string) => set({ sidebarColor: color }),
            setBrightness: (value: number) => set({ brightness: value }),
            setSidebarPosition: (position: SidebarPosition) => set({ sidebarPosition: position })
        }),
        {
            name: 'sidebar-color-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);