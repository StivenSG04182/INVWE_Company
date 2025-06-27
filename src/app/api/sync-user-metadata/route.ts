import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { getAuthUserDetails } from "@/lib/queries";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 });
    }

    const userDetails = await getAuthUserDetails();
    if (!userDetails) {
      return NextResponse.json({ error: "Usuario no encontrado en la base de datos" }, { status: 404 });
    }

    // Sincronizar metadatos de Clerk con la base de datos
    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        role: userDetails.role || "SUBACCOUNT_USER",
      },
    });

    // Verificar que se actualizó correctamente
    const updatedUser = await currentUser();

    return NextResponse.json({
      success: true,
      message: "Metadatos sincronizados correctamente",
      before: {
        clerkRole: user.privateMetadata.role,
        dbRole: userDetails.role,
      },
      after: {
        clerkRole: updatedUser?.privateMetadata.role,
        dbRole: userDetails.role,
      },
      userDetails: {
        id: userDetails.id,
        email: userDetails.email,
        role: userDetails.role,
        agencyId: userDetails.agencyId,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}