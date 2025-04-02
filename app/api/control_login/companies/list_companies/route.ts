import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // Obtener todas las empresas activas o sin definir status
        const companies = await db.collection("companies")
            .find({
                $or: [
                    { status: 'active' },
                    { status: { $exists: false } }
                ]
            })
            .project({ _id: 1, name: 1, 'values.nombreEmpresa': 1 })
            .toArray();

        const formattedCompanies = companies.map(company => ({
            _id: company._id.toString(),
            name: company.name || company.values?.nombreEmpresa || 'Empresa sin nombre'
        }));

        return NextResponse.json({ companies: formattedCompanies });
    } catch (error: unknown) {
        console.error("Error fetching data:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error fetching data" },
            { status: 500 }
        );
    }
}
