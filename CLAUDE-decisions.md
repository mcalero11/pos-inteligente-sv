# CLAUDE-decisions.md

Memory bank file documenting key technical decisions for Claude Code context.

## Decision Log

| # | Decision | Date | Status | ADR |
|---|----------|------|--------|-----|
| 1 | Multi-client architecture (Tauri + React + Go) | Jun 5, 2025 | Implemented | - |
| 2 | SQLite + PostgreSQL with change log sync | Jun 13, 2025 | Implemented | 002 |
| 3 | Passwordless auth (WhatsApp OTP + Email) | Jun 13, 2025 | Planned | 003 |
| 4 | Certificate vault with Tauri Stronghold | Jun 13, 2025 | Planned | 004 |
| 5 | Preact over React for desktop | Jun 5, 2025 | Implemented | - |
| 6 | HTTP polling over WebSocket | Jun 13, 2025 | Implemented | - |
| 7 | Dropped Automerge CRDT | Jun 13, 2025 | Implemented | 002 |

## Decision Details

### 1. Multi-Client Architecture

**Context**: Need a system that works offline for POS terminals while having centralized admin capabilities.

**Decision**: Three separate applications:
- **Desktop (Tauri)**: Offline-first POS for daily operations
- **Web (React)**: Admin panel for management/reporting
- **Backend (Go)**: Central API server

**Rationale**:
- Tauri provides native performance + system access for POS
- Web admin allows any-device access for managers
- Go backend is performant and deployment-friendly
- Clear separation of concerns

**Consequences**:
- More complex deployment (3 apps)
- Need shared type definitions
- Sync logic required between desktop and backend

---

### 2. SQLite + PostgreSQL Sync (ADR-002)

**Context**: Originally planned Automerge CRDT for local-first operation, but complexity was too high.

**Decision**: Use SQLite locally + PostgreSQL centrally with change log pattern.

**Rationale**:
- Standard SQL everywhere = familiar tooling
- Change log provides audit trail
- Simpler debugging and maintenance
- Proven sync patterns available

**Implementation**:
```sql
CREATE TABLE change_log (
    id INTEGER PRIMARY KEY,
    table_name TEXT,
    record_id TEXT,
    operation TEXT,  -- INSERT, UPDATE, DELETE
    data TEXT,       -- JSON
    timestamp DATETIME,
    synced INTEGER DEFAULT 0
);
```

**Sync Strategy**:
- HTTP polling with adaptive intervals (5-30 seconds)
- Batch uploads for efficiency
- Timestamp-based conflict resolution

**Trade-offs**:
- (+) Simpler implementation
- (+) Better debugging
- (-) No P2P sync between terminals
- (-) Requires server for full sync

---

### 3. Passwordless Authentication (ADR-003)

**Context**: El Salvador has 95% WhatsApp penetration. Traditional passwords cause friction.

**Decision**: WhatsApp OTP as primary, Email magic links as fallback.

**Implementation**:
- **WhatsApp**: 360dialog BSP for Year 1, direct Meta API later
- **Email**: Standard magic link with 15-minute expiry
- **Offline**: PIN fallback for POS terminals

**Cost Projection**:
| Year | Users | WhatsApp Cost | Email Cost | Total |
|------|-------|---------------|------------|-------|
| 1 | 1,000 | $912 | $0 | $912 |
| 2 | 5,000 | $4,080 | $240 | $4,320 |
| 3 | 15,000 | $12,480 | $240 | $12,720 |

**Security**:
- Rate limiting: 3 attempts/hour
- OTP expiry: 5 minutes
- Session tokens: 30-day expiry

---

### 4. Certificate Vault Management (ADR-004)

**Context**: DTE signing requires private keys. Must work offline and be secure.

**Decision**: Tauri Stronghold for encrypted local vault + OS keyring for password storage.

**5-Phase Flow**:
1. **Initial Setup**: Admin uploads cert via backend
2. **First Login**: POS creates local vault, stores cert
3. **Normal Operation**: Sign DTEs completely offline
4. **Later Sessions**: Instant access via cached password
5. **Rotation**: Automatic cert renewal when expiring

**Security Layers**:
- Server: PostgreSQL encryption at rest
- Transit: TLS + additional encryption
- Client: Stronghold + OS keyring

