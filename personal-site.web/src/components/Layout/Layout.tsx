import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { SECTIONS, findSectionByPath, indexOfSection } from '../../config/sections';
import { useSectionNavigation } from '../../hooks/useSectionNavigation';
import { Brand } from '../Brand/Brand';
import { ContentPanel } from '../ContentPanel/ContentPanel';
import { SideNav } from '../SideNav/SideNav';
import { SystemControls } from '../SystemControls/SystemControls';
import styles from './Layout.module.scss';

// The framed page: heading, side navigation and the section content.
export function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);

  const currentSection = findSectionByPath(pathname);
  const currentIndex = indexOfSection(currentSection.id);
  const sectionLabel = t(currentSection.labelKey);

  const onRequestSection = useCallback(
    (index: number) => {
      const target = SECTIONS[index];
      if (target) navigate(target.path);
    },
    [navigate],
  );

  useSectionNavigation({
    currentIndex,
    count: SECTIONS.length,
    onRequestSection,
    panelRef,
    enabled: true,
  });

  // The tab title stays the name alone; the section is announced by the live
  // region below instead.
  useEffect(() => {
    document.title = t('identity.name');
  }, [t]);

  return (
    <>
      <main className={styles.frame}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <Brand />
            <SystemControls />
          </div>

          <div className={styles.body}>
            <SideNav />
            <ContentPanel panelRef={panelRef} label={sectionLabel} />
          </div>
        </div>
      </main>

      <p className="visually-hidden" role="status" aria-live="polite">
        {t('a11y.sectionAnnouncement', { section: sectionLabel })}
      </p>
    </>
  );
}
