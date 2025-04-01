/* import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function POST(
    req: Request
) {
    try {
        const { userId } = auth();
        const body = await req.json();
        const { companyId, plan, limits } = body;

        if (!userId || !companyId) {
            return new NextResponse("No autorizado", { status: 401 });
        }

        if (!plan || !limits) {
            return new NextResponse("Faltan datos requeridos", { status: 400 });
        }

        const company = await prismadb.company.findFirst({
            where: {
                id: companyId,
                userId,
            },
        });

        if (!company) {
            return new NextResponse("Empresa no encontrada", { status: 404 });
        }

        const subscription = await prismadb.subscription.create({
            data: {
                plan,
                companyId,
                workersLimit: limits.workers,
                invoicesLimit: limits.invoices,
                storesLimit: limits.stores,
                status: "active",
            },
        });

        return NextResponse.json({
            companyName: company.name,
            storeId: company.defaultStoreId,
            subscription
        });
    } catch (error) {
        console.log("[SUBSCRIPTION_POST]", error);
        return new NextResponse("Error interno del servidor", { status: 500 });
    }
}

export async function GET(
    req: Request
) {
    try {
        const { userId } = auth();
        const { searchParams } = new URL(req.url);
        const companyId = searchParams.get("companyId");

        if (!userId || !companyId) {
            return new NextResponse("No autorizado", { status: 401 });
        }

        const subscription = await prismadb.subscription.findFirst({
            where: {
                companyId,
                company: {
                    userId,
                },
            },
        });

        return NextResponse.json(subscription);
    } catch (error) {
        console.log("[SUBSCRIPTION_GET]", error);
        return new NextResponse("Error interno del servidor", { status: 500 });
    }
} */