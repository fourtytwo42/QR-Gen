# QR-Gen Studio

High-fidelity QR + short-link studio built with Next.js (App Router), Mantine v7, and Tabler Icons.

## What’s inside

- **Web app** (`/web`) – Next.js 16 App Router, React 19, Mantine design system, and a fully mocked product experience (QR wizard, short-link wizard, editor dashboard, docs, and landing page).
- **Docs** (`/docs/project-doc.txt`) – the original product brief that guided the build.

## Local development

```bash
cd web
npm install
npm run dev
```

Lint the project (ESLint via Next.js):

```bash
cd web
npm run lint
```

## Feature highlights

- Three-step QR creation wizard with styling controls (colors, gradients, module/eye styles, quiet zone, ECC and logo enforcement).
- Short-link flow with device-bound management, redirect policy controls, and inline compliance hints.
- Editor dashboard that mirrors the real operational model: analytics, governance, password protection, asset regeneration call-to-actions.
- Multi-link landing page template aligned to the same design language.
- Documentation page summarizing design rules, safety posture, privacy, and operations runbook.

## License

MIT
