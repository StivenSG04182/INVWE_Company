"use server"

import { db } from "./db"
import { EmailTemplateStatus, Prisma } from "@prisma/client"

export const getEmailTemplates = async (
    agencyId: string,
    filters?: {
        search?: string
        status?: EmailTemplateStatus
        category?: string
    }
) => {
    try {
        const where: Prisma.EmailTemplateWhereInput = {
            agencyId,
            ...(filters?.search && {
                OR: [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                ],
            }),
            ...(filters?.status && { status: filters.status }),
            ...(filters?.category && { category: filters.category }),
        }

        const [templates, stats] = await Promise.all([
            db.emailTemplate.findMany({                                                 
                where,
                orderBy: { updatedAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    category: true,
                    status: true,
                    thumbnail: true,
                    updatedAt: true,
                },
            }),
            db.emailTemplate.groupBy({
                by: ['status'],
                where: { agencyId },
                _count: true,
            }),
        ])

        const totalStats = {
            total: stats.reduce((acc, curr) => acc + curr._count, 0),
            active: stats.find(s => s.status === EmailTemplateStatus.ACTIVE)?._count || 0,
            draft: stats.find(s => s.status === EmailTemplateStatus.DRAFT)?._count || 0,
            thisWeek: await db.emailTemplate.count({
                where: {
                    agencyId,
                    updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            }),
        }

        return { templates, stats: totalStats }
    } catch (error) {
        console.error("Error al obtener plantillas de email:", error)
        throw new Error("Error al obtener las plantillas de email")
    }
}

export const duplicateEmailTemplate = async (templateId: string) => {
    try {
        const original = await db.emailTemplate.findUnique({
            where: { id: templateId },
        })

        if (!original) throw new Error("Plantilla no encontrada")

        const copy = await db.emailTemplate.create({
            data: {
                name: `${original.name} (copia)`,
                description: original.description,
                content: original.content as any,
                thumbnail: original.thumbnail,
                status: 'DRAFT' as EmailTemplateStatus,
                category: original.category,
                Agency: { connect: { id: original.agencyId } },
            },
        })

        return copy
    } catch (error) {
        console.error("Error al duplicar plantilla:", error)
        throw error
    }
}

export const deleteEmailTemplate = async (templateId: string) => {
    try {
        await db.emailTemplate.delete({
            where: { id: templateId },
        })
        return true
    } catch (error) {
        console.error("Error al eliminar plantilla:", error)
        throw error
    }
}

interface CreateEmailTemplateData {
    name: string
    description?: string
    content: any
    thumbnail?: string
    status: EmailTemplateStatus
    category?: string
    agencyId: string
}

interface UpdateEmailTemplateData {
    name?: string
    description?: string
    content?: any
    thumbnail?: string
    status?: EmailTemplateStatus
    category?: string
}

export const createEmailTemplate = async (data: CreateEmailTemplateData) => {
    try {
        const template = await db.emailTemplate.create({
            data: {
                name: data.name,
                description: data.description,
                content: data.content,
                thumbnail: data.thumbnail,
                status: data.status,
                category: data.category,
                Agency: {
                    connect: { id: data.agencyId }
                }
            }
        })
        return template
    } catch (error) {
        console.error("Error al crear la plantilla de email:", error)
        throw new Error("Error al crear la plantilla de email")
    }
}

export const updateEmailTemplate = async (templateId: string, data: UpdateEmailTemplateData) => {
    try {
        const template = await db.emailTemplate.update({
            where: { id: templateId },
            data: {
                name: data.name,
                description: data.description,
                content: data.content,
                thumbnail: data.thumbnail,
                status: data.status,
                category: data.category,
            }
        })
        return template
    } catch (error) {
        console.error("Error al actualizar la plantilla de email:", error)
        throw new Error("Error al actualizar la plantilla de email")
    }
}

export const getEmailTemplateById = async (templateId: string) => {
    try {
        const template = await db.emailTemplate.findUnique({
            where: { id: templateId }
        })
        if (!template) {
            throw new Error("Plantilla no encontrada")
        }
        return template
    } catch (error) {
        console.error("Error al obtener la plantilla de email:", error)
        throw error
    }
}