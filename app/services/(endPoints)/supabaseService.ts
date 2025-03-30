// services/supabaseService.ts
import { supabase } from '@/lib/supabase';

/**
 * Consulta en Supabase la asociación de un usuario y retorna la empresa predeterminada.
 */
export async function getUserCompanyFromSupabase(userId: string): Promise<unknown> {
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("clerk", userId)
    .single();
  
  if (!userData?.id) return null;
  
  const { data: userCompanies } = await supabase
    .from("users_companies")
    .select("company_id, is_default_inventory")
    .eq("user_id", userData.id)
    .order("is_default_inventory", { ascending: false });
  
  if (userCompanies && userCompanies.length > 0) {
    const defaultCompany = userCompanies[0];
    const { data: companyData } = await supabase
      .from("companies")
      .select("*")
      .eq("id", defaultCompany.company_id)
      .single();
    return companyData;
  }
  return null;
}
