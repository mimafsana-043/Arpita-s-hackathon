# Smart Office Energy Dashboard — Frontend

React + Vite dashboard for the shared Smart Office backend. The frontend loads a REST snapshot first, then subscribes to Socket.IO updates. The Discord bot should use the same backend rather than maintaining separate device state.

## Dashboard features

- interactive SVG top-view floor plan for Drawing Room, Work Room 1, and Work Room 2;
- data-bound light glow and fan rotation with accessible device inspection;
- Overview, Details, and Both display modes;
- responsive room cards with active fan/light summaries;
- live total and room power, 100-point rolling power trend, and usage meters;
- backend-preferred alerts with local demo fallback;
- REST-first synchronization, Socket.IO updates, reconnection resync, and mock mode;
- reduced-motion support and mobile-friendly horizontal floor-plan navigation.

## Run locally

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

If the variable is omitted, the frontend uses `http://localhost:5000`.

## Backend contract

The frontend requests these endpoints before opening its Socket.IO connection:

- `GET /api/devices` — an array of devices, or `{ "devices": [...] }`
- `GET /api/usage` — usage values, optionally wrapped as `{ "usage": {...} }`
- `GET /api/alerts` — an array of alerts, or `{ "alerts": [...] }`

Supported usage fields are `totalPower` plus `roomPower`, `perRoom`, or `rooms`. If a total or room value is missing, the dashboard calculates it from ON devices and their `currentPower`.

The Socket.IO server should emit:

- `devices:update` — complete device array; replaces current devices
- `device:update` — one device object with an `id`; merges that device
- `usage:update` — latest usage object
- `alerts:update` — complete active-alert array; replaces current alerts

Wrapped payloads such as `{ "device": {...} }`, `{ "devices": [...] }`, `{ "usage": {...} }`, and `{ "alerts": [...] }` are also accepted.

Example backend emissions:

```js
io.emit('devices:update', devices)
io.emit('device:update', updatedDevice)
io.emit('usage:update', {
  totalPower: 375,
  roomPower: {
    'Drawing Room': 150,
    'Work Room 1': 90,
    'Work Room 2': 135,
  },
})
io.emit('alerts:update', activeAlerts)
```

When a device changes, persist the shared backend state first, then emit `device:update` and the matching `usage:update`. This keeps both dashboard values and any Discord bot reads consistent.

For the floor plan, each device should include a stable `id`, one of the exact room names (`Drawing Room`, `Work Room 1`, `Work Room 2`), `type` (`fan` or `light`), and a sortable name (`Fan 1`, `Fan 2`, `Light 1`–`Light 3`). Also provide `status`, `currentPower`, and `lastChanged` for complete icon details. Missing devices are rendered as unavailable rather than silently replaced with fake state.

## Connection and mock behavior

- Startup always attempts the three REST requests before connecting Socket.IO.
- A successful snapshot or socket connection shows **Live**.
- If startup cannot reach the backend, bundled data in `src/data/mockDevices.js` remains visible and the header shows **Mock Mode · Backend Disconnected**.
- A disconnect shows **Backend Disconnected** while retaining the last known data.
- Every reconnect fetches a fresh REST snapshot before continuing with live events, preventing missed events from leaving stale state.

## Power history and local alerts

The **Recent Power Trend** records changed total-power values in memory with timestamps. It retains only the latest 100 points and resets when the page reloads; no unlimited history or browser storage is used.

Backend alerts remain authoritative, including an empty `[]` response. If the alerts endpoint is unavailable or does not return an alert array, the frontend derives demo-safe alerts for:

- active devices outside 8:00 AM–6:00 PM local time;
- all five devices being active in one room;
- total power at or above 350W.

## Test reconnection

1. Start the backend and frontend; confirm the badge reads **Live**.
2. Stop the backend. The badge changes to **Backend Disconnected**, while the current cards remain visible.
3. Change backend state while the frontend is disconnected, then restart the backend.
4. Socket.IO reconnects automatically and the frontend re-fetches all three REST endpoints. Confirm the badge returns to **Live** and the changed snapshot appears without refreshing the page.

## Mock mode

Start only the frontend, leaving `http://localhost:5000` unavailable. The header and map identify mock/disconnected mode while bundled device data, locally derived alerts, the power meter, and the SVG floor plan remain demoable.

## Demo checklist

1. Start the backend simulator.
2. Start the frontend.
3. Open the dashboard and confirm the **Live** badge.
4. Show the room cards and active fan/light summaries.
5. Show the power meter and rolling trend.
6. Show the alert panel.
7. Show the SVG floor plan and its legend.
8. Trigger a device status change from the shared backend.
9. Show the light glow or fan rotation update without refreshing.
10. Show the total power and trend update, then select the changed map icon for details.
