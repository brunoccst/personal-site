import { useEffect, useRef, useState, type RefObject } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

import { findSectionByPath, indexOfSection } from '../../config/sections';
import styles from './ContentPanel.module.scss';

// Length of the leaving animation, matching `$swap-duration` in the stylesheet.
const EXIT_DURATION_MS = 220;

interface ContentPanelProps {
  /** Ref shared with the navigation hook so it can read the scroll position. */
  panelRef: RefObject<HTMLDivElement | null>;
  /** Accessible name of the region, i.e. the current section title. */
  label: string;
}

interface DisplayedRoute {
  pathname: string;
  node: React.ReactNode;
  /** 1 when moving down the section list, -1 when moving up. */
  direction: number;
}

// Scrollable area holding the current section. Swapping sections plays a short
// leaving animation before the new section is mounted.
export function ContentPanel({ panelRef, label }: ContentPanelProps) {
  const outlet = useOutlet();
  const { pathname } = useLocation();

  // Holds the newest route element without triggering the swap effect.
  const latestOutlet = useRef(outlet);
  latestOutlet.current = outlet;

  const [displayed, setDisplayed] = useState<DisplayedRoute>(() => ({
    pathname,
    node: outlet,
    direction: 1,
  }));
  const [phase, setPhase] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    if (displayed.pathname === pathname) return;

    const from = indexOfSection(findSectionByPath(displayed.pathname).id);
    const to = indexOfSection(findSectionByPath(pathname).id);
    const direction = to >= from ? 1 : -1;

    setPhase('exit');
    const timer = window.setTimeout(() => {
      setDisplayed({ pathname, node: latestOutlet.current, direction });
      setPhase('enter');
      panelRef.current?.scrollTo({ top: 0 });
    }, EXIT_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [pathname, displayed.pathname, panelRef]);

  return (
    <div
      id="content"
      ref={panelRef}
      className={styles.panel}
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      <div
        key={displayed.pathname}
        className={styles.slide}
        data-phase={phase}
        data-direction={displayed.direction > 0 ? 'forward' : 'back'}
      >
        {displayed.node}
      </div>
    </div>
  );
}
