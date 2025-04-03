"use client"

import { useRef } from "react"
import SidebarNavigation from "@/components/dashboard/sidebar/sidebar-navigation"
import { useSidebarColor } from "@/hooks/use-sidebar-color"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const layoutRef = useRef<HTMLDivElement>(null)
    const { sidebarPosition } = useSidebarColor()

    return (
        <div
            ref={layoutRef}
            className={`
                ${sidebarPosition === 'top' ? 'flex flex-col' : 'flex'}
                ${sidebarPosition === 'right' ? 'flex-row-reverse' : ''}
                min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
            `}>
            <SidebarNavigation />
            <main className="flex-1 overflow-auto w-full">
                {children}
            </main>
        </div>
    )
}