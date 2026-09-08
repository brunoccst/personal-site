import { useTranslation } from 'react-i18next';

import { useTranslatedList } from '../i18n/useTranslatedList';
import styles from './Section.module.scss';

interface ExperienceItem {
  period: string;
  role: string;
  organisation: string;
  location: string;
  summary: string;
  /** Technologies used in the role, shown as tags. */
  stack: string[];
}

export default function ExperienceSection() {
  const { t } = useTranslation();
  const items = useTranslatedList<ExperienceItem>('sections.experience.items');

  return (
    <article className={styles.section}>
      <span className={styles.kicker}>{t('sections.experience.kicker')}</span>
      <h2 className={styles.title}>{t('sections.experience.title')}</h2>

      <ol className={styles.list}>
        {items.map((item) => (
          <li key={`${item.period}-${item.role}`} className={styles.entry}>
            <span className={styles.period}>
              {item.period}
              <span className={styles.separator} aria-hidden="true">
                ·
              </span>
              {item.location}
            </span>

            <h3 className={styles.role}>{item.role}</h3>
            <span className={styles.organisation}>{item.organisation}</span>
            <p className={styles.summary}>{item.summary}</p>

            <ul className={styles.stack}>
              {item.stack.map((tech) => (
                <li key={tech} className={styles.tag}>
                  {tech}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}
