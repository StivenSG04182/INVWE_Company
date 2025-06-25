"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Copy, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"
import { toast } from "sonner"
import { duplicateTemplate, deleteTemplate } from "@/lib/template-actions"

interface TemplateActionsProps {
    templateId: string
    agencyId: string
}

export function TemplateActions({ templateId, agencyId }: TemplateActionsProps) {
    const [isPending, startTransition] = useTransition()

    const handleDuplicate = () => {
        startTransition(async () => {
            try {
                const result = await duplicateTemplate(templateId)
                if (result.success) {
                    toast.success("Plantilla duplicada correctamente")
                } else {
                    toast.error(result.error || "Error al duplicar la plantilla")
                }
            } catch (error) {
                toast.error("Error inesperado al duplicar la plantilla")
            }
        })
    }

    const handleDelete = () => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta plantilla?")) return

        startTransition(async () => {
            try {
                const result = await deleteTemplate(templateId)
                if (result.success) {
                    toast.success("Plantilla eliminada correctamente")
                } else {
                    toast.error(result.error || "Error al eliminar la plantilla")
                }
            } catch (error) {
                toast.error("Error inesperado al eliminar la plantilla")
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8" disabled={isPending}>
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
                <DropdownMenuItem asChild>
                    <Link href={`/agency/${agencyId}/email-templates/editor/${templateId}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete} disabled={isPending}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
