# ZCode

### Learn. Practice. Progress.

**ZCode** is an interactive programming learning platform designed to make learning to code engaging, structured, and accessible.

> 🚧 **Project Status:** Milestone 01 UI is implemented. Milestone 02 connects the existing forms to Supabase Auth; live inbox delivery and full browser end-to-end verification are still pending.

## Local development

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm install
npm run dev
```

Keep the existing `.env.local`. New checkouts can copy `.env.example` to `.env.local` and fill in:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Use the project URL and **publishable** key. Never use a service-role or secret key in frontend environment variables. Vite refuses to build or serve when the named key is not a publishable key. Missing configuration shows a clear form error and disables submission. Restart Vite after environment changes. `.env.local` is ignored by Git and was not overwritten during integration.

```sh
npm run typecheck
npm test
npm run build
npm run preview
node scripts/check-auth-settings.mjs
```

The settings check is read-only, prints no credentials, and does not create accounts or send email. Edit `src/` and root `index.html`; `dist/` and `tsconfig.tsbuildinfo` are generated output.

## Supabase project configuration

- **Email provider:** enabled. **Sign-ups:** allowed. **Confirm email:** enabled. These settings were verified against the project's public Auth settings endpoint.
- **Password policy:** 8+ characters, uppercase, lowercase, and a number, confirmed by the project owner. The public settings endpoint does not expose password policy, so it was not independently audited through the management API. There is no known mismatch with the confirmed policy.
- **URL configuration:** the owner confirmed the callback URLs are configured. Allow `http://localhost:5173/auth/callback` and `http://127.0.0.1:5173/auth/callback` if using both origins. Add the equivalent production callback before deployment; use the appropriate application origin for Site URL. Preview on port 4173 also requires that origin's callback to be allowlisted.
- Keep the configured signup/recovery email templates using Supabase's confirmation URL. Email links return to `/auth/callback` and use PKCE. Open links in the same browser and origin where the request began. A missing verifier, used link, expired link, or provider error shows an actionable error rather than a success screen. Callback codes and errors are removed from the address bar after processing.
- Production hosting must rewrite application routes to `index.html`. Confirm SMTP/sender configuration and delivery limits in Supabase before release. The app cannot determine inbox delivery from a successful API response.

## Authentication behavior

- **Registration:** validates the display name, email, password requirements, and exact confirmation; submits `signUp` with `display_name` in user metadata. A confirmation screen says to check email without revealing whether an account already exists. No authenticated UI is granted from a pending registration. A read-only preflight requires Confirm email; an unexpected signup session is signed out and treated as a configuration error.
- **Login:** calls `signInWithPassword`; invalid credentials and unconfirmed email receive a neutral error. Confirmed users go to `/dashboard`, a protected placeholder with their display name, email, and Log Out. Initial session verification blocks protected content; the SDK handles persistence and refresh.
- **Recovery:** calls `resetPasswordForEmail`; the response is conditional about account existence. A successfully exchanged recovery link opens the new-password form. The SDK's `PASSWORD_RECOVERY` event, not a query-string flag, enables this screen.
- **Password update:** uses the same live requirements as registration and calls `updateUser`. Success appears only after Supabase accepts the change. Return to Log In signs out the local recovery session and opens login. Reloading a consumed callback requires a fresh link; passwords are never retained for recovery.
- **Sessions:** one Supabase client and one shared `AuthProvider` handle initialization, refresh, and auth events. Existing sessions are checked with `getUser` before presenting authenticated UI. The SDK persists session tokens and the PKCE verifier in browser storage; the application never persists passwords. The theme preference also uses localStorage.
- **Request safety:** submission locks prevent duplicate requests, buttons and fields are disabled while processing, and server errors are mapped to helpful messages without raw backend details. Password managers, pasting, and long passwords are supported; no maximum password length is imposed by the UI.
- The confirmed frontend policy is centralized in `src/components/auth/password-policy.ts`. Supabase remains authoritative, including any leaked-password or stricter policy enforcement. A server `weak_password` response is shown as a rejection, never success. If the project policy changes, update this module and its tests before treating the UI as aligned.

User metadata is user-editable and must never be used for administrator authorization. A profiles migration with RLS is prepared but not applied to the hosted database. No admin access, full learning dashboard, learning content, or execution features were introduced. Future data access must be protected by server-enforced authorization/RLS; the UI session state alone is not an access-control boundary.

## Routes and architecture

- `/` and `/login` — original carousel and login card
- `/register` — real registration
- `/forgot-password` — recovery email request
- `/auth/callback` — verified email-link handling
- `/reset-password` — password update with a verified recovery session
- `/dashboard` — protected placeholder
- Unmatched routes — custom 404