**Trade-offs**:
- (+) True offline signing
- (+) Military-grade encryption
- (-) Complex initial setup
- (-) Vault corruption requires re-sync

---

### 5. Preact over React for Desktop

**Context**: Desktop app runs in Tauri, need small bundle and fast performance.

**Decision**: Use Preact instead of React for desktop frontend.

**Rationale**:
- ~3KB vs ~40KB bundle size
- API-compatible with React
- Better performance for resource-constrained environments
- Ideal for embedded Tauri webview

**Consequences**:
- Slight API differences (preact/hooks vs react)
- Some React libraries need compatibility layer
- Need separate configs for desktop (Preact) vs web (React)

---

### 6. HTTP Polling over WebSocket

**Context**: Need real-time sync but WebSocket adds complexity.

**Decision**: HTTP polling with adaptive intervals instead of WebSocket.

**Rationale**:
- Simpler to implement and debug
- Better handling of intermittent connectivity
- No persistent connection to maintain
- Sufficient for POS use case (seconds, not milliseconds)

**Polling Strategy**:
| State | Interval |
|-------|----------|
| Active (changes detected) | 5 seconds |
| Normal | 10 seconds |
| Idle | 30 seconds |
| Error | Exponential backoff |

**Future**: May add WebSocket for specific high-frequency features.

---

### 7. Dropped Automerge CRDT

**Context**: Initially planned CRDT for conflict-free replication.

**Decision**: Remove Automerge, use traditional sync instead.

**Reasons**:
- Overkill for POS use case
- Debugging distributed state is hard
- Standard SQL provides better tooling
- Team familiarity with traditional sync

**Cleanup**:
- Remove Automerge types from shared (marked deprecated)
- Implement change log pattern instead
- Use timestamp + business rules for conflicts

---

## Pending Decisions

### UI Component Library Selection
**Options**:
1. Radix UI primitives (current) + custom styling
2. Shadcn/ui components (partially implemented)
3. Full custom components

**Considerations**:
- Radix provides accessibility
- Shadcn patterns work well with Tailwind
- Custom = more control but more work

### Production Deployment
**Options**:
1. AWS (ECS/RDS)
2. Google Cloud Run
3. DigitalOcean App Platform
4. Self-hosted

**Considerations**:
- Cost for El Salvador market
- Latency to Central America
- Managed services vs control

### DTE Queue Strategy
**Questions**:
- Priority: FIFO or value-based?
- Retry: How many attempts?
- Offline: Max queue size?

---

## Technology Rationale

### Why Tauri over Electron?
- Smaller bundle size (~10MB vs ~150MB)
- Better performance (native Rust backend)
- System-level access for hardware
- Strong security model

### Why Go over Node.js for Backend?
- Single binary deployment
- Excellent concurrency
- Strong typing without overhead
- Good PostgreSQL drivers

### Why PostgreSQL over MySQL?
- Better JSON support (JSONB)
- Superior indexing options
- Advanced features (triggers, CTEs)
- Strong ecosystem

### Why pnpm over npm/yarn?
- Disk space efficiency
- Faster installs
- Strict dependency resolution
- Good monorepo support

---

## Constants & Configuration

### Tax Configuration (El Salvador)
```typescript
export const TAX_RATE_IVA = 0.13;  // 13% IVA
export const MAX_OFFLINE_DAYS = 7;
```

### Sync Intervals
```typescript
const SYNC_INTERVALS = {
  ACTIVE: 5000,    // 5 seconds when changes detected
  NORMAL: 10000,   // 10 seconds standard
  IDLE: 30000,     // 30 seconds when idle
  MAX_BACKOFF: 300000  // 5 minutes max on errors
};
```

### Security Limits
```typescript
const SECURITY = {
  OTP_EXPIRY_MINUTES: 5,
  MAGIC_LINK_EXPIRY_MINUTES: 15,
  SESSION_EXPIRY_DAYS: 30,
  MAX_LOGIN_ATTEMPTS_PER_HOUR: 3
};
```

---

## References

- [ADR-002: SQLite Sync Architecture](docs/decisions/002-sqlite-sync-architecture.md)
- [ADR-003: Passwordless Auth](docs/decisions/003-passwordless-auth.md)
- [ADR-004: Certificate Vault](docs/decisions/004-certificate-vault-management.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Project Status](PROJECT_STATUS.md)
