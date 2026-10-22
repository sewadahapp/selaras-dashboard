# Selaras Dashboard Starter

A Nuxt **4.6** dashboard starter using **Selaras**, **TanStack Charts**, and **Tiptap**. Ready-made application screens, editable demo data, and a small codebase to make your own. Use npm, pnpm, Yarn, or Bun to install and run it.

Built entirely against the published `@sewadah/selaras` package, with no workspace links or private library imports.

## Quick start

Scaffold a new project from this template. Nuxt will ask where to create it:

```sh
npm create nuxt@latest -- -t github:sewadahapp/selaras-dashboard
```

In the new project, install dependencies and start the dev server with your preferred package manager. For example, use `npm install` / `npm run dev`, `pnpm install` / `pnpm dev`, `yarn` / `yarn dev`, or `bun install` / `bun run dev`. Open `http://localhost:3000`.

## Develop this repository

Use a runtime supported by Nuxt. Node.js 24 is the contributor and CI default (`.nvmrc`); Bun also works. This repository includes `bun.lock`, but `package.json` does not pin a package manager or runtime. Choose npm, pnpm, Yarn, or Bun and use its install and script commands. If you use npm, pnpm, or Yarn, keep the lockfile that manager generates.

```sh
npm install
npm run dev
```

With pnpm, Yarn, or Bun, use `pnpm install` / `pnpm dev`, `yarn` / `yarn dev`, or `bun install` / `bun run dev`.

## Included screens

| Route                     | Screen                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| `/`                       | Overview, live customer counts, sample revenue chart, recent customers                          |
| `/analytics`              | TanStack area, line, and bar charts; period controls; accessible data tables                    |
| `/customers`              | Selaras table, URL filters/sorting/page, column visibility, selection, bulk delete/export, CRUD |
| `/editor`                 | Tiptap rich text editor, formatting toolbar, read-only mode, saved drafts, JSON export          |
| `/settings`               | Workspace profile and demo reset                                                                |
| `/settings/appearance`    | System/light/dark preference and theme preview                                                  |
| `/settings/members`       | Search, role changes, local invitations, removal, pagination, last-owner protection             |
| `/settings/notifications` | Saved notification preferences                                                                  |
| `/settings/security`      | Validated password form preview and two-factor integration placeholder                          |
| `/login`                  | Login form with validation and password visibility                                              |
| `/register`               | Registration form with validation                                                               |
| `/forgot-password`        | Password recovery form and confirmation screen                                                  |
| Any missing route         | Themed error page                                                                               |

The shell uses Selaras's `DashboardGroup`, `DashboardSidebar`, `DashboardResizeHandle`, `DashboardPanel`, `DashboardNavbar`, and `DashboardSidebarToggle`, with `NavigationMenu` for the links. Collapse/expand uses the library's built-in transition; drag or keyboard-resize the divider to adjust the sidebar from 200–400 px. The default is 260 px, with a 64 px collapsed rail. A cookie remembers width and collapse state across reloads. Below 768 px the same sidebar becomes a drawer. Light/dark appearance and screen search (`Cmd/Ctrl K`) are included.

Dashboard routes contain the shell within the viewport and scroll inside the main panel, keeping the navbar and sidebar stationary. The default layout applies a scoped `dashboard-page` class to the document; authentication routes release that class and retain normal page scrolling.

Screen search uses Selaras's `SCommandPalette` and `useCommandPalette()`: workspace and authentication groups, fuzzy search, arrow-key navigation, Enter to select, and Escape to dismiss. Its built-in `Cmd/Ctrl K` binding owns the shortcut. The palette uses the library's default compact layout and keyboard hints.

The sidebar's workspace selector and account menu use `SDropdown`. The selector lists the current workspace and links to its settings; this starter includes one demo workspace. The account menu links to Login and Register and contains the `SColorModeSwitch`. The sidebar footer links to Selaras's component documentation. The Editor navigation item carries a small "New" badge while the sidebar is expanded.

## Demo behavior and integration points

Authentication screens are **UI demonstrations**. They validate input and open the public demo dashboard. They do not authenticate a user, create an account, send recovery emails, or protect routes. Passwords are never persisted. Replace `AuthScreen.vue`'s `submit` with your auth provider and add server-enforced authorization when connecting real data.

Customers, members, and workspace settings persist in this browser under `selaras-dashboard:v1`. Existing saved workspaces without members load unchanged and receive the demo team. The editor saves separately under `selaras-dashboard:document:v1`, when you click **Save draft**. The settings reset replaces customers, members, and settings while preserving your document.

`SToast` reports successful saves, deletes, invitations, and exports. Persistent `SAlert` banners explain storage failures and offer retry actions. Unreadable saved data is not overwritten by subsequent saves: retry loading it or explicitly confirm a demo reset. `SSkeleton` placeholders cover browser storage initialization without artificial loading delays.

Members and Security are local demonstrations. Invitations send no email, member roles do not authorize access, and security previews do not change credentials. The last active owner cannot be removed or demoted; a pending owner invitation does not count as an active owner. Connect your own services at these boundaries.

