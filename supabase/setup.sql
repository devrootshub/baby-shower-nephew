-- Baby Shower — instalação completa para um projeto Supabase vazio.
-- Executar uma única vez no SQL Editor do Supabase.

begin;

create extension if not exists pgcrypto with schema extensions;

create table public.event_settings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  event_date date not null,
  event_time time not null,
  event_end_time time not null,
  venue_name text not null,
  address text not null,
  maps_url text,
  event_status text not null default 'open' check (event_status in ('draft','open','closed')),
  rsvp_enabled boolean not null default true,
  gifts_enabled boolean not null default true,
  reservation_changes_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guest_invitations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  invitation_type text not null default 'individual' check (invitation_type in ('individual','group','child')),
  response_status text not null default 'pending' check (response_status in ('pending','yes','no')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid unique references public.guest_invitations(id) on delete set null,
  full_name text not null check (char_length(trim(full_name)) between 1 and 120),
  adults_count integer not null default 1 check (adults_count between 0 and 20),
  children_count integer not null default 0 check (children_count between 0 and 20),
  guests_count integer generated always as (adults_count + children_count) stored,
  attendance_status text not null check (attendance_status in ('yes','no')),
  message text check (char_length(message) <= 1000),
  source text not null default 'site' check (source in ('site','manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (adults_count + children_count between 1 and 20)
);

create table public.gift_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.gift_categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  product_url text,
  emoji text,
  gift_type text not null default 'single' check (gift_type in ('single','quantity')),
  target_quantity integer not null default 1 check (target_quantity between 1 and 99),
  status text not null default 'available' check (status in ('available','unavailable','hidden')),
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gift_reservations (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts(id) on delete restrict,
  guest_name text not null check (char_length(trim(guest_name)) between 1 and 120),
  quantity integer not null default 1 check (quantity between 1 and 99),
  management_token_hash text unique not null,
  status text not null default 'active' check (status in ('active','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  activity_type text not null,
  entity_type text not null,
  entity_id uuid,
  description text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index rsvps_created_idx on public.rsvps(created_at desc);
create index reservations_gift_status_idx on public.gift_reservations(gift_id,status);
create index reservations_created_idx on public.gift_reservations(created_at desc);
create index invitations_status_idx on public.guest_invitations(response_status);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end
$$;

create trigger event_settings_updated before update on public.event_settings for each row execute function public.set_updated_at();
create trigger admin_profiles_updated before update on public.admin_profiles for each row execute function public.set_updated_at();
create trigger invitations_updated before update on public.guest_invitations for each row execute function public.set_updated_at();
create trigger rsvps_updated before update on public.rsvps for each row execute function public.set_updated_at();
create trigger categories_updated before update on public.gift_categories for each row execute function public.set_updated_at();
create trigger gifts_updated before update on public.gifts for each row execute function public.set_updated_at();
create trigger reservations_updated before update on public.gift_reservations for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin')
$$;

create or replace function public.get_public_invitations()
returns table(id uuid,name text)
language sql stable security definer set search_path = '' as $$
  select i.id,i.name from public.guest_invitations i order by i.name
$$;

create or replace function public.get_public_gifts()
returns table(id uuid,name text,description text,image_url text,product_url text,emoji text,gift_type text,target_quantity integer,reserved_quantity integer,status text,sort_order integer,category_name text)
language sql stable security definer set search_path = '' as $$
  select g.id,g.name,g.description,g.image_url,g.product_url,g.emoji,g.gift_type,g.target_quantity,
    coalesce(sum(r.quantity) filter (where r.status='active'),0)::integer,
    g.status,g.sort_order,c.name
  from public.gifts g
  left join public.gift_categories c on c.id=g.category_id
  left join public.gift_reservations r on r.gift_id=g.id
  where g.is_visible and g.status<>'hidden'
  group by g.id,c.name
  order by g.sort_order
$$;

create or replace function public.create_rsvp(
  p_invitation_id uuid,
  p_full_name text,
  p_adults_count integer,
  p_children_count integer,
  p_attendance_status text,
  p_message text default null,
  p_source text default 'site'
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not exists(select 1 from public.event_settings where event_status='open' and rsvp_enabled) then raise exception 'RSVP_CLOSED'; end if;
  if trim(p_full_name)='' or p_adults_count<0 or p_children_count<0 or p_adults_count+p_children_count not between 1 and 20 or p_attendance_status not in('yes','no') or p_source not in('site','manual') then raise exception 'INVALID_RSVP'; end if;
  if p_invitation_id is not null and not exists(select 1 from public.guest_invitations where id=p_invitation_id) then raise exception 'INVITATION_NOT_FOUND'; end if;
  insert into public.rsvps(invitation_id,full_name,adults_count,children_count,attendance_status,message,source)
  values(p_invitation_id,trim(p_full_name),p_adults_count,p_children_count,p_attendance_status,nullif(trim(p_message),''),p_source)
  on conflict(invitation_id) do update set full_name=excluded.full_name,adults_count=excluded.adults_count,children_count=excluded.children_count,attendance_status=excluded.attendance_status,message=excluded.message,source=excluded.source
  returning id into v_id;
  if p_invitation_id is not null then update public.guest_invitations set response_status=p_attendance_status where id=p_invitation_id; end if;
  insert into public.activity_log(activity_type,entity_type,entity_id,description) values('rsvp_saved','rsvp',v_id,'Confirmação recebida');
  return v_id;
end
$$;

create or replace function public.create_gift_reservation(p_gift_id uuid,p_guest_name text,p_quantity integer default 1)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare g public.gifts%rowtype; used integer; raw_token text; rid uuid;
begin
  select * into g from public.gifts where id=p_gift_id for update;
  if not found or not g.is_visible or g.status<>'available' then raise exception 'GIFT_UNAVAILABLE'; end if;
  if not exists(select 1 from public.event_settings where event_status='open' and gifts_enabled) then raise exception 'EVENT_CLOSED'; end if;
  if trim(p_guest_name)='' or p_quantity<1 then raise exception 'INVALID_RESERVATION'; end if;
  select coalesce(sum(quantity),0) into used from public.gift_reservations where gift_id=p_gift_id and status='active';
  if used+p_quantity>g.target_quantity then raise exception 'INSUFFICIENT_AVAILABILITY'; end if;
  raw_token=encode(extensions.gen_random_bytes(32),'hex');
  insert into public.gift_reservations(gift_id,guest_name,quantity,management_token_hash)
  values(p_gift_id,trim(p_guest_name),p_quantity,encode(extensions.digest(raw_token,'sha256'),'hex')) returning id into rid;
  insert into public.activity_log(activity_type,entity_type,entity_id,description) values('reservation_created','reservation',rid,'Reserva de presente criada');
  return jsonb_build_object('id',rid,'token',raw_token);
end
$$;

create or replace function public.get_reservation_by_token(p_token text)
returns table(id uuid,gift_id uuid,guest_name text,quantity integer,status text,created_at timestamptz,updated_at timestamptz)
language sql security definer set search_path = '' as $$
  select r.id,r.gift_id,r.guest_name,r.quantity,r.status,r.created_at,r.updated_at
  from public.gift_reservations r
  where r.management_token_hash=encode(extensions.digest(p_token,'sha256'),'hex') limit 1
$$;

create or replace function public.update_reservation_by_token(p_token text,p_guest_name text,p_quantity integer)
returns void language plpgsql security definer set search_path = '' as $$
declare r public.gift_reservations%rowtype; used integer; target integer;
begin
  select * into r from public.gift_reservations where management_token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and status='active' for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if not exists(select 1 from public.event_settings where event_status='open' and reservation_changes_enabled) then raise exception 'CHANGES_CLOSED'; end if;
  select target_quantity into target from public.gifts where id=r.gift_id for update;
  select coalesce(sum(quantity),0) into used from public.gift_reservations where gift_id=r.gift_id and status='active' and id<>r.id;
  if trim(p_guest_name)='' or p_quantity<1 or used+p_quantity>target then raise exception 'INVALID_UPDATE'; end if;
  update public.gift_reservations set guest_name=trim(p_guest_name),quantity=p_quantity where id=r.id;
end
$$;

create or replace function public.cancel_reservation_by_token(p_token text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.event_settings where event_status='open' and reservation_changes_enabled) then raise exception 'CHANGES_CLOSED'; end if;
  update public.gift_reservations set status='cancelled' where management_token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and status='active';
  if not found then raise exception 'NOT_FOUND'; end if;
end
$$;

create or replace function public.admin_update_gift_target(p_gift_id uuid,p_target_quantity integer)
returns void language plpgsql security definer set search_path = '' as $$
declare used integer;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  select coalesce(sum(quantity),0) into used from public.gift_reservations where gift_id=p_gift_id and status='active';
  if p_target_quantity<greatest(1,used) or p_target_quantity>99 then raise exception 'INVALID_TARGET'; end if;
  update public.gifts set target_quantity=p_target_quantity where id=p_gift_id;
  if not found then raise exception 'NOT_FOUND'; end if;
end
$$;

alter table public.event_settings enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.guest_invitations enable row level security;
alter table public.rsvps enable row level security;
alter table public.gift_categories enable row level security;
alter table public.gifts enable row level security;
alter table public.gift_reservations enable row level security;
alter table public.activity_log enable row level security;

create policy admin_profiles_self_read on public.admin_profiles for select to authenticated using(user_id=auth.uid());
create policy event_settings_admin_all on public.event_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy invitations_admin_all on public.guest_invitations for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy rsvps_admin_all on public.rsvps for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy categories_admin_all on public.gift_categories for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy gifts_admin_all on public.gifts for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy reservations_admin_all on public.gift_reservations for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy activity_admin_read on public.activity_log for select to authenticated using(public.is_admin());

revoke all on all tables in schema public from anon,authenticated;
grant select on public.admin_profiles to authenticated;
grant select,insert,update,delete on public.event_settings,public.guest_invitations,public.rsvps,public.gift_categories,public.gifts,public.gift_reservations to authenticated;
grant select on public.activity_log to authenticated;
revoke all on function public.get_public_invitations() from public;
revoke all on function public.get_public_gifts() from public;
revoke all on function public.create_rsvp(uuid,text,integer,integer,text,text,text) from public;
revoke all on function public.create_gift_reservation(uuid,text,integer) from public;
revoke all on function public.get_reservation_by_token(text) from public;
revoke all on function public.update_reservation_by_token(text,text,integer) from public;
revoke all on function public.cancel_reservation_by_token(text) from public;
revoke all on function public.admin_update_gift_target(uuid,integer) from public;
grant execute on function public.get_public_invitations(),public.get_public_gifts(),public.create_rsvp(uuid,text,integer,integer,text,text,text),public.create_gift_reservation(uuid,text,integer),public.get_reservation_by_token(text),public.update_reservation_by_token(text,text,integer),public.cancel_reservation_by_token(text) to anon,authenticated;
grant execute on function public.admin_update_gift_target(uuid,integer) to authenticated;

insert into public.event_settings(title,subtitle,event_date,event_time,event_end_time,venue_name,address,maps_url,event_status)
values('Um bebé está a chegar','Vamos celebrar juntos esta nova aventura','2026-10-16','14:30','19:30','Quinta da Alana','Rua das Fazendas, 2910-212 Gâmbia, Setúbal','https://www.google.com/maps/search/?api=1&query=Quinta+da+Alana+Gambia+Setubal','open');

insert into public.guest_invitations(name,invitation_type) values
('Cátia','individual'),('Miguel','individual'),('Rúben','individual'),('José','individual'),('Mariana','individual'),('Tiago','individual'),('Vera','individual'),('Vanda','individual'),('Celso & Filhos','group'),('Afonso','individual'),('Rafa','individual'),('Leo','individual'),('Fábio','individual'),('Filipa','individual'),('Rodrigo','individual'),('Liliana','individual'),('Gonçalo','individual'),('Ana','individual'),('Carol','individual'),('Francisco','individual'),('Sara','individual'),('Tiago','individual'),('Gordão & Família','group'),('Rui','individual'),('Ana','individual'),('Rapha & Arthur','group'),('Cláudia','individual'),('Carina','individual'),('Bruno','individual'),('Mafalda','individual'),('Condeixa','individual'),('Igor','individual'),('Viky','individual'),('Selma','individual'),('Bruno (padrinho)','individual'),('Bruno Luís','individual'),('Juliana & Bebés','group'),('Joana','individual'),('Márcio','individual'),('Solange','individual'),('Matilde','individual'),('Rafael','individual'),('Carla (tia)','individual'),('Álvaro','individual'),('Inês (tia babada)','individual'),('Andreia','individual'),('Margarida','individual'),('Rita & Oliver','group'),('Britney','individual');

insert into public.gift_categories(name,sort_order) values
('Passeio e transporte',1),('Quarto e descanso',2),('Alimentação',3),('Higiene e cuidados',4),('Amamentação',5),('Segurança e monitorização',6);

insert into public.gifts(category_id,name,slug,description,image_url,product_url,gift_type,target_quantity,sort_order)
select c.id,v.name,v.slug,v.description,v.image_url,v.product_url,'single',1,v.sort_order
from public.gift_categories c
join (values
('Passeio e transporte','Carrinho Bellagio 2.0','carrinho-bellagio','Carrinho Chicco Bellagio 2.0 na cor Amber Glow.','/images/gifts/carrinho-bellagio.jpg','https://www.chicco.pt/produtos/auto-e-passeio/passeio/carrinhos-de-passeio/carrinho-bellagio-2.0-8058664191048-04087183500000.html',1),
('Passeio e transporte','Cadeira auto First Seat Recline i-Size','cadeira-auto-chicco','Cadeira auto Chicco reclinável para bebés dos 40 aos 87 cm.','/images/gifts/cadeira-auto-chicco.jpg','https://www.chicco.pt/produtos/auto-e-passeio/seguranca-auto/cadeiras-auto/cadeira-auto-first-seat-recline-i-size-40-87-cm-8058664174157-04087100500000.html',2),
('Passeio e transporte','Alcofa Flexi Bellagio','alcofa-flexi','Alcofa Chicco Flexi compatível com o sistema Bellagio.','/images/gifts/alcofa-flexi.jpg','https://www.chicco.pt/pensado-para-si/sistema-modular-bellagio/alcofa-flexi-8058664180509-04087137500000.html',3),
('Quarto e descanso','Berço Next2Me Forever','berco-next2me','Berço co-sleeping Chicco Next2Me Forever em Ash Grey.','/images/gifts/berco-next2me.jpg','https://www.chicco.pt/produtos/dormir-e-relaxar/hora-de-dormir/bercos-e-camas/cama-next2me-forever-8058664165056-08079650610000.html',4),
('Higiene e cuidados','Termómetro digital sem contacto','termometro-digital','Termómetro infravermelho com leitura rápida e alarme de febre.','/images/gifts/termometro.jpg','https://www.amazon.es/dp/B0865RL4PH',5),
('Passeio e transporte','Marsúpio ergonómico Momcozy','marsupio-momcozy','Porta-bebés leve com suporte lombar, indicado dos 3 aos 24 meses.','/images/gifts/marsupio-momcozy.jpg','https://www.amazon.es/dp/B0FJRR17NX',6),
('Segurança e monitorização','Intercomunicador Blemil com câmara','intercomunicador-blemil','Monitor de bebé com ecrã IPS de 6”, visão noturna e áudio bidirecional.','/images/gifts/intercomunicador.jpg','https://www.amazon.es/-/pt/dp/B0DG2QS4GG',7),
('Amamentação','Bomba tira-leite elétrica dupla','bomba-tira-leite','Bomba KISSBOBO K5 mãos-livres com quatro modos e 19 níveis.','/images/gifts/bomba-leite.jpg','https://www.amazon.es/dp/B0FKTN43MC',8),
('Higiene e cuidados','Trocador Nattou Softy','trocador-nattou','Trocador acolchoado em espuma PU macia, lavável, 50 × 70 cm.','/images/gifts/trocador-nattou.jpg','https://www.amazon.es/-/pt/Nattou-Cambiador-acolchado-espuma-lavable/dp/B0D2QYXMTD',9),
('Amamentação','Almofada de gravidez e amamentação Niimo XXL','almofada-niimo','Almofada XXL com capa de algodão removível e lavável.','/images/gifts/almofada-niimo.jpg','https://www.amazon.es/-/pt/dp/B0DHVJTV3Q',10),
('Quarto e descanso','Ninho de bebé Totsy Baby','ninho-totsy','Ninho acolchoado de 90 × 50 cm em bege com estrelas brancas.','/images/gifts/ninho-totsy.jpg','https://www.amazon.es/-/pt/Nido-beb%C3%A9-reci%C3%A9n-nacido-90x50/dp/B0DK3GXZCM',11),
('Alimentação','Cadeira de papa Kinderkraft Yummy','cadeira-papa-kinderkraft','Cadeira de papa ajustável, com tabuleiro, indicada até aos 3 anos.','/images/gifts/cadeira-papa.jpg','https://www.amazon.es/gp/aw/d/B07GDN22TF/',12),
('Higiene e cuidados','Contentor de fraldas Nattou Dropy','contentor-fraldas','Contentor de fraldas antiodor, fácil de abrir com uma mão, em taupe.','/images/gifts/contentor-fraldas.jpg','https://amzn.eu/d/0aqgSuBx',13)
) as v(category_name,name,slug,description,image_url,product_url,sort_order) on v.category_name=c.name;

do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='rsvps') then alter publication supabase_realtime add table public.rsvps; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='guest_invitations') then alter publication supabase_realtime add table public.guest_invitations; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='gifts') then alter publication supabase_realtime add table public.gifts; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='gift_reservations') then alter publication supabase_realtime add table public.gift_reservations; end if;
end $$;

commit;
