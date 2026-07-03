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
```

## Health check

```bash
curl http://localhost:5000/health
```

Expected response includes `"status":"OK"` and `"deviceCount":18`.

## Verify the internal store

```bash
npm run verify
```

The verification checks the 18-device count, unique IDs, six devices per room, initial zero usage, and ON/OFF power and timestamp transitions.

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
| GET | `/api/alerts` | `/alerts` | Active alerts; empty in Step 2 |
| GET | `/api/status` | — | Human-friendly office summary for Discord |

Device responses retain both naming conventions used by clients:

```json
{
  "id": "drawing_room_fan_1",
  "ratedPowerW": 60,
  "power": 60,
  "currentPowerW": 0,
  "currentPower": 0
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
