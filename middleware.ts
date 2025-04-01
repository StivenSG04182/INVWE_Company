import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    "/",
    "/enterprise",
    "/nots",
    "/about",
    "/notes",
    "/blog",
    "/contact",
    "/faq",
    "/features",
    "/pricing",
    "/privacy",
    "/service",
    "/terms",
    "/sign-in(.*)",
    "/sign-up(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
    console.log("[Middleware] Request URL:", request.url);

    // Evitar ejecutar la lógica en ciertas rutas
    if (request.nextUrl.pathname.startsWith('/api/control_login')) {
        return NextResponse.next();
    }

    // Leer la cookie de consentimiento
    const cookieConsent = request.cookies.get('invwe-cookie-consent')?.value;
    console.log("[Middleware] Consentimiento de cookies:", cookieConsent);
 
    if (cookieConsent !== 'accepted') {
        console.log("[Middleware] Cookies no aceptadas, omitiendo configuración adicional.");
        return NextResponse.next();
    }

    // Si el usuario no está autenticado y es una ruta pública, permitir acceso
    if (!auth.userId) {
        if (isPublicRoute(request)) {
            console.log("[Middleware] Ruta pública sin autenticación, permitiendo acceso");
            return NextResponse.next();
        }
        await auth.protect();
        return NextResponse.next();
    }
 
    // realizar redirecciones basadas en la asociación del usuario
    try {
        const res = await fetch(new URL("/api/control_login/companies", request.url), {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("[Middleware] Error al obtener datos del usuario:", res.statusText);
            return NextResponse.next();
        }

        const data = await res.json();
        if (data.isValid) {
            let redirectUrl = "/";
            if (data.data?.role === "admin") {
                redirectUrl = "/admin/dashboard_admin";
            } else if (data.data?.role === "inventory" && data.data?.company?.name) {
                redirectUrl = `/inventory/${encodeURIComponent(data.data.company.name)}/dashboard`;
            }
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        } else {
            console.error("[Middleware] Usuario no asociado a ningún inventario:", data.error);
        }
    } catch (error) {
        console.error("[Middleware] Error en checkUserAssociation:", error);
    }

    return NextResponse.next();
});



export const config = {
    matcher: [
        '/((?!_next|trpc|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
    ],
};
