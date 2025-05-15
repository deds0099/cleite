-- Create registros_financeiros table
create table public.registros_financeiros (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    tipo text not null check (tipo in ('Receita', 'Despesa')),
    categoria text not null,
    valor decimal(10,2) not null check (valor > 0),
    descricao text not null default '',
    data date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.registros_financeiros enable row level security;

-- Create policies
create policy "Usuários podem ver seus próprios registros financeiros"
    on public.registros_financeiros for select
    using (auth.uid() = user_id);

create policy "Usuários podem inserir seus próprios registros financeiros"
    on public.registros_financeiros for insert
    with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus próprios registros financeiros"
    on public.registros_financeiros for update
    using (auth.uid() = user_id);

create policy "Usuários podem deletar seus próprios registros financeiros"
    on public.registros_financeiros for delete
    using (auth.uid() = user_id);

-- Create indexes
create index registros_financeiros_user_id_idx on public.registros_financeiros(user_id);
create index registros_financeiros_data_idx on public.registros_financeiros(data);
create index registros_financeiros_tipo_idx on public.registros_financeiros(tipo);

-- Grant permissions
grant all on public.registros_financeiros to authenticated;
grant all on public.registros_financeiros to service_role; 