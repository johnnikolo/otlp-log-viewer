# 🔭 OTLP Log Viewer

A web UI for exploring OpenTelemetry (OTLP) logs — a sortable log table, a severity-stacked histogram, and a group-by-service view — built with Next.js and TypeScript.

<img width="1133" height="452" alt="Image" src="https://github.com/user-attachments/assets/5449a3de-9843-4491-85df-50cf6bcfc41f" />

**Live demo:** https://otlp-log-viewer-lilac.vercel.app/

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Requires Node 18.18+. Other scripts:

```bash
npm run build    # production build
npm start        # serve the production build
npm test         # Jest + React Testing Library (143 tests)
npm run lint     # ESLint (flat config)
```

Logs are fetched from the assignment API (`https://take-home-assignment-otlp-logs-api.vercel.app/api/v2/logs`), configured in [lib/api.ts](lib/api.ts). No environment variables are needed.

## ✨ Features

### 📋 Log list

- Table with **Severity**, **Time**, **Service**, and **Body** columns.
- **Sortable** by severity, time, or service (defaults to newest-first).
- **Expandable rows** revealing the full message, trace/span IDs, exact timestamp, severity number, service namespace/version, and all attributes.
- **Body type detection** — plain text, pretty-printed JSON, and stack traces are each rendered appropriately.
- **Virtualized** rendering so large result sets stay smooth (only visible rows are mounted).
- Keyboard accessible — rows are focusable and toggle with Enter/Space (`aria-expanded`).

### 📊 Histogram

- Log volume over time (X: time, Y: count), bucketed into 24 intervals across the selected range.
- **Stacked by severity**, with a color legend.
- Hover tooltip showing the exact time range plus a per-severity breakdown.
- Lazy-loaded (Recharts is code-split via `next/dynamic`) so it doesn't block first paint.

### 🗂️ Group by service

- Toggle between a **flat list** and a **grouped view** organized by parent resource (`service.name`).
- Collapsible per-service accordions, each with its log count, error/warn counts, and top-severity badge.
- Groups sorted by highest severity, then volume.

### 🔍 Filtering & refresh

- **Time range** picker (1h / 6h / 24h / 7d / All) that drives both the histogram and the list.
- **Auto-refresh** (Off / 5s / 10s / 30s / 1m) plus manual refresh and a "last updated" timestamp.
- Header summary: total logs, error & fatal count, and warn count.

### 🎨 UX & robustness

- **Light/dark theme** honoring the OS preference, persisted to `localStorage`, with a no-flash inline script.
- **Runtime validation** — the API response is parsed with a Zod schema before use, so malformed data fails loudly instead of corrupting the UI.
- **Cancellable requests** — in-flight fetches abort when superseded or unmounted (`AbortSignal`).
- **Status-aware retries** — no retry on 4xx or schema-validation errors; transient failures back off.
- **Error handling** at every level — an app-level error boundary, per-panel error overlays with retry, and loading skeletons.
- Responsive layout down to narrow widths.

## 🔄 OTLP data handling

The raw OTLP payload (`resourceLogs → scopeLogs → logRecords`) is flattened into a normalized record shape in [lib/transform.ts](lib/transform.ts):

- **Timestamps** — nanosecond `timeUnixNano` is parsed with `BigInt` to avoid precision loss, falling back to `observedTimeUnixNano` per the OTel data model.
- **Severity** — a valid `severityText` is preferred, otherwise the level is derived from `severityNumber` using the OTel ranges (TRACE 1–4, DEBUG 5–8, INFO 9–12, WARN 13–16, ERROR 17–20, FATAL 21–24).
- **Trace correlation** — `trace.id` / `span.id` attributes are pulled into dedicated fields for distinct display.
- **Stable IDs** — each record gets a deterministic content-hash id, so React keys, expanded-row state, and virtualizer measurements stay stable across refetches of unchanged data.

## 🛠️ Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **TanStack Query** — data fetching, caching, auto-refresh, retries
- **TanStack Table** + **TanStack Virtual** — sorting and row virtualization
- **Recharts** — histogram
- **Radix UI** — accessible primitives (accordion, select, toggle, tooltip)
- **Tailwind CSS** — styling with semantic theme tokens
- **Zod** — runtime response validation
- **Jest** + **React Testing Library** — 143 tests across 23 suites

## 📁 Project structure

```
app/
  components/
    log-viewer/
      controls/     time range, view mode, refresh controls
      detail/       expanded-row detail + body rendering
      histogram/    chart, tooltip, legend, panel
      table/        table, header, rows, columns, + hooks/
      LogViewer.tsx           top-level composition
      GroupedLogView.tsx      group-by-service view
      LogViewerHeader.tsx     brand, stats, controls
    ui/             reusable primitives (badges, dropdown, theme toggle…)
  error.tsx         app-level error boundary
lib/
  api.ts            fetch + Zod validation
  transform.ts      OTLP → normalized records, bucketing, grouping
  useLogsQuery.ts   shared TanStack Query hook
  timeRange.ts      range filtering + histogram windowing
  utils/            severity, time, and format helpers
types/otlp.ts       OTLP + normalized type definitions
```

## 🧪 Testing

```bash
npm test
```

Covers the transform/utility layer (severity mapping, timestamp parsing, bucketing, grouping) and every component (rendering, sorting, row expansion, view switching, time-range filtering, error/retry flows, theme toggling).
