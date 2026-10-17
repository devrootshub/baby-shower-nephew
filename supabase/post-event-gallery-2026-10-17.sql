-- Pós-evento e galeria privada.
-- Executar uma vez no SQL Editor do Supabase.

begin;

alter table public.event_settings
  add column if not exists gallery_enabled boolean not null default false;

alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check;
alter table public.admin_profiles
  add constraint admin_profiles_role_check check (role in ('admin','gallery_guest'));

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  media_type text not null check (media_type in ('image','video')),
  storage_path text unique not null,
  file_name text not null,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists gallery_items_updated on public.gallery_items;
create trigger gallery_items_updated before update on public.gallery_items
for each row execute function public.set_updated_at();

create or replace function public.is_gallery_member()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from public.admin_profiles
    where user_id = auth.uid() and role in ('admin','gallery_guest')
  )
$$;

create or replace function public.get_public_event_settings()
returns table(event_status text,gallery_enabled boolean,updated_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select e.event_status,e.gallery_enabled,e.updated_at
  from public.event_settings e
  order by e.created_at
  limit 1
$$;

alter table public.gallery_items enable row level security;

drop policy if exists gallery_items_member_read on public.gallery_items;
create policy gallery_items_member_read on public.gallery_items
for select to authenticated using(public.is_gallery_member());

drop policy if exists gallery_items_admin_insert on public.gallery_items;
create policy gallery_items_admin_insert on public.gallery_items
for insert to authenticated with check(public.is_admin());

drop policy if exists gallery_items_admin_update on public.gallery_items;
create policy gallery_items_admin_update on public.gallery_items
for update to authenticated using(public.is_admin()) with check(public.is_admin());

drop policy if exists gallery_items_admin_delete on public.gallery_items;
create policy gallery_items_admin_delete on public.gallery_items
for delete to authenticated using(public.is_admin());

grant select on public.gallery_items to authenticated;
grant insert,update,delete on public.gallery_items to authenticated;
grant execute on function public.get_public_event_settings() to anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values(
  'event-gallery',
  'event-gallery',
  false,
  52428800,
  array['image/jpeg','image/png','image/webp','image/heic','video/mp4','video/quicktime','video/webm']
)
on conflict(id) do update set
  public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists event_gallery_member_read on storage.objects;
create policy event_gallery_member_read on storage.objects
for select to authenticated
using(bucket_id='event-gallery' and public.is_gallery_member());

drop policy if exists event_gallery_admin_insert on storage.objects;
create policy event_gallery_admin_insert on storage.objects
for insert to authenticated
with check(bucket_id='event-gallery' and public.is_admin());

drop policy if exists event_gallery_admin_update on storage.objects;
create policy event_gallery_admin_update on storage.objects
for update to authenticated
using(bucket_id='event-gallery' and public.is_admin())
with check(bucket_id='event-gallery' and public.is_admin());

drop policy if exists event_gallery_admin_delete on storage.objects;
create policy event_gallery_admin_delete on storage.objects
for delete to authenticated
using(bucket_id='event-gallery' and public.is_admin());

-- O evento já terminou; a galeria fica desligada até existir uma conta de convidado.
update public.event_settings
set event_status='closed',
    rsvp_enabled=false,
    gifts_enabled=false,
    reservation_changes_enabled=false;

commit;

-- Depois de criares o utilizador partilhado em Authentication > Users,
-- substitui o UUID abaixo e executa apenas este INSERT:
-- insert into public.admin_profiles(user_id,role,display_name)
-- values('UUID_DO_UTILIZADOR','gallery_guest','Convidados da galeria');
