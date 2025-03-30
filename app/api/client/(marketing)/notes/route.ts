import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

// Inicializando el cliente de Prisma para la base de datos principal
const prismadb = new PrismaClient();

// GET all notes
export async function GET() {
    try {
        const notes = await prismadb.note.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error('[NOTES_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

// POST create a new note
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { title, content, imageUrl } = body;

        if (!title) {
            return new NextResponse("Title is required", { status: 400 });
        }

        if (!content) {
            return new NextResponse("Content is required", { status: 400 });
        }

        const note = await prismadb.note.create({
            data: {
                title,
                content,
                imageUrl
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error('[NOTES_POST]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}