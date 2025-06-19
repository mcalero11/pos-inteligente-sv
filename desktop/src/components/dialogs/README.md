# Dialog System

A centralized dialog management system with t-shirt sizing conventions.

## Usage

```typescript
// Basic usage
openDialog('customers');

// With props
openDialog('inventory', { productId: 123 });
```

## Dialog Sizes

We use t-shirt sizing for consistent dialog dimensions:

| Size | Class | Width | Best For |
|------|-------|-------|----------|
| `xs` | `max-w-xs` | ~320px | Confirmations, alerts |
| `sm` | `max-w-sm` | ~384px | Simple forms |
| `md` | `max-w-md` | ~448px | Default size |
| `lg` | `max-w-lg` | ~512px | Settings, help |
| `xl` | `max-w-xl` | ~576px | Complex forms |
| `2xl` | `max-w-2xl` | ~672px | Management interfaces |
| `3xl` | `max-w-3xl` | ~768px | Reports, logs |
| `4xl` | `max-w-4xl` | ~896px | Complex tables, inventory |

## Adding New Dialogs

1. Create component: `src/components/dialogs/NewDialog.tsx`
2. Add to registry: `src/components/dialogs/registry.ts`
3. Import directly where needed

## Available Dialogs

### Core Management

- `customers` - Customer management interface
- `inventory` - Product and inventory management
- `users` - User account management
- `settings` - System configuration

### Operations

- `transaction` - New transaction processing
- `shifts` - Shift management
- `logs` - Activity and audit logs

### System

- `systemMenu` - Quick system actions
- `endOfDay` - End of day process and reporting
- `logout` - Logout confirmation
- `help` - Keyboard shortcuts and help

## Architecture Benefits

- ✅ **No barrel files** - Better tree-shaking and bundle size
- ✅ **T-shirt sizing** - Intuitive and consistent sizing
- ✅ **Centralized config** - Easy to maintain and modify
- ✅ **Type safe** - Full TypeScript support
- ✅ **Props passing** - Dynamic content and callbacks
