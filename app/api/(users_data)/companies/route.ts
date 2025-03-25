/* import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(request: Request) {
    console.log("[API/Companies] Petición recibida en /api/companies");
    try {
        // Aquí getAuth() funciona porque el middleware de Clerk se aplica (ya no se excluyen las API)
        const { userId, sessionClaims } = getAuth(request);
        console.log("[API/Companies] userId:", userId);
        if (!userId) {
            console.error("[API/Companies] Usuario no autenticado");
            return NextResponse.json({ isValid: false, error: 'Unauthorized' }, { status: 401 });
        }

        const isAdmin = sessionClaims?.publicMetadata?.role === 'ADMIN';
        console.log("[API/Companies] Rol del usuario según Clerk:", sessionClaims?.publicMetadata?.role);

        if (isAdmin) {
            console.log("[API/Companies] Usuario es admin, redirigiendo a /admin");
            return NextResponse.json({
                isValid: true,
                isAdmin: true,
                redirectUrl: '/admin'
            });
        }

        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        console.log("[API/Companies] Conectado a la base de datos:", process.env.MONGODB_DB);

        // Función para validar que el documento de la empresa tenga el campo de nombre
        const validateCompany = (company: any) => {
            if (!company) return null;

            if (company.values && company.values.nombreEmpresa) {
                return { ...company, name: company.values.nombreEmpresa };
            } else if (company.name) {
                return company;
            } else if (company.metadata && company.metadata.supabaseId) {
                return { ...company, name: company.metadata.name || "Empresa" };
            }

            return null;
        };

        // Verificar si el usuario es creador de alguna empresa
        const ownedCompany = await db.collection("companies").findOne({
            $or: [
                { clerkUserId: userId },
                { createdBy: userId }
            ]
        });

        if (ownedCompany) {
            console.log("[API/Companies] Found owned company:", JSON.stringify(ownedCompany, null, 2));
            if (ownedCompany.name) {
                console.log("[API/Companies] La empresa tiene nombre:", ownedCompany.name);
                return NextResponse.json({
                    isValid: true,
                    data: {
                        company: {
                            name: ownedCompany.name,
                            _id: ownedCompany._id
                        }
                    }
                });
            }

            const companyValidated = validateCompany(ownedCompany);
            if (!companyValidated) {
                console.error("[API/Companies] No se pudo validar la empresa, intentando con Supabase");
                if (ownedCompany.metadata && ownedCompany.metadata.supabaseId) {
                    const { data: supabaseCompany } = await supabase
                        .from("companies")
                        .select("name")
                        .eq("id", ownedCompany.metadata.supabaseId)
                        .single();

                    if (supabaseCompany && supabaseCompany.name) {
                        console.log("[API/Companies] Nombre obtenido de Supabase:", supabaseCompany.name);
                        return NextResponse.json({
                            isValid: true,
                            data: { company: { ...ownedCompany, name: supabaseCompany.name } }
                        });
                    }
                }
                return NextResponse.json({ isValid: false, error: "Company name not found" });
            }

            console.log("[API/Companies] Empresa validada:", companyValidated);
            return NextResponse.json({
                isValid: true,
                data: { company: companyValidated }
            });
        }

        // Si el usuario no es creador, buscar asociación en users_companies
        const userCompany = await db.collection("users_companies").findOne({ userId });
        console.log("[API/Companies] Resultado de búsqueda en users_companies:", userCompany);

        if (!userCompany) {
            console.log("[API/Companies] No se encontró asociación en MongoDB, buscando en Supabase");
            const { data: userData } = await supabase
                .from("users")
                .select("id")
                .eq("clerk", userId)
                .single();

            if (userData && userData.id) {
                const { data: userCompanies } = await supabase
                    .from("users_companies")
                    .select("company_id, is_default_inventory")
                    .eq("user_id", userData.id)
                    .order("is_default_inventory", { ascending: false });

                console.log("[API/Companies] Asociaciones encontradas en Supabase:", userCompanies);
                if (userCompanies && userCompanies.length > 0) {
                    const defaultCompany = userCompanies[0];
                    const { data: companyData } = await supabase
                        .from("companies")
                        .select("*")
                        .eq("id", defaultCompany.company_id)
                        .single();

                    if (companyData) {
                        console.log("[API/Companies] Detalles de la empresa obtenidos de Supabase:", companyData);
                        return NextResponse.json({
                            isValid: true,
                            data: { company: { name: companyData.name } }
                        });
                    }
                }
            }

            return NextResponse.json({ isValid: false, error: "No inventory associated" });
        }

        const associatedCompany = await db.collection("companies").findOne({
            _id: typeof userCompany.companyId === 'string'
                ? new ObjectId(userCompany.companyId)
                : userCompany.companyId
        });
        console.log("[API/Companies] Empresa asociada encontrada:", associatedCompany);

        if (!associatedCompany) {
            console.error("[API/Companies] No se encontró la empresa asociada");
            return NextResponse.json({ isValid: false, error: "Associated company not found" });
        }

        if (userCompany.status === 'pending') {
            console.warn("[API/Companies] La asociación del usuario está pendiente de aprobación");
            return NextResponse.json({
                isValid: false,
                error: "Your association with this company is pending approval"
            });
        }

        const companyValidated = validateCompany(associatedCompany);
        if (!companyValidated) {
            console.error("[API/Companies] No se pudo validar la empresa asociada, intentando con Supabase");
            if (associatedCompany.metadata && associatedCompany.metadata.supabaseId) {
                const { data: supabaseCompany } = await supabase
                    .from("companies")
                    .select("name")
                    .eq("id", associatedCompany.metadata.supabaseId)
                    .single();

                if (supabaseCompany && supabaseCompany.name) {
                    console.log("[API/Companies] Nombre obtenido de Supabase:", supabaseCompany.name);
                    return NextResponse.json({
                        isValid: true,
                        data: { company: { ...associatedCompany, name: supabaseCompany.name } }
                    });
                }
            }
            return NextResponse.json({ isValid: false, error: "Company name not found" });
        }

        console.log("[API/Companies] Empresa validada y asociada:", companyValidated);
        return NextResponse.json({
            isValid: true,
            data: { company: companyValidated }
        });

    } catch (error: any) {
        console.error("[API/Companies] Error validando inventario:", error);
        return NextResponse.json({
            isValid: false,
            error: error.message || "Error validating inventory"
        }, { status: 500 });
    }
}
 */

