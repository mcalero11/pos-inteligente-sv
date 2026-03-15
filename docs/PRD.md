# 📋 Product Requirements Document (PRD) - POS Inteligente El Salvador

> **Status**: ✅ APPROVED & LOCKED
> **Last Updated**: March 2026
> **Approved By**: Marvin Calero (Owner)
> **Note**: Any changes require a formal Change Request (CR).
> **CR-001**: Added Section 9 (Scope Tiers). No features added or removed. Approved by Marvin Calero (March 2026).

## 1. 🌟 Product Vision
To build the most reliable, offline-capable POS ecosystem for any business size in El Salvador. From individual freelancers to multi-branch retailers, our platform makes sales, inventory, and tax compliance (DTE) invisible and automatic. We empower the Salvadoran economy with tools that just work.

## 2. 🎯 Target Audience (Personas)
*   **Don Carlos (The Owner)**: Has 3 hardware stores. Wants to see consolidated sales from his phone. Fears internet outages.
*   **Maria (The Cashier)**: Needs a "fast lane" interface. Hates complex menus. Needs to sell in < 10 seconds.
*   **Alex (The Freelancer)**: Graphic designer. Needs to send a professional "Factura" from his phone in 3 clicks.
*   **Sofia (The Stock Keeper)**: Manages the main warehouse. Needs to move stock to branches without paperwork.

## 3. 🏗️ Module 1: The Core Platform (Shared Brain)
*The foundation that powers all apps.*

### 3.1 Identity & Security
- [ ] **Unified Auth**: Single Sign-On (SSO) for all modules.
- [ ] **RBAC**: Granular permissions (e.g., "Can Sell" vs "Can Refund" vs "Can View Reports").
- [ ] **Audit Log**: Immutable record of every action (Who, What, When).

### 3.2 DTE Engine (The Compliance Heart)
- [ ] **Universal Signing**: Signs FCF, CCF, Export, **CRE (Retención)**, and **Liquidación** locally.
- [ ] **Contingency Mode**: Handles "Diferido" transmission. Auto-generates "Evento de Contingencia" after offline periods > 24h.
- [ ] **Invalidation**: Support DTE "Invalidación" (Voiding) within the legal time window (before day close).
- [ ] **Smart Retry**: Auto-retries failed DTE submissions with exponential backoff.
- [ ] **Taxpayer Logic**: Auto-calculate **1% Retención/Percepción** based on Client/Issuer classification (Gran Contribuyente).

### 3.3 Inventory Core
- [ ] **Multi-Location**: Track stock across "Main Warehouse", "Store A", and "Store B".
- [ ] **Stock Movements**: Transfer inventory between locations (creates internal "Nota de Remisión").
- [ ] **Stock Taking**: "Inventario Físico" mode to reconcile system count vs. real count (Adjustments).
- [ ] **Real-time Sync**: Deduct stock instantly across the ecosystem when online.
- [ ] **Traceability**: Track **Batches (Lotes)** and **Expiration Dates** (Critical for Pharmacy).
- [ ] **Vendor Returns**: Process returns to suppliers for expired/damaged goods (creates "Nota de Débito").
- [ ] **Unit Conversion**: Handle "Box vs Unit" (e.g., Buy 1 Box of 30 pills, Sell 1 pill).
- [ ] **Kits/Bundles**: Group items (e.g., "Cold Flu Kit" = 2 pills + 1 syrup).

---

## 4. 🤖 Module 2: POS Retail (Desktop App)
*For Don Carlos's stores. Optimized for speed and offline reliability.*

### 4.0 Target Verticals
*   **General Retail**: Clothing, Shoes, Accessories.
*   **Hardware (Ferretería)**: Construction materials, bulk items.
*   **Pharmacy**: Medicines, personal care (Requires Batch/Expiration).
*   **Mini-Market**: High volume, barcode scanning.

### 4.1 The Terminal (Cashier View)
- [ ] **Speed UI**: Large touch-friendly buttons. Dark mode by default.
- [ ] **Training Mode**: Sandbox mode for new cashiers to practice without generating real DTEs.
- [ ] **Smart Search**: Find products by Name, SKU, or Barcode scan instantly.
- [ ] **Dynamic Pricing**: Support Multi-Tier Pricing (Retail, Wholesale, VIP) and "Price per Unit" logic.
- [ ] **Cart Actions**: Hold/Resume cart, Split payment, Line-item discounts.
- [ ] **Returns & Refunds**: Handle full or partial returns (creates "Nota de Crédito" automatically).
- [ ] **Quote-to-Sale**: Load a saved "Cotización" and convert it to a sale instantly.
- [ ] **Payments**: Cash, Card, and **Bitcoin (Lightning/On-chain)**.

### 4.2 Shift Management
- [ ] **Blind Close**: Cashier declares cash count before seeing the system expected total.
- [ ] **Cash Management**: Record "Petty Cash" (Gastos) or "Withdrawals" (Retiros) directly from the drawer.
- [ ] **X/Z Cuts**: Instant generation of shift reports.

### 4.3 Vertical Specifics
- [ ] **Pharmacy**: Capture **Doctor Name** and **License Number** for controlled medications (Antibiotics).

---

