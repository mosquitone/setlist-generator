# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based setlist generator application for music bands. Users can create, edit, and share setlists with QR codes and downloadable images. The app is deployed on Vercel with serverless API functions.

## Development Commands

### Core Development
- **Start development server**: `pnpm start` (runs Vite dev server)
- **Local development with Vercel**: `pnpm develop` (loads `.env.local` and runs `vercel dev`)
- **Build for production**: `pnpm build` (outputs to `/build` directory)
- **Install dependencies**: `pnpm install`

### Testing Commands
- **Unit tests**: `pnpm test` (interactive), `pnpm test:run` (once), `pnpm test:coverage` (with coverage)
- **E2E tests**: `pnpm test:e2e` (all browsers), `pnpm test:e2e:chromium` (Chromium only), `pnpm test:e2e:headed` (visible browser)
- **Combined testing**: `pnpm test:all` (unit + E2E), `pnpm test:ci` (CI/CD optimized)
- **Coverage reports**: Generated in `/test/coverage/` with HTML, JSON, and text formats

## Environment Setup

- **Package Manager**: pnpm (configured via corepack)
- **Environment Variables**: Use `.env.local` for local development (auto-loaded by `pnpm develop`)
- **Required Environment Variables**:
  - `KV_REST_API_URL`: Vercel KV database URL
  - `KV_REST_API_TOKEN`: Vercel KV access token
  - `KV_REST_API_READ_ONLY_TOKEN`: Vercel KV read-only token

## Architecture Overview

### Frontend Architecture
- **Framework**: React 18.3.1 with TypeScript
- **Routing**: React Router DOM v7 with route-based code splitting
- **State Management**: Context API with `SetlistManager` class for API calls and localStorage for client-side persistence
- **UI Framework**: Semantic UI React (compatible with React 18, not React 19)
- **Forms**: Formik + Yup validation with auto-save to localStorage
- **Build System**: Vite 6.3.5

### Backend Architecture
- **API**: Vercel serverless function at `/api/setlist.ts`
- **Database**: Vercel KV (Redis-compatible key-value store)
- **API Operations**: GET (single/multiple), POST (create), PUT (update)
- **Data Storage**: Hash sets in KV store with UUID keys

### Key Application Features
1. **Setlist Management**: Create, update, view setlists with band info and song lists
2. **Themes**: Four display themes - "mqtn" (mosquitone), "basic", "minimal", and "mqtn2" (mosquitone 2.0)
3. **QR Codes**: Auto-generated QR codes for sharing setlists
4. **Image Export**: html2canvas integration for downloading setlist images
5. **History Tracking**: localStorage-based history of created setlists
6. **Form Persistence**: Auto-saves form data to prevent data loss
7. **Debug Mode**: Development-only debug functionality for theme testing

## File Structure & Key Components

### Core Files
- `src/client.ts`: SetlistManager class (API client) and React context provider
- `src/model.ts`: TypeScript types and Yup validation schemas
- `src/page.tsx`: All page components (Home, Create, Update, Show, NotFound)
- `src/component.tsx`: Setlist display components (MQTNSetlist, BasicSetlist, MinimalSetlist, Mqtn2Setlist)
- `api/setlist.ts`: Vercel serverless API endpoint

### Test Files
- `test/unit/setlist-manager.test.ts`: SetlistManager API client tests (8 tests)
- `test/unit/setlist-components.test.tsx`: React component rendering tests (13 tests)
- `test/unit/schema-validation.test.ts`: Yup schema validation tests (11 tests)
- `test/api/setlist-endpoints.test.ts`: Vercel API endpoint tests (8 tests)
- `test/e2e/setlist-creation-workflow.spec.ts`: Complete user workflow tests (5 tests)
- `test/unit/unit-setup/setup.ts`: Test environment configuration

### Data Models
```typescript
// Setlist structure
{
  meta: { createDate: string, version: string },
  band: { name: string },
  event: { name: string, date?: string, openTime?: string, startTime?: string },
  playings: Array<{ _id: string, title: string, note: string }>,
  theme: "mqtn" | "basic" | "minimal" | "mqtn2"
}
```

### API Endpoints
- `GET /api/setlist?id=uuid`: Fetch setlist(s) by ID
- `POST /api/setlist`: Create new setlist (returns UUID)
- `PUT /api/setlist?id=uuid`: Update existing setlist

## Important Dependencies

### UI & Forms
- `semantic-ui-react@2.1.5`: UI components (React 18 compatible only)
- `formik@2.4.6`: Form state management
- `yup@1.6.1`: Schema validation

### Utilities
- `html2canvas@1.4.1`: Screenshot generation for image export
- `qrcode@1.5.4`: QR code generation
- `react-router-dom@7.6.2`: Latest version with new data APIs

### Build & Development
- `vite@6.3.5`: Build tool and dev server
- `@vitejs/plugin-react@4.5.2`: React plugin for Vite
- `typescript@5.8.3`: TypeScript compiler

### Testing Framework
- `vitest@3.2.4`: Fast unit test runner with Vite integration
- `@testing-library/react@16.2.0`: React testing utilities
- `@testing-library/jest-dom@6.6.3`: Custom Jest matchers for DOM testing
- `@playwright/test@1.53.0`: E2E testing framework with multi-browser support
- `jsdom@26.0.5`: DOM implementation for unit tests

## Development Notes

### React Version Compatibility
- **Must use React 18.3.1**: semantic-ui-react is not compatible with React 19 (uses deprecated ReactDOM.findDOMNode)
- Security overrides in package.json ensure vulnerable dependencies are updated via pnpm overrides

