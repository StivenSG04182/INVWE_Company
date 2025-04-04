import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
    try {
        const { userId } = auth();

        if (!userId) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const { functionality, mode } = body;

        if (!functionality) {
            return NextResponse.json(
                { error: "Datos de funcionalidad no proporcionados" },
                { status: 400 }
            );
        }

        // Validar campos requeridos
        if (!functionality.nombre || !functionality.descripcion || !functionality.categoria) {
            return NextResponse.json(
                { error: "Faltan campos requeridos" },
                { status: 400 }
            );
        }

        let result;

        if (mode === 'add') {
            // Insertar nueva funcionalidad
            const { data, error } = await supabase
                .from('functionalities')
                .insert([
                    {
                        id: functionality.id,
                        nombre: functionality.nombre,
                        descripcion: functionality.descripcion,
                        categoria: functionality.categoria,
                        creadorId: userId,
                        votos: 0,
                        progreso: 0,
                        tareas: functionality.tareas || []
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error("[FUNCTIONALITY_CREATE]", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            result = data;
        } else if (mode === 'edit') {
            // Verificar si el usuario es el creador (excepto para votos)
            if (functionality.creadorId !== userId && !('votos' in body)) {
                return NextResponse.json(
                    { error: "No autorizado para editar esta funcionalidad" },
                    { status: 403 }
                );
            }

            // Actualizar funcionalidad existente
            const { data, error } = await supabase
                .from('functionalities')
                .update({
                    nombre: functionality.nombre,
                    descripcion: functionality.descripcion,
                    categoria: functionality.categoria,
                    votos: functionality.votos,
                    progreso: functionality.progreso,
                    tareas: functionality.tareas
                })
                .eq('id', functionality.id)
                .select()
                .single();

            if (error) {
                console.error("[FUNCTIONALITY_UPDATE]", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            result = data;
        } else {
            return NextResponse.json(
                { error: "Modo no válido" },
                { status: 400 }
            );
        }

        return NextResponse.json({ functionality: result || functionality });
    } catch (error) {
        console.error("[FUNCTIONALITY_WRITE]", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}