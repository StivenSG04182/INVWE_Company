import { auth } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
    const { userId } = auth();

    if (!userId) {
        return new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 });
    }

    const { data, error } = await supabase
        .from('notifications')
        .select(`
        id,
        type,
        title,
        message,
        created_at,
        read,
        users_companies_id,
        users_companies:users_companies_id ( role )
    `)
        .eq('users_companies.created_by', userId)
        .order('created_at', { ascending: false });

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const filteredData = data.filter(notification =>
        notification.users_companies?.role === 'ADMINISTRATOR'
    );

    return new Response(JSON.stringify({ notifications: filteredData }), {
        headers: { 'Content-Type': 'application/json' }
    });
}