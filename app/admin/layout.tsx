"use client"

import { useState, useEffect, useRef } from "react"
import SidebarNavigation from "@/components/dashboard/sidebar_admin/sidebar-navigation-admin"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [, setZoomLevel] = useState(1)
    const layoutRef = useRef<HTMLDivElement>(null)

    // Effect to handle zoom level changes through window resize events
    useEffect(() => {
        const handleResize = () => {
            // Calculate zoom level based on device pixel ratio and other factors
            const currentZoom = window.innerWidth / window.outerWidth
            setZoomLevel(currentZoom)
            
            // Apply CSS custom property for zoom-aware scaling
            if (layoutRef.current) {
                layoutRef.current.style.setProperty('--zoom-factor', String(1 / currentZoom))
            }
        }

        // Initial calculation
        handleResize()

        // Listen for resize events which happen during zoom changes
        window.addEventListener('resize', handleResize)
        
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <div 
            ref={layoutRef}
            className="flex min-h-screen bg-gray-50 zoom-responsive"
            style={{
                // Apply zoom-aware styles
                fontSize: `calc(1rem * var(--zoom-factor, 1))`,
                // Ensure content scales properly with zoom
                width: '100%',
                height: '100%'
            }}
        >
            <SidebarNavigation />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}