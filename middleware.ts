import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';

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

export default clerkMiddleware(async (auth, request: NextRequest) => {
    console.log("[Middleware] Request URL:", request.url);

    // Si la request es para el endpoint, no se aplica la lógica de redirección
    if (request.nextUrl.pathname.startsWith('/api/control_login/companies')) {
        return NextResponse.next();
    }

    // Evitar redirección si ya se está en un dashboard para prevenir bucles
    if (
        request.nextUrl.pathname.startsWith('/admin/dashboard_admin') ||
        request.nextUrl.pathname.startsWith('/inventory/')
    ) {
        return NextResponse.next();
    }

    // Si el usuario no está autenticado y la ruta no es pública, se protege la ruta
    if (!auth.userId) {
        if (isPublicRoute(request)) {
            console.log("[Middleware] Ruta pública sin autenticación, permitiendo acceso");
            return NextResponse.next();
        }
        await auth.protect();
        return NextResponse.next();
    }

    // El usuario está autenticado: llamar al endpoint para validar su asociación
    try {
        const apiUrl = new URL("/api/control_login/companies", request.url);
        const res = await fetch(apiUrl.toString(), {
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
            console.log("[Middleware] Redireccionando a:", redirectUrl);
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        } else {
            console.error("[Middleware] Usuario no asociado a ningún inventario - Redirigiendo a selección:", data.error);
            return NextResponse.redirect(new URL('/Select_inventory', request.url));
        }
    } catch (error) {
        console.error("[Middleware] Error en checkUserAssociation:", error);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next|trpc|select_inventory|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
    ],
};


/* import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';

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

export default clerkMiddleware(async (auth, request: NextRequest) => {
    console.log("[Middleware] Request URL:", request.url);

    // Leer cookies
    const cookies = request.cookies;
    const selectedColor = cookies.get("selectedColor")?.value || "#FFFFFF"; // Color por defecto
    const grainIntensity = cookies.get("grainIntensity")?.value || "1"; // Intensidad por defecto

    // Evitar redirección si ya se está en un dashboard para prevenir bucles
    if (
        request.nextUrl.pathname.startsWith('/admin/dashboard_admin') ||
        request.nextUrl.pathname.startsWith('/inventory/')
    ) {
        return NextResponse.next();
    }

    // Si la request es para el endpoint, no se aplica la lógica de redirección
    if (request.nextUrl.pathname.startsWith('/api/control_login/companies')) {
        return NextResponse.next();
    }

    // Si el usuario no está autenticado y la ruta no es pública, se protege la ruta
    if (!auth.userId) {
        if (isPublicRoute(request)) {
            console.log("[Middleware] Ruta pública sin autenticación, permitiendo acceso");
            return NextResponse.next();
        }
        await auth.protect();
        return NextResponse.next();
    }

    // Validar la asociación del usuario
    try {
        const apiUrl = new URL("/api/control_login/companies", request.url);
        const res = await fetch(apiUrl.toString(), {
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
            console.log("[Middleware] Redireccionando a:", redirectUrl);
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        } else {
            console.error("[Middleware] Usuario no asociado a ningún inventario - Redirigiendo a selección:", data.error);
            return NextResponse.redirect(new URL('/Select_inventory', request.url));
        }
    } catch (error) {
        console.error("[Middleware] Error en checkUserAssociation:", error);
    }

    // Crear la respuesta y establecer cookies
    const response = NextResponse.next();
    response.cookies.set("selectedColor", selectedColor, { path: "/", httpOnly: false });
    response.cookies.set("grainIntensity", grainIntensity, { path: "/", httpOnly: false });

    return response;
});

export const config = {
    matcher: [
        '/((?!_next|trpc|select_inventory|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'
    ],
};
 */