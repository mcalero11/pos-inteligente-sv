// Domain modules organized by bounded context
// Note: Most domain logic lives in TypeScript (frontend) using tauri-plugin-sql
// Only DTE remains in Rust due to cryptographic requirements
pub mod dte;
