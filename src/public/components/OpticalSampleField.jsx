const samples = Array.from({ length: 34 }, (_, index) => ({
  x: 8 + ((index * 19) % 84),
  y: 9 + ((index * 31) % 82),
  size: 3 + ((index * 7) % 6),
  delay: (index % 9) * -0.48,
  tone: index % 5 === 0 ? 'coral' : index % 7 === 0 ? 'mint' : 'neutral',
}))

export default function OpticalSampleField() {
  return (
    <div className="optical-field" aria-hidden="true">
      <div className="optical-field__frame">
        <span className="optical-field__corner optical-field__corner--tl" />
        <span className="optical-field__corner optical-field__corner--tr" />
        <span className="optical-field__corner optical-field__corner--bl" />
        <span className="optical-field__corner optical-field__corner--br" />
      </div>
      <div className="optical-field__scan-line" />
      {samples.map((sample, index) => (
        <span
          className={`optical-field__sample optical-field__sample--${sample.tone}`}
          key={index}
          style={{
            '--sample-x': `${sample.x}%`,
            '--sample-y': `${sample.y}%`,
            '--sample-size': `${sample.size}px`,
            '--sample-delay': `${sample.delay}s`,
          }}
        />
      ))}
      <span className="optical-field__label optical-field__label--input">CAMERA / OPTICAL INPUT</span>
      <span className="optical-field__label optical-field__label--signal">SIGNAL / SEARCHING</span>
    </div>
  )
}
