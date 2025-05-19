"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { revalidatePath } from 'next/cache';
import { NextResponse } from "next/server";

// Parámetros de búsqueda para clientes
interface SearchParams {
    searchTerm?: string;
    type?: string;
    status?: string;
    sortBy: string;
    limit?: number;
}

// Repositorio Prisma
async function getClients(agencyId: string, subAccountId?: string) {
    const where: Prisma.ClientWhereInput = { agencyId };
    if (subAccountId) where.subAccountId = subAccountId;
    return await db.client.findMany({ where, orderBy: { name: 'asc' } });
}

async function searchClients(
    agencyId: string,
    { searchTerm, type, status, sortBy, limit }: SearchParams,
    subAccountId?: string
) {
    const where: Prisma.ClientWhereInput = { agencyId };
    if (subAccountId) where.subAccountId = subAccountId;
    if (searchTerm) where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
    ];
    if (type) where.type = type as any;
    if (status) where.status = status as any;
    const orderBy: Prisma.Enumerable<Prisma.ClientOrderByWithRelationInput> = { [sortBy]: 'asc' };
    return await db.client.findMany({ where, orderBy, take: limit });
}

async function createClient(
    agencyId: string,
    data: Omit<Prisma.ClientCreateInput, 'Agency' | 'SubAccount'>,
    subAccountId?: string
) {
    return await db.client.create({
        data: {
            ...data,
            Agency: { connect: { id: agencyId } },
            ...(subAccountId && { SubAccount: { connect: { id: subAccountId } } }),
        }
    });
}

// Helpers de Clerk y Activity Logs
export const getAuthUserDetails = async () => {
    const user = await currentUser();
    if (!user) return;
    return await db.user.findUnique({
        where: { email: user.emailAddresses[0].emailAddress },
        include: { Agency: { include: { SubAccount: true } } }
    });
};

export const saveActivityLogsNotification = async ({
    agencyId,
    description,
    subaccountId,
}: {
    agencyId?: string;
    description: string;
    subaccountId?: string;
}) => {
    const authUser = await currentUser();
    let userData = authUser
        ? await db.user.findUnique({ where: { email: authUser.emailAddresses[0].emailAddress } })
        : undefined;
    if (!userData) {
        userData = await db.user.findFirst({ where: { Agency: { SubAccount: { some: { id: subaccountId } } } } });
    }
    if (!userData) return;
    let targetAgency = agencyId;
    if (!targetAgency && subaccountId) {
        const sub = await db.subAccount.findUnique({ where: { id: subaccountId } });
        targetAgency = sub?.agencyId;
    }
    if (!targetAgency) return;
    await db.notification.create({
        data: {
            notification: `${userData.name} | ${description}`,
            User: { connect: { id: userData.id } },
            Agency: { connect: { id: targetAgency } },
            ...(subaccountId && { SubAccount: { connect: { id: subaccountId } } }),
        }
    });
};

export const createTeamUser = async (agencyId: string, userObj: any) => {
    if (userObj.role === "AGENCY_OWNER") return null;
    return await db.user.create({ data: { ...userObj } });
};

// Rutas API para clientes con Clerk
export async function GET(req: Request, { params }: { params: { agencyId: string } }) {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    const { agencyId } = params;
    const { searchParams } = new URL(req.url);
    const subAccountId = searchParams.get('subAccountId') || undefined;
    const searchTerm = searchParams.get('search') || undefined;
    const type = searchParams.get('type') as string | undefined;
    const status = searchParams.get('status') as string | undefined;
    const sortBy = searchParams.get('sortBy') || 'name';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let data;
    if (searchTerm || type || status || sortBy !== 'name' || limit) {
        data = await searchClients(agencyId, { searchTerm, type, status, sortBy, limit }, subAccountId);
        await saveActivityLogsNotification({ agencyId, description: 'Buscó clientes', subaccountId: subAccountId });
    } else {
        data = await getClients(agencyId, subAccountId);
        await saveActivityLogsNotification({ agencyId, description: 'Obtuvo lista de clientes', subaccountId: subAccountId });
    }

    revalidatePath(`/api/clients/${agencyId}`);
    return NextResponse.json({ success: true, data });
}

export async function POST(req: Request, { params }: { params: { agencyId: string } }) {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    const body = await req.json();
    const { subAccountId, ...clientData } = body;
    const newClient = await createClient(params.agencyId, clientData as Omit<Prisma.ClientCreateInput, 'Agency' | 'SubAccount'>, subAccountId);
    await saveActivityLogsNotification({ agencyId: params.agencyId, description: 'Creó un cliente', subaccountId: subAccountId });
    revalidatePath(`/api/clients/${params.agencyId}`);
    return NextResponse.json({ success: true, data: newClient });
}
