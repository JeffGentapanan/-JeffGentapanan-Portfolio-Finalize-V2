# Jeff Gentapanan — Portfolio V2

A personal portfolio showcasing projects, skills, background, and contact information through a minimalist black-and-white interface. The website combines an interactive 3D cube, an animated plasma background, and owner-managed project and skill content.

**Jeff A. Gentapanan · BSIT 3 · Section 1 · First Semester Pre-Final**

## Features

- **Opening screen:** a centered Get Started button introduces the main portfolio.
- **Six portfolio views:** Home, About, Projects, Skills, Resume, and Contact.
- **Dark and light themes:** the selected theme is saved in the visitor’s browser.
- **Interactive 3D cube:** floating motion, cursor interaction, drag rotation, keyboard controls, beveled edges, and lighting. The cube is white in dark mode and black in light mode.
- **Animated plasma background:** a custom WebGL shader provides subtle motion behind the content.
- **Responsive navigation:** a sticky top bar and a bottom-right back-to-top button.
- **Project previews:** project cards open a preview dialog with external project links.
- **Owner editing:** authenticated controls to add, edit, and delete projects and skill categories on their respective pages.
- **Languages and tools section:** Home displays a generated source-code breakdown and the technologies used.
- **Resume and contact:** a downloadable resume, social links, and a contact form.
- **Accessibility support:** semantic sections, keyboard-accessible controls, reduced-motion handling, and focus management.

## Languages

| Language / format | Use in this project |
| --- | --- |
| JavaScript | React components, state management, interactions, validation, scripts, tests, and the Node.js server |
| HTML | The application entry document and page markup rendered through React |
| CSS | Layout, responsive styling, themes, typography, and transitions |
| Windows Batch (`.cmd`) | Local startup and owner-password setup shortcuts |
| JSON | Project data, skill data, generated language statistics, and configuration |
| GLSL embedded in JavaScript | Vertex and fragment shader code for the plasma background |

React components use **JSX**, a syntax extension of JavaScript. Server and utility scripts use JavaScript ES modules (`.mjs`). JSON is a data format, not an application programming language. There is no application TypeScript code.

GitHub calculates its language percentages from the committed files it recognizes. The Home section calculates percentages from selected application source files by file size, so the two breakdowns can differ. The Home percentages describe code composition, not proficiency levels.

## Libraries, tools, and runtime

| Technology | Version declared | Purpose |
| --- | --- | --- |
| React | `^19.2.4` | Component-based UI, hooks, context, and view state |
| React DOM | `^19.2.4` | Rendering the React application in the browser |
| Three.js | `^0.180.0` | 3D geometry, materials, lighting, camera, and shadows |
| React Three Fiber | `^9.4.0` | React integration for the Three.js scene |
| Vite | `^8.0.1` | Development server and production build |
| Vite React plugin | `^6.0.1` | JSX transformation and React development integration |
| Node.js | See setup below | Custom HTTP API, file persistence, password hashing, and production serving |
| npm | Included with Node.js | Dependency installation and project commands |
| Node.js test runner | Built into Node.js | Automated validation and owner-API tests |

The version ranges above come from `package.json`; `package-lock.json` records the resolved dependency versions. Styling uses plain CSS. The API uses Node.js built-in modules rather than Express, and content is stored in JSON files rather than a database.

## APIs and integrations

### Internal HTTP API

The React application communicates with a custom Node.js API defined in `server/api.mjs`. During development, Vite mounts the same API handler; in production, `server/start.mjs` serves both the API and the built frontend.

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| `GET` | `/api/content` | Load projects and skills | Public |
| `GET` | `/api/session` | Check owner-session and setup status | Public; returns the current session’s status |
| `POST` | `/api/login` | Sign in using the owner password | Requires the owner password; rate-limited |
| `POST` | `/api/logout` | End the current owner session | Authenticated session and CSRF token |
| `PUT` | `/api/projects` | Save the updated projects collection | Authenticated session and CSRF token |
| `PUT` | `/api/skills` | Save the updated skills collection | Authenticated session and CSRF token |

Mutating requests are checked for a matching origin. Project and skill data is validated on the server before it is saved.

### External service

**FormSubmit** receives the Contact page’s HTML form submissions and routes messages to the configured portfolio email address. The form uses a standard HTTP `POST` to FormSubmit, not the internal owner API. Before using this project with another recipient, update the form action and contact information in `src/components/personal-sections.jsx` and complete any recipient verification requested by the service.

GitHub, LinkedIn, Facebook, Figma, and Google Drive destinations are ordinary external links. This portfolio does not call their APIs.

### Browser APIs

- **Fetch API:** requests to the internal content and owner-session endpoints.
- **WebGL / Canvas:** the plasma shader and 3D rendering.
- **Local Storage:** saves the selected theme in each browser.
- **Pointer events and keyboard events:** cube interaction and navigation controls.
- **Intersection Observer and Page Visibility:** pause rendering work when appropriate.
- **Resize Observer:** resize the plasma canvas with the viewport.
- **Media queries / `matchMedia`:** reduced-motion preferences and responsive behavior.
- **`requestAnimationFrame`:** background animation scheduling.

