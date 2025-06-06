"use server"

import { revalidatePath } from "next/cache"
import { duplicateEmailTemplate, deleteEmailTemplate } from "@/lib/email-template-queries"

export async function duplicateTemplate(templateId: string) {
    try {
        await duplicateEmailTemplate(templateId)
        revalidatePath("/agency/[agencyId]/email-templates", "page")
        return { success: true }
    } catch (error) {
        console.error("Error duplicating template:", error)
        return {
            success: false,
            error: "Error al duplicar la plantilla",
        }
    }
}

export async function deleteTemplate(templateId: string) {
    try {
        await deleteEmailTemplate(templateId)
        revalidatePath("/agency/[agencyId]/email-templates", "page")
        return { success: true }
    } catch (error) {
        console.error("Error deleting template:", error)
        return {
            success: false,
            error: "Error al eliminar la plantilla",
        }
    }
}

export async function saveTemplate(templateData: any, isNew: boolean, templateId?: string) {
    try {
        if (isNew) {
            const { createEmailTemplate } = await import("@/lib/email-template-queries")
            await createEmailTemplate(templateData)
        } else {
            const { updateEmailTemplate } = await import("@/lib/email-template-queries")
            await updateEmailTemplate(templateId!, templateData)
        }

        revalidatePath("/agency/[agencyId]/email-templates", "page")
        return { success: true }
    } catch (error) {
        console.error("Error saving template:", error)
        return {
            success: false,
            error: "Error al guardar la plantilla",
        }
    }
}
