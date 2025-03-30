import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getMongoDB, validateCompany, normalizeCompanyId } from '@/app/services/(endPoints)/companiesService';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    const startTime = performance.now();
    console.time("[API/Companies] Tiempo de ejecución");
    try {
        // 1. Autenticación con Clerk
        const { userId, sessionClaims } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ isValid: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Validar si el usuario es administrador organizacional
        console.log("org_role:", sessionClaims.org_role);
        if (sessionClaims.org_role === 'org:admin') {
            console.log("Usuario es org admin");
            return NextResponse.json({ isValid: true, data: { role: 'admin' } });
        }

        // 3. Conectar a la base de datos
        const db = await getMongoDB();

        // 4. Buscar si el usuario es creador de alguna empresa
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
            return NextResponse.json({ isValid: true, data: { role: 'inventory', company: companyData } });
        }

        // 5. Si no es creador, buscar asociación en MongoDB
        const userCompany = await db.collection("users_companies").findOne({ userId });
        if (!userCompany) {
            return NextResponse.json({ isValid: false, error: "No inventory associated" });
        }

        // 6. Validar estado de la asociación
        if (userCompany.status === 'pending') {
            return NextResponse.json({
                isValid: false,
                error: "Your association with this company is pending approval"
            });
        }
<<<<<<< Updated upstream
        // Obtener empresa asociada en MongoDB
=======

        // 7. Validar el formato del ID de empresa
        if (!/^[0-9a-fA-F]{24}$/.test(userCompany.companyId)) {
            return NextResponse.json(
                { error: 'Formato de ID de empresa inválido' },
                { status: 400 }
            );
        }

        // 8. Obtener empresa asociada en MongoDB
>>>>>>> Stashed changes
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

    } catch (error: Error | unknown) {
        console.error("[API/Companies] Error:", error);
        return NextResponse.json({
            isValid: false,
            error: error instanceof Error ? error.message : "Error validating inventory"
        }, { status: 500 });
    } finally {
        const endTime = performance.now();
        console.log(`[API/Companies] Tiempo de ejecución: ${(endTime - startTime).toFixed(2)} ms`);
        console.timeEnd("[API/Companies] Tiempo de ejecución");
    }
}

