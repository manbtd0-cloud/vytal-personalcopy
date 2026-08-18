# Bluetooth Pulse Oximeter Pairing

`Hardware · W3C Web Bluetooth API`

---

## What it does

Lets Vytal pair with a real, validated Bluetooth pulse oximeter (rather than relying solely on the camera-based SpO2 proxy from feature 01) when one is available — giving a ground-truth reading and, longer-term, a way to locally calibrate the camera-based proxy against a real device.

## The standard and hardware this is built on

| Source | What it defines | Where it fits Vytal |
|---|---|---|
| **W3C Web Bluetooth API** specification | Browser-native Bluetooth Low Energy (BLE) device pairing and GATT (Generic Attribute Profile) characteristic reading, no native app or plugin needed | This is why it's a browser-compatible feature at all — Vytal is a web app, and Web Bluetooth is what lets a web app talk to a BLE pulse oximeter directly |
| **Bluetooth SIG Pulse Oximeter Service (PLXS)** GATT profile | Standard, published BLE characteristic layout that compliant pulse oximeters expose (SpO2 %, pulse rate, measurement status) | The actual data format to read once paired — any PLXS-compliant device (which includes most consumer/clinical BLE oximeters, e.g. Wellue O2Ring, Nonin WristOx, both referenced in the roadmap) exposes the same characteristic structure |

## Algorithm / implementation

```
1. Device discovery (triggered by explicit user tap, per Web
   Bluetooth's required user-gesture security model — cannot be
   triggered automatically):

     const device = await navigator.bluetooth.requestDevice({
       filters: [{ services: ['pulse_oximeter'] }]  // PLXS UUID
     });

2. Connect + get the GATT service:
     const server = await device.gatt.connect();
     const service = await server.getPrimaryService('pulse_oximeter');

3. Read the standard PLXS characteristics:
     - PLX Spot-Check Measurement (single reading)
     - PLX Continuous Measurement (streaming, if the device supports it)
   Both expose SpO2 % and pulse rate in a fixed byte layout defined
   by the Bluetooth SIG spec — parse per the published PLXS
   characteristic format, not a device-specific guess.

4. Store the paired-device reading alongside (not instead of) the
   camera-based SpO2 proxy reading for that same scan session —
   this pairing is exactly what feature 01's calibration step needs:
   a real reference value captured at the same time as the camera
   estimate, from the same patient.
```

## Where this lives in the codebase

- New `bleOximeter.js` handling Web Bluetooth pairing and GATT parsing.
- Surfaces as an optional "pair a pulse oximeter" button on `ScanPage.jsx`, alongside (not replacing) the camera-based scan flow.
- Directly feeds feature 01's calibration need — this is the most natural real-world source of the paired reference readings that SpO2 proxy calibration requires.

## Honest limitations

- Web Bluetooth is **not supported in Safari/iOS** as of this writing — a real deployment constraint given some CHWs may carry iPhones; this feature would need a native-app fallback path to reach that population, which the current web-app architecture doesn't provide.
- Requires the CHW to actually own/carry a compatible pulse oximeter — this is a nice-to-have accuracy booster for CHWs who have one, not a replacement for the no-extra-hardware core pitch of Vytal.
