import { useCallback, useState, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Intro } from './components/Intro/Intro';
import { Layout } from './components/Layout/Layout';
import { SystemControls } from './components/SystemControls/SystemControls';
import { DEFAULT_SECTION, SECTIONS, type SectionId } from './config/sections';
import AboutSection from './sections/AboutSection';
import ExperienceSection from './sections/ExperienceSection';
import LinksSection from './sections/LinksSection';

// Component rendered inside the content panel for each section.
const SECTION_COMPONENTS: Record<SectionId, ComponentType> = {
  about: AboutSection,
  experience: ExperienceSection,
  links: LinksSection,
};

// 'intro' plays the opening animation, 'revealing' fades the page in behind the
// leaving intro, and 'done' drops the intro from the tree.
type Stage = 'intro' | 'revealing' | 'done';

export default function App() {
  const { t } = useTranslation();
  const [stage, setStage] = useState<Stage>('intro');

  const startReveal = useCallback(() => setStage('revealing'), []);
  const finishIntro = useCallback(() => setStage('done'), []);

  return (
    <>
      {stage !== 'done' && <Intro onExitStart={startReveal} onFinish={finishIntro} />}

      {stage !== 'intro' && (
        <>
          {/* First stop in the tab order, so keyboard users can jump the chrome. */}
          <a className="skip-link" href="#content">
            {t('a11y.skipToContent')}
          </a>

          <SystemControls />

          <Routes>
            <Route path="/" element={<Navigate to={DEFAULT_SECTION.path} replace />} />

            <Route element={<Layout />}>
              {SECTIONS.map((section) => {
                const Section = SECTION_COMPONENTS[section.id];
                return <Route key={section.id} path={section.path} element={<Section />} />;
              })}
            </Route>

            <Route path="*" element={<Navigate to={DEFAULT_SECTION.path} replace />} />
          </Routes>
        </>
      )}
    </>
  );
}
