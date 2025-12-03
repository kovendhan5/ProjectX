# Contributing

Thank you for investing in ProjectX. Follow the guidelines below to keep collaboration predictable, secure, and audit-ready.

## Branching and Workflow

- Fork or create feature branches off `main` using the pattern `<area>/<short-description>` (e.g., `api/billing-endpoints`).
- Keep branches focused; large cross-cutting changes should be broken into sequenced pull requests.
- Rebase onto the latest `main` before opening a pull request to minimize merge conflicts.

## Commit Hygiene

- Write descriptive commit messages following the structure `<type>: <summary>` (e.g., `feat: add custody anomaly detector`).
- Reference related issues using `Fixes #id` or `Refs #id` in commit bodies.
- Avoid committing generated artifacts, secrets, or credential files.

## Pull Request Expectations

- Include a concise summary, testing evidence, and security considerations in each PR description.
- Request review from the relevant code owners (API, blockchain, clients, infrastructure).
- Ensure CI pipelines pass (lint, unit, integration, security scans) prior to requesting merge.

## Testing Standards

- Provide automated tests alongside code changes (unit, integration, contract, or end-to-end as applicable).
- Document manual test steps when automation is not feasible, and create follow-up tasks to cover gaps.
- Keep fixtures and test data scrubbed of sensitive information.

## Documentation

- Update `README.md`, architecture docs, or API references when behavior or interfaces change.
- Record significant design decisions as Architecture Decision Records (ADRs) under `docs/adr/` (create the folder if absent).
- Link documentation updates in the PR to help reviewers trace context quickly.

## Security and Compliance

- Never store secrets in the repository; use the designated vault or secret manager.
- Flag any cryptography, identity, or compliance-impacting changes for security review.
- Report vulnerabilities privately to the security team before disclosing them publicly.

## Communication

- Use issue templates for bugs, features, and tasks to streamline triage.
- Discuss breaking or contentious changes in design reviews before implementation.
- Keep discussions respectful and inclusive; follow the code of conduct of the hosting organization.

By following these practices, we ensure ProjectX remains trustworthy for all partners in the pharmaceutical ecosystem.
