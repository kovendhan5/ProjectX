# ProjectX Product Requirements Document (PRD)

## 1. Product Overview

- **Product Name:** ProjectX Trusted Pharma Billing Network
- **Objective:** Establish a blockchain-backed, end-to-end traceable billing ecosystem connecting pharmaceutical producers, distributors, retail pharmacies, regulators, and consumers.
- **Problem Statement:** Traditional pharma supply chains suffer from counterfeit risks, opaque product provenance, and unverifiable billing. Stakeholders lack a trusted, tamper-evident record linking product origins, regulatory compliance, and sales transactions.
- **Solution Summary:** Producers register products and attach tamper-proof QR codes anchored on a permissioned blockchain. Sellers and pharmacies scan codes to validate provenance, generate compliant invoices with QR codes tied to a government portal, and publish transaction data to regulators while exposing product safety details to consumers.

## 2. Goals and Non-Goals

- **Primary Goals:**
  - Provide immutable traceability for every product unit from production to point of sale.
  - Ensure billing artifacts are trustworthy, machine-verifiable, and linked to regulatory records.
  - Surface complete product information (warnings, contraindications, expiry, cold chain flags) to pharmacists and consumers.
  - Deliver real-time compliance visibility to government regulators and licensing authorities.
- **Secondary Goals:**
  - Enable analytics for supply chain performance, recalls, and adverse event tracking.
  - Support cross-border expansion through modular regulatory adapters.
- **Non-Goals:**
  - Replacing existing ERP or POS systems entirely.
  - Managing physical inventory logistics beyond recording custody events.
  - Performing payment settlement; integration points will be provided but payment processing remains external.

## 3. Stakeholders

- **Producers / Manufacturers:** Register products, upload batch metadata, print secure QR labels.
- **Distributors / Wholesalers:** Validate custody transfer, manage bulk dispatch records.
- **Retail Pharmacies / Sellers:** Verify product authenticity, generate compliant bills, provide product information to consumers.
- **Regulators / Government Agencies:** Monitor licensing, sales compliance, and recall execution.
- **Consumers / Patients:** Scan invoice QR to validate purchase legitimacy and view product advisories.
- **System Administrators:** Manage blockchain nodes, onboarding, keys, and audit responses.

## 4. Personas and Journeys

- **Priya (Producer QA Lead):** Uploads product SKUs, defines batch data, generates label PDFs, monitors scan anomalies.
- **Rahul (Distributor Operations Manager):** Receives pallets, scans to acknowledge custody, assigns to pharmacies, generates transfer certificates.
- **Anita (Pharmacy Owner):** Performs inbound verification, creates invoices with blockchain-backed QR, shares link with customers.
- **Inspector Kumar (Regulatory Auditor):** Runs reports on sales volume vs. license limits, monitors flagged transactions, triggers investigations.
- **Vijay (Consumer):** Scans invoice QR to confirm legitimacy and review warnings (e.g., pediatric contraindications).

## 5. Key Use Cases

1. **Product Onboarding:** Producer defines SKU, batch, composition, storage requirements, hazard warnings; system issues blockchain asset and QR labels.
2. **Custody Transfer:** Distributor scans inbound QR, confirms quantity, records handoff to pharmacy with signatures and timestamps.
3. **Point-of-Sale Billing:** Pharmacy scans product QR, system fetches verified data, composes invoice, registers transaction on blockchain, prints/shares invoice with QR linking to government portal.
4. **Regulatory Oversight:** Government portal ingests blockchain stream, cross-checks license validity, surfaces non-compliant sales for action.
5. **Consumer Validation:** Customer scans invoice QR, views transaction details, warranties, and health advisories.
6. **Recall / Alert:** Producer issues recall notice; system propagates alerts to holders of affected batch via push notifications and flags point-of-sale attempts.

## 6. Scope and Assumptions

