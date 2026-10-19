# ZCode

### Learn. Practice. Progress.

**ZCode** is an interactive programming learning platform designed to make learning to code engaging, structured, and accessible.

> 🚧 **Project Status:** Milestone 01 frontend is implemented, with remaining visual QA noted below. Features in the Planned Features section belong to future milestones.

---

## Milestone 01 — Local development

The landing page, shared design foundation, and authentication **interface preview** are implemented. No backend is connected: forms validate sample input locally, then explain that no account, session, or reset email was created. Credentials are never persisted or sent to a server.

### Run

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm install
npm run dev
```

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

### Routes

- `/` — 55/45 introduction carousel and login card
- `/login` — login interface
- `/register` — registration interface
- `/forgot-password` — password recovery interface
- Unmatched routes — custom 404

### Design foundation

`src/styles/globals.css` defines semantic CSS variables for **Cosmic Midnight Lavender**, shared surfaces, borders, typography, and responsive components. The Tailwind v4 `@theme inline` block exposes the palette and Outfit / Inter / JetBrains Mono typography as reusable utilities. Light mode keeps pale cosmic gradients and glass surfaces. The theme defaults to dark and persists the user's explicit choice in local storage, with a graceful fallback when storage is unavailable. Google Fonts are loaded with system font fallbacks.

Components are grouped by responsibility:

```text
src/
  components/
    branding/    # Scalable ZCodeLogo
    ui/          # Button, GlassCard, FormInput, ThemeToggle, typography, loading
    landing/     # IntroCarousel and CosmicBackground
    auth/        # LoginForm, SignupForm, ForgotPasswordForm, shared preview/validation
    layout/      # Header and Footer
  context/       # Reusable ThemeProvider
  pages/         # Landing and account route composition
  styles/        # globals.css: design tokens, controls, responsive layout
