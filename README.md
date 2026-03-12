# 🎬 Talent Movie Explorer

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)](https://redux.js.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A production-grade, highly scalable single-page application built to explore movies using the TMDB API. Engineered with a strict adherence to **Feature-Sliced Design (FSD)**, this project serves as a showcase of senior-level frontend architecture, state management patterns, and performance optimizations.

---

## 🏗 Architecture & Design Patterns

The codebase is strictly structured following the [Feature-Sliced Design (FSD)](https://feature-sliced.design/) methodology. FSD enforces unidirectional dependencies, ensuring that lower layers (e.g., `shared`, `entities`) never import from higher layers (e.g., `features`, `pages`). This prevents circular dependencies and highly decouples the UI components from business logic.

### Dependency Flow

```mermaid
graph TD
    App[📱 App Layer] --> Pages[📄 Pages Layer]
    App --> Shared[🛠 Shared Layer]
    Pages --> Widgets[🧩 Widgets Layer]
    Pages --> Features[⚡ Features Layer]
    Pages --> Entities[🧱 Entities Layer]
    Pages --> Shared
    Widgets --> Features
    Widgets --> Entities
    Widgets --> Shared
    Features --> Entities
    Features --> Shared
    Entities --> Shared

    style App fill:#312e81,stroke:#4f46e5,color:#fff
    style Pages fill:#1e3a8a,stroke:#3b82f6,color:#fff
    style Widgets fill:#14532d,stroke:#22c55e,color:#fff
    style Features fill:#701a75,stroke:#d946ef,color:#fff
    style Entities fill:#7f1d1d,stroke:#ef4444,color:#fff
    style Shared fill:#3f3f46,stroke:#a1a1aa,color:#fff
```

### Layer Breakdown

- **`app/`**: Application-wide configurations, routing root (`RouterProvider`), and global providers (`StoreProvider`).
- **`pages/`**: Thin composition layers that orchestrate widgets and features to form complete views (`/movies`, `/movies/:id`, `/favorites`).
- **`widgets/`**: Complex UI blocks combining multiple features and entities (e.g., `MovieTable`, `MovieDetailPanel`).
- **`features/`**: User-facing interactions and domain-specific logic (e.g., `movie-search`, `movie-sort`, `favorites` slices).
- **`entities/`**: Core business entities and RTK Query API definitions (`movieApi.ts`).
- **`shared/`**: Zero-dependency UI primitives (using `shadcn/ui`), hooks, and utilities.

---

## ⚡ State Management & Trade-offs

A fundamental architectural decision in this project is treating the **URL as the single source of truth** for table state constraints.

### The URL Sync Pattern

By keeping search queries, active filters, sorting preferences, and pagination stored exclusively in URL query parameters, we ensure the app remains fully shareable, bookmarkable, and resilient to page reloads.

- **URL params validate** strictly through **Zod** using TanStack Router.
- **Redux (`sortSlice`, `filtersSlice`)** serves strictly as an in-memory projection populated _from_ the URL. We never blindly push local Redux state to the URL to avoid vicious infinite sync cycles.
- **Client-Side Persistence:** The `favoritesSlice` writes directly to `localStorage` via RTK middleware. Hydration occurs transparently on startup.

### API Orchestration: Search vs. Discover

TMDB provides two separate endpoints: one strictly for text searching (`/search/movie`) and one for filtering (`/discover/movie`). We created a dual-query hook architecture inside `features/movie-search/model/useMovieSearch.ts` using RTK Query's `skip` boolean feature:

```mermaid
sequenceDiagram
    participant UI as MovieTable / UI
    participant Hook as useMovieSearch
    participant Search as API: /search/movie
    participant Discover as API: /discover/movie

    UI->>Hook: React renders with URL params
    alt text query provides "?q=Inception"
        Hook->>Search: Trigger Search endpoint
        Hook-->>Discover: Skip request
    else no text query
        Hook-->>Search: Skip request
        Hook->>Discover: Trigger Discover endpoint with ?genres=28
    end
    Hook-->>UI: Return unified response
```

_Trade-off_: Disabling sorting and filtering entirely during a text search provides a seamless, unconfusing UX while adhering strictly to TMDB's parameter limits.

---

## 🚀 Performance Optimizations

1. **Virtualization**: The `MovieTable` renders thousands of rows effortlessly by implementing **TanStack Virtual**. Only the visible DOM nodes are rendered. We mitigated native table structure limitations by using dynamic top/bottom whitespace `<tr>` spacer paddings.
2. **Debounced Interactions**: Inputs trigger updates instantly locally but are pushed to the URL search parameters within a `startTransition` and a `300ms` debounce, prioritizing the application responsiveness and avoiding layout thrash queues.
3. **Optimized Caching**: Using `RTK Query` with aggressive `keepUnusedDataFor` cache invalidations minimizes repetitive network calls when jumping between table pages and the movie details screen.
4. **Lazy Asset Loading**: Poster images use native `loading="lazy"` interlaced with a visual fallback handled by `shadcn Skeleton` segments while fetching images.

---

## 🧪 Testing Suites

A strict TDD mindset supports the application's overall stability.

- **Unit & Integration (Vitest + React Testing Library)**: Tests ensure state transitions react accurately. Virtual DOM testing includes specialized mock wrappers (`renderWithProviders`) that stub out global context (Router, RTK store memory history) seamlessly for isolated logic execution.
- **End-to-End (Playwright)**: Browser-level automation runs against mocked interactions targeting `data-testid` values. The CI environment relies heavily solely upon these E2E checks to guarantee critical user paths (Search -> Filter -> Sort -> Favorite).

---

## 🛠 Local Setup & Installation

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x

### Steps

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd talent_movie
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Environment Setup:**
   Duplicate the template environment file and add your TMDB API read access token.

   ```bash
   cp .env.example .env
   # Edit .env and supply VITE_TMDB_API_KEY
   ```

4. **Run the local development server:**
   ```bash
   npm run dev
   ```

### Operational Commands

| Command            | Action                                                    |
| ------------------ | --------------------------------------------------------- |
| `npm run dev`      | Spins up the Vite hot-reloading dev server.               |
| `npm run test`     | Sweeps through Vitest unit suites in watch mode.          |
| `npm run test:e2e` | Headless execution of Playwright test suites.             |
| `npm run lint`     | Fires ESLint across `.ts`/`.tsx` ignoring vendor code.    |
| `npm run build`    | Transpiles TS and bundles via Vite for production output. |

---

## 👨‍💻 Project Guidelines

When committing changes, ensure compliance with the repository constraints:

- Work strictly off tracked items outlined in `plan.md`.
- Ensure changes pass the internal FSD import threshold (guarded by `eslint-plugin-boundaries`).
- Commit using standard Conventional Commits principles (e.g., `feat(ui): add search debounce`).

_Detailed developer procedures map directly back back to `conductor/workflow.md`._
