# Sprint 3 - Core Sales Flow Implementation

**Duration**: 2 weeks  
**Focus**: Implement working POS sales functionality with cart management  
**Team**: 1 Developer (Full-stack focus)

---

## 🎯 Sprint Goal

**Enable basic sales transactions** with a functional cart, product selection, and transaction creation. This sprint delivers the **minimum viable POS** that can process sales end-to-end.

---

## 📊 Sprint Context

### Completed (Sprint 1 & 2)
✅ **DDD Architecture Migration** - 100% complete  
✅ **Database schema aligned** with domain services  
✅ **UI components** migrated to DDD structure  
✅ **Legacy code cleanup** - All legacy directories removed  
✅ **Type safety** - Fixed all blocking type errors

### Current State
- ⚠️ **Cart is mocked** in POS.tsx
- ⚠️ **No state persistence** for cart
- ⚠️ **Sales flow incomplete** - Cannot create transactions
- ✅ **Database services ready** (UserService, ProductService, CategoryService, SalesService)
- ✅ **UI components exist** (POSCart, POSProducts, POSHeader, POSFooter)

---

## 📋 Sprint Backlog

### Priority 1: Cart State Management (8 pts)

**User Story**: As a cashier, I need to add/remove products from the cart so I can build a customer's order.

**Tasks**:
- [ ] **Create CartContext** (3 pts)
  - Implement `domains/sales/providers/CartContext.tsx`
  - State: cart items, totals, customer selection
  - Actions: add item, remove item, update quantity, clear cart
  - Auto-calculate: subtotal, tax, total

- [ ] **Wire Cart to UI Components** (3 pts)
  - Update `POSProducts` to use CartContext.addItem()
  - Update `POSCart` to use CartContext state
  - Update `POSFooter` to display real totals
  - Remove all mock data from POS.tsx

- [ ] **Add Cart Persistence** (2 pts)
  - Implement localStorage persistence for cart state
  - Auto-save on cart changes
  - Restore cart on app reload

**Acceptance Criteria**:
- ✅ Can add products to cart by clicking product card
- ✅ Can remove items from cart
- ✅ Can update item quantities
- ✅ Totals calculate correctly (subtotal + tax)
- ✅ Cart persists across page reloads

---

### Priority 2: Complete Sales Transaction Flow (8 pts)

**User Story**: As a cashier, I need to complete a sale so I can charge the customer and record the transaction.

**Tasks**:
- [ ] **Implement Checkout Flow** (4 pts)
  - Create "Completar Venta" button handler
  - Integrate with `SalesService.create()`
  - Show success/error feedback
  - Clear cart after successful sale

- [ ] **Add Payment Method Selection** (2 pts)
  - Add payment method selector to POSFooter
  - Support: Efectivo, Tarjeta, Transferencia
  - Update transaction creation with selected method

- [ ] **Transaction Receipt Preview** (2 pts)
  - Create `TransactionReceiptDialog` component
  - Show: items, totals, payment method, transaction ID
  - Add "Imprimir" and "Cerrar" buttons
  - Display after successful sale

**Acceptance Criteria**:
- ✅ Can select payment method before checkout
- ✅ "Completar Venta" creates transaction in database
- ✅ Success shows receipt preview dialog
- ✅ Receipt displays all transaction details
- ✅ Cart clears after successful sale
- ✅ Transaction appears in database with correct data

---

### Priority 3: Product Management Basics (5 pts)

**User Story**: As a supervisor, I need to view and search products so I can help cashiers find items.

**Tasks**:
- [ ] **Implement Product Search** (3 pts)
  - Add search input to POSProducts header
  - Implement `ProductService.search()` integration
  - Show search results in product grid
  - Support search by name or barcode

- [ ] **Add Category Filter** (2 pts)
  - Add category tabs to POSProducts
  - Fetch categories from `CategoryService.findAll()`
  - Filter products by selected category
  - Add "Todos" tab to show all products

**Acceptance Criteria**:
- ✅ Can search products by name
- ✅ Can search products by barcode
- ✅ Search results update in real-time
- ✅ Can filter by category
- ✅ "Todos" shows all active products

