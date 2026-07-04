# FC4 Testing Checklist

## 1. Purpose

Use this checklist to verify that FC4 is stable, internally consistent, and ready for a hackathon demonstration. Complete it against the same build and configuration that will be presented to the judges.

## 2. Test Scope

- [ ] Simulated device generation and state changes are covered.
- [ ] Backend REST API and shared in-memory state are covered.
- [ ] Socket.IO events and real-time client synchronization are covered.
- [ ] React dashboard behavior and presentation are covered.
- [ ] Discord bot commands and proactive alerts are covered.
- [ ] Power calculations and alert rules are covered.
- [ ] Setup documentation, diagrams, and demo readiness are covered.
- [ ] Tests use the actual modules under `backend/src/`, `frontend/src/`, and `bot/`.

### Requirement baseline

- [ ] Confirm the accepted device inventory before judging: the brief says 2 fans + 3 lights, which equals 5 devices per room and 15 total, but it also requires 6 devices per room and 18 total.
- [ ] Confirm sign-off on the implemented inventory in `backend/src/data/initialDevices.js`: 2 fans + 4 lights per room, 6 devices per room, and 18 devices total.
- [ ] If the official requirement remains 2 fans + 3 lights, record the 18-device implementation as a requirement mismatch instead of silently passing both conditions.

## 3. Test Environment

- [ ] Node.js 18 or newer and npm are installed.
- [ ] Dependencies are installed with `npm install` in `backend/`, `frontend/`, and `bot/`.
- [ ] `backend/.env`, `frontend/.env`, and `bot/.env` are created from their `.env.example` files.
- [ ] Backend environment values use office hours 09:00–17:00 and the intended simulator and alert thresholds.
- [ ] Backend starts successfully with `cd backend && npm run dev`.
- [ ] Backend is reachable at `http://localhost:5000`, or every client is updated to the chosen alternate port.
- [ ] Frontend starts successfully with `cd frontend && npm run dev`.
- [ ] Dashboard opens at `http://localhost:5173`.
- [ ] A valid `DISCORD_BOT_TOKEN` is configured before starting the bot.
- [ ] Discord Message Content Intent is enabled for prefix commands.
- [ ] Bot starts successfully with `cd bot && npm start`.
- [ ] Simulator ticks appear in the backend logs at the configured interval.
- [ ] `VITE_BACKEND_URL`, `BACKEND_API_URL`, and `BACKEND_SOCKET_URL` point to the same backend.
- [ ] `MOCK_MODE=false` is used for final live integration testing.
- [ ] No real hardware or ESP32 connection is required for the test run.

## 4. Simulated Device Data Testing

- [ ] `GET /api/devices` returns exactly 3 rooms: Drawing Room, Work Room 1, and Work Room 2.
- [ ] `GET /api/devices` returns exactly 18 unique device IDs for the implemented baseline.
- [ ] Each room contains exactly 2 fans and 4 lights in the current backend implementation.
- [ ] The original 2-fan/3-light requirement conflict is resolved and documented before final acceptance.
- [ ] Every device includes `id`, `name`, `room`, `type`, `status`, and `lastChanged`.
- [ ] Every device exposes rated wattage through `ratedPowerW` or the compatible `power` field.
- [ ] Every device exposes current draw through `currentPowerW` or the compatible `currentPower` field.
- [ ] Device status is always `ON` or `OFF`.
- [ ] Fans use the configured realistic rating of 60W and lights use 15W.
- [ ] Simulator state changes occur over time and are visible in backend logs.
- [ ] A simulator tick changes no more than three devices.
- [ ] `lastChanged` changes only when the device status actually changes.
- [ ] `onSince` is set when a device turns ON and cleared when it turns OFF.
- [ ] Repeating the same status does not incorrectly change `lastChanged`.
- [ ] API snapshots are generated from `backend/src/store/deviceStore.js`, not from route-level hardcoded demo responses.
- [ ] Bot responses use live API data when `MOCK_MODE=false`.

## 5. Backend API Testing

- [ ] `GET /health` returns HTTP 200, `status: "OK"`, and `deviceCount: 18`.
- [ ] `GET /api/devices` returns all current device snapshots.
- [ ] `GET /api/rooms` returns summaries for all three rooms.
- [ ] `GET /api/rooms/drawing` resolves the Drawing Room alias.
- [ ] `GET /api/rooms/work1` resolves Work Room 1.
- [ ] `GET /api/rooms/work2` resolves Work Room 2.
- [ ] `GET /api/usage` returns total power and a power summary for every room.
- [ ] `GET /api/alerts` returns an array, including an empty array when no alerts are active.
- [ ] `GET /api/status` returns a human-readable office summary for bot use.
- [ ] Legacy aliases `/devices`, `/rooms`, `/room/:roomName`, `/usage`, and `/alerts` remain consistent with canonical routes.
- [ ] An unknown room returns HTTP 404 with `code: "UNKNOWN_ROOM"` and helpful aliases.
- [ ] `POST /api/devices/:id/toggle` changes a valid device and returns updated device, usage, and alerts.
- [ ] `POST /api/devices/:id/status` accepts only `ON` or `OFF`.
- [ ] An invalid status returns HTTP 400 with `code: "INVALID_STATUS"`.
- [ ] An unknown device ID returns HTTP 404 with `code: "UNKNOWN_DEVICE"`.
- [ ] Unknown routes return a consistent JSON 404 response.
- [ ] Device, usage, room, and alert payloads remain valid JSON with stable field names.
- [ ] API mutations, simulator changes, power summaries, alerts, dashboard data, and bot reads all use the same backend store.
- [ ] `cd backend && npm run verify` passes.
- [ ] `cd backend && npm run validate` passes.

