/**
 * Web USB Thermal Camera Integration (FLIR Lepton 3.5 format)
 * Reference: Web USB API (W3C Draft) & FLIR Radiometric VoSPI interface
 */

export async function connectThermalCamera() {
  if (!navigator.usb) {
    throw new Error('Web USB API is not supported on this browser/device.')
  }

  const device = await navigator.usb.requestDevice({
    filters: [{ vendorId: 0x09fb }], // FLIR / Lepton USB controller VID
  })

  await device.open()
  await device.selectConfiguration(1)
  await device.claimInterface(0)

  return {
    device,
    readTemperature: async () => {
      // Transfer bulk data frame (160x120 radiometric temperature matrix)
      const result = await device.transferIn(1, 19200)
      const dataView = result.data
      // Convert raw Kelvin (mK) -> Celsius
      const rawTempKelvin = dataView.getUint16(0, true) / 100
      const tempCelsius = rawTempKelvin - 273.15
      const clamped = Math.round(tempCelsius * 10) / 10

      return {
        temperatureCelsius: clamped,
        isFever: clamped > 37.5,
        status: clamped > 37.5 ? 'Fever Detected' : 'Normal Temperature',
      }
    },
    disconnect: () => device.close(),
  }
}
