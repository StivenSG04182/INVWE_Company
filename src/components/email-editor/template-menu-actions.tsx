// src/components/email-editor/template-menu-actions.tsx
'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { duplicateEmailTemplate, deleteEmailTemplate } from "@/lib/email-template-queries"
import { toast } from "sonner"

interface TemplateMenuActionsProps {
    templateId: string
    agencyId: string
}

export function TemplateMenuActions({ templateId, agencyId }: TemplateMenuActionsProps) {
    const router = useRouter()

    const handleDuplicate = async () => {
        try {
            await duplicateEmailTemplate(templateId)
            router.refresh()
            toast.success("Plantilla duplicada correctamente")
        } catch (error) {
            console.error('Error al duplicar la plantilla:', error)
            toast.error("Error al duplicar la plantilla")
        }
    }

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) {
            try {
                await deleteEmailTemplate(templateId)
                router.push(`/agency/${agencyId}/email-templates`)
                toast.success("Plantilla eliminada correctamente")
            } catch (error) {
                console.error('Error al eliminar la plantilla:', error)
                toast.error("Error al eliminar la plantilla")
            }
        }
    }

    return (
        <div className="absolute top-4 right-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                        <Link href={`/agency/${agencyId}/email-templates/preview/${templateId}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            Vista previa
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="text-destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}