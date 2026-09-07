import { useTranslation } from 'react-i18next';

import { useTranslatedList } from '../i18n/useTranslatedList';
import styles from './Section.module.scss';

export default function AboutSection() {
  const { t } = useTranslation();
  const paragraphs = useTranslatedList<string>('sections.about.paragraphs');

  return (
    <article className={styles.section}>
      <span className={styles.kicker}>{t('sections.about.kicker')}</span>
      <h2 className={styles.title}>{t('sections.about.title')}</h2>

      <div className={styles.prose}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
