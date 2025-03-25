// services/companiesService.ts
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Retorna la instancia de la base de datos Mongo.
 */
export async function getMongoDB() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB);
}

/**
 * Valida y normaliza el documento de una empresa.
 * Si no se encuentra el campo name, intenta obtenerlo desde otros campos o consulta a Supabase.
 */
export async function validateCompany(company: any, supabaseClient: SupabaseClient): Promise<any> {
  if (!company) return null;
  if (company.values && company.values.nombreEmpresa) {
    return { ...company, name: company.values.nombreEmpresa };
  } else if (company.name) {
    return company;
  } else if (company.metadata && company.metadata.supabaseId) {
    const { data: supabaseCompany, error } = await supabaseClient
      .from("companies")
      .select("name")
      .eq("id", company.metadata.supabaseId)
      .single();
    if (!error && supabaseCompany?.name) {
      return { ...company, name: supabaseCompany.name };
    }
  }
  return null;
}

/**
 * Convierte el campo companyId a ObjectId si es una cadena.
 */
export function normalizeCompanyId(id: string | ObjectId): ObjectId {
  return typeof id === 'string' ? new ObjectId(id) : id;
}
