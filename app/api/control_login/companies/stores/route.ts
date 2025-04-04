import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const GET = async (
    req: Request,
    { params }: { params: { companyId?: string } } = { params: {} }
) => {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const companiesCollection = db.collection("companies");
        const storesCollection = db.collection("stores");

        // Si se proporciona un companyId, devolver solo las tiendas de esa empresa
        if (params && params.companyId) {
            const stores = await storesCollection.find({
                companyId: new ObjectId(params.companyId)
            }).toArray();
            return NextResponse.json(stores);
        }

        // Primero obtenemos las empresas asociadas al usuario
        const userCompanies = await db.collection("users_companies").find({
            userId: userId
        }).toArray();

        // También incluimos las empresas creadas por el usuario
        const companies = await companiesCollection.find({
            $or: [
                { _id: { $in: userCompanies.map(uc => new ObjectId(uc.companyId)) } },
                { createdBy: userId },
                { clerkUserId: userId }
            ]
        }).toArray();

        // Para cada empresa, obtenemos sus tiendas
        const companiesWithStores = await Promise.all(companies.map(async (company) => {
            const stores = await storesCollection.find({
                companyId: new ObjectId(company._id.toString())
            }).toArray();
            return {
                ...company,
                stores: stores
            };
        }));

        return NextResponse.json(companiesWithStores);
    } catch (error) {
        console.error(`STORES_GET: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};