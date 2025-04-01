/* import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    { params }: { params: { category: string } }
) {
    try {
        const { userId } = auth();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");

        if (!userId) {
            return new NextResponse("No autorizado", { status: 401 });
        }

        let notifications;
        if (category === "all") {
            notifications = await prismadb.notification.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        } else {
            notifications = await prismadb.notification.findMany({
                where: {
                    userId,
                    category,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }

        return NextResponse.json({ notifications });
    } catch (error) {
        console.log("[NOTIFICATIONS_GET]", error);
        return new NextResponse("Error interno del servidor", { status: 500 });
    }
} */