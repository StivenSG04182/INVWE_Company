import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getMongoDB, validateCompany, normalizeCompanyId } from '@/app/services/(endPoints)/companiesService';
export const runtime = 'nodejs';
export async function GET(request: Request) {
    const startTime = performance.now();
    console.time("[API/Companies] Tiempo de ejecución");
    try {
        // Autenticación usando Clerk
        const { userId, sessionClaims } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ isValid: false, error: 'Unauthorized' }, { status: 401 });
        }
        // Verificar rol ADMIN desde Clerk
        const isAdmin = sessionClaims?.publicMetadata?.role === 'ADMIN';
        if (isAdmin) {
            console.log(JSON.stringify(user, null, 2));
            return NextResponse.json({ isValid: true, isAdmin: true, redirectUrl: '/admin' });
        }
        // Conectar a la BD de MongoDB (una sola vez)
        const db = await getMongoDB();
        // Buscar si el usuario es creador de alguna empresa
        const ownedCompany = await db.collection("companies").findOne({
            $or: [
                { clerkUserId: userId },
                { createdBy: userId }
            ]
        });
        if (ownedCompany) {
            const companyData = ownedCompany.name
                ? { name: ownedCompany.name, _id: ownedCompany._id }
                : await validateCompany(ownedCompany, undefined);
            if (!companyData) {
                return NextResponse.json({ isValid: false, error: "Company name not found" });
            }
            return NextResponse.json({ isValid: true, data: { company: companyData } });
        }
        // Si no es creador, buscar asociación en MongoDB
        const userCompany = await db.collection("users_companies").findOne({ userId });
        if (!userCompany) {
            return NextResponse.json({ isValid: false, error: "No inventory associated" });
        }
        // Validar estado de la asociación
        if (userCompany.status === 'pending') {
            return NextResponse.json({
                isValid: false,
                error: "Your association with this company is pending approval"
            });
        }
        // Obtener empresa asociada en MongoDB
        if (!/^[0-9a-fA-F]{24}$/.test(userCompany.companyId)) {
            return NextResponse.json(
                { error: 'Formato de ID de empresa inválido' },
                { status: 400 }
            );
        }

        const associatedCompany = await db.collection("companies").findOne({
            _id: normalizeCompanyId(userCompany.companyId)
        });
        if (!associatedCompany) {
            return NextResponse.json({ isValid: false, error: "Associated company not found" });
        }
        const companyData = await validateCompany(associatedCompany, undefined);
        if (!companyData) {
            return NextResponse.json({ isValid: false, error: "Company name not found" });
        }
        return NextResponse.json({ isValid: true, data: { company: companyData } });
    } catch (error: any) {
        console.error("[API/Companies] Error:", error);
        return NextResponse.json({ isValid: false, error: error.message || "Error validating inventory" }, { status: 500 });
    } finally {
        const endTime = performance.now();
        console.log(`[API/Companies] Tiempo de ejecución: ${(endTime - startTime).toFixed(2)} ms`);
        console.timeEnd("[API/Companies] Tiempo de ejecución");
    }
}