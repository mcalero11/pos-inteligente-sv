# Shared Types and Protocols

This directory contains shared type definitions and protocol specifications for the POS Inteligente system's multi-service architecture.

## Structure

```
shared/
├── types/          # TypeScript type definitions
│   ├── domain.ts   # Core business domain types
│   ├── automerge.ts # CRDT document schemas
│   └── index.ts    # Main export file
├── proto/          # Protocol Buffer definitions
│   └── sync.proto  # gRPC service definitions
├── package.json    # Package configuration
├── tsconfig.json   # TypeScript configuration
└── generate-proto.sh # Protocol Buffer code generation
```

## Architecture Decisions

### TypeScript as Source of Truth
TypeScript types serve as the primary source of truth for:
- Frontend applications (web and desktop)
- Automerge document schemas
- Shared business logic

### Protocol Buffers for Service Communication
gRPC with Protocol Buffers is used for:
- Efficient binary serialization
- Type-safe service communication
- Real-time synchronization over WebSocket

### CI/CD Considerations
This shared package uses TypeScript project references to enable:
- Type checking across projects
- Build-time validation
- No runtime dependencies

## Usage

### In Web/Desktop Projects

Configure TypeScript project references in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@pos-inteligente/shared": ["../shared/types"]
    }
  },
  "references": [
    { "path": "../shared" }
  ]
}
```

Import types in your code:

```typescript
import { Product, Sale, TerminalDocument } from '@pos-inteligente/shared';
```

### In Backend (Go)

Generated Protocol Buffer code is located in `backend/pkg/proto/`:

```go
import "github.com/mcalero11/pos-inteligente-sv/backend/pkg/proto"
```

### In Desktop (Rust)

Configure `build.rs` to generate Rust code from Protocol Buffers:

```rust
fn main() {
    prost_build::compile_protos(
        &["../../shared/proto/sync.proto"],
        &["../../shared/proto/"]
    ).unwrap();
}
```

## Type Generation

### Protocol Buffers

Generate code for all platforms:

```bash
cd shared
chmod +x generate-proto.sh
./generate-proto.sh
```

Prerequisites:
- `protoc` - Protocol Buffer compiler
- `protoc-gen-go` - Go code generator
- `protoc-gen-go-grpc` - Go gRPC generator
- `ts-proto` - TypeScript generator (optional)

## Best Practices

1. **Immutability**: Keep types immutable where possible
2. **Validation**: Add validation logic in service layers, not type definitions
3. **Versioning**: Use semantic versioning for breaking changes
4. **Documentation**: Document complex types with JSDoc comments
5. **Testing**: Validate type compatibility in CI/CD pipeline

## Type Categories

### Domain Types (`domain.ts`)
Core business entities used across all services:
- Product, Customer, Sale
- Payment and inventory types
- Configuration types

### Automerge Types (`automerge.ts`)
CRDT document schemas for local-first operation:
- TerminalDocument structure
- Sync state management
- Conflict-free data types

### Protocol Types (`proto/sync.proto`)
Service communication protocols:
- Sync messages
- Real-time notifications
- Terminal status updates

## Development Workflow

1. **Adding New Types**
   - Add to appropriate `.ts` file
   - Export from `index.ts`
   - Run type checking: `npm run typecheck`

2. **Updating Protocol Buffers**
   - Modify `.proto` files
   - Run `./generate-proto.sh`
   - Update service implementations

3. **Testing Changes**
   - Build all dependent projects
   - Run integration tests
   - Validate in CI pipeline

## Troubleshooting

### TypeScript References Not Working
- Ensure `composite: true` in tsconfig.json
- Run `tsc --build` in project root
- Check paths configuration

### Protocol Buffer Generation Fails
- Verify `protoc` is installed
- Check import paths in .proto files
- Ensure output directories exist

### Import Errors in Projects
- Verify TypeScript paths configuration
- Check reference paths are correct
- Rebuild shared package: `npm run build`
