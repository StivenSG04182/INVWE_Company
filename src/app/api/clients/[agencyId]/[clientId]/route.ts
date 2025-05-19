import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ClientService } from "@/lib/services/client-service";
import { ClientStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/clients/[agencyId]/[clientId]
export async function GET(req: Request, { params }: { params: { agencyId: string; clientId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("No autorizado", { status: 401 });
        }

        const response = await ClientService.getClientById(params.clientId);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error en GET /api/clients/[agencyId]/[clientId]:", error);
        return new NextResponse("Error interno del servidor", { status: 500 });
    }
}

// PATCH /api/clients/[agencyId]/[clientId]
export async function PATCH(req: Request, { params }: { params: { agencyId: string; clientId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("No autorizado", { status: 401 });
        }

        const body = await req.json();
        const response = await ClientService.updateClient(params.clientId, body);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error en PATCH /api/clients/[agencyId]/[clientId]:", error);
        return new NextResponse("Error interno del servidor", { status: 500 });
    }
}

// DELETE /api/clients/[agencyId]/[clientId]
export async function DELETE(req: Request, { params }: { params: { agencyId: string; clientId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("No autorizado", { status: 401 });
        }

        const response = await ClientService.deleteClient(params.clientId);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error en DELETE /api/clients/[agencyId]/[clientId]:", error);
        return new NextResponse("Error interno del servidor", { status: 500 });
    }
}