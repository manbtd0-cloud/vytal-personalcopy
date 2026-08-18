/**
 * Web Bluetooth (BLE) Pulse Oximeter Integration
 * Reference: Bluetooth SIG Pulse Oximeter Service (UUID: 0x1822 / 0x2A5E)
 * PLX Continuous Measurement characteristic layout:
 *   byte 0:    Flags
 *   bytes 1-2: SpO2 (IEEE-11073-20601 SFLOAT, little-endian)
 *   bytes 3-4: Pulse Rate (IEEE-11073-20601 SFLOAT, little-endian)
 *   ...optional fields depending on flags bits (fast/slow SpO2PR,
 *      measurement status, sensor status, pulse amplitude index)
 */

// IEEE-11073-20601 SFLOAT decoder — a 16-bit value split into a 4-bit
// signed exponent (bits 15-12) and a 12-bit signed mantissa (bits 11-0),
// value = mantissa * 10^exponent. This is NOT the same format as IEEE-754
// half-float. `DataView.getFloat16` does not exist as a native method in
// any browser (it silently returns undefined, which is falsy, and JS just
// fell through to reading a single raw byte via getUint8) — every SpO2/
// pulse-rate reading from a real device was garbage. There is no shortcut
// here; the bytes have to be decoded per the actual SFLOAT spec.
function decodeSFLOAT(view, byteOffset, littleEndian = true) {
  const raw = view.getUint16(byteOffset, littleEndian)
  const rawMantissa = raw & 0x0fff
  const rawExponent = (raw >> 12) & 0x000f

  // Reserved special mantissa values (checked before sign-extension)
  if (rawMantissa === 0x07ff) return NaN // +INFINITY
  if (rawMantissa === 0x0800) return NaN // NaN
  if (rawMantissa === 0x0801) return NaN // NRes (not at this resolution)
  if (rawMantissa === 0x0802) return NaN // -INFINITY

  const exponent = rawExponent >= 0x8 ? rawExponent - 0x10 : rawExponent
  const mantissa = rawMantissa >= 0x0800 ? rawMantissa - 0x1000 : rawMantissa

  return mantissa * Math.pow(10, exponent)
}

export async function connectBlePulseOximeter() {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth API is not supported in this browser.')
  }

  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: ['pulse_oximeter'] }],
    optionalServices: ['battery_service'],
  })

  const server = await device.gatt.connect()
  const service = await server.getPrimaryService('pulse_oximeter')
  const characteristic = await service.getCharacteristic('plx_continuous_measurement')

  await characteristic.startNotifications()

  return {
    device,
    listen: (callback) => {
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value
        const flags = value.getUint8(0)
        const spo2 = decodeSFLOAT(value, 1, true)
        const pr = decodeSFLOAT(value, 3, true)
        callback({
          spo2: Number.isNaN(spo2) ? null : Math.round(spo2 * 10) / 10,
          pulseRate: Number.isNaN(pr) ? null : Math.round(pr),
          rawFlags: flags,
        })
      })
    },
    disconnect: () => device.gatt.disconnect(),
  }
}
