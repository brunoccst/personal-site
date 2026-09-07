import { useTranslation } from 'react-i18next';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';

import styles from './ScrollHint.module.scss';

// Small cue showing that more sections follow the current one.
export function ScrollHint({ visible }: { visible: boolean }) {
  const { t } = useTranslation();

  return (
    <p className={styles.hint} data-visible={visible} aria-hidden="true">
      <span className={styles.text}>{t('hint.scroll')}</span>
      <KeyboardArrowDownRounded className={styles.icon} fontSize="small" />
    </p>
  );
}
