"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { menuSections } from "@/data/menu-items"

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    // Get settings section (last section from menuSections)
    const settingsSection = menuSections[menuSections.length - 1]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[500px] h-[400px] p-0 bg-white">
                <div className="flex flex-col h-full">
                    <div className="flex items-center p-6 border-b">
                        <DialogTitle className="text-2xl font-semibold">Settings</DialogTitle>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {settingsSection.items.map((item) =>
                                item.submenu?.map((subitem) => (
                                    <button
                                        key={subitem.label}
                                        className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="p-2 rounded-lg bg-gray-100">
                                            <subitem.icon className="h-6 w-6 text-gray-700" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-medium text-gray-900">{subitem.label}</h3>
                                            <p className="text-sm text-gray-500">
                                                Manage your {subitem.label.toLowerCase()} settings
                                            </p>
                                        </div>
                                    </button>
                                )),
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}