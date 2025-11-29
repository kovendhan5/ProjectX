# System Context

ProjectX connects multiple regulated stakeholders through a permissioned blockchain backbone while exposing secure interfaces for day-to-day operations.

## Primary Actors

| Actor                            | Role in Ecosystem                                                     | Interaction Highlights                                                     |
| -------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Producers / Manufacturers        | Register product SKUs and batches; print tamper-evident QR labels     | Create on-chain assets, upload documentation, request analytics            |
| Distributors / Wholesalers       | Handle bulk custody transfers between producers and pharmacies        | Scan and acknowledge inventory, submit custody events, flag exceptions     |
| Retail Pharmacies / Sellers      | Validate provenance, maintain inventory visibility, generate invoices | Scan inbound products, issue compliant bills, respond to recalls           |
| Regulators / Government Agencies | Oversee licensing, compliance, and recall execution                   | Subscribe to ledger events, review dashboards, trigger enforcement actions |
| Consumers / Patients             | Verify purchase authenticity and safety advisories                    | Scan invoice QR, view product warnings, submit adverse event reports       |
| External Systems                 | ERP/POS platforms, payment gateways, government portals               | Integrate via APIs, webhooks, and secure data feeds                        |

## Boundary Overview

- **Consortium Blockchain Network:** Shared ledger operated by approved nodes (producers, regulator, independent auditor). Stores tamper-evident hashes and transaction states.
- **Application Services:** Microservices exposing REST/GraphQL APIs for onboarding, custody, billing, and compliance flows. Reside within ProjectX-managed cloud environments.
- **Client Applications:** Web/mobile portals tailored to persona workflows (pharmacy checkout, regulator monitoring, producer operations).
- **Government Portal Integration:** Secure channel for reporting sales data, license validation, and enforcement signals. Anchors invoice QR references consumed by consumers.
- **Analytics and Data Lake:** Off-chain store aggregating events for dashboards, anomaly detection, and recall analysis. Fed by event streams from services and blockchain emitters.

## Trust Zones

- **Consortium Zone:** Nodes with strict PKI-backed identities; smart contracts enforce role-based permissions.
- **Enterprise Zone:** ProjectX services, databases, and analytics systems deployed in segmented networks with least-privilege access.
- **Edge Zone:** Scanning devices, POS systems, and consumer mobile apps interacting through authenticated APIs.

Document assumptions about hosting, networking, and compliance controls here as infrastructure designs become concrete.
