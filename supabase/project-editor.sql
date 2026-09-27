-- Run once in this project's Supabase SQL Editor. Safe to run again.
begin;
alter table public.projects add column if not exists tags text[];
alter table public.projects add column if not exists github text;
update public.projects set tags = ARRAY['React','Vite','Node.js','Express','JavaScript','HTML/CSS'] where id = 'awesome-todos' and tags is null;
update public.projects set github = 'https://github.com/JeffGentapanan/awesometodosapp.git' where id = 'awesome-todos' and github is null;
update public.projects set tags = ARRAY['UI/UX Design','Figma','Interaction Design','Travel Tech','Mobile Design','User Experience','Visual Design','App Design','Travel Planning'] where id = 'letsgo' and tags is null;
update public.projects set github = '' where id = 'letsgo' and github is null;
update public.projects set tags = '{}' where tags is null;
update public.projects set github = '' where github is null;
alter table public.projects alter column tags set default '{}', alter column tags set not null;
alter table public.projects alter column github set default '', alter column github set not null;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 5242880, ARRAY['image/png','image/jpeg','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Jeff uploads project images" on storage.objects;
create policy "Jeff uploads project images" on storage.objects for insert to authenticated
with check (bucket_id = 'project-images' and (select auth.uid()) = '9f3911bb-eaa1-4a39-b269-861c499a3b13'::uuid);
drop policy if exists "Jeff reads project image metadata" on storage.objects;
create policy "Jeff reads project image metadata" on storage.objects for select to authenticated
using (bucket_id = 'project-images' and (select auth.uid()) = '9f3911bb-eaa1-4a39-b269-861c499a3b13'::uuid);
drop policy if exists "Jeff removes project images" on storage.objects;
create policy "Jeff removes project images" on storage.objects for delete to authenticated
using (bucket_id = 'project-images' and (select auth.uid()) = '9f3911bb-eaa1-4a39-b269-861c499a3b13'::uuid);
notify pgrst, 'reload schema';
commit;
