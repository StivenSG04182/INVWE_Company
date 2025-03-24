import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // Obtener todas las empresas
        const companies = await db.collection("companies")
            .find({
                $or: [
                    { status: 'active' },
                    { status: { $exists: false } }
                ]
            })
            .project({ _id: 1, name: 1, 'values.nombreEmpresa': 1 })
            .toArray();

        // Transformar los datos para asegurar que cada empresa tenga un nombre
        const formattedCompanies = companies.map(company => ({
            _id: company._id.toString(),
            name: company.name || company.values?.nombreEmpresa || 'Empresa sin nombre'
        }));

        return NextResponse.json(formattedCompanies);
    } catch (error: any) {
        console.error("Error fetching companies:", error);
        return NextResponse.json(
            { error: error.message || "Error fetching companies" },
            { status: 500 }
        );
    }
}