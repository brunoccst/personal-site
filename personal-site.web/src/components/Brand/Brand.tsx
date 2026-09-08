import { useTranslation } from 'react-i18next';

import styles from './Brand.module.scss';

// Page heading in the top-left corner of the frame.
export function Brand() {
  const { t } = useTranslation();

  return (
    <h1 className={styles.brand}>
      <span className={styles.name}>{t('identity.name')}</span>
      <span className={styles.separator} aria-hidden="true">
        {t('identity.separator')}
      </span>
      <span className={styles.role}>{t('identity.role')}</span>
    </h1>
  );
}
