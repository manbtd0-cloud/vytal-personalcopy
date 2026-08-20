import LoopBand from '../system/LoopBand.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'
import { homeLanguageItems } from '../../content/homeReference.js'

function LanguageItem({ language }) {
  return (
    <span className="ref-language-band__item">
      <span lang={language.code} className="ref-language-band__native">{language.label}</span>
      {language.label === language.name ? null : (
        <span className="ref-language-band__name" aria-hidden="true">{language.name}</span>
      )}
    </span>
  )
}

export default function LanguageBandChapter() {
  return (
    <SectionThemeBoundary
      theme="coral"
      as="section"
      className="ref-language-band"
      data-home-chapter="language-band"
    >
      <div className="public-shell ref-language-band__header">
        <p className="ref-kicker">LANGUAGE / ACCESS</p>
        <p>Explanation is only useful when people can understand it. The current prototype carries eight explanation-language records in its product layer.</p>
      </div>

      <div className="ref-language-band__stage">
        <SignalThread variant="divider" tone="ink" density="quiet" className="ref-language-band__thread" />
        <LoopBand
          items={homeLanguageItems}
          direction="right"
          speed={0.38}
          ariaLabel="Supported explanation languages"
          className="ref-language-band__loop"
          getKey={(language) => language.code}
          renderItem={(language) => <LanguageItem language={language} />}
        />
      </div>
    </SectionThemeBoundary>
  )
}
