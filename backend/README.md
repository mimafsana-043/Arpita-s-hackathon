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
