# Data Flow Narratives

These flows outline how information travels across ProjectX for critical end-to-end scenarios. Expand each sequence with diagrams and timing details as implementation decisions solidify.

## 1. Product Onboarding

1. Producer authenticates via Identity service and submits SKU, batch, and documentation through the Product Registry API.
2. Registry validates metadata, persists off-chain records, and triggers smart contract creation via the Blockchain Adapter.
3. Blockchain records hash of the batch payload and emits an event consumed by the Label Service.
4. Label Service generates secure QR assets and stores print files in object storage; notification sent to producer.
5. Analytics Platform ingests onboarding event for traceability reporting.

## 2. Custody Transfer

1. Distributor scans inbound products using scanning client; Custody Orchestrator verifies QR signature and ledger state.
2. Valid scans create custody events anchored on-chain and persisted off-chain with geolocation, timestamp, and actor identity.
3. Orchestrator publishes transfer event to message bus; Analytics and Compliance services subscribe for anomaly detection.
4. If discrepancies occur, alert routed to Case Management workflow for manual resolution.

## 3. Point-of-Sale Billing

1. Pharmacy POS scans product QR; Billing Service fetches validated product metadata and pricing rules.
2. Service composes invoice, applies taxes, embeds regulator-mandated disclosures, and anchors invoice hash on blockchain.
3. Invoice QR with government portal URL is generated and rendered on receipt/PDF.
4. Compliance Gateway packages transaction payload and pushes to government endpoint, awaiting acknowledgment.
5. Consumer receives invoice copy with QR for downstream validation.

## 4. Regulatory Reporting and Enforcement

1. Compliance Gateway batches or streams transactions to government API with mutual TLS and digital signatures.
2. Government portal responds with license confirmation, warnings, or enforcement directives.
3. Gateway updates license cache, triggers workflow for suspensions or audits, and logs events for auditing.
4. Regulator Portal surfaces updated compliance status and pending actions to agency users.

## 5. Consumer Validation

1. Consumer scans invoice QR which resolves to government portal link including blockchain transaction reference.
2. Portal retrieves transaction details, verifies signatures, and displays authenticity status plus product advisories.
3. Consumer may submit feedback or adverse event report which routes back to Compliance Gateway and Analytics Platform.

## 6. Recall Execution

1. Producer initiates recall via Product Registry, specifying affected batches and guidance.
2. Smart contract records recall state; Notification Service broadcasts alerts to pharmacies with inventory matches.
3. Custody Orchestrator flags any attempted sale of recalled items and blocks billing flow.
4. Regulator Portal tracks remediation progress; Analytics monitors recall effectiveness KPIs.

Augment these narratives with sequence diagrams, message schemas, and latency targets to guide implementation and testing.
