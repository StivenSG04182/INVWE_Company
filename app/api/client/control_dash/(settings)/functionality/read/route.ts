import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
    try {
        // Obtener las funcionalidades desde Supabase
        const { data: functionalities, error } = await supabase
            .from('functionalities')
            .select('*');

        if (error) {
            console.error("[FUNCTIONALITIES_READ]", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Si no hay funcionalidades en la base de datos, devolver un array vacío
        return NextResponse.json({ functionalities: functionalities || [] });
    } catch (error) {
        console.error("[FUNCTIONALITIES_READ]", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}