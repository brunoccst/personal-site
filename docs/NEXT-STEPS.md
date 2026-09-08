# Next steps

Planned work, roughly in the order it should be done. Problems being carried are
listed in [KNOWN-ISSUES.md](KNOWN-ISSUES.md).

---

## 1. Confirm the content

The lorem ipsum is gone; every section is now written from the CV. What remains
is verification, because the CV was the only source available.

- Supply the earlier MECOMO role from LinkedIn. The site still carries the CV's
  single entry for May 2016 – Nov 2020, while LinkedIn splits it in two; the
  first of those was cut off in the screenshot used for the cross-check.
- Settle whether the stay in Germany has been continuous. The About text says it
  has, LinkedIn's "relocated back to Germany" suggests otherwise, and only one of
  them can be right.
- Cross-check everything before Nov 2020. The DocuWare entries have been checked
  against LinkedIn and the CV turned out to be stale; the older roles have had no
  such check.
- Read the Portuguese as a native speaker would. It is a translation rather than
  a copy, but the register was chosen without a second opinion.
- Decide the order of the words in the heading. It reads "Software Engineer &
  Team Lead", while the current role is Team Lead and coding is about a fifth of
  the work.
- Decide whether LinkedIn and GitHub are enough. No contact details appear
  anywhere on the site — phone, address and email were all deliberately left off
  a public page — so those two profiles are the only routes in. A contact form
  backed by a form service would add a third without publishing an address.

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
  intro playing through to the page, deep-linking to `/experience`, and a wheel
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
- Tell people that scrolling moves between sections. The on-screen hint has been
  removed, so the behaviour is now undiscoverable for everyone rather than just
  for screen reader users. An accessible description on the navigation, or a
  quieter visual cue, would cover both.
- Reconsider whether the intro should be skippable. It is four seconds on every
  full page load with no way out.

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
