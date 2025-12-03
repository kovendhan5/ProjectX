# Deployment Topology

This document sketches the target-state environments, hosting strategy, and runtime topology for ProjectX. Refine as infrastructure requirements are finalized.

## Environments

| Environment | Purpose | Key Characteristics |
|-------------|---------|---------------------|
| Dev | Rapid iteration for feature branches, mocked integrations | Single-region cluster, permissive feature toggles, ephemeral data |
| QA / Staging | Integration testing, performance validation, pre-production sign-off | Mirrors production topology, connects to sandbox government APIs |
| Production | Live consortium operations | Multi-region high availability, hardened security controls, audited change management |

## Logical Layout

```
+-----------------+      +----------------+      +----------------+
| Client Devices  | ---> | API Gateway    | ---> | Service Mesh   |
+-----------------+      +----------------+      +----------------+
                                                | Identity Svc   |
                                                | Product Reg.   |
                                                | Custody Orches.|
                                                | Billing Svc    |
                                                | Compliance Gtw |
                                                +----------------+
                                                      |
                                                      v
                                              +----------------+
                                              | Blockchain Net |
                                              | (Validator     |
                                              |  Nodes)        |
                                              +----------------+
                                                      |
                                                      v
                                              +----------------+
                                              | Data Lake &    |
                                              | Analytics      |
                                              +----------------+
```

## Hosting Strategy

- **API Layer:** Containerized microservices deployed on Kubernetes (AKS/EKS/GKE) with autoscaling and zero-downtime rollouts.
- **Blockchain Nodes:** Managed via consortium-operated Kubernetes clusters or bare-metal hosts with dedicated HSM integration; separated orderer and peer nodes.
- **Data Stores:** PostgreSQL for transactional needs, object storage for documents, and scalable warehouse (e.g., Snowflake/BigQuery) for analytics.
- **Messaging:** Kafka or AMQP broker for event-driven integrations and real-time notifications.

## Networking and Segmentation

- Private subnets for core services with ingress controlled by API gateway and service mesh mutual TLS.
- Separate network segments per stakeholder node to enforce least-privilege access.
- VPN or dedicated connectivity (MPLS/ExpressRoute) for government agency integrations where possible.

## Observability and Operations

- Centralized logging (ELK / OpenSearch) and metrics (Prometheus + Grafana) stack shared across environments.
- Distributed tracing via OpenTelemetry to monitor cross-service latency.
- Automated runbooks executed through Infrastructure-as-Code (Terraform/Ansible) with policy-as-code guardrails.

Document concrete cloud provider services, sizing assumptions, and failover playbooks here as the platform design solidifies.