## 5. 💼 Module 3: Freelancer App (Web/Mobile PWA)
*For Alex. Lightweight, mobile-first, service-oriented.*

### 5.1 Service Management
- [ ] **Service Catalog**: Define hourly rates or fixed-price packages.
- [ ] **Quick Invoice**: "Create Quote" -> Convert to "Factura" in 1 click.
- [ ] **Export Mode**: Generate **Factura de Exportación** (Type 11) for foreign clients (No IVA).
- [ ] **Client Rolodex**: Save client NIT/NRC for one-tap invoicing.

### 5.2 Link-to-Pay
- [ ] **Payment Links**: Generate a URL to get paid via Card or BTC.

---

## 6. 📊 Module 4: Admin HQ (Web Dashboard)
*For Don Carlos and the Accountant. The Control Center.*

### 6.1 Business Intelligence
- [ ] **Live Dashboard**: "Heartbeat" view of sales across all branches in real-time.
- [ ] **AI Copilot**: "Hey, why were sales down in Store B yesterday?" (Natural Language Query).
- [ ] **Profitability**: COGS vs Revenue analysis.

### 6.2 Ecosystem Management
- [ ] **Onboarding Wizard**: Drag-and-drop setup for new branches/users.
- [ ] **Catalog Manager**: Bulk import/export products via Excel.

### 6.3 Fiscal Reports (Accountant View)
- [ ] **Libros de IVA**: Auto-generate "Libro de Ventas" (Consumidor/Contribuyente) and "Libro de Compras" with DTE codes.
- [ ] **F07 Helper**: Export data pre-formatted for the F07 tax return annexes.

---

## 7. 🔌 Module 5: Integrations & API
- [ ] **E-commerce Bridge**: Sync stock with Shopify/WooCommerce.
- [ ] **Open API**: Allow third-party developers to build plugins.

## 8. 📐 Success Metrics
- **Reliability**: 99.9% uptime for offline sales (local mode).
- **Speed**: < 30 seconds to onboard a new Freelancer user.
- **Compliance**: 100% of DTEs accepted by Hacienda within 24 hours.

---

## 9. Scope Tiers & Milestones

This section categorizes all 42 PRD features into four delivery tiers. No features are added or removed -- this is a sequencing overlay that prioritizes the DTE compliance wedge for entrepreneurs first, then expands into retail POS, multi-location operations, and long-term differentiation.

For the full business rationale behind this sequencing, see [Business Model](BUSINESS_MODEL.md).

### Tier 1 -- MVP: DTE Compliance Tool (9 features)

Target persona: Alex (Freelancer). Product: PWA.

| Feature | PRD Ref |
|---------|---------|
| Unified Auth | 3.1 |
| RBAC | 3.1 |
| Universal Signing | 3.2 |
| Contingency Mode | 3.2 |
| Invalidation | 3.2 |
| Smart Retry | 3.2 |
| Taxpayer Logic | 3.2 |
| Quick Invoice | 5.1 |
| Client Rolodex | 5.1 |

### Tier 2 -- Desktop POS: Single-Store Sales (14 features)

Target persona: Don Carlos, Maria. Product: Desktop POS.

| Feature | PRD Ref |
|---------|---------|
| Audit Log | 3.1 |
| Stock Movements (basic) | 3.3 |
| Real-time Sync | 3.3 |
| Speed UI | 4.1 |
| Training Mode | 4.1 |
| Smart Search | 4.1 |
| Dynamic Pricing | 4.1 |
| Cart Actions | 4.1 |
| Returns & Refunds | 4.1 |
| Quote-to-Sale | 4.1 |
| Payments (Cash, Card) | 4.1 |
| Blind Close | 4.2 |
| Cash Management | 4.2 |
| X/Z Cuts | 4.2 |

> **Note**: Bitcoin payments (from 4.1) are deferred to Tier 4.

### Tier 3 -- Scale: Multi-Location & Reports (16 features)

Target persona: Don Carlos (multi-store), Sofia, Accountant.

| Feature | PRD Ref |
|---------|---------|
| Multi-Location | 3.3 |
| Stock Taking | 3.3 |
| Traceability | 3.3 |
| Vendor Returns | 3.3 |
| Unit Conversion | 3.3 |
| Kits/Bundles | 3.3 |
| Pharmacy | 4.3 |
| Service Catalog | 5.1 |
| Export Mode | 5.1 |
| Payment Links | 5.2 |
| Live Dashboard | 6.1 |
| Profitability | 6.1 |
| Onboarding Wizard | 6.2 |
| Catalog Manager | 6.2 |
| Libros de IVA | 6.3 |
| F07 Helper | 6.3 |

### Tier 4 -- Differentiation (3+ features)

| Feature | PRD Ref |
|---------|---------|
| AI Copilot | 6.1 |
| E-commerce Bridge | 7 |
| Open API | 7 |
| Bitcoin Payments | 4.1 (deferred) |

### Summary

| Tier | Name | Features | Persona | Status |
|------|------|----------|---------|--------|
| 1 | MVP: DTE Compliance | 9 | Alex (Freelancer) | Current focus |
| 2 | Desktop POS | 14 | Don Carlos, Maria | Next |
| 3 | Scale | 16 | Multi-store, Sofia, Accountant | Future |
| 4 | Differentiation | 3+ | All | Long-term |
