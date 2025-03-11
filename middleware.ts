import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    "/",
    "/enterprise",
    "/about",
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
    if (auth.userId) {
        const userId = auth.userId;
        console.log("Clerk user id:", userId);
        let isAdmin = false;

        try {
            const { publicMetadata } = auth.sessionClaims;
            isAdmin = publicMetadata?.role === 'ADMIN';

            if (isAdmin) {
                if (!request.nextUrl.pathname.startsWith('/admin')) {
                    return NextResponse.redirect(new URL('/admin', request.url));
                }
                return NextResponse.next();
            }

            // Llamada al endpoint de validación en MongoDB
            const validateUrl = new URL(`/api/companies?userId=${userId}`, request.url);
            const res = await fetch(validateUrl.toString());
            const result = await res.json();

            if (!result.isValid) {
                const debugMessage = result.error || "No inventory associated";
                console.log("Error validando inventario en MongoDB:", debugMessage);
                if (!request.nextUrl.pathname.startsWith("/select-company")) {
                    return NextResponse.redirect(new URL(`/select-company?debug=${encodeURIComponent(debugMessage)}`, request.url));
                }
                return NextResponse.next();
            }

            // Redirige al dashboard usando el campo "company_name" del documento en MongoDB
            const companyNameEncoded = encodeURIComponent(result.data.company.company_name);
            const dashboardUrl = `/inventory/${companyNameEncoded}/dashboard`;
            if (!request.nextUrl.pathname.startsWith(`/inventory/${companyNameEncoded}`)) {
                return NextResponse.redirect(new URL(dashboardUrl, request.url));
            }

            return NextResponse.next();
        } catch (e) {
            console.error("Error en middleware:", e);
            return NextResponse.redirect(new URL("/select-company", request.url));
        }
    } else {
        if (isPublicRoute(request)) {
            return NextResponse.next();
        }
        await auth.protect();
        return NextResponse.next();
    }
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
