-- Create notifications table
create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    type text not null check (type in ('message', 'alert')),
    title text not null,
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    read boolean default false not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_by uuid references auth.users(id) on delete set null
);
