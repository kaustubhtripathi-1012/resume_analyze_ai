# Frontend Guidelines

## Folder layout
```
frontend/src/
  api/          # axios instance + one file per resource
  components/   # reusable UI (Button, Card, Table, Modal, Toast)
  features/     # auth, resume, analysis, jobs, recruiter, admin
  hooks/        # custom hooks (useAuth, usePagination)
  layouts/      # AuthLayout, DashboardLayout
  pages/        # route-level components
  routes/       # route table + ProtectedRoute
  store/        # global state
  utils/        # formatters, validators
```

## Component conventions
- Functional components with hooks only; one component per file; max ~150 lines.
- Props validated with TypeScript interfaces. Keep presentational and data-fetching components separate.
- No inline styles; use Tailwind utility classes and design tokens from 10_DESIGN_SYSTEM.md.

## State management
- Server state: TanStack Query (caching, retries, invalidation).
- Client/global state (auth user, theme): Zustand. Local UI state: `useState`.
- Access token held in memory only; refresh token is an httpOnly cookie.

## Naming rules
- Components/pages `PascalCase.tsx`; hooks `useCamelCase.ts`; utils `camelCase.ts`.
- API functions `verbResource` (e.g. `fetchReports`). CSS classes via Tailwind only.

## Accessibility and responsiveness
- Mobile-first breakpoints (sm 640, md 768, lg 1024, xl 1280).
- Semantic HTML, labelled inputs, visible focus ring, keyboard-operable modals, WCAG AA contrast.
- Every async view has loading, empty and error states. Charts have text summaries.