- Network operates on a consortium permissioned blockchain (e.g., Hyperledger Fabric, Quorum) with identity-backed nodes.
- All stakeholders have access to internet-connected devices capable of scanning QR codes.
- Government agencies expose APIs (or secure data drop) for submitting transaction data and retrieving license status.
- System will provide SDKs/APIs for integrating with third-party POS/ERP systems.
- QR codes follow secure format (encrypted payload + digital signature) to resist tampering.

## 7. Functional Requirements

- **User Management & Identity:**
  - Role-based access for producers, distributors, sellers, regulators, admins.
  - Multi-factor authentication and hardware key support for high-privilege roles.
  - Onboarding workflow with KYC/AML compliance for licensed pharmacies.
- **Product Registry:**
  - CRUD for product SKUs, batch metadata, storage conditions, shelf life.
  - Attachment of documentation: MSDS, FDA approvals, clinical advisories.
  - Automatic QR generation (vector PDF and print-ready formats) with embedded blockchain asset ID and validation URL.
- **Blockchain Layer:**
  - Smart contracts modeling product lifecycle states (produced, in transit, received, sold, recalled, destroyed).
  - Permissioned access control for transaction submission and querying.
  - Anchoring of critical data (hashes of full records, digital signatures) with off-chain storage for bulky documents.
- **Custody Tracking:**
  - Mobile/web scanning interface to acknowledge transfers with geolocation and timestamp.
  - Bulk upload and API endpoints for high-volume distributors.
  - Exception handling for missing/damaged QR codes with manual review queue.
- **Billing & Invoicing:**
  - Invoice composition using validated product details, pricing rules, taxes, pharmacist license information.
  - Generation of invoice QR linking to government portal record; multiple format options (paper, PDF, e-receipt).
  - Support for configurable tax regimes and discount policies; audit trail for overrides.
- **Government Integration:**
  - Daily or real-time push of sales transactions via secure APIs (REST/GraphQL) or message queues.
  - Retrieval and caching of shop, pharmacist, and product licenses; automatic expiration alerts.
  - Response handling for compliance directives (suspensions, recalls, investigations).
- **Consumer Portal:**
  - Public web/mobile interface to validate invoices, view product warnings, report adverse events.
  - Multilingual support and accessibility compliance.
- **Analytics & Reporting:**
  - Dashboard for supply chain integrity metrics, sales velocity, anomaly detection.
  - Custom report builder with export to CSV/PDF.
  - Alerting for counterfeit suspicion (duplicate scans, location anomalies).
- **Administration & Audit:**
  - Node monitoring, ledger health checks, certificate lifecycle management.
  - Immutable audit logs for every configuration change.
  - Case management workflow for investigating flagged transactions.

## 8. Data Model (High-Level)

- **Entities:** Product, Batch, QRCode, Stakeholder, License, CustodyEvent, Invoice, InvoiceItem, ComplianceAlert, RecallNotice, AdverseEventReport.
- **Relationships:**
  - Product has many Batches; Batch links to QRCode instances.
  - CustodyEvents chain together via parent-child references providing provenance graph.
  - InvoiceItems reference QRCode/Batch and include pricing, tax, warnings.
  - ComplianceAlert references Stakeholder, Invoice, Product.
- **Storage Strategy:**
  - On-chain: Hash of Product, Batch, CustodyEvent, Invoice; key states and signatures.
  - Off-chain: Detailed metadata in secure database (PostgreSQL/NoSQL) with encrypted storage; documents in object store.

## 9. QR Code Specification

- Payload contains unique asset ID, checksum, signature, optional encrypted metadata.
- Uses error correction level capable of surviving typical label wear (Level Q or H).
- Printed with tamper-evident labels; optional NFC tag association for high-risk products.
- Invoice QR contains URL to government portal entry plus hashed reference to blockchain transaction.

## 10. Security, Privacy, and Compliance

- Align with HIPAA/GDPR-equivalent where applicable for patient data.
- Encrypt sensitive data at rest (AES-256) and in transit (TLS 1.3).
- Implement fine-grained access policies and segregation of duties.
- Maintain full audit trail; support forensic export.
- Regular pen testing, smart contract audits, and key rotation policies.
- Data retention policies aligned with regulatory mandates; support right-to-forget where legally required.