Charts use deterministic sample revenue/visitor data from `shared/utils/analytics.ts`. The overview's customer counts reflect actual demo edits. Notification preferences are local examples; no emails are sent.

The editor stores Tiptap JSON and renders it through Tiptap, without using `v-html`. If you add HTML publishing, handle validation and sanitization at that boundary.

## Customize

- Change the product name in `app/app.config.ts`, workspace defaults in `shared/utils/workspace.ts`, and demo members in `app/data/members.ts`.
- Edit routes and navigation in `app/pages/` and `app/layouts/default.vue`.
- Set sidebar width limits on `SDashboardSidebar` in the default layout. `SDashboardGroup`'s `auto-save-id` identifies the layout cookie; change it to start with fresh layout preferences. Omit `v-model:collapsed` to retain the composite's automatic persistence.
- Theme with `app/assets/css/main.css` and Selaras tokens. The three imports at its top are required, in that order.
- Keep one `SApp` provider in `app/app.vue`.
- Keep one `SToast` renderer inside `ClientOnly` under that provider.
- Settings sections and command-palette entries use `app/data/settings.ts`.
- Settings use `STabs` with a computed model derived from the route. Activating a tab navigates to its URL; deep links, reloads, and browser history select the matching tab. The active tab panel contains the nested `NuxtPage`, and the tab strip uses Selaras's built-in overflow scrolling.
- Nuxt's prerender configuration includes the settings URLs from that same section list, so static hosting supports direct links even though the tabs render buttons.
- Icons use the locally installed Hugeicons collection. `nuxt.config.ts` scans the app into the client bundle and explicitly includes dynamically chosen Selaras icons, so static output needs no icon requests.
- Replace local demo persistence in `useDashboard.ts` with your API. The validation helpers remain reusable.
- Reuse `DashboardChart.vue` with `{ label, value }[]` for area, line, or bar charts. It uses `@tanstack/charts/vue` directly and includes a readable data table.
- Add Tiptap extensions or toolbar actions in `RichTextEditor.client.vue`. It loads only on the editor screen and only in the browser.

The editor adapts the [Selaras Tiptap block](https://selarasui.my.id/blocks/editors/tiptap): `SToolbar`, `SToolbarToggleGroup`, `SToolbarButton`, and `SToolbarSeparator` provide keyboard navigation and selection-aware formatting. It includes bold/italic/underline, heading, bullet list, a validated link dialog, undo/redo, placeholder text, a read-only switch, Reset content, and an escaped HTML output view. JSON draft persistence and export remain the starter's data contract. Reset content restores the sample document body and stays unsaved until **Save draft** is clicked.

Placeholder uses Tiptap's public `@tiptap/extensions/placeholder` entry, declared as a direct dependency. It supplies the same extension as the block's `@tiptap/extension-placeholder` wrapper.

Customer tables use `STable` and declarative `SColumn` slots, with `SAvatar`, `SBadge`, `SCheckbox`, and `SDropdown` cells. Customer and member pagination both use `SPagination`. The customer table uses documented manual sorting/pagination because its URL-driven view supplies the processed rows. Selection is keyed by customer ID, survives page/sort changes, and clears when search/status changes. The select-all checkbox selects the current page; bulk actions include selected rows across pages. Exports retain the shared CSV formula protection.

## Commands

```sh
npm run dev          # Development
npm run lint         # Nuxt ESLint
npm run typecheck    # Nuxt and Vue types
npm run build        # Production SSR build
npm run test:e2e     # Playwright against the production build
npm run preview      # Preview production output
npm run generate     # Static output in .output/public
```

Use your package manager's equivalent `run` syntax for these scripts. The `test` and `check` scripts use Bun's unit-test runner, so those two scripts require Bun (`bun run test` and `bun run check`).

For browser tests, install Chromium once, then build and test:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

If you use pnpm, Yarn, or Bun, run Playwright's install command and the build/test scripts through that manager. Playwright exercises desktop and mobile Chromium. CI uses `bun install --frozen-lockfile`, installs browser system dependencies, and runs the same checks.

## Deploy and share

For a Node deployment, run `npm run build`, then `node .output/server/index.mjs`. Set `NITRO_HOST` and `NITRO_PORT` as needed. Static hosting uses `npm run generate` and `.output/public`; verify your host's route fallback and 404 handling before publishing. Replace `npm run` with your chosen package manager's script command if needed.

## References

- [Selaras](https://github.com/sewadahapp/selaras) and [Selaras Blog](https://github.com/sewadahapp/selaras-blog): library integration and Bun conventions.
- [Nuxt UI Dashboard](https://github.com/nuxt-ui-templates/dashboard) and [Nuxt Shadcn Dashboard](https://github.com/dianprata/nuxt-shadcn-dashboard): scope and screen references. This implementation uses Selaras; neither UI library is installed.
- [TanStack Charts installation](https://tanstack.com/charts/latest/docs/installation) and [Nuxt UI's Vue chart integration](https://github.com/nuxt/ui/blob/v4/src/runtime/components/Chart.vue): chart APIs.
- [Tiptap's Nuxt guide](https://tiptap.dev/docs/editor/getting-started/install/nuxt): editor integration.

MIT licensed. See [LICENSE](LICENSE).
