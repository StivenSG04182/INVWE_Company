"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface CreateTemplateModalProps {
    isOpen: boolean,
    onClose: () => void,
}

export const CreateTemplateModal = ({ isOpen, onClose }: CreateTemplateModalProps) => {
    const router = useRouter()

    const onChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    const handleCodeOption = () => {
        router.push('/admin/ecommerce/create_ecommerce');
        onClose();
    }

    const handleAIOption = () => {
        // Esta funcionalidad se implementará más adelante
        router.push('./ecommerce/ai-generator');
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear nueva plantilla</DialogTitle>
                    <DialogDescription>
                        Selecciona el método para crear tu plantilla de e-commerce
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Button 
                        onClick={handleCodeOption}
                        className="w-full h-20 text-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                    >
                        Crear con código
                    </Button>
                    <Button 
                        onClick={handleAIOption}
                        className="w-full h-20 text-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                    >
                        Crear con IA
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}