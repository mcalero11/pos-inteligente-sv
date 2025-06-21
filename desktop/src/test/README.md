# Testing Setup

This directory contains the testing configuration and utilities for the POS Desktop application.

## Overview

The testing setup uses:

- **Vitest** - Fast unit test runner for Vite projects
- **jsdom** - DOM environment for testing UI components
- **@testing-library/preact** - Testing utilities for Preact components

## Files

- `setup.ts` - Global test configuration and mocks
- `helpers.ts` - Reusable testing utilities and mock factories
- `settings-service.test.ts` - Tests for the SettingsService class
- `README.md` - This documentation file

## Running Tests

```bash
# Run tests in watch mode (development)
npm run test

# Run tests once (CI/production)
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Organization

All test files are organized in the `src/test/` directory for better project structure:

```
src/test/
├── setup.ts              # Global test configuration
├── helpers.ts             # Testing utilities
├── settings-service.test.ts  # SettingsService tests
└── README.md             # This documentation
```

## Writing Tests

### Service Tests

For services like `SettingsService`, use the provided helpers:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockDatabaseService, createMockDbSettings } from './helpers';
import { MyService } from '../lib/my-service';

describe('MyService', () => {
  // Test implementation
});
```

### Component Tests

For Preact components:

```typescript
import { render, screen } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## Mocking

### Automatic Mocks

The following are automatically mocked in `setup.ts`:

- `../lib/logger` - Logger service
- `../lib/database` - Database service
- Tauri APIs

### Custom Mocks

Use `vi.mock()` for specific mocking needs:

```typescript
vi.mock('../lib/my-service', () => ({
  myService: {
    method: vi.fn(),
  },
}));
```

## Coverage

Test coverage reports are generated when running `npm run test:coverage`. The reports show:

- Line coverage
- Function coverage
- Branch coverage
- Statement coverage

## Best Practices

1. **Test Behavior, Not Implementation** - Focus on what the code does, not how it does it
2. **Use Descriptive Test Names** - Test names should clearly describe what is being tested
3. **Arrange, Act, Assert** - Structure tests with clear setup, execution, and verification phases
4. **Mock External Dependencies** - Keep tests isolated by mocking external services
5. **Test Edge Cases** - Include tests for error conditions and boundary cases
6. **Organize by Feature** - Group related tests in the same file or directory

## Example Test Coverage

The `SettingsService` tests cover:

- ✅ Singleton pattern
- ✅ Cache management (fresh/stale/expiry)
- ✅ Database operations (get/set/batch updates)
- ✅ Error handling
- ✅ Reactive updates (subscriptions)
- ✅ Serialization/deserialization
- ✅ Concurrent load prevention

## Adding New Tests

When adding tests for new services or components:

1. Create a new test file in `src/test/`
2. Name it `[feature-name].test.ts` or `[component-name].test.ts`
3. Import the code to test using relative paths (e.g., `../lib/my-service`)
4. Use the helpers from `helpers.ts` when applicable
5. Follow the existing test patterns and structure
