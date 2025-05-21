import { NextResponse } from "next/server";
import { paypal } from "@/lib/paypal";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { subscriptionId, agencyId } = await req.json();

    if (!subscriptionId || !agencyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Obtener la agencia
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      include: { Subscription: true },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      );
    }

    // Capturar la suscripción en PayPal
    const captureResult = await paypal.captureSubscription(subscriptionId);

    // Actualizar la suscripción en la base de datos
    if (agency.Subscription) {
      await db.subscription.update({
        where: { id: agency.Subscription.id },
        data: {
          active: true,
          currentPeriodEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        },
      });
    }

    return NextResponse.json({
      success: true,
      captureResult,
    });
  } catch (error) {
    console.error("Error capturing subscription:", error);
    return NextResponse.json(
      { error: "Failed to capture subscription" },
      { status: 500 }
    );
  }
} 