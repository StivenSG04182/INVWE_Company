import { supabase } from "./lib/supabase";
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    "/",
    "/enterprise",
    "/nots",
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
])

export default clerkMiddleware(async (auth, request) => {
    if (auth.userId) {
        const userId = auth.userId;
        let userCompanyData = null;
        let error = null;

        try {
            // First check if the table exists
            const { data: tables } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_name', 'users_companies')
                .single()

            if (tables) {
                const response = await supabase
                    .from("users_companies")
                    .select(`
                        id,
                        company_id,
                        role,
                        nombres_apellidos,
                        correo_electronico,
                        is_default_inventory,
                        empresas (id, nombre, nit, direccion, telefono, correo)
                    `)
                    .eq("user_id", userId)
                    .eq("is_default_inventory", true)
                    .single()
                
                userCompanyData = response.data
                error = response.error
            }
        } catch (e) {
            error = e
            console.error('Error checking users_companies table:', e)
        }

        // Si ocurre un error o el usuario no tiene empresa asociada, redirigir a selección de empresa
        if (error || !userCompanyData) {
            if (!request.nextUrl.pathname.startsWith("/select-company")) {
                return NextResponse.redirect(new URL("/select-company", request.url))
            }
            return NextResponse.next()
        }

        // Si el usuario YA tiene empresa, construir la URL de su dashboard
        const companyNameEncoded = encodeURIComponent(userCompanyData.companies.name)
        const dashboardUrl = `/inventory/${companyNameEncoded}/dashboard`
        if (!request.nextUrl.pathname.startsWith(`/inventory/${companyNameEncoded}`)) {
            return NextResponse.redirect(new URL(dashboardUrl, request.url))
        }

        return NextResponse.next()
    } else {
        // Si el usuario no está autenticado:
        // Permitir el acceso a rutas públicas
        if (isPublicRoute(request)) {
            return NextResponse.next()
        }
        // Para rutas privadas, proteger con Clerk
        await auth.protect()
        return NextResponse.next()
    }
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}
