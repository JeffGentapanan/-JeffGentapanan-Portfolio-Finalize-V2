-- Add this portfolio's libraries and services while preserving existing skills.
-- Run in the portfolio project's Supabase SQL Editor.
insert into public.skills (id, title, items, position)
values (
  'libraries',
  'Libraries & services',
  ARRAY[
    'React', 'React DOM', 'Three.js', 'React Three Fiber',
    'Supabase JavaScript SDK', 'Supabase Auth',
    'Supabase Database (PostgreSQL)', 'Supabase Storage',
    'FormSubmit API', 'Vercel'
  ]::text[],
  1
)
on conflict (id) do update set items = (
  select array_agg(label order by first_position)
  from (
    select (array_agg(label order by ordinal))[1] as label,
           min(ordinal) as first_position
    from unnest(coalesce(skills.items, '{}'::text[]) || excluded.items)
         with ordinality as entries(label, ordinal)
    group by lower(trim(label))
  ) as unique_items
);