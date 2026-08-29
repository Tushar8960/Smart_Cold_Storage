# Harvest Guard — Smart Solar Cold Storage Dashboard

A warm, simple React dashboard for the Smart Solar-Powered IoT Mini Cold
Storage project — designed for farmers and collection-centre operators, not
just technicians.

## Stack
- React 19 + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- `lucide-react` for icons
- Google Fonts: Fredoka (headings) + Nunito (body)

## Getting started
```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend, or leave unset to use the dev proxy
npm run dev
```

## Design notes
- **Palette**: warm cream background, deep leaf green for structure, a
  brighter green for highlights, harvest gold for warnings, soft clay-red for
  critical alerts. All defined as tokens in `src/index.css` (`@theme` block)
  — change them in one place to retheme the whole app.
- **Type**: Fredoka for headings (big, round, friendly — legible at a glance
  outdoors or on a small phone screen), Nunito for body copy and numbers.
- **Plain language over jargon**: cards say "Nice and cool" or "A little
  warm — keep an eye on it" rather than just a bare number, so the dashboard
  is useful even to someone unfamiliar with the electronics.
- **Big, touch-friendly controls**: the target-temperature control uses large
  plus/minus buttons instead of a small numeric field, since this is meant to
  be used on a phone in the field.
- **Leaf motif**: a small set of reusable leaf SVGs (`src/components/common/LeafDecorations.jsx`)
  are the one recurring decorative element — used sparingly as corner accents,
  empty-state illustrations, and a dotted "vine" divider, rather than photos
  or heavy imagery.

## Folder structure

```
src/
├── api/                  # Talks to the backend
│   ├── client.js         # fetch wrapper (base URL, headers, error handling)
│   └── endpoints.js      # One function per backend route:
│                          #   GET  /target
│                          #   PUT  /target
│                          #   GET  /readings/latest
│                          #   GET  /readings/history
│                          #   GET  /alerts
│
├── hooks/                # Data-fetching hooks, each polling on an interval
│   ├── useLatestReading.js   # live temp/humidity/battery/cooling + online status
│   ├── useReadingHistory.js  # data for the history charts
│   └── useAlerts.js          # active + historical alerts
│
├── components/
│   ├── dashboard/        # TemperatureCard (hero), HumidityCard, BatteryCard,
│   │                      # CoolingStatusCard, DeviceStatusBadge,
│   │                      # TargetTemperatureControl
│   ├── charts/           # TemperatureHumidityChart, BatteryHistoryChart
│   │                      # (placeholders — plug in recharts/chart.js etc.)
│   ├── alerts/           # AlertBanner, AlertHistoryList
│   ├── layout/           # Navbar (Sidebar.jsx kept for future multi-device use)
│   └── common/           # LoadingSpinner, ErrorMessage, LeafDecorations
│
├── pages/
│   └── DashboardPage.jsx # Composes everything above into the main screen
│
├── context/              # (empty) for global state if you outgrow hooks-per-page
└── utils/                # (empty) for formatting helpers, constants, etc.
```

## Next steps
- Wire in a real chart library (recharts is a solid, lightweight pick) inside
  `TemperatureHumidityChart` and `BatteryHistoryChart`.
- If the backend response shape differs from `{tempC, humidity, battery,
  targetC, coolingOn, powerSource}`, adjust `src/api/endpoints.js` and the
  card props in `DashboardPage.jsx` to match.
- `Sidebar.jsx` is unused for now (kept intentionally simple, single-column)
  but is ready to reintroduce once you support multiple storage units.
