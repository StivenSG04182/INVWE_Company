import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ClientService } from "@/lib/services/client-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/clients/[agencyId]/stats
export async function GET(req: Request, { params }: { params: { agencyId: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new NextResponse("No autorizado", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const subAccountId = searchParams.get("subAccountId") || undefined;

        const response = await ClientService.getClientStats(params.agencyId, subAccountId);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error en GET /api/clients/[agencyId]/stats:", error);
        return new NextResponse("Error interno del servidor", { status: 500 });
    }
}