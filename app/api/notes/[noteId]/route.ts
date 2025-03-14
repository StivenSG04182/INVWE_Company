import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// GET a single note
export async function GET(
    req: NextRequest,
    { params }: { params: { noteId: string } }
) {
    try {
        if (!params.noteId) {
            return new NextResponse("Note ID is required", { status: 400 });
        }

        const note = await prismadb.note.findUnique({
            where: {
                id: params.noteId
            }
        });

        if (!note) {
            return new NextResponse("Note not found", { status: 404 });
        }

        return NextResponse.json(note);
    } catch (error) {
        console.error('[NOTE_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

// PATCH update a note
export async function PATCH(
    req: NextRequest,
    { params }: { params: { noteId: string } }
) {
    try {
        const body = await req.json();

        const { title, content, imageUrl } = body;

        if (!params.noteId) {
            return new NextResponse("Note ID is required", { status: 400 });
        }

        if (!title) {
            return new NextResponse("Title is required", { status: 400 });
        }

        if (!content) {
            return new NextResponse("Content is required", { status: 400 });
        }

        const note = await prismadb.note.update({
            where: {
                id: params.noteId
            },
            data: {
                title,
                content,
                imageUrl
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error('[NOTE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

// DELETE a note
export async function DELETE(
    req: NextRequest,
    { params }: { params: { noteId: string } }
) {
    try {
        if (!params.noteId) {
            return new NextResponse("Note ID is required", { status: 400 });
        }

        const note = await prismadb.note.delete({
            where: {
                id: params.noteId
            }
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error('[NOTE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}