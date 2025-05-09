import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserDetails } from '@/lib/queries';

// GET: Obtener subcuentas de una agencia
export async function GET(req: NextRequest, { params }: { params: { agencyId: string } }) {
    try {
        const agencyId = params.agencyId;

        // Verificar acceso del usuario a la agencia
        const user = await getAuthUserDetails();
        if (!user) {
            return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 });
        }

        // Verificar si el usuario tiene acceso a esta agencia
        const hasAccess = user.Agency?.id === agencyId ||
            user.Agency?.some((agency: any) => agency.id === agencyId);

        if (!hasAccess) {
            return NextResponse.json({ success: false, error: 'No tienes acceso a esta agencia' }, { status: 403 });
        }

        // Obtener todas las subcuentas de la agencia
        const subaccounts = await db.subAccount.findMany({
            where: { agencyId },
            select: {
                id: true,
                name: true,
                companyEmail: true,
                companyPhone: true,
                address: true,
                city: true,
                state: true,
                country: true,
                zipCode: true,
                subAccountLogo: true,
            },
        });

        return NextResponse.json({ success: true, data: subaccounts });
    } catch (error: any) {
        console.error('Error al obtener subcuentas:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}