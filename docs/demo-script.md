# Demo Script

This demo script is prepared for the final 3-minute walkthrough of the Smart Office Energy Monitoring System.

## Demo Goal

Show that the system can monitor office lights and fans using:

- A simulated backend
- A real-time web dashboard
- A Discord bot
- A shared single source of truth for all device data

The main proof is:

> The dashboard and Discord bot both read from the same backend, so they show the same live device and power data.

---

## Before Recording

Make sure these three terminals are running.

### Terminal 1: Backend

```bash
cd backend
npm install
npm run dev
```

Expected output:

```text
Smart Office backend listening on http://localhost:5000
Simulator started
```

### Terminal 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL shown in the terminal, usually:

```text
http://localhost:5173
```

### Terminal 3: Discord Bot

```bash
cd bot
npm install
node discordBot.js
```

Expected output:

```text
Bot is online
```

---

## 3-Minute Demo Timeline

| Time | Demo Part | What to Show | What to Say |
| --- | --- | --- | --- |
| 0:00 - 0:20 | Introduction | Show project title or dashboard home | "This is our Smart Office Energy Monitoring System. It monitors 3 rooms with 18 devices: lights and fans. Since no real hardware is required, we simulate the device data from the backend." |
| 0:20 - 0:45 | Architecture | Show `docs/system-diagram.png` | "The simulated device layer sends live device states to the backend. The backend is the single source of truth. Both the web dashboard and Discord bot read data from this same backend." |
| 0:45 - 1:20 | Backend proof | Show backend terminal logs and API endpoint | "Here the backend simulator is running. It changes device states automatically and recalculates power usage. The API endpoints return live data for devices, rooms, usage, and alerts." |
| 1:20 - 1:55 | Dashboard | Show web dashboard | "The dashboard shows all rooms separately. It displays live device status, total power consumption, room-wise power breakdown, and active alerts." |
| 1:55 - 2:25 | Live update proof | Wait for simulator change or refresh-free UI update | "When the backend simulator changes a device state, the dashboard updates without manual refresh. This proves the system is working in real time." |
| 2:25 - 2:45 | Discord bot | Show Discord server and run commands | "The Discord bot also reads data from the backend. I will run `!status`, `!room work1`, and `!usage` to show real backend data." |
| 2:45 - 2:55 | Hardware concept | Show `docs/hardware-schematic.png` | "For hardware, we designed a one-room representative Wokwi schematic using ESP32, 3 light switches, 2 fan switches, 3 lights, and 2 fan indicators. In real hardware, relays would safely isolate AC loads." |
| 2:55 - 3:00 | Closing | Show GitHub repository | "The complete code, README, diagrams, and documentation are available in the public GitHub repository." |

---

## Discord Bot Commands to Show

Run these commands in the Discord server:

```text
!status
!room drawing
!room work1
!room work2
!usage
```

Suggested order for demo:

```text
!status
!room work1
!usage
```

---

## Short Speaking Script

Use this if you want a simple spoken version.

```text
Hello everyone. This is our Smart Office Energy Monitoring System.

The office has 3 rooms: Drawing Room, Work Room 1, and Work Room 2.
Each room has 2 fans and 3 lights, so the total number of devices is 18.

Since real hardware is not required, our backend simulates device states and power usage.
The backend is the single source of truth for the whole system.

The web dashboard reads data from the backend and shows live device status, total power, room-wise power, and active alerts.

The Discord bot also reads from the same backend. So when we run commands like !status, !room work1, and !usage, the bot returns real current backend data, not hardcoded text.

For the hardware part, we created a one-room representative circuit using ESP32, switches, lights, and fan indicators. In a real office, relay modules would be used to safely control AC lights and fans.

This completes the full flow: simulated devices to backend, backend to dashboard, and backend to Discord bot.
```

---

## Demo Recording Checklist

| Item | Done |
| --- | --- |
| Backend running on `localhost:5000` | Yes / No |
| Frontend dashboard running | Yes / No |
| Discord bot online | Yes / No |
| `/devices`, `/rooms`, `/usage`, `/alerts` API checked | Yes / No |
| Dashboard shows live data | Yes / No |
| Bot commands work | Yes / No |
| System diagram shown | Yes / No |
| Hardware schematic shown | Yes / No |
| GitHub repository shown | Yes / No |
| Video length under 3 minutes | Yes / No |

---

## Important Demo Tips

- Keep all terminals ready before recording.
- Do not show the real `.env` file or Discord bot token.
- Keep the Discord bot token hidden.
- If the dashboard and bot values do not match instantly, wait for the next backend simulator update and test again.
- Keep the video short and focus on working integration.
- The strongest proof is that the dashboard and Discord bot show the same backend data.
