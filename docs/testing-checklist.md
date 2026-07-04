# Testing Checklist

This checklist is used to verify the final hackathon submission for the Smart Office Energy Monitoring System.

## 1. Backend Tests

| Area | Test Case | Expected Result | Status |
| --- | --- | --- | --- |
| Backend | Start backend server | Server runs on `http://localhost:5000` | Pass / Fail |
| Backend | Open `/devices` endpoint | Returns all simulated device data | Pass / Fail |
| Backend | Open `/rooms` endpoint | Returns room-wise summaries for Drawing Room, Work Room 1, and Work Room 2 | Pass / Fail |
| Backend | Open `/usage` endpoint | Returns total power and room-wise power usage | Pass / Fail |
| Backend | Open `/alerts` endpoint | Returns active alerts or an empty alert list | Pass / Fail |
| Backend | Simulator running | Device states change automatically over time | Pass / Fail |
| Backend | Power calculation | Total power changes according to ON/OFF device states | Pass / Fail |
| Backend | Timestamp update | `lastChanged` updates when a device state changes | Pass / Fail |

## 2. Frontend Dashboard Tests

| Area | Test Case | Expected Result | Status |
| --- | --- | --- | --- |
| Dashboard | Start frontend | Dashboard opens successfully in browser | Pass / Fail |
| Dashboard | Device status panel | Shows all room devices with ON/OFF state | Pass / Fail |
| Dashboard | Room-wise view | Shows Drawing Room, Work Room 1, and Work Room 2 separately | Pass / Fail |
| Dashboard | Total power meter | Shows current total power consumption in watts | Pass / Fail |
| Dashboard | Room power breakdown | Shows power consumption per room | Pass / Fail |
| Dashboard | Live update | Dashboard updates without manual refresh | Pass / Fail |
| Dashboard | Alerts panel | Shows active alerts with timestamp when alerts exist | Pass / Fail |
| Dashboard | UI usability | Interface is clean and understandable for demo | Pass / Fail |

## 3. Discord Bot Tests

| Area | Test Case | Expected Result | Status |
| --- | --- | --- | --- |
| Discord Bot | Start bot | Bot logs in successfully and stays online | Pass / Fail |
| Discord Bot | Backend connection | Bot can fetch data from `http://localhost:5000` | Pass / Fail |
| Discord Bot | `!status` command | Shows office/room status from backend data | Pass / Fail |
| Discord Bot | `!room drawing` command | Shows Drawing Room device status | Pass / Fail |
| Discord Bot | `!room work1` command | Shows Work Room 1 device status | Pass / Fail |
| Discord Bot | `!room work2` command | Shows Work Room 2 device status | Pass / Fail |
| Discord Bot | `!usage` command | Shows current total power and estimated usage | Pass / Fail |
| Discord Bot | Data consistency | Bot values match dashboard/backend values | Pass / Fail |
| Discord Bot | No hardcoded reply | Bot responses come from backend API data | Pass / Fail |

## 4. Hardware and Documentation Tests

| Area | Test Case | Expected Result | Status |
| --- | --- | --- | --- |
| Hardware | Hardware schematic added | `docs/hardware-schematic.png` exists | Pass / Fail |
| Hardware | One-room concept | Schematic shows ESP32, 3 lights, 2 fans, and switches | Pass / Fail |
| Hardware | Electrical reasoning | README/docs explain relay isolation for real AC loads | Pass / Fail |
| Docs | Pin mapping table added | `docs/pin-mapping-table.md` exists and is readable | Pass / Fail |
| Docs | System diagram added | `docs/system-diagram.png` exists | Pass / Fail |
| Docs | Demo script added | `docs/demo-script.md` exists | Pass / Fail |
| Docs | README added | Root `README.md` exists | Pass / Fail |
| Docs | Setup instructions | README explains backend, frontend, and bot setup | Pass / Fail |

## 5. Repository and Security Tests

| Area | Test Case | Expected Result | Status |
| --- | --- | --- | --- |
| Repository | Public repository | GitHub/GitLab repository is public | Pass / Fail |
| Repository | Folder structure | `backend/`, `frontend/`, `bot/`, and `docs/` folders exist | Pass / Fail |
| Repository | Clean codebase | No unnecessary temporary files are committed | Pass / Fail |
| Repository | `.env.example` included | Example environment file exists | Pass / Fail |
| Security | `.env` not committed | Real `.env` file is not pushed to GitHub | Pass / Fail |
| Security | Bot token protected | Discord bot token is not visible in code or commit history | Pass / Fail |
| Security | Token regenerated if leaked | Exposed token is regenerated from Discord Developer Portal | Pass / Fail |
| Git | Final commit pushed | Latest final version is pushed to `main` branch | Pass / Fail |

## 6. Final Demo Tests

| Area | Test Case | Expected Result | Status |
| --- | --- | --- | --- |
| Demo | Backend shown | Backend server and simulator logs are visible | Pass / Fail |
| Demo | Dashboard shown | Dashboard shows live room/device status | Pass / Fail |
| Demo | Live update proof | Device/power value changes during demo | Pass / Fail |
| Demo | Discord bot shown | `!status`, `!room`, and `!usage` are demonstrated | Pass / Fail |
| Demo | Same backend proof | Dashboard and bot show matching data | Pass / Fail |
| Demo | Architecture explained | System diagram/data flow is briefly explained | Pass / Fail |
| Demo | Hardware shown | Wokwi/Tinkercad schematic is briefly shown | Pass / Fail |
| Demo | Time limit | Demo video is within 3 minutes | Pass / Fail |

## Final Submission Readiness

| Item | Required? | Status |
| --- | --- | --- |
| Public GitHub/GitLab repository link | Yes | Pass / Fail |
| Working backend | Yes | Pass / Fail |
| Working web dashboard | Yes | Pass / Fail |
| Working Discord bot | Yes | Pass / Fail |
| System architecture diagram | Yes | Pass / Fail |
| Hardware schematic | Yes | Pass / Fail |
| README with setup instructions | Yes | Pass / Fail |
| Demo video | Yes | Pass / Fail |