### State Management Pattern
- `SetlistManager` class handles all API operations and localStorage
- Context provider wraps the app for global access
- Local component state for UI interactions
- Form state managed by Formik with Yup validation

### Image Generation Flow
1. Create temporary DOM element with setlist component
2. Render using ReactDOM.createRoot
3. Capture with html2canvas
4. Generate download link
5. Clean up temporary DOM

### localStorage Usage
- Form auto-save: `SetlistManager-${formId}`
- History tracking: `SetlistManager-history`
- Persistent across browser sessions

### Deployment
- **Platform**: Vercel
- **Build Command**: `pnpm build`
- **API Routes**: `/api/*` directory structure
- **Environment**: Production variables set in Vercel dashboard

## Code Patterns

### API Client Pattern
```typescript
// SetlistManager class methods
await manager.get(id)           // Get single setlist
await manager.getAll([ids])     // Get multiple setlists
await manager.create(value)     // Create new setlist
await manager.update(id, value) // Update existing setlist
```

### Form Pattern with Auto-save
```typescript
// Formik integration with localStorage persistence
<Formik
  initialValues={savedValues || defaultValues}
  validationSchema={SetListSchema}
  onSubmit={handleSubmit}
  enableReinitialize
/>
```

### Component Theme Pattern
```typescript
// Theme-aware component rendering
switch (theme) {
  case "mqtn": return <MQTNSetlist />;
  case "basic": return <BasicSetlist />;
  case "minimal": return <MinimalSetlist />;
  case "mqtn2": return <Mqtn2Setlist />;
}
```

## Theme Specifications

### mqtn2 (Mosquitone 2.0) Theme
- **Design Philosophy**: Modern dark theme with glassmorphism effects
- **Background**: Dark gradient (black to navy blue)
- **Typography**: Dynamic font sizing based on song count (up to 3.5rem for short setlists)
- **Layout**: A4-optimized with flex-based height distribution
- **Visual Effects**: Subtle background patterns, backdrop blur, text shadows
- **Logo Integration**: Mosquitone white logo with drop shadow
- **Accessibility**: High contrast text on dark background for low-light environments

### Debug Mode
- **Availability**: Development environment only (`import.meta.env.DEV`)
- **Functionality**: Live DOM preview of setlist components before image generation
- **Usage**: Toggle via Debug button in show page menu
- **Scaling**: 0.8x scale for optimal viewing in browser

## Testing Strategy

### Test Coverage Overview
- **Total Tests**: 45 tests (40 unit + 5 E2E)
- **Coverage Target**: 80% minimum across branches, functions, lines, statements
- **Test Types**: Unit tests, API tests, component tests, E2E workflow tests

### Unit Testing Approach
1. **API Client Testing** (`setlist-manager.test.ts`): 
   - SetlistManager class methods (get, getAll, create, update)
   - localStorage history management
   - Error handling and edge cases

2. **Component Testing** (`setlist-components.test.tsx`):
   - React component rendering across all themes
   - Dynamic font sizing based on song count
   - QR code display and image generation mocking
   - Theme switching and responsive behavior

3. **Schema Validation Testing** (`schema-validation.test.ts`):
   - Yup schema validation for all form fields
   - Type inference and default value handling
   - Error cases and edge conditions

4. **API Endpoint Testing** (`setlist-endpoints.test.ts`):
   - Vercel serverless function CRUD operations
   - Mock @vercel/kv interactions
   - HTTP status codes and response formats

### E2E Testing Approach
**Workflow Testing** (`setlist-creation-workflow.spec.ts`):
- Complete user journey from form input to success page
- Form validation with error handling
- Multi-song addition and removal
- Theme dropdown interactions
- Image generation and display verification

### Testing Environment Configuration

#### Unit Tests (Vitest)
- **Runtime**: jsdom environment for DOM simulation
- **Mocking**: VI.mock for external dependencies
- **Setup**: @testing-library/jest-dom matchers
- **Coverage**: V8 provider with HTML/JSON reports

#### E2E Tests (Playwright)
- **Browsers**: Chromium, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Mode**: Headed for development (html2canvas compatibility), headless for CI
- **Mocking**: Route interception for API calls
- **Timeouts**: Extended timeouts (30s) for image generation processes
- **Artifacts**: Screenshots, traces, and HTML reports on failure

### Testing Considerations

#### Image Generation Testing
- **Challenge**: html2canvas requires full DOM and Canvas API support
- **Solution**: Headed browser mode for reliable image generation
- **Waiting Strategy**: Multi-step verification:
  1. Wait for loader removal
  2. Verify blob URL generation
  3. Confirm browser image loading with `img.complete` and `img.naturalWidth`

#### API Mocking Strategy
- **Unit Tests**: Mock fetch and external dependencies
- **E2E Tests**: Playwright route interception with realistic responses
- **Data Consistency**: Ensure mock data matches actual API structure

#### CI/CD Integration
- **GitHub Actions**: Automated testing on push/PR
- **Coverage Reporting**: Codecov integration
- **Artifact Management**: Test reports and failure screenshots
- **Browser Support**: Chromium for CI, all browsers for local development

### Maintenance Guidelines
1. **Test Naming**: Semantic file names reflecting test purpose
2. **Test Organization**: Logical grouping by feature/layer
3. **Mock Management**: Keep mocks in sync with actual implementations
4. **Performance Monitoring**: Track test execution times
5. **Coverage Goals**: Maintain 80%+ coverage across all metrics