## 6. Real-time Sync Testing

- [ ] A new Socket.IO client immediately receives `devices:update`, `usage:update`, and `alerts:update` snapshots.
- [ ] A changed device emits `device:update` with the correct device ID and status.
- [ ] A change also emits complete `devices:update`, `usage:update`, and `alerts:update` payloads.
- [ ] The dashboard changes without a browser refresh after a simulator tick.
- [ ] A manual toggle appears on the dashboard without a browser refresh.
- [ ] A simulator or manual change appears in the next Discord command response.
- [ ] REST data and Socket.IO data agree after every update.
- [ ] Two open dashboard clients display the same device and power state.
- [ ] Dashboard and bot values match when checked at the same moment.
- [ ] Repeated updates do not create duplicate devices or stale room totals.
- [ ] After a backend restart, the dashboard reconnects and fetches a fresh REST snapshot.
- [ ] No missed socket event leaves the dashboard stale after reconnection.

## 7. Web Dashboard Testing

- [ ] Drawing Room, Work Room 1, and Work Room 2 are all visible.
- [ ] Details/room cards list all 18 live backend devices.
- [ ] The active-device summary denominator matches the received device count.
- [ ] Each device has a clear ON/OFF state and readable name.
- [ ] ON lights have a clear visual indication.
- [ ] ON fans animate or otherwise clearly indicate their state where implemented.
- [ ] Room cards show active fan and light counts correctly.
- [ ] Total power changes correctly after a known device toggle.
- [ ] Per-room power changes only for the affected room.
- [ ] The alert panel is visible and handles both active and empty alert lists.
- [ ] Overview, Details, and Both view controls work.
- [ ] Selecting a mapped device shows its room, status, power, and change time.
- [ ] Check the floor-plan limitation separately: `frontend/src/components/OfficeMap.jsx` currently defines only 3 light positions per room, so Light 4 must be added or recorded as an accepted demo limitation.
- [ ] Backend-disconnected state is clearly shown without destroying the last valid data.
- [ ] Automatic frontend mock fallback is clearly labeled as mock data.
- [ ] The interface remains usable at a typical 1366×768 laptop resolution.
- [ ] The interface remains readable on a narrow/mobile viewport.
- [ ] Keyboard focus and device selection work for interactive map devices.
- [ ] No uncaught errors appear in the browser console during the normal demo flow.
- [ ] `cd frontend && npm run build` completes successfully.

## 8. Discord Bot Testing

- [ ] The bot logs in and appears online in the intended Discord server.
- [ ] `!ping` confirms the bot is listening.
- [ ] `!status` returns a concise summary for all three rooms.
- [ ] `!room drawing` returns Drawing Room device states and usage.
- [ ] `!room work1` returns Work Room 1 device states and usage.
- [ ] `!room work2` returns Work Room 2 device states and usage.
- [ ] `!usage` returns current total power and the highest-consuming room.
- [ ] `!room nonsense` returns a friendly validation message and does not crash the bot.
- [ ] Command responses match live backend values when `MOCK_MODE=false`.
- [ ] Command responses do not contain randomly invented device values.
- [ ] Built-in responses remain clear when `ANTHROPIC_API_KEY` is blank.
- [ ] Optional LLM wording does not alter device states or numeric values.
- [ ] If the backend is unavailable, commands return a short friendly error instead of a stack trace.
- [ ] The bot remains running after a backend timeout or failed request.
- [ ] If `ALERT_CHANNEL_ID` is configured, a new backend alert is posted proactively.
- [ ] The same alert is not posted twice by Socket.IO and polling.
- [ ] Bot logs do not reveal the Discord token or other secrets.

## 9. Power Calculation Testing

- [ ] An OFF device contributes exactly 0W.
- [ ] Turning one fan ON increases its room and office totals by 60W.
- [ ] Turning one light ON increases its room and office totals by 15W.
- [ ] Turning a device OFF removes its rated wattage from the totals.
- [ ] Total power equals the sum of current power for every ON device.
- [ ] Each room's power equals the sum of current power for ON devices in that room.
- [ ] Sum of all room totals equals the office total.
- [ ] `totalPowerW` and compatibility field `totalPower` agree.
- [ ] Room `powerW` and compatibility field `power` agree.
- [ ] Dashboard total and room values match `GET /api/usage`.
- [ ] Discord `!usage` total matches `GET /api/usage` at the same moment.
- [ ] Estimated daily kWh, when shown, is labeled as an estimate and is numerically reasonable.
- [ ] Maximum implemented load is verified as 540W: 6 devices × 3 rooms using current ratings.

