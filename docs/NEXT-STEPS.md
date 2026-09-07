# Next steps

Planned work, roughly in the order it should be done. Problems being carried are
listed in [KNOWN-ISSUES.md](KNOWN-ISSUES.md).

---

## 1. Real content

The site cannot ship with lorem ipsum, so this comes first.

- Replace `sections.about.paragraphs` in both locale files with the real text.
- Replace `sections.experience.items` with real roles, organisations and dates.
  The field shape (`period`, `role`, `organisation`, `summary`) already exists;
  add fields to it if the real entries need more, and update the interface in
  `ExperienceSection.tsx` to match.
- Replace `sections.links.items` with real destinations. Decide at that point
  whether each entry needs an icon.
- Remove the `kicker` values, which currently read "Placeholder content".
- Write the Portuguese text as a translation, not a copy of the English.

## 2. Images and icons

Once the content is known:

- Add a portrait to the About me section. Serve it as AVIF with a WebP fallback,
  at two or three widths through `srcset`, with explicit `width` and `height` so
  it reserves its space and does not shift the layout.
- Add organisation logos to the experience entries, or decide the timeline reads
  better without them.
- Add brand icons to the link entries. Prefer inline SVG over another icon
  package; three or four icons do not justify a dependency.
- Give every image real alt text, or an empty `alt=""` when it is decorative.

## 3. Metadata and sharing

- Add Open Graph and Twitter Card tags to `index.html`.
- Add a 1200×630 preview image to `public/`.
- Add `public/sitemap.xml` and reference it from `robots.txt`.
- Add a `<link rel="canonical">`.
- Add JSON-LD `Person` structured data.
- Decide whether the `lang` attribute switching needs matching `hreflang`
  alternates. It probably does not while both languages share one URL, but a
  crawler only ever sees the default language, which is worth revisiting.

## 4. Quality tooling

- Add ESLint with `typescript-eslint`, `eslint-plugin-react-hooks` and
  `eslint-plugin-jsx-a11y`. The last one would have caught several things during
  the rewrite.
- Add Prettier and a `format` script.
- Add a `lint` script and make CI run `typecheck`, `lint` and `build`.

## 5. Tests

- Add Vitest and Testing Library.
- Cover `useSectionNavigation` first: the panel-priority rule, the 60px
  threshold, the 700ms lock, and the clamping at the first and last section.
- Cover the `ContentPanel` swap: that the old section stays mounted for the exit
  animation and that the direction is right in both directions.
- Cover the theme and language toggles, including the `localStorage` failure
  path.
- Add a small Playwright suite for the paths that only exist in a browser: the
  intro playing and being skippable, deep-linking to `/experience`, and a wheel
  gesture changing section.

## 6. Performance

- Measure first. Run Lighthouse against the deployed site and record the
  numbers before changing anything.
- Reconsider the Material UI dependency once the numbers are known. If the two
  icon buttons remain its only use, replacing them with plain buttons and inline
  SVG icons would remove roughly 56kB of compressed JavaScript. That decision
  belongs to whoever weighs the design-library requirement against the cost.
- If sections grow large, split them with `React.lazy` so the initial load only
  carries About me.
- Consider prerendering the three routes at build time so crawlers and
  no-JavaScript visitors get real HTML. `vite-plugin-prerender` or a small
  post-build script would do it without adopting a framework.

## 7. Accessibility follow-ups

- Run axe against all three sections in both themes and both languages.
- Test the whole page with a screen reader, particularly the section-change
  announcement and the intro.
- Make the content panel focusable only when it actually scrolls, by measuring
  overflow with a `ResizeObserver`.
- Offer a static version of the intro under reduced motion instead of removing
  it.
- Add `prefers-contrast: more` overrides that raise the border and muted-text
  tokens.
- Give the scroll hint a screen-reader-visible equivalent, or add instructions
  to the navigation's accessible description.

## 8. Internationalisation follow-ups

- Add a script that compares the key sets of `en.json` and `pt.json` and fails
  the build when they diverge.
- Decide whether Portuguese should be split into `pt-BR` and `pt-PT`.
- Replace the two-language toggle with a menu if a third language is added.
- Consider giving each language its own URL prefix so a shared link keeps its
  language.

## 9. Interaction polish

- Reconsider whether scroll-driven section changes should push history entries.
- Add horizontal-travel rejection to the touch handler so diagonal swipes do not
  change section.
- Add a progress indicator showing position within the section list, for
  visitors who do not read the navigation as a progress bar.

## 10. Analytics

If any measurement is wanted, use something cookie-free and self-hostable such
as Plausible or Umami, so no consent banner is needed. Decide first what
question the numbers would answer.
