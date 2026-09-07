import { useTranslation } from 'react-i18next';

import { useTranslatedList } from '../i18n/useTranslatedList';
import styles from './Section.module.scss';

interface LinkItem {
  label: string;
  description: string;
  href: string;
}

export default function LinksSection() {
  const { t } = useTranslation();
  const items = useTranslatedList<LinkItem>('sections.links.items');

  return (
    <article className={styles.section}>
      <span className={styles.kicker}>{t('sections.links.kicker')}</span>
      <h2 className={styles.title}>{t('sections.links.title')}</h2>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href + item.label}>
            <a
              className={styles.link}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.linkLabel}>
                {item.label}
                <span className="visually-hidden"> {t('a11y.opensInNewTab')}</span>
              </span>
              <span className={styles.linkDescription}>{item.description}</span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