## 10. Alert System Testing

- [ ] With normal load during 09:00–17:00, no after-hours alert is produced.
- [ ] At or after 17:00, each room with an ON device receives an `after_hours_on` alert.
- [ ] Before 09:00, ON devices also trigger the configured after-hours rule.
- [ ] After-hours alerts identify the room and affected device IDs.
- [ ] Every normalized alert includes `id`, `severity`, `type`, `message`, `createdAt`, `timestamp`, and `deviceIds`.
- [ ] A continuously ON device triggers `continuous_on` after the configured 120-minute threshold.
- [ ] A room triggers `room_fully_on_timeout` only when all 6 implemented devices have been ON together for more than 120 minutes.
- [ ] The full-room timer starts from the most recently activated device.
- [ ] Office load at or above `HIGH_POWER_THRESHOLD_W` triggers `high_power_usage`.
- [ ] Clearing the triggering condition removes the active alert on the next calculation.
- [ ] Equivalent alerts are deduplicated by type, room, and affected device IDs.
- [ ] Alerts appear in `GET /api/alerts` and the dashboard alert panel.
- [ ] Alerts reach the configured Discord channel when proactive delivery is enabled.
- [ ] Socket and polling delivery do not create duplicate Discord messages.
- [ ] Alert timestamps remain valid ISO dates and render readably in clients.

## 11. Edge Case Testing

- [ ] If initial device data is empty or unavailable in an isolated test, the backend returns safe JSON or fails with a clear error; do not claim this passes without testing it.
- [ ] Duplicate device IDs are detected by backend verification.
- [ ] Invalid device IDs return 404 without mutating another device.
- [ ] Invalid room names return 404 without crashing the server.
- [ ] Missing or malformed status bodies return 400.
- [ ] Starting the simulator twice does not create uncontrolled duplicate timers.
- [ ] Stopping and restarting the backend does not permanently break the dashboard.
- [ ] Frontend offline state and mock mode are clearly distinguishable from live mode.
- [ ] Discord requests handle connection refusal and timeout safely.
- [ ] Rapid toggles preserve the final backend state and correct total power.
- [ ] Repeated identical status writes do not create false timestamp changes.
- [ ] Empty alert arrays render without errors.
- [ ] Malformed client data does not produce `NaN` power in the UI.
- [ ] Long device and alert text does not break the dashboard layout.
- [ ] Timestamps remain readable in the configured demo timezone.
- [ ] Port 5000 conflicts, including macOS AirPlay, are handled by selecting one alternate port for all clients.

## 12. Demo Readiness Checklist

- [ ] Backend starts successfully from the root README instructions.
- [ ] Frontend starts successfully from the root README instructions.
- [ ] Discord bot starts successfully from the root README instructions.
- [ ] Simulator starts with the backend and produces visible tick logs.
- [ ] `/health` reports 18 devices immediately before the demo.
- [ ] Dashboard connection badge shows Live.
- [ ] A prepared API toggle produces an immediate visible state change.
- [ ] The same change updates device status and power without refreshing the dashboard.
- [ ] `!status`, `!room work1`, and `!usage` are rehearsed with live backend data.
- [ ] One alert scenario is prepared using safe temporary environment thresholds or after-hours timing.
- [ ] Alert behavior is shown on the dashboard and in Discord if configured.
- [ ] `docs/system-diagram.png` exists, is non-empty, and renders correctly.
- [ ] `docs/pin-mapping-table.md` exists and clearly states that hardware is conceptual.
- [ ] `docs/hardware-schematic.png` is either replaced with a valid non-empty image or omitted from demo claims; the current empty placeholder must not be presented as complete.
- [ ] `docs/demo-script.md` is complete and matches the actual commands and screens.
- [ ] Root and service README instructions have been run on a clean setup.
- [ ] Real `.env` files, bot tokens, and API keys are not committed or shown on screen.
- [ ] Browser tabs, terminal windows, Discord channel, and API commands are prepared in presentation order.
- [ ] A fallback plan is ready if Discord or the network is unavailable.
- [ ] The complete final video flow is rehearsed and finishes in under 3 minutes.

## 13. Final Acceptance Criteria

- [ ] PASS — Dashboard works with live backend data and updates without refresh.
- [ ] PASS — Discord bot reflects the same backend state as the dashboard.
- [ ] PASS — Backend store is the single source of truth.
- [ ] PASS — Simulation changes device state dynamically.
- [ ] PASS — Power totals are correct at device, room, and office levels.
- [ ] PASS — Required alert rules trigger, clear, and deduplicate correctly.
- [ ] PASS — Inventory requirement conflict is formally resolved.
- [ ] PASS — Documentation and non-empty diagram assets are complete.
- [ ] PASS — Project can be run from the root README on a clean environment.
- [ ] PASS — A judge can understand the system and see its core flow in under 3 minutes.

The build is accepted only when every applicable final criterion passes and every known limitation is documented. Record the tester, date, build/commit, environment, and any waived failures before submission.
