import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { normalizeCompanyId } from '@/app/services/(endPoints)/companiesService';

export const GET = async (
    req: Request,
    { params }: { params: { companyId: string } }
) => {
    try {
        const { userId } = await auth();
        const { companyId } = await params;

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const storesCollection = db.collection("stores");

        if (!/^[0-9a-fA-F]{24}$/.test(companyId)) {
            return NextResponse.json(
                { error: 'Formato de ID de empresa inválido' },
                { status: 400 }
            );
        }

        const stores = await storesCollection.find({
            companyId: new ObjectId(normalizeCompanyId(companyId))
        }).toArray();

        return NextResponse.json(stores, { status: 200 });
    } catch (error) {
        console.error(`STORES_GET: ${error}`);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};