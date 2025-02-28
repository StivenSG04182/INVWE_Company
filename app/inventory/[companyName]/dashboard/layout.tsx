"use client"

import { useState } from "react"
import SidebarNavigation from "@/components/dashboard/sidebar/sidebar-navigation"
import { ContentView } from "@/components/dashboard/content-view"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [currentPath, setCurrentPath] = useState("/overview/dashboard")

    return (
        <div className="flex min-h-screen bg-gray-50">
            <SidebarNavigation />
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}