"use client"

import type React from "react"

import { useState, useMemo } from "react"
import Image from "next/image"
import { MenuIcon, User2, Settings, LogOut, KeyRound, RefreshCw, ExternalLink, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { menuSections } from "@/data/menu-items"
import { UserButton, useUser } from "@clerk/nextjs"

export default function SidebarNavigation() {
    const [isExpanded, setIsExpanded] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeItem, setActiveItem] = useState<string | null>("Store")
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const { user } = useUser()

    const handleItemClick = (label: string) => {
        if (!isExpanded) {
            setIsExpanded(true)
        }
        setActiveItem(activeItem === label ? null : label)
    }

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded)
    }

    // Get all menu items and their suboptions for search
    const allMenuItems = useMemo(() => {
        const items: Array<{
            mainOption: string
            icon: React.ElementType
            label: string
            href?: string
        }> = []

        menuSections.forEach((section) => {
            section.items.forEach((menuItem) => {
                // Add main menu item
                items.push({
                    mainOption: menuItem.label,
                    icon: menuItem.icon,
                    label: menuItem.label,
                    href: menuItem.href,
                })
                // Add submenu items
                if (menuItem.submenu) {
                    menuItem.submenu.forEach((subItem) => {
                        items.push({
                            mainOption: menuItem.label,
                            icon: subItem.icon,
                            label: subItem.label,
                            href: subItem.href,
                        })
                    })
                }
            })
        })
        return items
    }, [])

    // Filter all items based on search query
    const filteredItems = useMemo(() => {
        if (!searchQuery) return []

        return allMenuItems.filter(
            ({ label, mainOption }) =>
                label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mainOption.toLowerCase().includes(searchQuery.toLowerCase()),
        )
    }, [searchQuery, allMenuItems])

    // Get active menu item's suboptions
    const activeMenuItem = menuSections.flatMap((section) => section.items).find((item) => item.label === activeItem)

    // Separate main menu items and settings
    const mainMenuItems = menuSections.slice(0, -1)
    const settingsSection = menuSections[menuSections.length - 1]

    return (
        <div className="flex h-screen">
            {/* Icon sidebar - always visible */}
            <div className="flex h-full w-16 flex-col justify-between bg-white shadow-md">
                <div>
                    {/* Search icon when collapsed */}
                    <div className="flex h-16 items-center justify-center">
                        {!isExpanded && (
                            <button onClick={() => setIsExpanded(true)} className="rounded-lg p-2 text-gray-700 hover:bg-gray-100">
                                <Search className="h-5 w-5" />
                            </button>
                        )}
                    </div>

                    {/* Main menu icons */}
                    <div className="flex flex-col items-center py-4">
                        {mainMenuItems.map((section) =>
                            section.items.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => handleItemClick(item.label)}
                                    className={cn(
                                        "mb-2 flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100",
                                        activeItem === item.label && "bg-gray-100 font-semibold text-gray-900",
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                </button>
                            )),
                        )}
                    </div>
                </div>

                {/* Settings and Profile icons at bottom */}
                <div className="flex flex-col items-center py-4 space-y-2">
                    {settingsSection.items.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => handleItemClick(item.label)}
                            className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100",
                                activeItem === item.label && "bg-gray-100 font-semibold text-gray-900",
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                        </button>
                    ))}

                    <div className="relative h-10 w-10">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </div>

            {/* Expandable content panel */}
            <div className={cn("w-64 bg-white shadow-lg transition-all duration-300", !isExpanded && "w-0 overflow-hidden")}>
                <div className="flex h-full flex-col">
                    {/* Header with search */}
                    <div className="flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <Image src="/placeholder.svg" alt="Company Logo" width={32} height={32} className="rounded" />
                            <div>
                                <span className="font-semibold text-gray-900">Company Name</span>
                                <span className="ml-2 text-sm text-gray-600">Enterprise</span>
                            </div>
                        </div>
                        <button onClick={toggleSidebar} className="rounded-lg p-2 text-gray-700 hover:bg-gray-100">
                            <MenuIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Global search */}
                    <div className="px-4 py-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search all options..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm font-medium placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring-0"
                            />
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="flex-1 overflow-y-auto p-3">
                        {searchQuery ? (
                            // Show search results
                            <div className="space-y-1">
                                {filteredItems.map(({ mainOption, icon: Icon, label, href }, index) => (
                                    <button
                                        key={`${mainOption}-${label}-${index}`}
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{label}</span>
                                        <span className="ml-auto text-xs font-normal text-gray-500">{mainOption}</span>
                                    </button>
                                ))}
                                {filteredItems.length === 0 && <div className="px-3 py-2 text-sm text-gray-500">No options found</div>}
                            </div>
                        ) : (
                            // Show active section's suboptions
                            activeMenuItem?.submenu && (
                                <div className="space-y-1">
                                    {activeMenuItem.submenu.map((subitem) => (
                                        <button
                                            key={subitem.label}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                        >
                                            <subitem.icon className="h-5 w-5" />
                                            <span>{subitem.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )
                            /* agregar elemento de login clerk */
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

