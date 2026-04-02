-- T023: Enrollments and progress tables

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create index idx_enrollments_course on public.enrollments(course_id);

create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  last_position_seconds integer not null default 0,
  watched_seconds integer not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index idx_progress_lesson on public.progress(lesson_id);

create trigger progress_updated_at
  before update on public.progress
  for each row execute procedure public.update_updated_at();
