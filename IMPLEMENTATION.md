# Code guide

## How the app starts

1. `index.html` loads `src/main.jsx`.
2. `main.jsx` renders `App.jsx`.
3. `App.jsx` sets up shared state, the background, and the opening screen.
4. Get Started shows `components/portfolio.jsx`.
5. The portfolio selects a page using the URL hash, such as `#about`.

## Folder structure

```text
src/
├── pages/                 # Home, About, Projects, Skills, Resume, Contact
├── components/
│   ├── layout/            # Navigation, Hero, Footer, BackToTop
│   ├── projects/          # Cards, previews, and project editor
│   ├── skills/            # Skill display and editor
│   ├── owner/             # Sign-in interface
│   ├── three/             # Cube, camera, lights, and plasma
│   └── ui/                # Shared dialog
├── context/               # Shared theme and owner-session state
├── hooks/                 # Reusable React behavior
├── data/                  # Navigation labels and JSON content
├── lib/                   # API and validation helpers
├── styles/                # Colors, typography, and layout
├── App.jsx                # Opening flow and providers
└── main.jsx               # Starts React
server/                    # Owner API, password setup, production server
scripts/                   # Language statistics generator
public/                    # Images and resume PDF
tests/                     # Validation and API tests
```

## Where to edit

| Change | File |
| --- | --- |
| Opening screen | src/components/opening-page.jsx |
| Home | src/pages/HomePage.jsx |
| About | src/pages/AboutPage.jsx |
| Projects layout | src/pages/ProjectsPage.jsx |
| Skills page | src/pages/SkillsPage.jsx |
| Resume details | src/pages/ResumePage.jsx |
| Contact details and form | src/pages/ContactPage.jsx |
| Navigation order | src/components/layout/Navigation.jsx |
| Page headings and route aliases | src/data/navigation.js |
| Shared hero | src/components/layout/Hero.jsx |
| Footer links | src/components/layout/Footer.jsx |
| Theme state | src/context/theme-context.jsx |
| Login state | src/context/owner-context.jsx |
| Colors and fonts | src/styles/tokens.css |
| Base styles | src/styles/global.css |
| Final responsive adjustments | src/styles/layout-overrides.css |
| Language-section styles | src/styles/home-stack.css |
| Authentication and saving data | server/api.mjs |

Pages arrange content. Components contain reusable pieces. Context shares state. Hooks contain reusable behavior. The lib folder holds API and validation helpers. The server authenticates the owner and saves content.

Home reuses the Projects layout without its editing control. Owner authentication remains enforced on the server. Existing content and interactions are preserved.

Styles load in this order: tokens.css, global.css, layout-overrides.css. The final file overrides earlier rules where necessary to retain the current design.

## Commands

```sh
npm run dev
npm run format
npm run format:check
npm test
npm run build
```

The code uses JavaScript and JSX, HTML, and CSS. Prettier formats the files with two-space indentation. JSX is React's HTML-like syntax. Source language percentages may change with formatting because they are calculated from file sizes.
