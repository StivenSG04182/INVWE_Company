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

    // Obtener todas las empresas activas o sin status definido
    const companies = await db
      .collection("companies")
      .find({
        $or: [{ status: 'active' }, { status: { $exists: false } }]
      })
      .project({ _id: 1, name: 1, 'values.nombreEmpresa': 1 })
      .toArray();

    // Formatear las empresas: convertir _id a string y asignar un nombre si no existe
    const formattedCompanies = companies.map(company => ({
      _id: company._id.toString(),
      name: company.name || company.values?.nombreEmpresa || 'Empresa sin nombre'
    }));

    const companyIds = companies.map(company => company._id.toString());

    const rawStores = await db
      .collection("stores")
      .find({ companyId: { $in: companyIds } })
      .toArray();

    const formattedStores = rawStores.map(store => ({
      ...store,
      _id: store._id.toString(),
      companyId: store.companyId.toString()
    }));

    const companiesWithStores = formattedCompanies.map(company => ({
      ...company,
      stores: formattedStores.filter(store => store.companyId === company._id)
    }));

    return NextResponse.json(companiesWithStores);
  } catch (error: any) {
    console.error("Error fetching companies and stores:", error);
    return NextResponse.json(
      { error: error.message || "Error fetching companies and stores" },
      { status: 500 }
    );
  }
}
