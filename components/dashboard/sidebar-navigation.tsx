"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import {
    Home,
    Store,
    Mail,
    FileText,
    User2,
    Settings,
    Search,
    Plus,
    LogOut,
    KeyRound,
    RefreshCw,
    X,
    ExternalLink,
    MenuIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuItem {
    icon: React.ReactNode
    label: string
    href?: string
    submenu?: MenuItem[]
}

const menuItems: MenuItem[] = [
    { icon: <Home className="h-4 w-4" />, label: "Overview" },
    {
        icon: <Store className="h-4 w-4" />,
        label: "Store",
        submenu: [
            { icon: <Store className="h-4 w-4" />, label: "Products" },
            { icon: <FileText className="h-4 w-4" />, label: "Orders" },
            { icon: <RefreshCw className="h-4 w-4" />, label: "Subscriptions" },
            { icon: <User2 className="h-4 w-4" />, label: "Customers" },
            { icon: <FileText className="h-4 w-4" />, label: "Discounts" },
            { icon: <KeyRound className="h-4 w-4" />, label: "Licenses" },
        ],
    },
    { icon: <Mail className="h-4 w-4" />, label: "Emails" },
    { icon: <FileText className="h-4 w-4" />, label: "Reports" },
    { icon: <User2 className="h-4 w-4" />, label: "Design" },
]

const settingsItems: MenuItem[] = [{ icon: <Settings className="h-4 w-4" />, label: "Settings" }]

export default function SidebarNavigation() {
    const [isExpanded, setIsExpanded] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeItem, setActiveItem] = useState<string | null>("Store")
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    const handleItemClick = (label: string) => {
        setActiveItem(activeItem === label ? null : label)
    }

    const filteredItems = [...menuItems, ...settingsItems].filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return (
        <div className="flex h-screen">
            {/* Icon sidebar - always visible */}
            <div className="flex h-full w-16 flex-col justify-between border-r bg-white">
                <div>
                    {/* Logo area */}
                    <div className="flex h-16 items-center justify-center border-b">
                        <X className="h-5 w-5 text-gray-500" />
                    </div>

                    {/* Main menu icons */}
                    <div className="flex flex-col items-center py-4">
                        {menuItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleItemClick(item.label)}
                                className={cn(
                                    "mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100",
                                    activeItem === item.label && "bg-gray-100 text-gray-900",
                                )}
                            >
                                {item.icon}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings and profile icons */}
                <div className="flex flex-col items-center py-4">
                    {settingsItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => handleItemClick(item.label)}
                            className={cn(
                                "mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100",
                                activeItem === item.label && "bg-gray-100 text-gray-900",
                            )}
                        >
                            {item.icon}
                        </button>
                    ))}
                    <button className="relative mb-2 h-8 w-8" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                        <Image src="/placeholder.svg" alt="Profile" width={32} height={32} className="rounded-lg" />
                    </button>
                </div>
            </div>

            {/* Expandable content panel */}
            <div className={cn("w-64 border-r bg-white transition-all duration-300", !isExpanded && "w-0 overflow-hidden")}>
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b px-4">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold">Online store</span>
                            <span className="text-sm text-gray-500">Learn Figma</span>
                        </div>
                        <button onClick={() => setIsExpanded(!isExpanded)} className="rounded p-1 hover:bg-gray-100">
                            <MenuIcon className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-gray-300 focus:outline-none focus:ring-0"
                            />
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {filteredItems.map((item) => (
                            <div key={item.label}>
                                <button
                                    onClick={() => handleItemClick(item.label)}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100",
                                        activeItem === item.label && "bg-gray-100 text-gray-900",
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                    {item.submenu && <Plus className="h-4 w-4 text-gray-400" />}
                                </button>
                                {item.submenu && activeItem === item.label && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {item.submenu.map((subitem) => (
                                            <button
                                                key={subitem.label}
                                                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                                            >
                                                {subitem.icon}
                                                <span>{subitem.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Profile section */}
                    {isProfileOpen && (
                        <div className="absolute bottom-4 left-16 w-64 rounded-lg border bg-white p-1 shadow-lg">
                            <div className="p-2">
                                <div className="flex items-center gap-2">
                                    <Image src="/placeholder.svg" alt="Profile" width={40} height={40} className="rounded-lg" />
                                    <div>
                                        <div className="font-medium">Sophia Munn</div>
                                        <div className="text-xs text-gray-500">sophia@untitledui.com</div>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t" />
                            <button className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-gray-600 hover:bg-gray-100">
                                <User2 className="h-4 w-4" />
                                <span className="flex-1 text-left">View profile</span>
                                <span className="text-xs text-gray-400">⌘+P</span>
                            </button>
                            <button className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-gray-600 hover:bg-gray-100">
                                <Settings className="h-4 w-4" />
                                <span className="flex-1 text-left">Account settings</span>
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                            </button>
                            <button className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-gray-600 hover:bg-gray-100">
                                <KeyRound className="h-4 w-4" />
                                <span className="flex-1 text-left">Keyboard shortcuts</span>
                                <span className="text-xs text-gray-400">?</span>
                            </button>
                            <button className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-gray-600 hover:bg-gray-100">
                                <RefreshCw className="h-4 w-4" />
                                <span className="flex-1 text-left">Updates</span>
                                <span className="text-xs text-gray-400">⌘+A</span>
                            </button>
                            <div className="border-t" />
                            <button className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-gray-600 hover:bg-gray-100">
                                <LogOut className="h-4 w-4" />
                                <span className="flex-1 text-left">Log out</span>
                                <span className="text-xs text-gray-400">⌘+Q</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

