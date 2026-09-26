# Jeff Portfolio — owner edition

This updates the same `jeff-portfolio-clear` folder with system-font typography, a shaded beveled cube (white in dark mode, black in light mode), a sticky top navigation, separate layout tracks that keep the cube away from text, and a bottom-right arrow that scrolls the current page to the top. It never reopens Get Started.

## Start and owner setup

1. Double-click **SET OWNER PASSWORD.cmd** once. Choose and confirm a password of at least 12 characters. Input is hidden.
2. Double-click **START PORTFOLIO.cmd** and open the Local URL it prints.
3. Enter the portfolio. Open **Projects** or **Skills**, then choose **Owner sign in**.
4. After sign-in, use **Edit projects** or **Edit skills** on that page. Sign out when finished.

No owner password has been preset. Anyone without it can view the portfolio but the server rejects their changes. Keep your password private. To change it, rerun SET OWNER PASSWORD and restart the server to end existing sessions.

## Editing and persistence

The Projects editor appears only on Projects. Home can showcase projects but has no editor. The Skills editor appears only on Skills and supports adding, renaming, editing, and deleting skill categories and their entries.

Edits are now shared server data, stored in `.private/content.json`, not localStorage. Initial content comes from `src/data/projects.json` and `src/data/skills.json`. Old browser-only collections are left untouched and are not automatically published. You can recreate any desired old edits after signing in.

`.private/owner.json` contains a salted scrypt password hash, never the plaintext password. This directory is excluded from Git and release ZIPs and blocked by the development server. Back up `.private` yourself if you want to preserve published content across machines. Do not put it in public hosting or a source repository.

## Run and deploy

Requires Node.js 22.12+ (Node 20.19+ is also supported by Vite).

```sh
npm ci
npm run owner:setup
npm run dev
```

Production:

```sh
npm run build
npm start
```

The provided Node server serves both `dist/` and the owner API at http://127.0.0.1:4173 by default. Vite development serves the same API handler. Static-only hosting will not support owner editing.

For public hosting, run the Node server behind HTTPS, set `PUBLIC_ORIGIN` to your exact HTTPS origin, and configure the reverse proxy to reach the Node process. Set `HOST` and `PORT` only as needed for your host. Use persistent storage for `.private`. The default binding is loopback. This implementation is intended for a single server instance; multiple instances require shared session and data storage.

## Access protections

Every write requires a valid server session, matching request origin, and CSRF token. Cookies are HttpOnly and SameSite=Strict, with Secure enabled for the configured HTTPS origin. Sessions expire after eight hours and are cleared on server restart. Login attempts are rate-limited, password hashing concurrency is capped, input is validated again on the server, and JSON writes are serialized and atomic.

Users with access to your Windows account or server files can reset the password locally. Protect that account and never share the owner password.

## Key files

- `src/styles/owner-refinement.css`: system fonts, grid spacing, right-hand arrow.
- `src/components/three/floating-box.jsx`: beveled cube, smoothly interpolated theme color, floating motion, floor shadow.
- `src/components/owner/`: login UI and session context.
- `src/components/skills/skills-section.jsx`: public skills and owner editor.
- `server/api.mjs`: shared read/write and authentication API.
- `server/setup-owner.mjs`: local password setup.
- `server/start.mjs`: production static/API server.
- `IMPLEMENTATION.md`: source and folder reference.

## Verification

Run npm run build and npm test to verify the JavaScript application. API tests cover rejected unsigned writes, login, origin and CSRF checks, shared projects/skills persistence, logout, and rate limiting. Development-server access to a harmless file in `.private` was verified to return HTTP 403. Browser checks cover system-font typography, editor placement, scroll-only return behavior, cube/text separation, and mobile overflow.

No real owner password was created during testing. No contact form messages were sent. The 3D scene remains a separate lazy-loaded chunk; its size produces a non-blocking Vite warning.

