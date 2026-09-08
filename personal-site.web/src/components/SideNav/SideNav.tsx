import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { SECTIONS } from '../../config/sections';
import styles from './SideNav.module.scss';

// Vertical list of the site sections. The active entry is highlighted and
// marked with an anchor bar.
export function SideNav() {
  const { t } = useTranslation();

  return (
    <nav className={styles.nav} aria-label={t('nav.label')}>
      <ul className={styles.list}>
        {SECTIONS.map((section, index) => (
          <li
            key={section.id}
            className={styles.item}
            // Drives the staggered reveal in the stylesheet.
            style={{ '--item-index': index } as React.CSSProperties}
          >
            <NavLink to={section.path} className={styles.link}>
              <span className={styles.anchor} aria-hidden="true" />
              <span className={styles.label}>{t(section.labelKey)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