// app/api/companies/route.ts
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { supabase } from '@/lib/supabase';
import { getMongoDB, validateCompany, normalizeCompanyId } from '@/app/services/(endPoints)/companiesService';
import { getUserCompanyFromSupabase } from '@/app/services/(endPoints)/supabaseService';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  console.log("[API/Companies] Petición recibida en /api/companies");
  try {
    // Autenticación usando Clerk
    const { userId, sessionClaims } = getAuth(request);
    console.log("[API/Companies] userId:", userId);
    if (!userId) {
      console.error("[API/Companies] Usuario no autenticado");
      return NextResponse.json({ isValid: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = sessionClaims?.publicMetadata?.role === 'ADMIN';
    console.log("[API/Companies] Rol del usuario:", sessionClaims?.publicMetadata?.role);
    if (isAdmin) {
      return NextResponse.json({ isValid: true, isAdmin: true, redirectUrl: '/admin' });
    }

    // Conectar a la BD de MongoDB
    const db = await getMongoDB();
    console.log("[API/Companies] Conectado a la base de datos:", process.env.MONGODB_DB);

    // Buscar si el usuario es creador de alguna empresa
    const ownedCompany = await db.collection("companies").findOne({
      $or: [
        { clerkUserId: userId },
        { createdBy: userId }
      ]
    });

    if (ownedCompany) {
      console.log("[API/Companies] Empresa propia encontrada:", JSON.stringify(ownedCompany, null, 2));
      let companyData: any;
      if (ownedCompany.name) {
        companyData = { name: ownedCompany.name, _id: ownedCompany._id };
      } else {
        companyData = await validateCompany(ownedCompany, supabase);
      }
      if (!companyData) {
        return NextResponse.json({ isValid: false, error: "Company name not found" });
      }
      return NextResponse.json({ isValid: true, data: { company: companyData } });
    }

    // Si no es creador, buscar asociación en MongoDB
    const userCompany = await db.collection("users_companies").findOne({ userId });
    console.log("[API/Companies] Resultado en users_companies:", userCompany);

    if (!userCompany) {
      // Buscar asociación en Supabase
      const supabaseCompany = await getUserCompanyFromSupabase(userId);
      if (supabaseCompany) {
        return NextResponse.json({ isValid: true, data: { company: { name: supabaseCompany.name } } });
      }
      return NextResponse.json({ isValid: false, error: "No inventory associated" });
    }

    // Obtener empresa asociada en MongoDB
    const associatedCompany = await db.collection("companies").findOne({
      _id: normalizeCompanyId(userCompany.companyId)
    });
    console.log("[API/Companies] Empresa asociada encontrada:", associatedCompany);

    if (!associatedCompany) {
      console.error("[API/Companies] Empresa asociada no encontrada");
      return NextResponse.json({ isValid: false, error: "Associated company not found" });
    }

    if (userCompany.status === 'pending') {
      console.warn("[API/Companies] Asociación pendiente");
      return NextResponse.json({
        isValid: false,
        error: "Your association with this company is pending approval"
      });
    }

    const companyData = await validateCompany(associatedCompany, supabase);
    if (!companyData) {
      return NextResponse.json({ isValid: false, error: "Company name not found" });
    }

    console.log("[API/Companies] Empresa validada y asociada:", companyData);
    return NextResponse.json({ isValid: true, data: { company: companyData } });

  } catch (error: any) {
    console.error("[API/Companies] Error:", error);
    return NextResponse.json({ isValid: false, error: error.message || "Error validating inventory" }, { status: 500 });
  }
}
