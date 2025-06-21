# Architecture Decision: SQLite + PostgreSQL Sync

**Date**: June 13, 2025  
**Status**: Implemented  
**Decision**: Replace Automerge with SQLite local storage and PostgreSQL central database using change log sync pattern.

## Context

Initially planned to use Automerge for CRDT-based local-first operation. However, after analysis:
- Automerge adds significant complexity
- CRDT conflict resolution is overkill for POS use case
- Debugging distributed state is challenging
- Standard SQL provides better tooling

## Decision

Implement a traditional sync architecture with modern optimizations:

### Local Storage (Tauri)
- **SQLite** for all local data
- Full SQL capabilities
- Excellent performance
- Proven reliability

### Central Storage (Server)
- **PostgreSQL** as source of truth
- Change log table for sync
- Multi-tenant support
- Complete audit trail

### Sync Strategy
- **HTTP polling** with adaptive intervals
- Delta sync using change timestamps
- Batch uploads for efficiency
- Conflict resolution rules

## Architecture Diagram

```
┌─────────────────┐
│   PostgreSQL    │
│   (Central)     │
│                 │
│ ┌─────────────┐ │
│ │ Change Log  │ │
│ │  - table    │ │
│ │  - record   │ │
│ │  - operation│ │
│ │  - timestamp│ │
│ └─────────────┘ │
└────────┬────────┘
         │ HTTP/REST
         │ (Polling)
┌────────▼────────┐
│   Tauri POS     │
│                 │
│ ┌─────────────┐ │
│ │   SQLite    │ │
│ │  - products │ │
│ │  - sales    │ │
│ │  - sync_log │ │
│ └─────────────┘ │
└─────────────────┘
```

## Benefits

1. **Simpler Implementation**: Standard SQL everywhere
2. **Better Debugging**: Can inspect database directly
3. **Proven Pattern**: Well-understood sync strategies
4. **Flexible Conflict Resolution**: Business rules in code
5. **Performance**: SQLite is extremely fast locally

## Implementation Details

### Change Tracking
```sql
CREATE TABLE change_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    record_id UUID,
    operation VARCHAR(10),
    org_id UUID,
    old_data JSONB,
    new_data JSONB,
    changed_at TIMESTAMP,
    version INTEGER
);
```

### Sync Process
1. Poll for changes since last_sync
2. Apply remote changes locally
3. Upload local changes in batches
4. Handle conflicts with business rules
5. Update sync timestamp

### Adaptive Polling
- No changes: 30 second interval
- Few changes: 10 second interval  
- Many changes: 5 second interval
- Error state: Exponential backoff

## Trade-offs

### Pros
- Simpler to implement and maintain
- Standard tooling works
- Easy to debug
- Predictable behavior

### Cons
- No P2P sync between terminals
- Requires connection to sync
- Central point of failure
- Not "true" local-first

## Migration Path

Since we're early in development, no migration needed. Simply:
1. Remove Automerge dependencies
2. Implement SQLite schema
3. Create sync endpoints
4. Build sync manager

This decision significantly reduces complexity while maintaining offline capability.