## Run locally

### Requirements

Use **Node.js 22.12 or later** and npm. Install dependencies from the project folder:

```sh
npm ci
npm run dev
```

Open the **Local** address printed by Vite, usually `http://127.0.0.1:5173/`. If that port is occupied, use the different address printed in the terminal. Keep the terminal open while using the site.

### Windows shortcut

Double-click **`START PORTFOLIO.cmd`**. It checks for Node.js, installs dependencies if needed, and starts the development server.

### Owner setup

Owner setup is optional for viewing the website and required for editing its content.

```sh
npm run owner:setup
```

Alternatively, double-click **`SET OWNER PASSWORD.cmd`**. Choose and confirm a password of at least 12 characters; input is hidden. No default password is supplied.

Then open **Projects** or **Skills**, choose **Owner sign in**, and use the editing controls. To reset the password, run the setup command again and restart the server.

## Available commands

| Command | Action |
| --- | --- |
| `npm ci` | Install the locked dependencies |
| `npm run dev` | Regenerate language statistics and start the development server |
| `npm run build` | Regenerate language statistics and build the frontend into `dist/` |
| `npm start` | Serve the built frontend and internal API |
| `npm run preview` | Run the same production server as `npm start` |
| `npm test` | Run validation and owner-API tests |
| `npm run owner:setup` | Create or replace the owner-password hash |

## Project structure

```text
Jeff Portfolio V2 - Section1 BSIT3 - 1stSemPreFi - Finalize/
├── public/portfolio/            # Portrait, project previews, and resume PDF
├── scripts/
│   └── update-stack.mjs         # Generates the Home language breakdown
├── server/
│   ├── api.mjs                  # Content, authentication, and editing endpoints
│   ├── setup-owner.mjs          # Local password setup
│   └── start.mjs                # Production HTTP server
├── src/
│   ├── components/
│   │   ├── owner/              # Owner authentication interface
│   │   ├── projects/           # Project cards, previews, and editor
│   │   ├── skills/             # Skill display and editor
│   │   ├── three/              # 3D cube, scene, and plasma shader
│   │   ├── ui/                 # Shared dialog component
│   │   └── home-stack.jsx      # Languages and tools section
│   ├── data/                   # JSON content and generated language statistics
│   ├── hooks/                  # Reusable React hooks
│   ├── lib/                    # API helpers and project validation
│   ├── styles/                 # Global CSS and theme tokens
│   ├── App.jsx                 # Opening flow and application providers
│   └── main.jsx                # React entry point
├── tests/                      # Node.js tests
├── index.html
├── jsconfig.json               # Editor import-alias configuration
├── package.json
├── package-lock.json
├── vite.config.js
├── START PORTFOLIO.cmd
└── SET OWNER PASSWORD.cmd
```

## Content and authentication

Initial projects and skills come from `src/data/projects.json` and `src/data/skills.json`. Owner edits are persisted in `.private/content.json`. The password is stored as a salted scrypt hash in `.private/owner.json`, not as readable text.

Sessions use HttpOnly, SameSite cookies, expire after eight hours, and are cleared when the server restarts. Editing endpoints require a valid session and CSRF token. Login attempts are rate-limited.

The `.private/` directory is excluded by `.gitignore` and blocked by the development server. Keep it private and preserve it when moving an existing installation. `node_modules/` and `dist/` are also ignored; they can be recreated with the install and build commands.

## Production hosting

```sh
npm run build
npm start
```

The production server defaults to `http://127.0.0.1:4173/`.

| Environment variable | Purpose |
| --- | --- |
| `PORT` | Listening port; defaults to `4173` |
| `HOST` | Listening interface; defaults to `127.0.0.1` |
| `PUBLIC_ORIGIN` | Exact public HTTPS origin used for origin validation and secure owner cookies |

For public deployment, use a Node.js host with HTTPS and persistent storage for `.private/`. Configure the public origin and reverse proxy for the deployment. This implementation uses in-memory sessions and file storage and is intended for a single server instance.

**GitHub stores the source code; GitHub Pages alone cannot run the Node.js owner API.** A static-only deployment will not provide the full owner-editing functionality.

## Testing

The automated tests cover project validation, unsafe URL rejection, content decoding, server-side collection validation, owner login, rejected unauthorized writes, origin and CSRF checks, persistence, logout, and login rate limiting.

```sh
npm test
npm run build
```

The 3D scene is lazy-loaded. Vite may report a large-chunk warning for the Three.js bundle; this is a bundle-size notice rather than a failed build.

## Author

**Jeff A. Gentapanan**  
BSIT — Western Institute of Technology

[GitHub profile](https://github.com/JeffGentapanan) · [Portfolio repository](https://github.com/JeffGentapanan/-JeffGentapanan-Portfolio-Finalize-V2)
