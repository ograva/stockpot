# Project Brief: StockPot

| Information | Details |
| :--- | :--- |
| **Project Name** | StockPot |
| **Owner** | Novus Apps |
| **Platform** | Angular 21 Monorepo + Firebase |
| **Status** | Version 1.0 (MVP) |

## Version History
| Version | Date | Author | Summary of Changes |
|---------|------|--------|--------------------|
| v1.0 | April 13, 2026 | Mary (Analyst) | Initial Draft based on strategic brainstorming session |
| v1.1 | April 15, 2026 | Jason (PM) | Added Vendor/Supplier Portal (3rd app), Platform Data Management (admin-managed UoM + ingredient catalog), expanded admin feature scope, added Vendor persona |

## Executive Summary
StockPot is a specialized inventory and recipe management Software-as-a-Service (SaaS) designed specifically for Small and Medium-sized Businesses (SMBs) in the restaurant industry. Rooted in the proven methodologies of a 30-year restaurant industry veteran's Excel models, StockPot digitizes and scales a highly effective operational workflow without the bloated overhead of traditional enterprise ERPs. 

The core philosophy of StockPot is to work "the way restaurateurs think." Instead of forcing chefs and owners to act like accountants, StockPot aligns its user experience with the physical layout and fast-paced environment of a commercial kitchen. By tightly coupling raw material inventory to sub-component preparation and final recipe yields, the platform provides a closed-loop system where purchasing, receiving, prepping, and eventually selling are completely synchronized.

For version 1 (Minimum Loveable Product), StockPot targets responsive PWA accessibility alongside an offline-capable architecture designed for kitchen tablets. It completely reimagines operational efficiency by introducing an ecosystem where operators can quickly generate Purchase Orders (POs) based on required pars, while kitchen staff can execute daily workflows seamlessly, ensuring a profitable and well-managed restaurant.

StockPot is designed as a **three-sided platform**: the Admin portal manages the platform itself (tenants, subscriptions, and shared data), the User-App serves restaurant operators and kitchen staff, and a **Vendor/Supplier Portal** allows local suppliers to self-manage their product catalogs, pricing, and availability. The platform's admin layer also maintains canonical master data — a global Unit of Measure library and a Master Ingredient Catalog — that flows into every restaurant's setup as lookup tables, eliminating redundant configuration and ensuring consistency across all tenants.

## Problem Statement
Running a profitable restaurant requires a constant, delicate juggling act between maintaining sufficient raw material inventory, preparing exact sub-components, and matching those to the POS sales of final recipes. Currently, operators are trapped between two unappealing extremes: highly-customized but fragile Excel spreadsheets that do not scale and lack multi-user collaboration, or bulky, generic ERP systems (like Odoo or Microsoft Dynamics) to which the restaurant must adapt its workflows.

This lack of specialized, accessible technology leads to severe operational friction. Kitchen staff struggle with data entry in environments not suited for keyboards, leading to inaccurate inventory counts. Internet outages in the kitchen disrupt cloud-based receiving. Furthermore, owners lack real-time visibility into theoretical vs. actual food costs, experiencing stockouts or food waste which directly erodes the restaurant's bottom line.

## Target Audience & Personas
1. **The Owner / Franchisor**
   - **Role:** Decision Maker & Financial Controller.
   - **Primary Goal:** Maintain budget discipline, ensure menu profitability, and easily manage recipes and vendors.
   - **Key Frustration:** Blind spots in inventory counts leading to unexplained variances, stockouts, or excessive food waste. Frustrated by reactive reporting.
   - **Technical Proficiency:** Moderate to High. Prefers desktop/web dashboards for deep-dive analysis and configuration.

2. **The Kitchen Manager / Head Chef**
   - **Role:** Operational Leader.
   - **Primary Goal:** Ensure the kitchen is always stocked to meet daily menu demands and efficiently route purchase orders to vendors. 
   - **Key Frustration:** Spending hours counting inventory manually or navigating clunky software with dirty hands.
   - **Technical Proficiency:** Low to Moderate. Highly mobile, relies on tablets or touch-screens, values large UI targets and simple, linear workflows.

