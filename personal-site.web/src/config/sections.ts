export type SectionId = 'about' | 'experience' | 'links';

export interface SectionDefinition {
  id: SectionId;
  /** Route path used by React Router. */
  path: string;
  /** Key of the label inside the `nav` namespace of the locale files. */
  labelKey: string;
}

// Order of this array drives both the side navigation and scroll navigation.
export const SECTIONS: readonly SectionDefinition[] = [
  { id: 'about', path: '/about', labelKey: 'nav.about' },
  { id: 'experience', path: '/experience', labelKey: 'nav.experience' },
  { id: 'links', path: '/links', labelKey: 'nav.links' },
] as const;

export const DEFAULT_SECTION = SECTIONS[0];

// Finds the section matching a pathname, or the default section.
export function findSectionByPath(pathname: string): SectionDefinition {
  return SECTIONS.find((section) => section.path === pathname) ?? DEFAULT_SECTION;
}

// Returns the position of a section in the navigation order.
export function indexOfSection(id: SectionId): number {
  return SECTIONS.findIndex((section) => section.id === id);
}
