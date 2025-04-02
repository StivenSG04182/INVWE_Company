'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SidebarColorState {
    sidebarColor: string;
    setSidebarColor: (color: string) => void;
}

export const useSidebarColor = create<SidebarColorState>(
    persist(
        (set) => ({
            sidebarColor: '#f6d365', // Color predeterminado
            setSidebarColor: (color: string) => set({ sidebarColor: color }),
        }),
        {
            name: 'sidebar-color-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);