```text
src/
  components/
    branding/     # Scalable ZCodeLogo
    ui/           # Button, GlassCard, FormInput, ThemeToggle, loading, typography
    landing/      # Three-slide IntroCarousel and CosmicBackground
    auth/         # Existing forms, shared AuthForm, password policy/feedback
    layout/       # Header and Footer
  context/        # ThemeProvider and AuthProvider
  lib/            # Environment validation and single Supabase client
  services/       # Shared auth requests, safe errors, PKCE callback handling
  pages/          # Landing, account, and callback route composition
  styles/         # globals.css: preserved tokens and responsive styling
scripts/          # Read-only Auth settings check
tests/           # Validation, configuration, service, and callback tests
```

The Cosmic Midnight Lavender layout, original carousel, theme toggle, typography, and shared design components remain intact. Only authentication feedback/requirements styling was added. Dark mode remains the default; saved themes apply in the document head before rendering. Light mode retains cosmic gradients and glass surfaces. Reduced-motion preferences are honored. CSS/SVG artwork has no external image dependencies.

## Verification and remaining checks

Automated checks use test doubles for auth requests; they never create live users or send email. Tests cover the configured password boundary and composition, long passwords, confirmation, safe configuration, signup payloads, duplicate-account privacy, unexpected sessions, backend failures, SDK recovery events, and expired/invalid links. Targeted temporary DOM tests cover submission locking/loading, real-time indicators, validation focus, registration confirmation, sign-in failure/success, sign-out, recovery requests, password-update acceptance/rejection, expired callbacks, and a single PKCE exchange under React StrictMode. These temporary UI tests use mocked SDK responses and are not retained as project dependencies.

Live verification completed: environment presence/key classification and the read-only Supabase Auth settings request. **Not yet verified:** creating a real user, email delivery, clicking a real verification/recovery link, and using real credentials end-to-end. Perform those with an email address you control:

1. Register; confirm the card asks you to check email and no signed-in session appears.
2. Open the verification link in the same browser; confirm the account can sign in.
3. Sign out; test wrong credentials, then correct credentials and reload persistence.
4. Request recovery, open the link in the same browser, and save a new compliant password.
5. Test an expired/reused link, rapid submissions, network failure, and server rejection.

Earlier visual checks covered 360px dark and 390px light views. Full-form scrolling, final 768px/1024px/1440px checks, physical touch devices, and full screen-reader verification remain pending because concurrent Chrome use interrupted layout QA. DOM tests do not replace layout testing.