```

Artwork is authored as local CSS and inline SVG; no external image URLs or placeholder asset folder are required. `public/favicon.svg` contains the app icon. Edit source files in `src/` and `index.html`; `dist/` and `tsconfig.tsbuildinfo` are generated build output.

Routing and route titles are managed in `src/App.tsx`. Decorative artwork uses local CSS and SVG and requires no image assets. Motion respects `prefers-reduced-motion`.

### Reusable UI and introduction

- `Button` / `ButtonLink`: primary lavender-to-blue gradient or secondary glass styling. `Button` accepts `loading`, disables interaction while busy, and exposes loading state to assistive technology.
- `GlassCard`, `LoadingIndicator`, `ThemeToggle`, `CosmicBackground`, and `Eyebrow`: reusable presentation components in `src/components`.
- `.field`, `.form-input`, `.form-label`, `.field-error`, and `.error-message`: shared form styling with semantic color, radius, border, motion, and focus tokens.
- `AuthCard`: branded interface for login, registration, and recovery, with client-side route switching. Registration requires a display name, valid email, a password of at least 12 characters, and a matching confirmation. Persistent passphrase guidance and independent password visibility controls support the form. Recovery explicitly states that no email is sent. Remember me is omitted until real sessions are available.
- `IntroCarousel`: exactly three manually controlled slides, clickable pagination, Previous/Next, wraparound, scoped arrow-key navigation, and polite screen-reader announcements. Decorative art is hidden from assistive technology.

Desktop uses a 55/45 split with the card centered on the right. At 900px and below, a compact text introduction replaces the large artwork and the form sits directly below its controls. The layout allows natural scrolling when forms expand, zoom increases, or the viewport is short; content is never clipped to force a viewport fit.

### Scope and deployment notes

Learning-related visuals are illustrative and upcoming features are labeled. Dashboard, courses, lessons, editing, code execution, progress tracking, and backend authentication remain future milestones. Production hosting must rewrite application routes to `index.html` for direct route navigation.

### Authentication and verification boundary

Valid submissions show an informational message that authentication is not connected. There are no fake accounts, hardcoded credentials, session simulation, dashboard redirects, administrator access, or verification-success states. Only the theme preference is stored; credentials are neither stored nor transmitted. Supabase integration is reserved for a future milestone.

The theme bootstrap runs in the document head before styles and React, restoring the saved theme and browser theme color. Missing, invalid, or inaccessible storage defaults to dark. Decorative layers ignore pointer input; mobile removes large artwork, and reduced motion disables transitions and animations.

### Quality checks

- Dependencies are installed and `npm ls --depth=0` reports a complete tree.
- `npm run typecheck`, `npm test`, and `npm run build` validate types, registration/email validation boundaries, and production compilation.
- A temporary DOM harness exercised carousel pagination and keyboard wraparound, account route switching, validation/error focus, independent password toggles, preview-only submission, loading states, and theme persistence. It also executed the pre-render theme bootstrap with fresh, saved, invalid, and blocked storage. The harness is not a project dependency or retained test suite.
- Small muted text uses a darker semantic token in light mode for contrast; the original muted lavender remains available as a decorative palette token. Icons and artwork are hidden from assistive technology; visible focus and associated labels/hints/errors are retained.
- Full screen-reader testing, touch-device testing, and the complete rendered viewport matrix remain manual checks.

### Responsive verification

Chrome responsive mode was used to inspect the 360px dark and 390px light landing views. The captured views fit horizontally; the 390px check also exercised carousel navigation and the theme toggle. Full-form scrolling and the remaining 768px, 1024px, and 1440px visual checks are still pending: concurrent browser use interrupted the testing session. DOM interaction checks do not substitute for layout verification.

### Milestone 02 — Authentication and security

Connect the existing forms to Supabase for real sign-in, registration, email verification, password recovery, and sign-out. Add session restoration and expiration handling, protected route boundaries, secure administrator authorization enforced beyond the client, and appropriate database access policies for any account data introduced. Keep privileged credentials out of the frontend. Replace preview notices only when genuine backend results are available, and test authentication failures, recovery links, expired sessions, and unauthorized access.

Preserve the shared design system. Dashboard content, courses, lessons, editors, execution, and learning progress remain separate future milestones. Finish the outstanding responsive/accessibility QA before declaring the frontend fully verified.

### Manual verification

- Check the landing page and navigation at mobile, tablet, and desktop widths.
- Toggle light/dark mode and reload to confirm preference persistence.
- Navigate all account routes and the 404 page.
- Submit blank/invalid details; check field messages, focus, and password confirmation.
- Submit valid sample details; confirm the preview notice and cleared form.
- Check keyboard focus, the skip link, theme toggle, and reduced motion.
- Use Previous/Next, pagination buttons, and Left/Right arrow keys while focused in the carousel; confirm wrapping and the `01 / 03` counter.
- Confirm slide 1 remains selected until interaction (there is no autoplay).

---

## ✨ Project Vision

ZCode aims to create a learning environment where programming knowledge can be explored, practiced, and reinforced through hands-on exercises.

Unlike platforms that rely on automatically generated educational content, ZCode's courses and lessons will be **manually created, reviewed, and managed by the platform administrator**.

The goal is to help learners understand programming concepts through explanations, examples, and practical coding challenges.

---

## 🚀 Planned Features

### 🔐 Authentication and User Accounts

- Secure account registration and login
- Email verification and password recovery
- User profile management
- Dark and light mode preferences
- Protected administrator access

### 📊 Personalized Dashboard

- Daily learning streaks
- Completed lesson statistics
- Course progress tracking
- Continue Learning section
- Learning achievements and milestones

### 📚 Interactive Learning System

- Organized programming courses and modules
- Beginner-friendly lessons and code examples
- Winding, gamified learning paths
- Progressive lesson unlocking
- Previously completed lessons remain accessible
- Reading-based and practice-based lesson completion

### 💻 Coding Exercises

- Editable starter code
- Browser-based code editor
- Run Code functionality
- Output and error display
- Automated exercise validation
- Hints and reference solutions
- Saved exercise progress

### 🛡️ Administrator Dashboard

- Secure, administrator-only access
- Create and manage courses
- Publish, edit, and delete lessons
- Create coding exercises and test cases
- Organize learning modules
- Manage content visibility
- Review account-related requests where applicable

### 🎨 User Interface

- Cosmic Midnight Lavender visual theme
- Glassmorphism components
- Dreamy cosmic backgrounds and subtle animations
- Dark and light mode
- Responsive desktop, tablet, and mobile layouts

---

## 🛠️ Technology Stack

ZCode will primarily use the following technologies:

| Technology        | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| **HTML5**         | Website structure and semantic content            |
| **CSS3**          | Styling, responsive layouts, and animations       |
| **JavaScript**    | Interactive website functionality                 |
| **TypeScript**    | Type-safe application development                 |
| **React**         | Component-based user interface                    |
| **Vite**          | Frontend development and build tooling            |
| **Tailwind CSS**  | Utility-based styling and design system           |
| **React Router**  | Client-side page navigation                       |
| **Lucide React**  | Interface icons                                   |
| **Supabase**      | Authentication, database, and file storage        |
| **PostgreSQL**    | Storage of courses, lessons, and learner progress |
| **Monaco Editor** | Interactive code editing interface                |
| **Pyodide**       | Running Python code in the browser                |
| **Git & GitHub**  | Version control and source code management        |
| **Vercel**        | Planned website deployment                        |

---

## 💻 Programming Languages

### Languages Used to Develop ZCode

- **HTML** — Structures the website
- **CSS** — Styles the website and its responsive layouts
- **JavaScript** — Adds interactive functionality
- **TypeScript** — Provides type safety for application development
- **SQL** — Manages structured database operations

### Languages Planned for Interactive Learning

- 🐍 **Python** — Initial programming course and executable code support
- 🟨 **JavaScript** — Future interactive coding support
- ☕ **Java** — Planned educational content; execution support to be determined
- 🔵 **C** — Planned educational content; execution support to be determined
- 🗄️ **SQL** — Future lessons and interactive database exercises

**Python will be the first programming language supported by ZCode's coding execution environment.**

Additional programming languages will be introduced gradually, depending on development requirements and technical feasibility.

---
