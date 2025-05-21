import { NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const inventoryId = searchParams.get('inventoryId');

    if (!orgId || !inventoryId) {
        return NextResponse.json({ valid: false }, { status: 400 });
    }

    try {
        const { db } = await connectToMongoDB();
        const inventory = await db.collection('companies').findOne({
            _id: inventoryId,
            organizationId: orgId
        });

        return NextResponse.json({ valid: !!inventory });
    } catch (error) {
        console.error('[API Validate Inventory] Error:', error);
        return NextResponse.json(
            { valid: false, error: 'Error de servidor' },
            { status: 500 }
        );
    }
}