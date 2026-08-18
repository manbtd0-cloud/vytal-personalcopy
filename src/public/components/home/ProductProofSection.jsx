import SectionShell from '../SectionShell.jsx'
import CardSwap, { Card } from '../reactbits/CardSwap.jsx'
import { homeContent } from '../../content/home.js'

function DemoChrome({ step, children }) {
  return (
    <div className="product-demo-card__inner">
      <div className="product-demo-card__chrome">
        <span>VYTAL / SCREEN</span>
        <span>{step}</span>
      </div>
      {children}
    </div>
  )
}

function AcquisitionCard() {
  return (
    <Card className="product-demo-card product-demo-card--acquisition">
      <DemoChrome step="01 / ACQUISITION">
        <div className="demo-camera">
          <div className="demo-camera__oval" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="demo-camera__status">
            <span className="demo-live-dot" />
            FACE / OPTICAL INPUT
          </div>
          <div className="demo-camera__readiness">
            <span>POSITION</span>
            <strong>Signal searching</strong>
          </div>
        </div>
        <div className="product-demo-card__label-row">
          <h3>Acquisition</h3>
          <span>CAMERA INPUT</span>
        </div>
      </DemoChrome>
    </Card>
  )
}

function QualityCard() {
  return (
    <Card className="product-demo-card product-demo-card--quality">
      <DemoChrome step="02 / QUALITY">
        <div className="demo-quality">
          <div className="demo-quality__status">
            <span>QUALITY / STABLE</span>
            <strong>84</strong>
          </div>
          <svg viewBox="0 0 620 160" role="img" aria-label="Example stable pulse waveform">
            <path className="demo-quality__grid" d="M0 40H620 M0 80H620 M0 120H620 M100 0V160 M200 0V160 M300 0V160 M400 0V160 M500 0V160" />
            <path className="demo-quality__wave" d="M0 93 C25 91 44 92 60 94 C79 97 83 61 99 58 C114 55 119 93 140 93 C163 93 175 90 193 94 C211 98 216 72 231 68 C247 63 251 93 275 93 C294 93 311 91 325 94 C344 99 351 49 369 45 C385 41 392 94 414 94 C436 94 448 91 464 94 C482 98 488 66 504 62 C520 58 526 94 547 94 C569 94 589 91 620 93" />
          </svg>
          <div className="demo-quality__factors">
            <span><i style={{ '--factor': '92%' }} />Motion</span>
            <span><i style={{ '--factor': '88%' }} />Lighting</span>
            <span><i style={{ '--factor': '84%' }} />Signal</span>
          </div>
        </div>
        <div className="product-demo-card__label-row">
          <h3>Signal Quality</h3>
          <span>QUALITY CHECK</span>
        </div>
      </DemoChrome>
    </Card>
  )
}

function ResultCard() {
  return (
    <Card className="product-demo-card product-demo-card--result">
      <DemoChrome step="03 / EXPLANATION">
        <div className="demo-result">
          <div className="demo-result__badge">EXAMPLE RESULT</div>
          <div className="demo-result__metrics">
            <div><span>HEART RATE</span><strong>78 <small>BPM</small></strong></div>
            <div><span>BREATHING</span><strong>15 <small>/MIN</small></strong></div>
            <div><span>CONFIDENCE</span><strong>84 <small>%</small></strong></div>
          </div>
          <div className="demo-result__explanation">
            <span>PLAIN-LANGUAGE CONTEXT</span>
            <p>This example reading sits inside the product flow only to show how Vytal turns measurements into understandable screening context.</p>
          </div>
        </div>
        <div className="product-demo-card__label-row">
          <h3>Result Explained</h3>
          <span>MEASURE → UNDERSTAND</span>
        </div>
      </DemoChrome>
    </Card>
  )
}

export default function ProductProofSection() {
  const { productProof } = homeContent

  return (
    <SectionShell tone="raised" className="product-proof-section">
      <div className="product-proof__grid">
        <div className="product-proof__copy">
          <p className="public-eyebrow">{productProof.eyebrow}</p>
          <h2 className="landing-section-heading">{productProof.title}</h2>
          <p>{productProof.body}</p>
          <div className="product-proof__steps" aria-label="Product flow steps">
            {productProof.labels.map((label, index) => (
              <div key={label}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="product-proof__stage">
          <CardSwap width={560} height={420} cardDistance={36} verticalDistance={32} delay={3900} skewAmount={2}>
            <AcquisitionCard />
            <QualityCard />
            <ResultCard />
          </CardSwap>
        </div>
      </div>
    </SectionShell>
  )
}
