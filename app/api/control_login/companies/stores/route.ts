import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const GET = async (
    req: Request,
    { params }: { params: { companyId: string } }
) => {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const storesCollection = db.collection("stores");

        const stores = await storesCollection.find({
            companyId: new ObjectId(params.companyId)
        }).toArray();

        return NextResponse.json(stores);
    } catch (error) {
        console.error(`STORES_GET: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};