# Smart Office Energy Backend

Shared Node.js/Express foundation for the web dashboard and future Discord bot. Device state lives in exactly one mutable in-memory collection inside `src/store/deviceStore.js`; all future REST, simulator, Socket.IO, and alert modules must use that store.

## Inventory decision

The project requested exactly 18 devices, while the original list described only five devices per room. This implementation resolves the mismatch as six devices per room: two fans and four lights (`Light 1` through `Light 4`). That produces 18 unique fixed devices without duplicate IDs.

## Run

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The default server URL is `http://localhost:5000`.

On macOS, AirPlay Receiver may already occupy port 5000. Keep the requested default for team integration, or use another port locally without changing code:

```bash
PORT=5050 npm run dev
```

If using 5050, set the frontend's `VITE_BACKEND_URL=http://localhost:5050` as well.

## Configuration

```env
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
OFFICE_START_HOUR=9
OFFICE_END_HOUR=17
SIMULATOR_INTERVAL_MS=7000
DEVICE_ON_TIMEOUT_MINUTES=120
ROOM_FULLY_ON_TIMEOUT_MINUTES=120
HIGH_POWER_THRESHOLD_W=250
```

| Variable | Default | Purpose |
| --- | ---: | --- |
| `PORT` | `5000` | REST and Socket.IO port |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Allowed dashboard CORS origin |
| `OFFICE_START_HOUR` | `9` | Local office opening hour |
| `OFFICE_END_HOUR` | `17` | Local office closing hour |
| `SIMULATOR_INTERVAL_MS` | `7000` | Milliseconds between simulator ticks |
| `DEVICE_ON_TIMEOUT_MINUTES` | `120` | Continuous device runtime alert threshold |
| `ROOM_FULLY_ON_TIMEOUT_MINUTES` | `120` | Fully-active room alert threshold |
| `HIGH_POWER_THRESHOLD_W` | `250` | Combined office load alert threshold |

## Health check

```bash
curl http://localhost:5000/health
```

Expected response includes `"status":"OK"` and `"deviceCount":18`.

## Verify the internal store

```bash
npm run verify
npm run validate
```

`verify` checks store and simulator invariants. `validate` performs the final backend contract audit: device/room counts, calculated usage, shared-store mutations, every alert rule, and alert deduplication.

## Store API

- `getAllDevices()`
- `getDevicesByRoom(roomName)`
- `getDeviceById(id)`
- `updateDeviceStatus(id, status)`
- `getRoomSummary()`
- `getUsageSummary()`

Getter results are defensive snapshots. The module's internal device array remains the single mutable source of truth.

## REST snapshot API

Every response below is generated from `src/store/deviceStore.js`. There are no route-level mock device arrays.

| Method | Canonical endpoint | Alias | Description |
| --- | --- | --- | --- |
| GET | `/api/devices` | `/devices` | All 18 devices |
| GET | `/api/rooms` | `/rooms` | Three grouped room snapshots |
| GET | `/api/rooms/:roomName` | `/room/:roomName` | One room snapshot |
| GET | `/api/usage` | `/usage` | Total, per-room, and estimated daily usage |
| GET | `/api/alerts` | `/alerts` | Active alerts derived from current store state |
| GET | `/api/status` | — | Human-friendly office summary for Discord |

Device responses retain both naming conventions used by clients:

```json
{
  "id": "drawing_room_fan_1",
  "name": "Fan 1",
  "room": "Drawing Room",
  "type": "fan",
  "status": "OFF",
  "ratedPowerW": 60,
  "power": 60,
  "currentPowerW": 0,
  "currentPower": 0,
  "lastChanged": "2026-07-03T16:00:00.000Z",
  "onSince": null
}
```

Usage response example:

```json
{
  "totalPowerW": 0,
  "totalPower": 0,
  "rooms": {
    "Drawing Room": {
      "powerW": 0,
      "power": 0,
      "activeFans": 0,
      "activeLights": 0,
      "totalDevicesOn": 0
    }
  },
  "estimatedTodayKWh": 0,
  "updatedAt": "2026-07-03T16:00:00.000Z"
}
```

`estimatedTodayKWh` is intentionally a Step 2 approximation: current watts × elapsed hours since server-local midnight ÷ 1000. It assumes the present load was constant throughout the elapsed day. A future usage accumulator can replace this without changing the endpoint shape.

### Room aliases