3. **Kitchen Staff**
   - **Role:** Data Transactors.
   - **Primary Goal:** Receive goods, update sub-components, and clear tasks quickly so they can get back to cooking.
   - **Key Frustration:** Dropped internet connections causing data loss, complex screen transitions that interrupt physical workflows.
   - **Technical Proficiency:** Low. Requires foolproof, touch-driven systems with zero reliance on keyboards.

4. **The Vendor/Supplier Representative**
   - **Role:** Product Catalog Manager.
   - **Primary Goal:** Keep their product listings, pricing, and availability current so restaurant clients can order accurately without back-and-forth calls.
   - **Key Frustration:** Manually communicating price changes and out-of-stock items to each restaurant separately — a time-consuming and error-prone process.
   - **Technical Proficiency:** Low to Moderate. Needs a simple, clean web portal to manage their catalog without training.

## Strategic Goals & Success Metrics
To ensure StockPot delivers immediate value, we will track the following KPIs within 6 months of the MVP launch:
- **Activation Retention:** > 50% of first-time restaurant users are retained as active daily users ("can't do without it" metric).
- **Inventory Time Savings:** 90% reduction in daily stock count duration (shifting from full counts to delta/anomaly counts, with full counts dropping to 1x/month).
- **Proactive Interventions:** 100% generation of automated alerts to the Kitchen and Owner for stockouts, over-budget scenarios, and out-of-stock items *before* they impact dining service.
- **Offline Reliability:** 0% data loss reported by kitchen staff during periods of internet outage while receiving or prepping.

## High-Level Feature Areas
- **Core Data & Master Setup:** Admin interfaces for the Owner to define raw materials, units of measure, sub-components, recipes, and vendor profiles. This forms the backbone of all theoretical calculations.
- **Platform Data Management:** The StockPot Admin (platform operator) maintains a canonical **Master Unit of Measure library** and a **Master Ingredient Catalog** — the global reference list of raw material ingredients. These flow into every restaurant's user-app as lookup tables, so operators select from a curated list rather than setting up from scratch. Admin can also maintain a **Supplier Network** — a managed directory of local suppliers with the raw materials they carry and their current pricing.
- **Smart PO & Replenishment Engine:** Automated compilation of recommended Purchase Orders by calculating current stock against par levels and mapping shortages to assigned vendors. 
- **Kitchen Execution Hub:** A specialized, touch-first tablet interface for back-of-house staff. Employs large buttons and focused dialog windows to perform receiving, preparation batching, and inventory adjustments without a keyboard.
- **Local Hardware Bridge:** A dedicated Node.js Express server running on-site to facilitate communication between the StockPot cloud application and local kitchen peripherals (thermal printers, weighing scales). (Needs new folder in monorepo).
- **Offline Sync & Receiving:** Implementation of an offline-first architecture (via `StoreForwardService`) allowing kitchen staff to download expected arrivals, execute receiving operations, and update statuses locally, syncing to Firebase upon reconnection.
- **Reconciliation & Variance Auditing:** CSV upload utility to ingest Daily POS Sales Data, triggering automated deductions from raw materials and sub-components, culminating in an Expected vs. Actual Count Sheet.
- **Vendor/Supplier Portal:** A dedicated third application in the monorepo allowing registered suppliers to self-manage their product catalog — defining which raw materials they carry, setting and updating prices, and flagging item availability. Restaurant operators can browse the supplier catalog directly when generating purchase orders, ensuring pricing is always current without manual synchronization.

