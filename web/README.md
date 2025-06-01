# POS Web Frontend

Modern, responsive web interface for the POS Inteligente system built with React, TypeScript, and Vite.

## Overview

This is the primary user interface for the point-of-sale system, designed for high-performance and reliability in commercial environments. The application features:

- Real-time transaction processing
- Voice-enabled product search
- Offline-first architecture with automatic sync
- Responsive design for tablets and desktop
- Multi-language support (Spanish primary)

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

## Architecture

```
web/
├── src/
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific modules
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and helpers
│   ├── pages/          # Route pages
│   ├── services/       # API client and external services
│   ├── stores/         # State management
│   └── types/          # TypeScript type definitions
├── public/             # Static assets
└── tests/              # Test files
```

## Prerequisites

- Node.js 18+ 
- pnpm 8+ (recommended) or npm 9+
- Modern browser with ES6+ support

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

### Using Docker Compose

From the project root directory:

```bash
docker-compose up web
```

## Environment Variables

Create a `.env` file in the web directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws

# Feature Flags
VITE_ENABLE_VOICE_SEARCH=true
VITE_ENABLE_OFFLINE_MODE=true

# External Services
VITE_OPENAI_API_KEY=your-key-here
```

## Key Features

### Offline Support

The application uses service workers and IndexedDB to provide full functionality even without internet connection:

- Cache all product data locally
- Queue transactions when offline
- Automatic sync when connection restored
- Visual indicators for sync status

### Voice Search

Integrated voice search allows users to:

- Search products by speaking
- Add items to cart with voice commands
- Navigate the interface hands-free

### Real-time Updates

WebSocket connection provides:

- Live inventory updates
- Price changes synchronization
- Multi-terminal coordination

## Building for Production

```bash
# Create optimized build
pnpm build

# Preview production build
pnpm preview
```

Build output will be in the `dist/` directory.

## Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run e2e tests
pnpm test:e2e

# Generate coverage report
pnpm test:coverage
```

## Code Quality

The project uses several tools to maintain code quality:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks

Run all checks:

```bash
pnpm lint
pnpm format
pnpm typecheck
```

## Performance Optimization

- Lazy loading for route components
- Image optimization with responsive sizes
- Code splitting at route level
- Memoization for expensive computations
- Virtual scrolling for large lists

## Accessibility

The application follows WCAG 2.1 Level AA guidelines:

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Chrome Android 90+
- Safari iOS 14+

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Ensure all tests pass
4. Update documentation as needed
5. Submit PR with clear description

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Dependencies issues**
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## License

See the main project [LICENSE](../LICENSE) file.