Official references: [Supabase signup](https://supabase.com/docs/reference/javascript/auth-signup), [password security](https://supabase.com/docs/guides/auth/password-security), and [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow).

---

## ✨ Project Vision

ZCode aims to create a learning environment where programming knowledge can be explored, practiced, and reinforced through hands-on exercises.

Unlike platforms that rely on automatically generated educational content, ZCode's courses and lessons will be **manually created, reviewed, and managed by the platform administrator**.

The goal is to help learners understand programming concepts through explanations, examples, and practical coding challenges.

---

## 🚀 Platform Roadmap

### 🔐 Authentication and User Accounts

- Implemented: Supabase account registration and login
- Implemented: Supabase verification callback and password recovery (live inbox testing pending)
- Planned: User profile management
- Implemented: Dark and light mode preferences
- Planned: Server-enforced administrator authorization

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

### Verification, resend, and protected routes

Use the Supabase email template’s `{{ .ConfirmationURL }}` for signup and recovery links. The client uses PKCE, including confirmation resends; open the latest link in the same browser and origin that requested it. This implementation supports confirmation links, not manually entered OTP codes or custom token-hash templates. Invalid/expired links show retry options. Successful confirmation redirects only to `/dashboard`; URL-provided destinations are never used. Recovery links stay in the password-update flow.

Resend is available from login, the registration confirmation screen, and invalid-link screens. It uses a 60-second UI cooldown, increased to five minutes after rate-limit responses; Supabase remains authoritative for rate limits. Responses avoid disclosing account existence.

In Supabase **Authentication → URL Configuration**, set Site URL to the deployed origin and allowlist each exact callback: `http://localhost:5173/auth/callback`, `http://127.0.0.1:5173/auth/callback` when used, and `https://YOUR-DOMAIN/auth/callback` for production. Add the preview origin separately if testing on port 4173. Keep Confirm email enabled. Production hosting must serve `index.html` for client routes such as `/dashboard` and `/auth/callback`.

The dashboard is only a placeholder. Client-side route guards do not authorize database access. Future resources must use Supabase Row Level Security and server-enforced administrator permissions.

Validation for the protected-route extension: TypeScript, production build, and 24 unit tests pass. Additional temporary jsdom integration checks with a mocked SDK covered initial loading protection, anonymous/invalid-session redirects, persisted-session startup, duplicate auth-event suppression, subscription cleanup, login/logout, and recovery callbacks. These are not live Supabase end-to-end tests. Inbox delivery, the project's actual email template, and production redirect configuration require live verification; no test accounts or emails were created. No new browser visual inspection was completed for this extension.

### Password recovery and profiles

Forgot Password calls Supabase and shows a neutral inbox message only after an accepted request. Unexpected failures and rate limits remain errors. The existing `/auth/callback` allowlist remains the email destination; an SDK-verified recovery callback routes internally to `/reset-password`. No additional email redirect allowlist entry is required for that internal route. Host SPA rewrites must also cover `/reset-password`.

The reset page reuses the existing glass card, theme, password visibility controls, and live checklist (8+ characters, uppercase, lowercase, number). It requires recovery intent established by the SDK, then revalidates the current user with Supabase before `updateUser`. A normal login or URL flag cannot enable this UI. After saving, **Return to Log In** signs out the local recovery session before navigating to login; failed sign-out remains actionable. Recovery intent is intentionally held only in memory: reloading the reset page requires a fresh recovery link instead of trusting a persistent client flag. Supabase remains authoritative for session validity and password policy.

The dashboard now retrieves `profiles.display_name`. The profile migration is **prepared, not applied to the hosted project**. See [database setup and administrator strategy](supabase/README.md) for inspection, migration, RLS checks, and secure future single-administrator assignment. Credentials in `.env.local` are unchanged.

Recovery/profile extension checks: TypeScript, production build, and 24 unit tests pass. Mocked DOM tests cover recovery routing, server password rejection, successful save, return-to-login sign-out, and expired callbacks. The SQL migration and `supabase/tests/profiles.sql` passed in a temporary PGlite PostgreSQL-compatible database with a minimal Auth schema, including backfill, trigger creation, row isolation, column restrictions, anonymous denial, and the existing-table guard. Hosted Supabase RLS, real email links, and new browser visual checks remain unverified.

### Milestone 02 final security review

- No application password/token logging, custom token persistence, plaintext password storage, administrator credentials, or editable role assignment was found in the source review. The Supabase SDK owns session storage; an XSS vulnerability could still expose browser-held sessions. Keep dependencies patched and configure a deployment-specific Content Security Policy without breaking the existing fonts/styles.
- Callback processing ignores user-supplied destinations; navigation uses fixed application routes. Use exact production callback allowlists, HTTPS, and the correct Site URL. Avoid broad production wildcards. Never cache personalized authenticated responses in a shared cache.
- RLS stays enabled. Authenticated clients can select their own profile and update only their own display name. Trigger functions are not client-callable. Auth signup needs the narrowly scoped owner-run `SECURITY DEFINER` trigger; see the [trigger audit and existing-installation repair instructions](supabase/README.md#trigger-security-audit).
- Local Log Out clears this browser's SDK session. It does not promise immediate revocation of previously issued access tokens or logout on every device. Recovery UI checks are not a server-side restriction on Supabase's normal authenticated password-change API. Future privileged operations require database/server authorization.
- Live public Auth settings were rechecked: email enabled, confirmation required, signups enabled. An existing signed-in dashboard was observed, but concurrent Chrome activity interrupted controlled reload and visual testing. This does not verify signup, email delivery, token refresh, or persisted login end-to-end.
- Final automated coverage includes registration/login/reset validation, password visibility controls, dark/light switching and stored preference, pending/duplicate submissions, mocked login/logout, guarded initial loads, mocked persisted/invalid sessions, callback failures, recovery updates, and subscription cleanup. The SQL test now exercises signup as an Auth-like role as well as RLS/column privileges. Browser mobile/desktop layout checks remain incomplete; CSS was reviewed, but that is not a visual pass at 360/390/768/1024/1440px.

Before declaring production authentication verified, use an owned test inbox to complete signup → delivered confirmation → login → reload → logout, then delivered recovery → password update → login with the new password. Check resend cooldown/server throttling, expired/used links, and fresh browser sessions. Confirm actual email templates use `{{ .ConfirmationURL }}`, SMTP delivery, production redirects, the configured password policy, and hosted profiles/RLS/trigger behavior. No controlled live account creation, email send, or password change was performed by this implementation session. The hosted migration state has not been inspected or changed by the agent.
