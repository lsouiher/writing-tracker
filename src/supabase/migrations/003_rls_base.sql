-- T013: Base RLS policies

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;

-- Users: read own row, update own row
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Courses: public read for published, admin write
create policy "Anyone can read published courses"
  on public.courses for select
  using (is_published = true);

create policy "Admins can manage courses"
  on public.courses for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Modules: public read (via published course), admin write
create policy "Anyone can read modules of published courses"
  on public.modules for select
  using (
    exists (
      select 1 from public.courses
      where id = course_id and is_published = true
    )
  );

create policy "Admins can manage modules"
  on public.modules for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Lessons: public read (via published course), admin write
create policy "Anyone can read lessons of published courses"
  on public.lessons for select
  using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id and c.is_published = true
    )
  );

create policy "Admins can manage lessons"
  on public.lessons for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
