# Security Policy

## Supported Versions

POS Inteligente El Salvador is pre-release software under active development. Security updates are applied to the `main` branch only.

| Version | Supported |
|---------|-----------|
| `main` branch | Yes |
| Latest tagged release | Yes |
| Previous releases | No |

> **Note**: This project has not yet reached a stable 1.0 release. All interfaces, storage formats, and security boundaries may change without notice.

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Use [GitHub Security Advisories](https://github.com/anthropics/pos-inteligente-sv/security/advisories/new) (private vulnerability reporting) to submit your report.

Please include:

- **Type of vulnerability** (e.g., injection, authentication bypass, privilege escalation)
- **Affected component** (e.g., DTE signing, Tauri IPC, database commands, auth)
- **Steps to reproduce** with as much detail as possible
- **Impact assessment** -- what an attacker could achieve
- **Suggested fix** (if you have one)

## Scope

### In Scope

- DTE signing (RSA key handling, certificate storage)
- Authentication (Argon2id hashing, legacy SHA-256 compatibility)
- Stronghold vault (certificate and secret storage)
- SQL injection in database commands (`execute_transaction`, batch SQL)
- Tauri IPC privilege escalation (window capability bypass)
- PII exposure (NIT, NRC, DUI, customer data)
- Cross-window data leakage between main and child sale windows

### Out of Scope

- Feature requests or UI/UX bugs
- Performance issues
- Development-only configurations (e.g., seed scripts, Docker Compose)
- DTE validation failures originating from Ministerio de Hacienda (MH)
- Denial-of-service against local desktop application
- Issues requiring physical access to the device

## Response Timeline

| Stage | Timeline |
|-------|----------|
| Acknowledgment | 48 hours |
| Initial assessment | 7 days |
| Critical severity fix | 72 hours after assessment |
| High severity fix | 2 weeks |
| Medium/Low severity fix | Next scheduled release |

Coordinated disclosure will occur after the fix is released. We will credit reporters unless they prefer to remain anonymous.

## Security Architecture

POS Inteligente employs multiple layers of security:

- **Password hashing**: Argon2id with backward compatibility for legacy SHA-256 hashes (migrated on next login)
- **Secret storage**: Tauri Stronghold plugin for DTE certificates and sensitive keys (see [ADR-004](docs/decisions/004-certificate-vault-management.md))
- **DTE signing**: RSA signing performed locally in the Rust backend -- private keys never leave the device
- **Database**: SQLite in WAL mode with parameterized queries to prevent SQL injection
- **Transport**: TLS for all backend communication when online
- **Window isolation**: Tauri capability system restricts child sale windows from accessing secure storage or creating new windows

## Responsible Disclosure Guidelines

- Allow reasonable time for the team to address the vulnerability before any public disclosure
- Do not access, modify, or delete data belonging to other users
- Do not perform destructive testing against production or shared environments
- Limit testing to your own installations and development environments
- Act in good faith to avoid privacy violations, data destruction, and service disruption
