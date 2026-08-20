class ScanStrategy {
  constructor(id, label) {
    if (new.target === ScanStrategy) throw new TypeError('ScanStrategy is abstract.')
    this.id = id
    this.label = label
  }

  cameraConstraints() {
    throw new Error('cameraConstraints() must be implemented by a scan strategy.')
  }

  facingMode() {
    throw new Error('facingMode() must be implemented by a scan strategy.')
  }
}

export class FaceScanStrategy extends ScanStrategy {
  constructor() {
    super('face', 'Face scan')
  }

  cameraConstraints() {
    return { video: { facingMode: 'user', width: 640, height: 480 } }
  }

  facingMode() {
    return 'user'
  }
}

export class FingertipScanStrategy extends ScanStrategy {
  constructor() {
    super('fingertip', 'Fingertip + flash')
  }

  cameraConstraints() {
    return { video: { facingMode: { ideal: 'environment' }, width: 640, height: 480 } }
  }

  facingMode() {
    return 'environment'
  }

  assessContact(rgb, hasTorch = false) {
    const redRatioG = rgb.g > 0 ? rgb.r / rgb.g : 1
    const redRatioB = rgb.b > 0 ? rgb.r / rgb.b : 1
    const detected = rgb.r > 15 && (rgb.r >= rgb.b * 1.03 || rgb.r - rgb.b > 3) && rgb.r >= rgb.g * 0.94
    const strong = detected && (hasTorch ? rgb.r > 60 : rgb.r > 25)
      && (redRatioG > 1.08 || redRatioB > 1.15)
    return { detected, strong }
  }
}

export class ScanStrategyFactory {
  static #strategies = new Map([
    ['face', new FaceScanStrategy()],
    ['fingertip', new FingertipScanStrategy()],
  ])

  static create(mode) {
    const strategy = this.#strategies.get(mode)
    if (!strategy) throw new Error(`Unsupported scan mode: ${mode}`)
    return strategy
  }
}
