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

        let settings;
        if (category === "all") {
            settings = await prismadb.userSettings.findFirst({
                where: {
                    userId,
                },
                include: {
                    notifications: true,
                    templates: true,
                    themes: true,
                },
            });
        } else {
            settings = await prismadb.userSettings.findFirst({
                where: {
                    userId,
                },
                select: {
                    [category]: true,
                },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.log("[SETTINGS_GET]", error);
        return new NextResponse("Error interno del servidor", { status: 500 });
    }
} */