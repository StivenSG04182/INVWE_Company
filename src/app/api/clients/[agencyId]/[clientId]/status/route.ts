import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ClientService } from "@/lib/services/client-service";
import { ClientStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH /api/clients/[agencyId]/[clientId]/status
export async function PATCH(req: Request, { params }: { params: { agencyId: string; clientId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("No autorizado", { status: 401 });
        }

        const body = await req.json();
        const { status } = body;

        if (!status || !Object.values(ClientStatus).includes(status)) {
            return new NextResponse("Estado de cliente inválido", { status: 400 });
        }

        const response = await ClientService.changeClientStatus(params.clientId, status);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error en PATCH /api/clients/[agencyId]/[clientId]/status:", error);
        return new NextResponse("Error interno del servidor", { status: 500 });
    }
}