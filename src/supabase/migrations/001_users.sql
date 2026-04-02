-- T011: Users table
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  country text,
  language text not null default 'fr' check (language in ('fr', 'en')),
  role text not null default 'student' check (role in ('student', 'team_admin', 'admin')),
  referral_code text not null default nanoid(10) unique,
  referred_by uuid references public.users(id),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_users_country on public.users(country);
create index idx_users_referred_by on public.users(referred_by);

-- nanoid function for referral codes
create or replace function nanoid(size int default 21)
returns text as $$
declare
  id text := '';
  i int := 0;
  alphabet text := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  bytes bytea := gen_random_bytes(size);
begin
  while i < size loop
    id := id || substr(alphabet, (get_byte(bytes, i) % length(alphabet)) + 1, 1);
    i := i + 1;
  end loop;
  return id;
end;
$$ language plpgsql volatile;

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.update_updated_at();