## Scope Definition
**In Scope (v1):**
- Responsive PWA targeting Web, iOS, Android, and Desktop environments.
- Specialized touch-driven, icon-heavy UI for tablet/mobile kitchen use.
- Offline-capable receiving and syncing via Angular Signals and `StoreForwardService`.
- Complex unit-of-measure conversions (e.g., purchasing in Bulk, consuming in Grams).
- Local Node.js Express server integration for kitchen peripherals (scales, printers).
- POS data ingestion via CSV upload for end-of-day sales reconciliation.
- Alert engine for stockouts and budget variances.
- Admin-managed **Master UoM Library** and **Master Ingredient Catalog** as platform-wide lookup tables consumed by user-app.
- Admin-managed **Supplier Network** — curated directory of local suppliers with product catalogs and pricing.
- **Vendor/Supplier Portal** — a third Angular application in the monorepo for supplier self-management of product catalog, pricing, and availability.

**Out of Scope (v1):**
- Direct API integration with proprietary POS systems (Planned for V3).
- Employee payroll, time-tracking, or scheduling modules (Permanently Out of Scope).
- Direct integration with accounting ERPs for automatic ledger entries (Planned for V4).
- Complex routing for internal employee approvals (beyond basic submit/approve PO statuses).

## Technical Constraints & Stack Alignment
StockPot heavily relies on the constraints established in `#CONSTRAINTS.md`:
- **Frontend:** Angular 21 Standalone Components with Angular Signals for all reactive state management. No RxJS BehaviorSubjects. 
- **Backend/DB:** Firebase Firestore utilizing the `restaurants/{restaurantId}` multi-tenant isolation pattern. Backend models will reside in `functions/src/models` as pure interfaces. Vendor data will be isolated under a `vendors/{vendorId}` collection.
- **Three Angular Applications:** `projects/admin` (platform operator), `projects/user-app` (restaurant), and `projects/vendor-app` (supplier portal) — all sharing core models from `libs/core/models/`.
- **Offline architecture:** Deep reliance on the `StoreForwardService` to satisfy the strictly mandated offline capabilities of the kitchen persona, with custom `serialize`/`deserialize` transformers to handle schema versions.
- **Hardware Server:** Introduction of a new local Node.js Express server in the monorepo to handle peripheral integrations securely without cloud latency.
- **Styling:** Material 21 components augmented by Tailwind V4, maintaining the mandate for dialog-driven focuses rather than dense grids to satisfy the kitchen persona's need for simplicity.

## Risks & Open Questions
1. **Risk: Kitchen UX Adoption**
   - **Likelihood:** Medium
   - **Impact:** High
   - **Mitigation:** Design strictly for touch context. Eliminate keyboard entry wherever possible. Use large tap targets, high contrast, and simple dialog steps to keep cognitive load low.

2. **Risk: Mathematical & Yield Errors**
   - **Likelihood:** Low
   - **Impact:** High
   - **Mitigation:** Establish rigorous unit testing for the `CostService` and domain models, ensuring perfect conversions (e.g., Kg to portions) considering yield loss. Base logic strictly on the proven formulas from the Excel model.

3. **Risk: Offline Resiliency Failures**
   - **Likelihood:** High
   - **Impact:** High
   - **Mitigation:** Invest heavily in the `StoreForwardService`. Ensure the PWA caches the local state effectively and implements a robust optimistic UI that cleanly resolves data merges upon reconnection without panicking the operators.

## Timeline & Milestones
- **Phase 1: Foundation & Master Data (Weeks 1-3)**
  - Implement base architecture, offline models, and multi-tenant security rules.
  - Owner Setup tools: UI for Vendors, Raw Materials, Sub-components, and Recipes.
  - Data conversion logic fully tested (Units, Costs, Yields).
- **Phase 2: The Kitchen Rollout (Weeks 4-7)**
  - Develop the touch-optimized, tablet-first UI for kitchen staff.
  - Implement Auto-PO generation, Offline Receiving, and Stock Update flows.
  - Scaffold and test the local Node.js Express server for peripheral hardware.
- **Phase 3: Reconciliation & Insights (Weeks 8-10)**
  - Build the CSV POS data ingestion tool.
  - Implement the Variance Auditing dashboard (Expected vs Actual Count Sheets).
  - Deploy the Alert Engine for stockouts and budget overrides.
