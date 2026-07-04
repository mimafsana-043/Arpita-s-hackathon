# Pin Mapping Table

This file documents the one-room representative ESP32 hardware schematic for the Smart Office Energy Monitoring System.

## Input Pins: Switches

| Type | Component | Switch Label | ESP32 GPIO Pin | Mode | Purpose |
|---|---|---|---|---|---|
| Input | Light 1 Switch | SW1 | GPIO 13 | INPUT_PULLUP | Reads Light 1 ON/OFF switch state |
| Input | Light 2 Switch | SW2 | GPIO 12 | INPUT_PULLUP | Reads Light 2 ON/OFF switch state |
| Input | Light 3 Switch | SW3 | GPIO 14 | INPUT_PULLUP | Reads Light 3 ON/OFF switch state |
| Input | Fan 1 Switch | SW4 | GPIO 27 | INPUT_PULLUP | Reads Fan 1 ON/OFF switch state |
| Input | Fan 2 Switch | SW5 | GPIO 26 | INPUT_PULLUP | Reads Fan 2 ON/OFF switch state |

## Output Pins: Lights and Fans

| Type | Component | Device Label | ESP32 GPIO Pin | Mode | Purpose |
|---|---|---|---|---|---|
| Output | Light 1 | LED1 | GPIO 18 | OUTPUT | Controls Light 1 ON/OFF |
| Output | Light 2 | LED2 | GPIO 19 | OUTPUT | Controls Light 2 ON/OFF |
| Output | Light 3 | LED3 | GPIO 21 | OUTPUT | Controls Light 3 ON/OFF |
| Output | Fan 1 | FAN1 | GPIO 22 | OUTPUT | Controls Fan 1 ON/OFF |
| Output | Fan 2 | FAN2 | GPIO 23 | OUTPUT | Controls Fan 2 ON/OFF |

## Connection Summary

| Component Type | Connection |
|---|---|
| Switches | One side of each switch connects to GND, the other side connects to the assigned ESP32 input GPIO pin |
| LEDs | ESP32 output GPIO pin connects to LED through a current-limiting resistor; LED negative side connects to GND |
| Fan Indicators | ESP32 output GPIO pin controls fan indicator/motor module in simulation |
| Real Hardware Concept | In a real office, ESP32 would not directly control AC lights/fans; relay modules or contactors would be used for safe isolation |
| Current Sensing Concept | ACS712 or CT sensor can be added to estimate current draw and calculate power usage |

## Electrical Reasoning

- The switches represent manual wall switch inputs.
- `INPUT_PULLUP` is used, so the input normally stays HIGH and becomes LOW when the switch is pressed/closed to GND.
- LEDs represent the three room lights.
- Fan indicators/motor modules represent the two room fans.
- This is a one-room representative circuit. The full office has 3 rooms and 18 devices, but only one room is shown in the hardware schematic because the project uses simulated backend data.
- Real AC loads should always be isolated from the ESP32 using relay modules or contactors.
