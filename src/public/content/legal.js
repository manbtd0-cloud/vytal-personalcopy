export const medicalDisclaimer = {
  title: 'Medical Disclaimer',
  summary: 'Vytal is a screening and research prototype. It is not a certified medical device and does not provide a medical diagnosis.',
  points: [
    'Camera-derived readings may be affected by motion, lighting, device characteristics and signal quality.',
    'Research proxies and experimental screening pathways are not equivalent to validated clinical measurements.',
    'Concerning readings, persistent symptoms or urgent symptoms require appropriate professional medical assessment.',
    'Emergency symptoms should never be delayed because of reassuring app output.',
  ],
}

export const privacyContent = {
  title: 'Privacy',
  summary: 'The public website should collect no camera data. The screening application should describe processing and storage behavior separately and accurately as its backend architecture evolves.',
  principles: [
    'Ask for camera permission only inside the screening experience.',
    'Do not imply cloud synchronization where it is not actually available.',
    'Explain what data leaves the device before enabling network-backed AI or sync features.',
    'Keep public marketing analytics separate from health-record data.',
  ],
}
