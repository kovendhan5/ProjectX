# Component Overview

This guide enumerates the logical components that will compose ProjectX and clarifies their responsibilities and integration contracts.

## Core Platform Services

| Component                   | Responsibility                                                                             | Key Interfaces                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Identity and Access Service | Tenant, user, and role management with MFA and hardware key enforcement                    | OAuth2/OpenID Connect, SCIM provisioning                              |
| Product Registry            | SKU, batch, documentation, and warning metadata management                                 | REST/GraphQL endpoints, bulk CSV import, event stream                 |
| Custody Orchestrator        | Records custody events, validates scan authenticity, detects anomalies                     | Mobile scanning API, distributor bulk ingest API, alert notifications |
| Billing Service             | Generates compliant invoices, calculates taxes, signs invoices, produces QR payloads       | POS API, PDF generation pipeline, blockchain anchoring                |
| Compliance Gateway          | Streams sales data to regulators, reconciles license status, handles enforcement responses | Government API adapters, message queues, reporting API                |
| Blockchain Adapter          | Abstracts ledger transactions, smart contract invocation, and state queries                | gRPC/REST interface to chaincode, event emitters                      |
| Analytics Platform          | Aggregates events, drives dashboards, powers anomaly detection models                      | ETL jobs, BI connectors, ML pipelines                                 |

## Client Experiences

- **Pharmacy Portal:** Inventory verification, billing console, recall notifications, license status dashboard.
- **Regulator Portal:** Compliance overview, case management, investigative drill-downs, audit exports.
- **Producer Console:** Batch onboarding, label management, quality alerts, performance analytics.

## Integration Connectors

- **ERP/POS Adapters:** SDKs and webhook handlers enabling third-party systems to push or pull custody and billing data.
- **Government Portal Adapters:** Configurable connectors supporting file drops, API pushes, or secure messaging depending on jurisdiction.
- **Notification Service:** Multi-channel delivery (email, SMS, push) for critical alerts, recalls, and regulatory notices.

## Supporting Capabilities

- **Secrets Management:** Vault-backed store for API keys, certificates, and signing keys.
- **Observability Stack:** Centralized logging, metrics, tracing, and incident dashboards.
- **DevSecOps Pipeline:** CI/CD workflows with security scans, infrastructure-as-code validation, and automated compliance checks.

Extend this document as components are elaborated, ensuring interface contracts and SLAs are captured alongside dependencies.