## 11. Non-Functional Requirements

- **Scalability:** Support 10k transactions/minute during peak retail hours; horizontal scaling through microservices.
- **Availability:** 99.9% SLA for critical services; blockchain nodes deployed across multiple data centers.
- **Performance:** Sub-second QR scan validation; invoice generation under 2 seconds.
- **Reliability:** Automatic failover for blockchain nodes; distributed ledger synchronization monitoring.
- **Usability:** Responsive UX for tablets and desktops; WCAG 2.1 AA compliance for consumer portal.
- **Maintainability:** Modular service architecture with documented APIs; infrastructure-as-code for deployment.
- **Observability:** End-to-end tracing, metrics dashboards, centralized logging, and alert thresholds.

## 12. Integration Architecture

- Microservices layer exposing REST/GraphQL APIs for onboarding, scanning, invoicing, compliance.
- Blockchain network with validator nodes run by consortium members (producers, regulator, independent auditors).
- Message bus (Kafka/AMQP) for event-driven updates (recalls, alerts, analytics ingestion).
- Identity and access management via OAuth2/OpenID Connect integrated with enterprise SSO.
- Connectors for ERP/POS (SAP, Oracle, custom) through SDK and webhooks.
- Government portal integration using secure APIs with mutual TLS, signing keys, and data validation schemas.

## 13. Analytics and Monitoring

- Real-time dashboards for transaction throughput, anomaly scores, geographic distribution of sales.
- Machine learning hooks for fraud detection (duplicate scans, improbable inventory turnover).
- Recall effectiveness tracking: percentage of units recovered vs. sold.
- Consumer feedback loop capturing adverse events, escalated for regulatory review.

## 14. Success Metrics (KPIs)

- 100% of registered products mapped to verified producers.
- Reduction in counterfeit incidents by >80% within first year.
- 95% invoices validated by regulators within SLA.
- <1% failed QR validation scans at point of sale.
- 90% consumer trust rating via post-scan feedback surveys.

## 15. Release Plan (High-Level)

- **Phase 0 (0-2 months):** Requirements validation, consortium formation, regulatory alignment, technical architecture finalization.
- **Phase 1 (3-6 months):** MVP with producer onboarding, blockchain network setup, basic custody tracking, pharmacy billing prototype.
- **Phase 2 (7-10 months):** Government portal integration, consumer validation portal, advanced analytics, recall workflows.
- **Phase 3 (11-14 months):** Scale rollout, ERP/POS integrations, mobile apps, performance hardening.
- **Phase 4 (15+ months):** Cross-border compliance modules, AI-driven anomaly detection, extended data marketplace.

## 16. Risks and Mitigations

- **Regulatory API Readiness:** Mitigate via staged rollout and data escrow until live integration.
- **Stakeholder Adoption:** Offer onboarding incentives, training, and modular integration adapters.
- **QR Tampering:** Use tamper-evident labels, periodic revalidation, and anomaly detection.
- **Blockchain Governance:** Define consortium charter, dispute resolution, and node participation rules early.
- **Data Privacy Breach:** Enforce encryption, access auditing, and incident response playbooks.
- **Operational Complexity:** Invest in DevOps automation, runbooks, and managed support tiers.

## 17. Open Questions

- Which jurisdictions and regulatory frameworks must the initial launch support?
- Are there existing government portals with required APIs, or must ProjectX deliver the portal component?
- What level of integration is needed with consumer-facing health platforms or insurance providers?
- How will pricing models (subscription, transaction-based) be structured for different stakeholder tiers?

## 18. Appendices

- Glossary of terms (SKU, MSDS, KYC, etc.).
- Reference standards: GS1 barcode guidelines, WHO Good Distribution Practice, ISO/IEC 18004 (QR Code).
- Preliminary data flow diagrams and sequence charts (to be produced in design phase).
