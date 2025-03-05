import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    console.log('Endpoint /api/enterprise llamado');
    try {
        const body = await req.json();

        const requiredFields = [
            'companyName',
            'firstName',
            'lastName',
            'email'
        ];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `El campo ${field} es requerido` },
                    { status: 400 }
                );
            }
        }

        const { data, error } = await supabase
            .from('public.enterprise')
            .insert([
                {
                    name_company: body.companyName,
                    name: body.firstName,
                    last_name: body.lastName,
                    email: body.email,
                    company_size: body.companySize ? parseInt(body.companySize) : 0,
                    phone: body.phoneNumber || '',
                    how_did_you_hear: body.referralSource || '',
                    message: body.additionalDetails || ''
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error inserting data:', error);
            return NextResponse.json({ error: 'Error al guardar los datos' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}