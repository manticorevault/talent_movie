# Track 1: Setup & Configuration

## Objective

Initialize the production-grade React application with Vite, TypeScript, Tailwind CSS, shadcn/ui, and establish the Feature-Sliced Design (FSD) architecture.

## Tasks

1. **Initialize Project**
   - Setup project with Vite + React + TypeScript (v5+, strict mode).
   - Configure path aliases for FSD (`@app`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`) in `tsconfig.json` and `vite.config.ts`.
   - Setup ESLint. Crucially, install and configure `eslint-plugin-boundaries` to enforce FSD cross-layer violations strictly from Day 1.
   - Setup Prettier. Hardcode the requested rules: `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`.
   - Setup Husky + lint-staged early for code quality.

2. **UI Toolkit & Styling**
   - Install and configure Tailwind CSS v3.
   - Run `npx shadcn-ui@latest init` (configured to install components in `shared/ui`).
   - Configure `components.json` to map `aliases.components` to `@shared/ui` and `aliases.utils` to `@shared/lib/utils`.
   - Install required shadcn components: `button`, `badge`, `skeleton`, `input`, `select`, `slider`, `dialog`, `separator`, `tooltip`, `popover`, `command`, `scroll-area`, `table`.
   - Setup dark mode. Install `next-themes` explicitly for theme management.

3. **Core Dependencies**
   - Install Redux Toolkit (`@reduxjs/toolkit`, `react-redux`).
   - Install TanStack Router, Table, and Virtual.
   - Install `lucide-react` for icons and `zod` for validation.

4. **Testing Infrastructure**
   - Configure Vitest (`vitest.config.ts`, `vitest.setup.ts`) with a `renderWithProviders` helper in `shared/lib/test-utils.tsx`.
   - Setup Playwright (`playwright.config.ts`) and create Page Object Models.

## Acceptance Criteria

- [ ] React app boots locally without errors.
- [ ] Path aliases work correctly.
- [ ] UI libraries are installed, `components.json` relies on custom `@shared` paths, and a `shadcn/ui` generic testing component renders successfully.
- [ ] FSD architecture is protected by structural linters.
- [ ] Testing framework setup is verified with a dummy test.
