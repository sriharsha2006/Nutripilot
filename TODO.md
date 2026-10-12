# NutriPilot TODOs

### Phase 1: Core Structure & Authentication
- [x] Initialize `shadcn/ui` default components
- [x] Setup `src/lib/api/` structure for central API fetching
- [x] Create base generic layout and navbar (Mobile & Desktop)
- [x] Setup JWT HttpOnly cookie handling structure
- [x] Implement `src/app/(auth)/login/page.tsx`
- [x] Implement `src/app/(auth)/register/page.tsx`

### Phase 2: Onboarding & Profile Setup
- [x] Implement `src/app/onboarding/page.tsx` multi-step wizard
- [x] Implement `src/app/profile/page.tsx`
- [x] Connect onboarding flows to mock API layer

### Phase 3: Dashboard & Meal Planner
- [x] Implement `src/app/dashboard/page.tsx`
- [x] Implement `src/app/planner/page.tsx`
- [x] Implement interactive drag-and-drop Planner UI
- [x] Create meal card component with refresh/lock/swap actions

### Phase 4: Pantry & Grocery Management
- [x] Implement `src/app/pantry/page.tsx`
- [x] Implement `src/app/grocery/page.tsx`
- [x] Build UI for pantry subtraction and expiry tracking

### Phase 5: Tracking & Analytics
- [x] Implement `src/app/tracking/page.tsx`
- [x] Implement `src/app/progress/page.tsx` with Recharts

### Phase 6: Reports & Exports
- [x] Implement `src/app/reports/page.tsx`
- [x] Implement PDF preview modal

### Phase 7: Recommendations & Food Bank
- [x] Implement `src/app/recommendations/page.tsx`
- [x] Implement `src/app/recipes/page.tsx` with custom recipe creation

### Phase 8: Settings & User Management
- [x] Implement `src/app/settings/page.tsx`

### Testing
- [x] Setup Vitest/Jest for unit tests
- [x] Setup Playwright for critical E2E flows
