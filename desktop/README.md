# POS Desktop Client (Tauri)

The primary point-of-sale client built with Tauri for true offline-first operation with native hardware access.

## Overview

This is the main POS terminal application that cashiers use for daily operations. Built with Tauri, it provides:

- **100% Offline Operation**: Uses Automerge CRDTs for conflict-free local-first data
- **Native Performance**: Rust backend with minimal resource usage
- **Hardware Integration**: Direct access to POS peripherals
- **P2P Sync**: Synchronize with other terminals on the same network
- **Automatic Cloud Sync**: Pushes changes to the server when online

## Architecture

```
desktop/
├── src/                    # Frontend (Preact + TypeScript)
│   ├── components/        # UI components
│   ├── stores/           # State management with Automerge
│   ├── hooks/            # Custom Preact hooks
│   └── services/         # Business logic
├── src-tauri/            # Backend (Rust)
│   ├── src/
│   │   ├── hardware/     # Hardware integrations
│   │   ├── sync/         # Automerge sync engine
│   │   └── storage/      # Local persistence
│   └── Cargo.toml        # Rust dependencies
└── public/               # Static assets
```

## Key Features

### Local-First Data Management

The desktop client uses Automerge for all transactional data:
- **Shopping Cart**: Current sale items and modifications
- **Daily Transactions**: All sales for the current business day
- **Cash Register State**: Opening balance, current cash, closing
- **Local Inventory**: Product quantities and availability

### Hardware Support

Native integration with POS hardware through Rust:
- Receipt printers (ESC/POS protocol)
- Barcode scanners (HID and serial)
- Cash drawers
- Customer displays
- Payment terminals (future)

### Synchronization

Three-tier sync strategy:
1. **Local Storage**: Automerge documents persisted to disk
2. **P2P Sync**: Direct sync with other POS terminals via LAN
3. **Cloud Sync**: WebSocket connection to backend when online

## Prerequisites

- Node.js 18+
- Rust 1.70+
- pnpm 8+
- Platform-specific requirements:
  - **Windows**: WebView2 (included in Windows 11)
  - **macOS**: Xcode Command Line Tools
  - **Linux**: webkit2gtk, libssl-dev

## Development Setup

### Install Dependencies

```bash
# Install JavaScript dependencies
pnpm install

# The Rust dependencies will be installed automatically by Cargo
```

### Configure Environment

Create a `.env` file in the desktop directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws

# POS Configuration
VITE_TERMINAL_ID=POS-001
VITE_STORE_ID=STORE-001

# Feature Flags
VITE_ENABLE_P2P_SYNC=true
VITE_ENABLE_VOICE_COMMANDS=true
```

### Run Development Mode

```bash
# Start Tauri in development mode with hot reload
pnpm tauri dev
```

This will:
- Start the Vite dev server for the frontend
- Compile and run the Rust backend
- Open the application window
- Enable hot module replacement for frontend changes

### Hardware Testing

For hardware testing in development:

```bash
# Run with mock hardware
MOCK_HARDWARE=true pnpm tauri dev

# Run with real hardware (requires devices connected)
pnpm tauri dev
```

## Building for Production

### Build for Current Platform

```bash
# Create optimized build
pnpm tauri build
```

The installer will be in `src-tauri/target/release/bundle/`

### Cross-Platform Builds

```bash
# Build for all platforms (requires CI/CD)
pnpm tauri build --target all

# Build for specific platform
pnpm tauri build --target x86_64-pc-windows-msvc
pnpm tauri build --target x86_64-apple-darwin
pnpm tauri build --target x86_64-unknown-linux-gnu
```

## Testing

```bash
# Run frontend tests
pnpm test

# Run Rust tests
cd src-tauri && cargo test

# Run integration tests
pnpm test:integration
```

## Configuration

### POS Settings

Configuration is stored locally and synced across terminals:
- Terminal identification
- Receipt printer settings
- Barcode scanner configuration
- Cash drawer port
- Sync preferences

### Automerge Configuration

The Automerge sync behavior can be configured:
- Sync frequency
- Document retention period
- Compaction strategy
- Conflict resolution rules

## Troubleshooting

### Common Issues

**Application won't start**
- Check Rust is installed: `rustc --version`
- Verify Node dependencies: `pnpm install`
- Clear Tauri cache: `pnpm tauri clean`

**Hardware not detected**
- Check device connections
- Verify permissions (may need sudo on Linux)
- Review hardware configuration in settings

**Sync not working**
- Check network connectivity
- Verify WebSocket URL in configuration
- Look for sync errors in console

### Debug Mode

Enable detailed logging:

```bash
# Run with debug logging
RUST_LOG=debug pnpm tauri dev

# Run with trace logging (very verbose)
RUST_LOG=trace pnpm tauri dev
```

## Performance Optimization

- Automerge documents are compacted daily
- Old transactions are archived to the cloud
- Local SQLite cache for read-heavy operations
- Lazy loading of UI components
- Virtual scrolling for large lists

## Security Considerations

- All local data is encrypted at rest
- Terminal-specific encryption keys
- Secure communication with backend
- Hardware access requires authentication
- Automatic session timeout

## License

See the main project [LICENSE](../LICENSE) file.