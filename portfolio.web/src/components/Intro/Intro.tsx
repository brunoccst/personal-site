import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import styles from './Intro.module.scss';

// Milliseconds from mount until the text starts leaving.
const EXIT_AT_MS = 3000;
// Length of the leaving animation, matching `$exit-duration` in the stylesheet.
const EXIT_DURATION_MS = 700;

type Phase = 'enter' | 'exit';

interface IntroProps {
  /** Called when the text starts leaving, so the page can fade in behind it. */
  onExitStart: () => void;
  /** Called once the intro has left the screen. */
  onFinish: () => void;
}

// Full-screen opening animation shown on the first render of the app.
export function Intro({ onExitStart, onFinish }: IntroProps) {
  const { t } = useTranslation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('enter');

  // Users who asked for reduced motion go straight to the page.
  useEffect(() => {
    if (prefersReducedMotion) onFinish();
  }, [prefersReducedMotion, onFinish]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const exitTimer = window.setTimeout(() => {
      setPhase('exit');
      onExitStart();
    }, EXIT_AT_MS);
    const finishTimer = window.setTimeout(onFinish, EXIT_AT_MS + EXIT_DURATION_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, [prefersReducedMotion, onExitStart, onFinish]);

  // Escape ends the intro early.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onFinish();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onFinish]);

  if (prefersReducedMotion) return null;

  return (
    <div className={styles.intro} data-phase={phase}>
      <p className={styles.line}>
        <span className={styles.name}>{t('identity.name')}</span>
        <span className={styles.separatorGlyph} aria-hidden="true">
          {t('identity.separator')}
        </span>
        <span className={styles.separatorBar} aria-hidden="true" />
        <span className={styles.role}>{t('identity.role')}</span>
      </p>

      <button type="button" className={styles.skip} onClick={onFinish}>
        {t('intro.skip')}
      </button>
    </div>
  );
}
