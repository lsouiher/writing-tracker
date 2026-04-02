-- T012: Content tables (courses, modules, lessons)

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  title_en text,
  description text not null,
  description_en text,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer not null,
  thumbnail_url text not null default '',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_courses_level on public.courses(level);
create index idx_courses_published on public.courses(is_published);
create index idx_courses_sort on public.courses(sort_order);

create trigger courses_updated_at
  before update on public.courses
  for each row execute procedure public.update_updated_at();

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(course_id, slug)
);

create index idx_modules_course on public.modules(course_id);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  video_id text not null,
  duration_seconds integer not null,
  transcript_fr text not null,
  transcript_en text,
  subtitle_url_fr text not null default '',
  subtitle_url_en text,
  is_free_preview boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(module_id, slug)
);

create index idx_lessons_module on public.lessons(module_id);
create index idx_lessons_free_preview on public.lessons(is_free_preview);
