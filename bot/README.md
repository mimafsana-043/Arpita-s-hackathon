# Smart Office Discord Bot

Discord bot for the Smart Office Energy Monitoring project. It reads live
device/usage/alert data from the **same backend** the dashboard uses, so
`!status`, `!room`, and `!usage` always match what's on screen — nothing here
is hardcoded or randomly generated.

## Commands

| Command | What it does |
|---|---|
| `!status` | One-line summary per room: how many fans/lights are ON. |
| `!room <name>` | Detail for one room. `<name>` is `drawing`, `work1`, or `work2`. |
| `!usage` | Total power draw right now, which room is drawing the most, and today's estimated kWh if the backend provides it. |

Bonus: the bot watches `GET /api/alerts` (and the backend's `alerts:update`
Socket.IO event, if available) and posts new alerts to `ALERT_CHANNEL_ID`
automatically, deduplicated by alert `id`.

## Setup

### 1. Create the Discord application and bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**.
2. Open **Bot** → **Reset Token** → copy it into `DISCORD_BOT_TOKEN` below. Never commit this value.
3. Under **Privileged Gateway Intents**, enable **Message Content Intent** — required because commands are read as plain `!status`-style messages.
4. Under **OAuth2 → URL Generator**, check scopes `bot`, and permissions `Send Messages` + `View Channel` (add `Read Message History` if you want it replying in threads). Open the generated URL to invite the bot to your test server.
5. Copy the application's **Client ID** into `DISCORD_CLIENT_ID`, and your test server's ID (right-click the server icon → Copy Server ID, with Developer Mode on) into `DISCORD_GUILD_ID`.
6. Right-click the channel you want proactive alerts posted to → Copy Channel ID → `ALERT_CHANNEL_ID`.

### 2. Configure environment

```bash
cd bot
cp .env.example .env
```

Fill in `.env`:

```env
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-application-id
DISCORD_GUILD_ID=your-test-server-id
ALERT_CHANNEL_ID=channel-id-for-proactive-alerts
BACKEND_API_URL=http://localhost:5000
BACKEND_SOCKET_URL=http://localhost:5000
```

Leave `ANTHROPIC_API_KEY` blank to use the built-in friendly templates (no
external calls, zero cost, fully deterministic — the safe default for a demo).
Set it to enable LLM-polished phrasing on top of the same numbers.

### 3. Install and run

```bash
npm install
npm start
```

You should see `[startup] Logged in as <bot-name>` in the console. Then in
your test server: `!status`, `!room work1`, `!usage`.

## Running without a finished backend (MOCK_MODE)

Set `MOCK_MODE=true` in `.env` to serve the bundled sample dataset in
`services/mockData.js` instead of calling `BACKEND_API_URL`. This is the same
15-device snapshot the frontend dashboard falls back to, so numbers still
match across the two interfaces even when neither has a live backend yet.
Switch it back to `false` the moment the real backend is up — no code changes
needed.

## Backend contract this bot expects

This matches what `frontend/` already implements (see
`frontend/README.md` → "Backend contract"), **not** the earlier draft
`/devices` / `/rooms` contract from the original work-plan doc. If your
backend differs, adjust `services/apiClient.js` and this section together.

- `GET /api/devices` → array of devices, or `{ "devices": [...] }`
- `GET /api/usage` → `{ totalPower, roomPower: { "Drawing Room": n, ... } }` (also accepts `perRoom`/`rooms`), optionally wrapped as `{ "usage": {...} }`
- `GET /api/alerts` → array of alerts (`id`, `message`, `room?`, `timestamp`, `severity`), or `{ "alerts": [...] }`
- Socket.IO (optional, best-effort): `alerts:update` with the same alert array shape

Device fields used: `id`, `name`, `room` (`Drawing Room` / `Work Room 1` /
`Work Room 2`), `type` (`fan`/`light`), `status` (`ON`/`OFF`, case-insensitive),
`power` (rated watts), `currentPower` (actual draw while ON).

There is no `/api/rooms` endpoint — per-room summaries are computed from
`/api/devices` on the fly (see `services/responseFormatter.js`), the same way
the dashboard derives its room cards.

`estimatedTodayKWh` is not guaranteed by the current backend contract; `!usage`
only mentions it when the field is actually present, rather than estimating a
number that isn't backed by real data.

## Design notes

- `services/powerUtils.js` and the mock dataset are intentionally a mirror of
  `frontend/src/utils/power.js` and `frontend/src/data/mockDevices.js` — keep
  them in sync if the frontend's calculation logic changes, so the bot and
  dashboard never disagree on a number.
- Per-device ON/OFF lines in `!room` are built directly from the fetched data
  and are never passed through the LLM step — only the one-sentence summary is
  optionally reworded, so a device's actual state can never be misreported by
  paraphrasing.
- Backend/network failures reply with a short apology instead of crashing the
  process or leaking a stack trace to Discord; see the `try/catch` in
  `discordBot.js`'s message handler.

## Testing checklist

- [ ] `!status` output matches the dashboard's room cards at the same moment
- [ ] `!room drawing` / `!room work1` / `!room work2` all resolve and list the correct devices
- [ ] `!room nonsense` replies with a friendly error, doesn't crash
- [ ] `!usage` total matches the dashboard's power meter
- [ ] Stopping the backend mid-session makes commands reply with the apology message, not a crash
- [ ] With `MOCK_MODE=true` and no backend running, all three commands still work
- [ ] A new alert from the backend gets posted to `ALERT_CHANNEL_ID` exactly once
