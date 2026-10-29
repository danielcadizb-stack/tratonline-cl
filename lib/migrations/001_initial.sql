-- ═══════════════════════════════════════════════
--  Trato.cl — Migración inicial
--  Ejecutar en: Supabase > SQL Editor
-- ═══════════════════════════════════════════════

create extension if not exists "uuid-ossp";

create type user_role    as enum ('vendedor', 'comprador', 'mecanico');
create type tipo_auto    as enum ('sedan', 'suv', 'hatchback', 'camioneta', 'otro');
create type transmision  as enum ('manual', 'automatico');
create type combustible  as enum ('bencina', 'diesel', 'electrico', 'hibrido');
create type estado_auto  as enum ('disponible', 'match_activo', 'vendido', 'retirado');
create type urgencia     as enum ('inmediata', '1mes', '3meses', 'flexible');
create type estado_match as enum (
  'pendiente','notificado','aceptado_comprador',
  'aceptado_vendedor','visita_agendada',
  'inspeccion_solicitada','cerrado','cancelado'
);

create table usuarios (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text not null,
  email      text not null unique,
  telefono   text,
  rol        user_role not null,
  rut        text,
  activo     boolean default true,
  created_at timestamptz default now()
);

create table autos (
  id              uuid primary key default uuid_generate_v4(),
  vendedor_id     uuid not null references usuarios(id) on delete cascade,
  marca           text not null,
  modelo          text not null,
  anio            integer not null,
  km              integer not null,
  precio_pedido   integer not null,
  precio_minimo   integer not null,
  transmision     transmision not null,
  combustible     combustible not null,
  tipo            tipo_auto not null,
  color           text,
  region          text not null,
  fotos           text[] default '{}',
  descripcion     text,
  estado          estado_auto default 'disponible',
  created_at      timestamptz default now()
);

create table perfiles_comprador (
  id           uuid primary key default uuid_generate_v4(),
  comprador_id uuid not null references usuarios(id) on delete cascade,
  marcas       text[] default '{}',
  anio_min     integer not null,
  anio_max     integer not null,
  km_max       integer not null,
  presupuesto  integer not null,
  tipos        tipo_auto[] default '{}',
  transmision  text default 'cualquiera',
  combustible  text default 'cualquiera',
  region       text not null,
  urgencia     urgencia default 'flexible',
  activo       boolean default true,
  created_at   timestamptz default now()
);

create table mecanicos (
  id                 uuid primary key default uuid_generate_v4(),
  usuario_id         uuid not null references usuarios(id) on delete cascade,
  nombre_taller      text,
  comunas            text[] default '{}',
  especialidad       text[] default '{}',
  tarifa_base        integer default 40000,
  suscripcion_activa boolean default false,
  suscripcion_vence  date,
  rating             numeric(3,2) default 5.0,
  total_inspecciones integer default 0,
  created_at         timestamptz default now()
);

create table matches (
  id           uuid primary key default uuid_generate_v4(),
  auto_id      uuid not null references autos(id) on delete cascade,
  comprador_id uuid not null references usuarios(id),
  perfil_id    uuid not null references perfiles_comprador(id),
  score        integer not null check (score between 0 and 100),
  estado       estado_match default 'pendiente',
  mecanico_id  uuid references mecanicos(id),
  fee_cobrado  boolean default false,
  created_at   timestamptz default now(),
  unique(auto_id, comprador_id)
);

create table mensajes (
  id         uuid primary key default uuid_generate_v4(),
  match_id   uuid not null references matches(id) on delete cascade,
  autor_id   uuid not null references usuarios(id),
  texto      text not null,
  tipo       text default 'texto',
  leido      boolean default false,
  created_at timestamptz default now()
);

create index idx_autos_estado     on autos(estado);
create index idx_autos_vendedor   on autos(vendedor_id);
create index idx_perfiles_activo  on perfiles_comprador(activo);
create index idx_matches_auto     on matches(auto_id);
create index idx_matches_comprador on matches(comprador_id);
create index idx_mensajes_match   on mensajes(match_id);

alter table usuarios           enable row level security;
alter table autos              enable row level security;
alter table perfiles_comprador enable row level security;
alter table mecanicos          enable row level security;
alter table matches            enable row level security;
alter table mensajes           enable row level security;

create policy "usuario_own" on usuarios
  for all using (auth.uid() = id);

create policy "autos_vendedor_own" on autos
  for all using (auth.uid() = vendedor_id);
create policy "autos_public_read" on autos
  for select using (estado = 'disponible');

create policy "perfil_own" on perfiles_comprador
  for all using (auth.uid() = comprador_id);

create policy "mecanico_own" on mecanicos
  for all using (auth.uid() = usuario_id);
create policy "mecanico_public_read" on mecanicos
  for select using (suscripcion_activa = true);

create policy "match_partes" on matches
  for all using (
    auth.uid() = comprador_id or
    auth.uid() = (select vendedor_id from autos where id = auto_id)
  );

create policy "mensajes_partes" on mensajes
  for all using (
    exists (
      select 1 from matches m
      where m.id = match_id and (
        auth.uid() = m.comprador_id or
        auth.uid() = (select vendedor_id from autos where id = m.auto_id)
      )
    )
  );
  