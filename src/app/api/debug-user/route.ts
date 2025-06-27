import { currentUser } from "@clerk/nextjs/server";
import { getAuthUserDetails } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    const userDetails = await getAuthUserDetails();

    return NextResponse.json({
      clerkUser: {
        id: user?.id,
        email: user?.emailAddresses[0]?.emailAddress,
        privateMetadata: user?.privateMetadata,
        publicMetadata: user?.publicMetadata,
      },
      dbUser: {
        id: userDetails?.id,
        email: userDetails?.email,
        role: userDetails?.role,
        agencyId: userDetails?.agencyId,
        agency: userDetails?.Agency ? {
          id: userDetails.Agency.id,
          name: userDetails.Agency.name,
        } : null,
      },
      comparison: {
        rolesMatch: user?.privateMetadata.role === userDetails?.role,
        hasAgency: !!userDetails?.Agency,
        isAgencyOwner: user?.privateMetadata.role === 'AGENCY_OWNER',
        isAgencyAdmin: user?.privateMetadata.role === 'AGENCY_ADMIN',
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}