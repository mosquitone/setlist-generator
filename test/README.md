# Testing Documentation

This directory contains comprehensive test suites for the setlist generator application.

## Test Structure

```
test/
├── unit/                                    # Unit tests
│   ├── unit-setup/setup.ts                # Test setup configuration
│   ├── setlist-manager.test.ts            # SetlistManager API client tests (8 tests)
│   ├── setlist-components.test.tsx        # React component rendering tests (13 tests)
│   └── schema-validation.test.ts          # Yup schema validation tests (11 tests)
├── api/                                    # API tests
│   └── setlist-endpoints.test.ts          # Vercel API endpoint tests (8 tests)
├── e2e/                                    # End-to-end tests
│   └── setlist-creation-workflow.spec.ts  # Complete user workflow tests (5 tests)
├── coverage/                     # Test coverage reports (gitignored)
├── playwright-report/            # E2E test reports (gitignored)
├── test-results/                 # E2E test artifacts (gitignored)
└── test.env.example              # Environment configuration template
```

## Test Categories

### Unit Tests (40 tests total)
- **SetlistManager Tests** (`setlist-manager.test.ts`): API client functionality, history management, error handling
- **Component Tests** (`setlist-components.test.tsx`): React component rendering, theme switching, dynamic font sizing
- **Schema Validation Tests** (`schema-validation.test.ts`): Yup form validation, data type inference
- **API Endpoint Tests** (`setlist-endpoints.test.ts`): Vercel serverless function CRUD operations

### End-to-End Tests (5 tests total)
**Workflow Tests** (`setlist-creation-workflow.spec.ts`):
- **Setlist Creation**: Complete user workflow from form input to success page with image generation
- **Form Validation**: Input validation and error handling across multiple form fields
- **Navigation**: User interaction flows and page routing
- **Multiple Songs**: Complex form operations with dynamic song addition/removal
- **Theme Selection**: UI dropdown interactions and theme switching

## Running Tests

### Development Commands

```bash
# Unit tests
pnpm test              # Interactive mode
pnpm test:run          # Run once
pnpm test:ui           # Visual test UI
pnpm test:coverage     # With coverage report

# E2E tests
pnpm test:e2e          # All browsers
pnpm test:e2e:chromium # Chromium only
pnpm test:e2e:firefox  # Firefox only
pnpm test:e2e:webkit   # Safari only
pnpm test:e2e:headed   # With visible browser
pnpm test:e2e:debug    # Debug mode

# Combined
pnpm test:all          # Unit + E2E (chromium)
```

### Production/CI Commands

```bash
pnpm test:ci           # Optimized for CI/CD
pnpm test:e2e:ci       # E2E with GitHub reporter
```

## Test Configuration

### Unit Tests (Vitest)
- **Framework**: Vitest with jsdom environment
- **UI Library**: @testing-library/react
- **Coverage**: V8 provider with 80% thresholds
- **Setup**: Automatic imports, DOM utilities

### E2E Tests (Playwright)
- **Browsers**: Chromium, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Mode**: Headed for development, headless for CI
- **Timeouts**: Extended for image generation (30s)
- **Reports**: HTML + GitHub Actions integration

## Key Features

### Image Generation Testing
E2E tests handle html2canvas image generation with specialized waiting logic:

```typescript
// Wait for success page and image generation
await waitForSetlistSuccess(page);
```

This helper function:
1. Confirms success page load
2. Waits for loader completion
3. Validates blob URL generation
4. Ensures browser image loading

### API Mocking
E2E tests use Playwright route mocking:

```typescript
await page.route('**/api/setlist**', async (route) => {
  // Mock POST/GET responses
});
```

### Environment Configuration
- **Development**: Headed browser, localhost:5173
- **CI**: Headless browser, configurable base URL
- **Timeouts**: Adaptive based on environment

## Coverage Thresholds

Minimum coverage requirements:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Troubleshooting

### Common Issues

1. **E2E Image Generation Failures**
   - Ensure headed mode for development
   - Check html2canvas compatibility
   - Verify blob URL generation

2. **API Mock Issues**
   - Check route pattern matching
   - Verify response format
   - Ensure proper async handling

3. **Test Timeouts**
   - Image generation can take 5-10 seconds
   - Network requests may be slow
   - Adjust timeouts in playwright.config.ts

### Performance Tips

1. **Parallel Execution**: Tests run in parallel by default
2. **Browser Reuse**: Playwright optimizes browser instances
3. **Smart Waiting**: Event-driven waits vs fixed delays
4. **Selective Running**: Use project filters for specific browsers

## Continuous Integration

GitHub Actions workflow includes:
- **Unit Tests**: With coverage reporting
- **E2E Tests**: Chromium browser only
- **Artifact Upload**: Test reports and screenshots
- **Coverage Upload**: Codecov integration

## Best Practices

1. **Test Isolation**: Each test is independent
2. **Real User Flows**: E2E tests follow actual user journeys
3. **Comprehensive Mocking**: API responses and external dependencies
4. **Clear Assertions**: Specific and meaningful test expectations
5. **Maintainable Structure**: Reusable helper functions

## Maintenance

- **Regular Updates**: Keep testing libraries updated
- **Performance Monitoring**: Track test execution times
- **Coverage Analysis**: Identify untested code paths
- **Flaky Test Detection**: Monitor for inconsistent failures