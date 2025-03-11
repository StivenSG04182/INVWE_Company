import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    try {
        // Get userId from Clerk authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ isValid: false, error: 'Unauthorized' }, { status: 401 });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        // First check if user is a creator of any company
        const ownedCompany = await db.collection("companies").findOne({
            $or: [
                { clerkUserId: userId },
                { createdBy: userId }
            ]
        });

        if (ownedCompany) {
            return NextResponse.json({
                isValid: true,
                data: { company: ownedCompany }
            });
        }

        // If not a creator, check if user is associated with any company
        const userCompany = await db.collection("users_companies").findOne({ userId });
        
        if (!userCompany) {
            return NextResponse.json({ isValid: false, error: "No inventory associated" });
        }

        // Get the associated company details
        const associatedCompany = await db.collection("companies").findOne({
            _id: typeof userCompany.companyId === 'string' ? 
                new ObjectId(userCompany.companyId) : 
                userCompany.companyId
        });

        if (!associatedCompany) {
            return NextResponse.json({ isValid: false, error: "Associated company not found" });
        }

        // Check if the user's association is approved
        if (userCompany.status === 'pending') {
            return NextResponse.json({
                isValid: false,
                error: "Your association with this company is pending approval"
            });
        }

        return NextResponse.json({
            isValid: true,
            data: { company: associatedCompany }
        });

    } catch (error: any) {
        console.error("Error validating inventory:", error);
        return NextResponse.json({
            isValid: false,
            error: error.message || "Error validating inventory"
        }, { status: 500 });
    }
}
