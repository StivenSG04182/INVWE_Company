import { NextResponse } from "next/server";
import { paypal } from "@/lib/paypal";
import { db } from "@/lib/db";
import { pricingCards } from "@/lib/constants";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get("planId");
    const agencyId = searchParams.get("agencyId");

    if (!planId || !agencyId) {
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

    // Obtener el plan seleccionado
    const selectedPlan = pricingCards.find(plan => plan.priceId === planId);
    
    if (!selectedPlan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    // Si es el plan personalizado, redirigir a una página de contacto
    if (planId === "P-3") {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/agency/${agencyId}/contact?plan=custom`);
    }

    // Si es el plan gratuito, crear una suscripción gratuita
    if (planId === "P-0") {
      // Actualizar o crear la suscripción en la base de datos
      await db.subscription.upsert({
        where: { agencyId },
        create: {
          agencyId,
          priceId: planId,
          price: selectedPlan.price,
          active: true,
          customerId: agency.customerId || agencyId,
          subscritiptionId: `free-${agencyId}`,
          currentPeriodEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        },
        update: {
          priceId: planId,
          price: selectedPlan.price,
          active: true,
          currentPeriodEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        },
      });

      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/agency/${agencyId}/pricing?success=true`);
    }

    // Crear la suscripción en PayPal
    const subscription = await paypal.createSubscription(planId, agencyId);

    // Guardar la suscripción en la base de datos
    await db.subscription.upsert({
      where: { agencyId },
      create: {
        agencyId,
        priceId: planId,
        price: selectedPlan.price,
        active: false, // Se activará cuando se capture el pago
        customerId: agency.customerId || agencyId,
        subscritiptionId: subscription.id,
        currentPeriodEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      },
      update: {
        priceId: planId,
        price: selectedPlan.price,
        active: false, // Se activará cuando se capture el pago
        subscritiptionId: subscription.id,
        currentPeriodEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      },
    });

    // Redirigir al usuario a la página de pago de PayPal
    return NextResponse.redirect(subscription.links.find(link => link.rel === "approve")?.href || `${process.env.NEXT_PUBLIC_URL}/agency/${agencyId}/pricing?error=payment_failed`);
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
} 