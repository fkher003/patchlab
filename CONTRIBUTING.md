# Contributing

Thank you for your interest in PatchLab.

## Development Setup

1. Install the Node.js version specified in `.node-version` (Node.js >= 24.12).
2. Install dependencies and verify the baseline:

```bash
npm ci
npm run verify
```

## Workflow

- Create a feature or fix branch from `main` (e.g., `feat/PL-xxx-short-description` or `fix/PL-xxx-short-description`).
- Add or update automated tests under `test/` for any behavioral change.
- Run `npm run verify` (strict TypeScript typecheck, Prettier formatting check, and full test suite) before opening a pull request.
- Keep commits focused and descriptive. Do not commit secrets, generated `reports/`, `node_modules/`, or unverified benchmark numbers.
