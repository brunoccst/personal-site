# Known issues

Things that are wrong, incomplete, or that will surprise someone reading the
code. Planned work is in [NEXT-STEPS.md](NEXT-STEPS.md).

---

## Content

### All content is placeholder text

Every section holds lorem ipsum. The link entries point at `https://example.com`.
The experience entries have invented dates and organisation names.

The shapes are real, though: `sections.experience.items` and
`sections.links.items` in the locale files already have the fields the finished
content needs, so replacing the values does not require touching a component.

### No images or icons in the sections

The section components render text only. Nothing is in place for a photo, a
company logo or the icons the Links section will eventually want.

---

## Interaction

### A panel that barely overflows eats a whole gesture

The content panel takes priority over section changes whenever it has room to
scroll — including when it has three pixels of room. In that case one wheel
gesture is spent scrolling those three pixels and a second is needed to change
section.

It is visible today: at 1280×720 the Experience section overflows by about five
pixels.

A minimum-overflow threshold would fix the gesture but would make those few
pixels of content unreachable. The real fix is section content that either fits
comfortably or overflows clearly.

### Scroll hijacking is an unusual interaction

Taking over the wheel is what the brief asked for, and the keyboard and touch
paths are covered, but it still breaks the expectation that a wheel scrolls a
page. Visitors using an input device that reports unusual `deltaY` values — some
free-spinning mice, some remote-desktop clients — may find the 60px threshold
either too easy or too hard to reach.

### Browser history fills up

Every section change is a `navigate()` call that pushes a history entry.
Scrolling from About me to Links and back leaves four entries, so the Back button
walks through them one at a time rather than leaving the site.

Using `replace` for scroll-driven changes and `push` for clicks would be closer
to what people expect, but it makes the Back button unable to return to a
previous section at all. Neither behaviour is clearly right; the current one is
at least predictable.

### No swipe distinction between vertical scroll and section change on touch

The touch handler only measures vertical travel. A diagonal swipe that is mostly
horizontal still counts toward a section change if its vertical component
crosses 56px.

---

## Build and dependencies

### Material UI is a large dependency for two buttons

`@mui/material`, `@mui/icons-material` and their Emotion dependency produce a
vendor chunk of roughly 162kB (about 56kB compressed) to render two icon buttons
and two tooltips. That is most of the third-party JavaScript on the page.

The trade was made knowingly — see [DECISIONS.md](DECISIONS.md) — but it is the
single largest performance cost in the project.

### No linter or formatter

There is no ESLint or Prettier configuration. Style is consistent because the
code was written in one pass, and nothing enforces it.

### No tests

There are no unit, component or end-to-end tests. `useSectionNavigation` and the
route-swapping state machine in `ContentPanel` are the two pieces where a
regression would be easy to introduce and hard to notice.

---

## Internationalisation

### Region variants collapse to the base language

`pt-BR` and `pt-PT` both resolve to `pt`, and the Portuguese file uses Brazilian
spelling and vocabulary ("Engenheiro de Software & Líder de Equipe"). A visitor
in Portugal gets Brazilian Portuguese.

### Nothing checks that the two locale files match

A key added to `en.json` and forgotten in `pt.json` produces no error. It falls
back to English silently, so a half-translated interface would ship unnoticed.

### The language toggle assumes exactly two languages

`SystemControls` switches between English and Portuguese with a lookup table. A
third language would need the control replaced with a menu.

---

## Layout and styling

### The pipe separator disappears below 768px

On narrow screens the heading stacks the name over the role and hides the `|`
between them. The intro replaces it with a short horizontal rule; the heading in
the frame drops it entirely. The character is decorative and stacking is the
only way to fit the text, but the two treatments are inconsistent with each
other.

### Wide screens leave the content column looking empty

With the reading measure capped at 68 characters, a 1440px window shows roughly
590px of text and 375px of empty space to its right. It is deliberate, and it
will look better with real content, but at present the page reads as sparse on a
large monitor.

### The frame is not a square

The brief calls the content container a square. It is a bordered box inset from
the viewport edges, and its proportions follow the window. See
[DECISIONS.md](DECISIONS.md) for why.

### `--frame-inset-top` couples two things

The top inset has to be tall enough for the system controls that sit above the
frame. If the buttons are ever made larger, the token has to be raised by hand
or the controls will overlap the frame border. Nothing enforces the
relationship.

### The control alignment depends on a duplicated padding value

The last control's negative right margin has to equal the button's own padding
for the icon to line up with the frame border. The padding is set in the MUI
theme and the margin in the stylesheet, both as `var(--space-2)`. They agree
today because they name the same token, but nothing fails if one is changed
alone.

### Entrance animations leave elements invisible while paused

The heading, navigation and frame all start at `opacity: 0` and are revealed by
a CSS animation. A browser that pauses animations — Chrome does this for tabs
that are never painted — leaves those elements invisible rather than showing
them unanimated. It resolves as soon as the tab is displayed, so a real visitor
is unlikely to see it, but automated screenshots of a hidden viewport catch it
consistently.

---

## Accessibility

### The content panel is always a tab stop

`tabindex="0"` is set on the content panel unconditionally so it can be scrolled
with the keyboard. When the section is short enough not to scroll, that is a tab
stop that does nothing.

### Nothing tells anyone that scrolling changes section

The on-screen hint that used to say so has been removed. The wheel, arrow keys
and swipes all still change section, and the side navigation is the only clue
that more sections exist. Nobody is told how to reach them without clicking.

### The intro cannot be skipped

The skip button and the <kbd>Esc</kbd> handler are gone, so every visitor waits
about four and a half seconds before the content appears, on every full page
load. Only the reduced-motion preference bypasses it.

### Reduced motion removes the intro rather than simplifying it

Someone who asks for reduced motion never sees the opening text at all. A static
version held briefly would carry the same information without movement.

---

## Hosting

### Deep links depend on the Netlify redirect

`/experience` only resolves because of the catch-all rule in `netlify.toml`.
Opening `dist/index.html` from the filesystem, or serving `dist` with a static
server that has no SPA fallback, gives a 404 on every path except `/`.

### No social preview or sitemap

`index.html` has a description but no Open Graph or Twitter Card tags, so a
shared link renders as a bare URL. There is no `sitemap.xml`.

### Client-side rendering only

The HTML served to a crawler contains an empty `<div id="root">`. Search engines
that execute JavaScript will index the page; those that do not will see nothing.
