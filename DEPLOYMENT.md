# Vercel and Supabase setup

This portfolio now uses Supabase Auth and its Data API directly from React.
The existing server/ folder and owner:setup command are legacy local-backend
utilities; the online editor no longer uses them.

## Local development
Copy .env.example to .env.local and supply the project's URL and publishable key.
Run npm install, then npm run dev. Restart Vite after changing environment variables.

## Vercel
Import the repository and choose Vite, npm run build, and dist.
Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the project's environment
variables for Production and Preview, then deploy. A changed variable requires a
new deployment. Never put a secret or service_role key in a VITE_ variable.

## Owner editing
Open Projects or Skills, choose Owner sign in, and enter the email/password of the
owner account created in Supabase Authentication. Only the UID configured in
src/lib/supabase.js gets editor controls. Database RLS policies must independently
restrict insert/update/delete to this same UID; hiding controls is not security.
Public signup should remain disabled.

Tables: projects (id, title, url, category, tagline, thumbnail, position) and
skills (id, title, items text[], position). Visitors have SELECT access. Each editor
save modifies one row. New visits and page reloads fetch the latest saved data.
If the service is unavailable, bundled JSON is displayed with a status message.
Image URLs can point to external images or existing public/portfolio assets.
The editor also accepts image files. Before deploying this update, run
supabase/project-editor.sql in the Supabase SQL Editor. It adds editable tags and
source links, preserves the original projects' details, and creates the public
project-images bucket with owner-only uploads (5 MB maximum, PNG/JPG/WebP/AVIF).
Images upload on Save; their public URL is stored in the project record.
Deleting a project or replacing its thumbnail keeps previously saved images,
since another project may reference them. Remove unused images through Storage.
Storage setup reference: https://supabase.com/docs/guides/storage/security/access-control

The password from SET OWNER PASSWORD.cmd is not the Supabase password.
Use the owner credentials created in the Supabase dashboard. Password recovery
is currently managed through Supabase; there is no website reset-password form.

Documentation:
- https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://vercel.com/docs/frameworks/frontend/vite
