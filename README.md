# Permanent Residency Tracker

A tiny **Next.js** app that helps you sketch and plan your **PR maintenance** (730 days in rolling 1825-day windows) and **citizenship physical presence** (1095 days, with half credit for eligible pre-PR time in Canada, capped at 365). You add your important dates and trips; the app does the counting.

## Run it locally

```bash
bun i
bun dev
```

Open the URL the terminal prints (usually `http://localhost:3000`).

```bash
bun build   # production check
bun start   # run production build
```

## Your data

Everything is stored in **your browser** (`localStorage`). There is no server or account. Use **Export** in the app if you want a backup JSON file.

## Disclaimer

This is a **planning tool**, not legal advice. IRCC rules and your situation can differ. Check official sources when it matters.