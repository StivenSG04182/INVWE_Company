import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const POST = async (req: Request) => {
    try {
        const { userId } = await auth();
        const body = await req.json();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { name } = body;

        if (!name) {
            return new NextResponse("Store name is missing", { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const storesCollection = db.collection("stores");

        const result = await storesCollection.insertOne({
            _id: new ObjectId(),
            name,
            userId,
            companyId: new ObjectId(body.companyId),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        if (!result.insertedId) {
            return new NextResponse("Error inserting data", { status: 500 });
        }

        return NextResponse.json({ storeId: result.insertedId }, { status: 201 });
    } catch (error) {
        console.error(`STORES_POST: ${error}`);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