---

### Priority 4: Error Handling & UX Polish (3 pts)

**User Story**: As a user, I need clear feedback when something goes wrong so I know how to fix it.

**Tasks**:
- [ ] **Add Error Boundaries** (1 pt)
  - Wrap POS screen in ErrorBoundary
  - Show friendly error messages
  - Add "Reintentar" button

- [ ] **Loading States** (1 pt)
  - Add loading spinners for:
    - Product fetch
    - Transaction creation
    - Cart operations

- [ ] **Validation & Feedback** (1 pt)
  - Validate cart not empty before checkout
  - Validate payment method selected
  - Show toast notifications for actions:
    - "Producto agregado"
    - "Venta completada"
    - Error messages

**Acceptance Criteria**:
- ✅ App doesn't crash on errors
- ✅ Loading states show during async operations
- ✅ User gets feedback for all actions
- ✅ Can't checkout with empty cart
- ✅ Can't checkout without payment method

---

## 🎯 Success Metrics

**Sprint Completion**: All Priority 1-2 tasks done (minimum)  
**Definition of Done**: Can complete a full sale transaction end-to-end

**Key Results**:
1. ✅ Cart management fully functional
2. ✅ At least 1 successful test transaction in database
3. ✅ Receipt preview works correctly
4. ✅ Zero critical bugs in sales flow

---

## 🚫 Out of Scope (Future Sprints)

- ❌ Customer management (use default customer)
- ❌ Discount application
- ❌ Multiple payment methods per transaction
- ❌ Transaction voiding
- ❌ Shift management
- ❌ Inventory tracking (stock disabled in schema)
- ❌ User permissions (basic role check only)
- ❌ Receipt printing (preview only)
- ❌ DTE/fiscal document generation

---

## 🎨 Technical Considerations

### Architecture Decisions
- **State Management**: Context API (sufficient for current scale)
- **Persistence**: localStorage (migrate to IndexedDB in Sprint 4 if needed)
- **Type Safety**: Strict TypeScript, no `any` types

### Database Schema Notes
- ⚠️ **Stock management disabled** - Products table doesn't have stock columns
- ⚠️ **No customer_id validation** - Can be null for default customer
- ✅ **Transactions table ready** - All columns exist and aligned

### Testing Strategy
- **Manual Testing**: Primary approach for this sprint
- **Test Data**: Use existing seeded products and users
- **Edge Cases**: Empty cart, invalid payment, network errors

---

## 📅 Sprint Timeline

### Week 1
**Days 1-2**: CartContext implementation + UI integration  
**Days 3-4**: Sales transaction flow + database integration  
**Day 5**: Testing & bug fixes

### Week 2
**Days 1-2**: Product search & category filter  
**Days 3-4**: Error handling + UX polish  
**Day 5**: Sprint review, demo, retrospective

---

## 🔄 Dependencies & Risks

### Dependencies
- ✅ **Database services** - All ready
- ✅ **UI components** - All exist
- ✅ **Schema alignment** - Complete

### Risks
| Risk | Mitigation |
|------|------------|
| Complex cart state logic | Start simple, iterate |
| Transaction creation errors | Robust error handling + logging |
| LocalStorage limitations | Monitor size, have IndexedDB plan ready |
| Time constraints | Priority 1-2 are MVP, 3-4 can slip |

---

## 📝 Notes

- This sprint focuses on **vertical slice** - one complete flow working
- **No infrastructure changes** needed - build on DDD work
- **Keep it simple** - Defer complexity (discounts, multi-pay) to later sprints
- **Test frequently** - After each task, manually test the flow

---

## ✅ Sprint Checklist

Before starting:
- [ ] Review and approve this sprint plan
- [ ] Ensure dev environment is running
- [ ] Verify database has seed data

During sprint:
- [ ] Update PROJECT_STATUS.md with progress
- [ ] Commit code frequently with clear messages
- [ ] Test each feature before moving to next

Sprint end:
- [ ] Demo working sales transaction
- [ ] Update documentation
- [ ] Create Sprint 4 plan based on learnings
