import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  try {
    const auth = getAuth(request);
    const { userId } = auth;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const companies = await db
      .collection("companies")
      .find({
        $or: [{ status: 'active' }, { status: { $exists: false } }]
      })
      .project({ _id: 1, name: 1, 'values.nombreEmpresa': 1 })
      .toArray();
    const formattedCompanies = companies.map(company => ({
      _id: company._id.toString(),
      name: company.name || company.values?.nombreEmpresa || 'Empresa sin nombre'
    }));
    const companyIds = formattedCompanies.map(company => company._id);
    const rawStores = await db
      .collection("stores")
      .find({ companyId: { $in: companyIds } })
      .project({ _id: 1, companyId: 1, name: 1 })
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
  } catch (error: unknown) {
    console.error("Error fetching companies and stores:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching companies and stores" },
      { status: 500 }
    );
  }
}