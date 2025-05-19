"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Prisma, ClientStatus } from "@prisma/client";
import { revalidatePath } from 'next/cache';
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientService } from "@/lib/services/client-service";
import { ProductService, AreaService, ProviderService, StockService, MovementService, CategoryService } from "@/lib/services/inventory-service";

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

// Clientes: GET, POST
export const GET = async (req: Request, { params }: { params: { agencyId: string } }) => {
    const user = await currentUser(); if (!user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    const { agencyId } = params;
    const sp = new URL(req.url).searchParams;
    const subAccountId = sp.get('subAccountId') || undefined;
    const searchTerm = sp.get('search') || undefined;
    const type = sp.get('type') as string | undefined;
    const status = sp.get('status') as string | undefined;
    const sortBy = sp.get('sortBy') || 'name';
    const limit = sp.get('limit') ? parseInt(sp.get('limit')!) : undefined;
    let data;
    if (searchTerm || type || status || sortBy !== 'name' || limit) {
        data = await searchClients(agencyId, { searchTerm, type, status, sortBy, limit }, subAccountId);
        await saveActivityLogsNotification({ agencyId, description: 'Buscó clientes', subaccountId });
    } else {
        data = await getClients(agencyId, subAccountId);
        await saveActivityLogsNotification({ agencyId, description: 'Obtuvo lista de clientes', subaccountId });
    }
    revalidatePath(`/api/clients/${agencyId}`);
    return NextResponse.json({ success: true, data });
};

export const POST = async (req: Request, { params }: { params: { agencyId: string } }) => {
    const user = await currentUser(); if (!user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    const { subAccountId, ...clientData } = await req.json();
    const newClient = await createClient(params.agencyId, clientData, subAccountId);
    await saveActivityLogsNotification({ agencyId: params.agencyId, description: 'Creó un cliente', subaccountId });
    revalidatePath(`/api/clients/${params.agencyId}`);
    return NextResponse.json({ success: true, data: newClient });
};

// Estadísticas de clientes
export const GET_STATS = async (req: Request, { params }: { params: { agencyId: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("No autorizado", { status: 401 });
    const subAccountId = new URL(req.url).searchParams.get("subAccountId") || undefined;
    const stats = await ClientService.getClientStats(params.agencyId, subAccountId);
    return NextResponse.json({ success: true, data: stats });
};

// Operaciones por ID
export const GET_BY_ID = async (req: Request, { params }: { params: { agencyId: string; clientId: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("No autorizado", { status: 401 });
    const client = await ClientService.getClientById(params.clientId);
    return NextResponse.json({ success: true, data: client });
};

export const PATCH_BY_ID = async (req: Request, { params }: { params: { agencyId: string; clientId: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("No autorizado", { status: 401 });
    const updated = await ClientService.updateClient(params.clientId, await req.json());
    return NextResponse.json({ success: true, data: updated });
};

export const DELETE_BY_ID = async (req: Request, { params }: { params: { agencyId: string; clientId: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("No autorizado", { status: 401 });
    await ClientService.deleteClient(params.clientId);
    return NextResponse.json({ success: true });
};

// Cambiar estado de cliente
export const PATCH_STATUS = async (req: Request, { params }: { params: { agencyId: string; clientId: string } }) => {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("No autorizado", { status: 401 });
    const { status } = await req.json();
    if (!status || !Object.values(ClientStatus).includes(status)) return new NextResponse("Estado inválido", { status: 400 });
    const result = await ClientService.changeClientStatus(params.clientId, status);
    return NextResponse.json({ success: true, data: result });
};

// Obtener subcuentas
export const GET_SUBACCOUNTS = async (req: NextRequest, { params }: { params: { agencyId: string } }) => {
    const { agencyId } = params;
    const user = await getAuthUserDetails(); if (!user) return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
    const has = user.Agency?.id === agencyId || user.Agency?.some((a: any) => a.id === agencyId);
    if (!has) return NextResponse.json({ success: false, error: 'Sin acceso' }, { status: 403 });
    const subs = await db.subAccount.findMany({ where: { agencyId }, select: { id: true, name: true, companyEmail: true, companyPhone: true, address: true, city: true, state: true, country: true, zipCode: true, subAccountLogo: true } });
    return NextResponse.json({ success: true, data: subs });
};

// Categorías de productos
export const GET_CATEGORIES = async (req: Request, { params }: { params: { agencyId: string } }) => {
    const user = await getAuthUserDetails(); if (!user) return new NextResponse('No autorizado', { status: 401 });
    const { agencyId } = params;
    const cats = await db.productCategory.findMany({ where: { agencyId }, orderBy: { name: 'asc' } });
    return NextResponse.json({ success: true, data: cats });
};

export const POST_CATEGORY = async (req: Request, { params }: { params: { agencyId: string } }) => {
    const { name, subaccountId, subAccountId } = await req.json();
    const user = await getAuthUserDetails(); if (!user) return new NextResponse('No autorizado', { status: 401 });
    const final = subAccountId || subaccountId;
    const exist = await db.productCategory.findFirst({ where: { name, agencyId: params.agencyId, subAccountId: final || undefined } });
    if (exist) return NextResponse.json({ success: false, error: 'Ya existe' }, { status: 400 });
    const nw = await db.productCategory.create({ data: { name, agencyId: params.agencyId, subAccountId: final || undefined } });
    return NextResponse.json({ success: true, data: nw });
};

// Inventory endpoints
async function hasAgencyAccess(a: string) { const u = await getAuthUserDetails(); return !!u && (u.Agency?.id === a); }

export const GET_INVENTORY = async (req: NextRequest, { params }: { params: { agencyId: string } }) => {
    const ag = params.agencyId;
    if (!await hasAgencyAccess(ag)) return NextResponse.json({ success: false, error: 'Sin acceso' }, { status: 403 });
    const sp = new URL(req.url).searchParams;
    const type = sp.get('type'); const categoryId = sp.get('categoryId'); const search = sp.get('search'); const areaId = sp.get('areaId');
    let data;
    switch (type) {
        case 'products': data = await ProductService.getProducts(ag, { categoryId, search, areaId }); break;
        case 'areas': data = await AreaService.getAreas(ag); break;
        case 'providers': data = await ProviderService.getProviders(ag); break;
        case 'stock': data = await StockService.getStocks(ag); break;
        case 'movements': data = await MovementService.getMovements(ag); break;
        case 'categories': data = await CategoryService.getCategories(ag); break;
        default: return NextResponse.json({ success: false, error: 'Tipo inválido' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data });
};

export const POST_INVENTORY = async (req: NextRequest, { params }: { params: { agencyId: string } }) => {
    const ag = params.agencyId; if (!await hasAgencyAccess(ag)) return NextResponse.json({ success: false, error: 'Sin acceso' }, { status: 403 });
    const { type, data } = await req.json(); const d = { ...data, agencyId: ag }; let res;
    switch (type) {
        case 'product': res = await ProductService.createProduct(d); break;
        case 'area': res = await AreaService.createArea(d); break;
        case 'provider': res = await ProviderService.createProvider(d); break;
        case 'movement': res = await MovementService.createMovement(d); await StockService.updateStock({ agencyId: ag, productId: d.productId, areaId: d.areaId, quantity: d.type === 'entrada' ? d.quantity : -d.quantity }); break;
        default: return NextResponse.json({ success: false, error: 'Tipo inválido' }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: res });
};

export const PUT_INVENTORY = async (req: NextRequest, { params }: { params: { agencyId: string } }) => {
    const ag = params.agencyId; if (!await hasAgencyAccess(ag)) return NextResponse.json({ success: false, error: 'Sin acceso' }, { status: 403 });
    const { type, id, data } = await req.json(); if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    let existing;
    switch (type) {
        case 'product': existing = await ProductService.getProductById(ag, id); break;
        case 'area': existing = await AreaService.getAreaById(ag, id); break;
        case 'provider': existing = await ProviderService.getProviderById(ag, id); break;
        default: return NextResponse.json({ success: false, error: 'Tipo inválido' }, { status: 400 });
    }
    if (!existing || existing.agencyId !== ag) return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    let r;
    switch (type) {
        case 'product': r = await ProductService.updateProduct(id, data); break;
        case 'area': r = await AreaService.updateArea(id, data); break;
        case 'provider': r = await ProviderService.updateProvider(id, data); break;
    }
    return NextResponse.json({ success: true, data: r });
};

export const DELETE_INVENTORY = async (req: NextRequest, { params }: { params: { agencyId: string } }) => {
    const ag = params.agencyId; if (!await hasAgencyAccess(ag)) return NextResponse.json({ success: false, error: 'Sin acceso' }, { status: 403 });
    const sp = new URL(req.url).searchParams; const type = sp.get('type'); const id = sp.get('id'); if (!id) return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    let existing;
    switch (type) {
        case 'product': existing = await ProductService.getProductById(ag, id); break;
        case 'area': existing = await AreaService.getAreaById(ag, id); break;
        case 'provider': existing = await ProviderService.getProviderById(ag, id); break;
        default: return NextResponse.json({ success: false, error: 'Tipo inválido' }, { status: 400 });
    }
    if (!existing || existing.agencyId !== ag) return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });
    let r;
    switch (type) {
        case 'product': r = await ProductService.deleteProduct(id); break;
        case 'area': r = await AreaService.deleteArea(id); break;
        case 'provider': r = await ProviderService.deleteProvider(id); break;
    }
    return NextResponse.json({ success: true, data: r });
};
