import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { SECTIONS, findSectionByPath, indexOfSection } from '../../config/sections';
import { useSectionNavigation } from '../../hooks/useSectionNavigation';
import { Brand } from '../Brand/Brand';
import { ContentPanel } from '../ContentPanel/ContentPanel';
import { ScrollHint } from '../ScrollHint/ScrollHint';
import { SideNav } from '../SideNav/SideNav';
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

  useEffect(() => {
    document.title = t('a11y.pageTitle', { section: sectionLabel });
  }, [t, sectionLabel]);

  return (
    <>
      <main className={styles.frame}>
        <div className={styles.inner}>
          <Brand />

          <div className={styles.body}>
            <SideNav />
            <ContentPanel panelRef={panelRef} label={sectionLabel} />
          </div>
        </div>

        <ScrollHint visible={currentIndex < SECTIONS.length - 1} />
      </main>

      <p className="visually-hidden" role="status" aria-live="polite">
        {t('a11y.sectionAnnouncement', { section: sectionLabel })}
      </p>
    </>
  );
}