- Drawing Room: `drawing`, `drawing-room`
- Work Room 1: `work1`, `work-room-1`
- Work Room 2: `work2`, `work-room-2`

Unknown rooms return HTTP 404 with a JSON message, available rooms, and supported aliases.

### Dashboard snapshot flow

On startup and after Socket.IO reconnection, fetch these in parallel:

```text
GET /api/devices
GET /api/usage
GET /api/alerts
```

The dashboard should render this snapshot before applying subsequent live socket events.

## Smart simulator and live updates

The simulator runs every `SIMULATOR_INTERVAL_MS` (7000ms by default) and always mutates devices through `deviceStore.updateDeviceStatus()`. It does not maintain a second state array.

Its current-time phases are:

- before 9 AM: almost everything off;
- 9–11 AM: work rooms gradually activate first;
- 11 AM–5 PM: steady occupied-office behavior;
- 5–7 PM: devices progressively turn off;
- after 7 PM: mostly off, with an occasional partial forgotten-room scenario.

Each tick changes at most three devices. The server logs its phase, changed count, and total watts.

### Socket.IO contract

Connect to the same origin as the REST API. On connection the server immediately sends the current devices, usage, and alerts.

| Event | Payload |
| --- | --- |
| `devices:update` | Complete device array |
| `device:update` | One changed device |
| `usage:update` | Current store usage summary |
| `alerts:update` | Current derived active-alert array |
| `simulator:tick` | `{ timestamp, changedCount, phase, totalPowerW }` |

Frontend connection example:

```js
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
})
```

REST remains the startup and reconnect snapshot source. Socket.IO is only the live push layer.

### Manual device controls

Toggle a device:

```bash
curl -X POST http://localhost:5000/api/devices/drawing_room_fan_1/toggle
```

Set an explicit status:

```bash
curl -X POST http://localhost:5000/api/devices/drawing_room_fan_1/status \
  -H 'Content-Type: application/json' \
  -d '{"status":"ON"}'
```

Both endpoints mutate the shared store and immediately emit `device:update`, `devices:update`, `usage:update`, and `alerts:update`.

## Alert rule engine

`src/services/alertService.js` contains independent, testable rules. No alert state is cached: REST and Socket.IO recalculate active alerts from the current device store and usage snapshot.

| Rule function | Alert type | Behavior |
| --- | --- | --- |
| `detectAfterHoursDevices` | `after_hours_on` | One room-level alert when devices remain ON outside configured hours |
| `detectContinuousOnDevices` | `continuous_on` | One alert per device exceeding its continuous runtime limit |
| `detectRoomFullyOnTooLong` | `room_fully_on_timeout` | Alert when every actual device in a room remains ON too long |
| `detectHighPowerUsage` | `high_power_usage` | Alert when combined watts reach the configured threshold |

Every alert includes `id`, `severity`, `type`, `room`, `message`, `createdAt`, `timestamp`, and `deviceIds`. `timestamp` is retained for dashboard compatibility. Alerts are normalized and deduplicated by `type + room + sorted deviceIds`.

## Team integration

### Member 2 — dashboard

1. Set `VITE_BACKEND_URL` to this server, for example `http://localhost:5050`.
2. Fetch `/api/devices`, `/api/usage`, and `/api/alerts` for startup and reconnect recovery.
3. Listen for `devices:update`, `device:update`, `usage:update`, and `alerts:update`.
4. Treat REST as the snapshot layer and Socket.IO as live push only.

### Member 3 — Discord bot

- Fetch `/api/status` for ready-to-send human-readable room text.
- Fetch `/api/usage` for structured power information.
- Fetch `/api/rooms/:roomName` for commands such as `/room work1`.
- Use the manual status endpoint only for authorized demo commands; it updates the same store as the simulator and dashboard.

## Final demo checklist

1. Run `npm install`, `npm run verify`, and `npm run validate`.
2. Start the backend with `npm run dev`.
3. Confirm `/health` reports 18 devices.
4. Open `/api/devices`, `/api/usage`, `/api/alerts`, and `/api/status`.
5. Connect the dashboard and confirm the socket becomes Live.
6. Toggle a fan manually and confirm REST, room cards, map, and total power update.
7. During after-hours, confirm an `after_hours_on` alert appears.
8. Temporarily lower timeout or high-power thresholds to demonstrate other rules.
9. Let the simulator tick and confirm it changes no more than three devices.
10. Stop and restart the backend to demonstrate dashboard reconnect recovery.
