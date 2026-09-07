import { useEffect, useRef, type RefObject } from 'react';

// Wheel distance that must build up before the section changes.
const WHEEL_THRESHOLD = 60;
// Time without wheel events after which the built-up distance resets.
const WHEEL_IDLE_RESET_MS = 220;
// Time after a section change during which further input is ignored.
const LOCK_MS = 700;
// Vertical finger travel that counts as a swipe.
const SWIPE_THRESHOLD = 56;

interface Options {
  /** Index of the section currently shown. */
  currentIndex: number;
  /** Number of sections available. */
  count: number;
  /** Called with the index of the section to show next. */
  onRequestSection: (index: number) => void;
  /** The scrollable content element, which gets priority over section changes. */
  panelRef: RefObject<HTMLElement | null>;
  /** Set to false to ignore all input (for example while the intro plays). */
  enabled: boolean;
}

// Reports whether the panel still has room to scroll in the given direction.
function canPanelAbsorb(panel: HTMLElement | null, direction: number): boolean {
  if (!panel) return false;

  const maxScroll = panel.scrollHeight - panel.clientHeight;
  if (maxScroll <= 1) return false;

  return direction > 0 ? panel.scrollTop < maxScroll - 1 : panel.scrollTop > 1;
}

// Returns true when the key event came from a field that needs the arrow keys.
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

// Moves between sections with the wheel, touch swipes and the keyboard while
// keeping the window itself from scrolling.
export function useSectionNavigation({
  currentIndex,
  count,
  onRequestSection,
  panelRef,
  enabled,
}: Options): void {
  const lockedUntil = useRef(0);
  const wheelDistance = useRef(0);
  const lastWheelAt = useRef(0);
  const touchStartY = useRef(0);
  const touchDelta = useRef(0);

  // Latest values are kept in a ref so the listeners are attached only once.
  const state = useRef({ currentIndex, count, onRequestSection, enabled });
  state.current = { currentIndex, count, onRequestSection, enabled };

  useEffect(() => {
    // Requests the section `step` places away, respecting the input lock.
    const step = (direction: number) => {
      const { currentIndex: index, count: total, onRequestSection: request } = state.current;
      const next = index + direction;
      if (next < 0 || next >= total) return;

      lockedUntil.current = performance.now() + LOCK_MS;
      wheelDistance.current = 0;
      request(next);
    };

    const isLocked = () => performance.now() < lockedUntil.current;

    const onWheel = (event: WheelEvent) => {
      if (!state.current.enabled) return;

      const direction = Math.sign(event.deltaY);
      if (direction === 0) return;

      const panel = panelRef.current;

      if (canPanelAbsorb(panel, direction)) {
        wheelDistance.current = 0;
        // Let the browser scroll the panel when the pointer is already over it.
        if (panel?.contains(event.target as Node)) return;
        event.preventDefault();
        panel?.scrollBy({ top: event.deltaY });
        return;
      }

      event.preventDefault();
      if (isLocked()) return;

      const now = performance.now();
      if (now - lastWheelAt.current > WHEEL_IDLE_RESET_MS) wheelDistance.current = 0;
      lastWheelAt.current = now;

      wheelDistance.current += event.deltaY;
      if (Math.abs(wheelDistance.current) < WHEEL_THRESHOLD) return;

      step(Math.sign(wheelDistance.current));
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? 0;
      touchDelta.current = 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!state.current.enabled) return;

      const currentY = event.touches[0]?.clientY ?? 0;
      touchDelta.current = touchStartY.current - currentY;

      const direction = Math.sign(touchDelta.current);
      if (direction === 0) return;
      if (canPanelAbsorb(panelRef.current, direction)) return;

      // Stops the browser's pull-to-refresh and rubber-band effects.
      if (event.cancelable) event.preventDefault();
    };

    const onTouchEnd = () => {
      if (!state.current.enabled) return;

      const direction = Math.sign(touchDelta.current);
      if (direction === 0 || Math.abs(touchDelta.current) < SWIPE_THRESHOLD) return;
      if (canPanelAbsorb(panelRef.current, direction)) return;
      if (isLocked()) return;

      step(direction);
      touchDelta.current = 0;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!state.current.enabled) return;
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const { count: total, onRequestSection: request } = state.current;

      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        lockedUntil.current = performance.now() + LOCK_MS;
        request(event.key === 'Home' ? 0 : total - 1);
        return;
      }

      const direction =
        event.key === 'ArrowDown' || event.key === 'PageDown'
          ? 1
          : event.key === 'ArrowUp' || event.key === 'PageUp'
            ? -1
            : 0;

      if (direction === 0) return;

      const panel = panelRef.current;
      // Let the panel handle the key when it is focused and can still scroll.
      if (panel?.contains(document.activeElement) && canPanelAbsorb(panel, direction)) {
        return;
      }

      event.preventDefault();
      if (isLocked()) return;
      step(direction);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [panelRef]);
}
