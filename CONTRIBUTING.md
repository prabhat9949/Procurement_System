# Contributing to the Enterprise Procurement System

Thank you for contributing to EPS, an enterprise procurement platform built with
Spring Boot, React, TypeScript, and MySQL.

## Before You Start

- Read the project overview and setup instructions in `README.md`.
- Install Java 21, Maven, Node.js LTS, and MySQL.
- Check existing issues, documentation, and open pull requests before starting work.
- Never commit passwords, tokens, private keys, or local environment files.

## Branching and Commits

Create a dedicated branch from `develop` for every task:

```text
feature/<short-description>
bugfix/<short-description>
hotfix/<short-description>
```

Examples include `feature/vendor-management` and `bugfix/invoice-validation`.
Use clear, focused commits. Keep unrelated changes out of the same branch.

## Development Guidelines

- Backend changes belong in the layered Spring Boot architecture.
- Keep controllers thin; place business rules in services and persistence in repositories.
- Use DTOs, constructor injection, validation annotations, and centralized exception handling.
- Use functional React components and TypeScript on the frontend.
- Keep API calls in the API/service layer and shared state in Redux Toolkit where appropriate.
- Use migrations and seed data for database changes; preserve referential integrity.
- Update relevant API, architecture, workflow, or deployment documentation.
- Add or update tests for changed behavior.

## Pull Requests

1. Rebase or merge the latest `develop` into your branch.
2. Run the relevant backend and frontend checks locally.
3. Describe the change, affected modules, database changes, and test results.
4. Include screenshots or Postman examples for UI or API changes when useful.
5. Open the pull request against `develop`.

Direct commits to `main` are not permitted. Releases are promoted from `develop`
to `main` after review and validation.

## Areas of Ownership

Changes may involve authentication/RBAC, master data, procurement, inventory,
finance, reporting, notifications, audit, or future integrations. Coordinate
cross-module changes with the relevant maintainers and keep the end-to-end
procurement workflow in mind.
