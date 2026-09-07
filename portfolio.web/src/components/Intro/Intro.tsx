import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import styles from './Intro.module.scss';

// Milliseconds from mount until the text starts leaving.
const EXIT_AT_MS = 3200;
// Length of the leaving animation, matching `$exit-duration` in the stylesheet:
// the words sliding back, then the separator fading out behind them.
const EXIT_DURATION_MS = 1250;

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

  if (prefersReducedMotion) return null;

  return (
    <div className={styles.intro} data-phase={phase}>
      <p className={styles.line}>
        {/* Each half is clipped up to the separator, so it stays hidden behind
            the pipe until it has slid out. */}
        <span className={`${styles.mask} ${styles.maskStart}`}>
          <span className={styles.name}>{t('identity.name')}</span>
        </span>

        <span className={styles.separatorGlyph} aria-hidden="true">
          {t('identity.separator')}
        </span>
        <span className={styles.separatorBar} aria-hidden="true" />

        <span className={`${styles.mask} ${styles.maskEnd}`}>
          <span className={styles.role}>{t('identity.role')}</span>
        </span>
      </p>
    </div>
  );
}
