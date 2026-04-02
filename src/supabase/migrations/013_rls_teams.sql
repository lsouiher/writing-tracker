-- T093: RLS for team_licenses and team_members

alter table public.team_licenses enable row level security;
alter table public.team_members enable row level security;

-- Team licenses: admin of team can read/manage
create policy "Team admins can read own licenses"
  on public.team_licenses for select
  using (auth.uid() = admin_id);

-- Team members: team admin can manage, members can read own row
create policy "Team admins can read team members"
  on public.team_members for select
  using (
    exists (
      select 1 from public.team_licenses
      where id = team_license_id and admin_id = auth.uid()
    )
  );

create policy "Members can read own team membership"
  on public.team_members for select
  using (auth.uid() = user_id);

create policy "Team admins can insert team members"
  on public.team_members for insert
  with check (
    exists (
      select 1 from public.team_licenses
      where id = team_license_id and admin_id = auth.uid()
    )
  );

create policy "Team admins can update team members"
  on public.team_members for update
  using (
    exists (
      select 1 from public.team_licenses
      where id = team_license_id and admin_id = auth.uid()
    )
  );
