# Decisions

Why the project is built the way it is. For a factual description of the code,
see the [README](../README.md).

Date of the rewrite: 2026-09-07.

---

## Scope

### Rebuild instead of refactor

The previous version was replaced wholesale. The brief changed the layout, the
interaction model, the styling approach and the content structure at the same
time, so almost nothing carried over. Only `LICENSE` and the Git history were
kept.

`LICENSE` was kept deliberately even though the brief said no file had to
survive. Deleting a licence file changes the legal terms of the repository,
which is not something a redesign should do as a side effect.

### Keeping the `portfolio.web` folder

The Netlify project `brunoccst` was already wired to this repository with
`portfolio.web` as its base directory. Keeping the folder name means the
existing project keeps deploying without anyone touching the Netlify dashboard.

`netlify.toml` was added on top of that. Settings in the file override the ones
stored in the dashboard, so the build is reproducible from the repository alone
and a future move to another host or another Netlify project does not depend on
undocumented dashboard state.

---

## Stack

### Vite

Vite is the default build tool for a React single-page application in 2026. It
needs no configuration to compile TypeScript, JSX and SCSS, and its dev server
starts in well under a second. The alternative worth considering was a framework
with server rendering, but this site has no backend and three pages of static
text, so a framework would add build complexity for nothing.

### CSS Modules with SCSS, not a CSS-in-JS library

The brief asked for SCSS. CSS Modules were chosen over plain global SCSS because
they scope class names at build time, which removes the whole class of bugs
where one component's selector leaks into another. They were chosen over Emotion
or styled-components because styles that live in a separate file are easier to
read, and because the styles here are static — they never depend on props.

Emotion is still installed, but only because Material UI depends on it.

### Material UI used for two buttons

The brief asked for Material UI as the design library. It is used for the two
icon buttons and their tooltips in the top-right corner, plus `CssBaseline`.

Everything else is hand-written SCSS. Using MUI's layout and typography
components would have meant expressing the design through the `sx` prop, which
contradicts the SCSS requirement and would have produced two competing styling
systems in one codebase.

The cost is a large dependency for a small amount of UI. See
[KNOWN-ISSUES.md](KNOWN-ISSUES.md).

### CSS custom properties as the single source of colour

Material UI's theme and the SCSS files both need the palette. Rather than
declaring the colours twice and keeping them in sync by hand, the theme in
`theme/createAppTheme.ts` refers to the same CSS custom properties the SCSS uses
(`'var(--color-text-muted)'` and so on). MUI writes those strings straight into
its generated CSS, so the browser resolves them.

A consequence is that one theme object serves both modes: switching
`data-theme` on `<html>` changes what the variables resolve to, and MUI's output
follows automatically. That is why `createAppTheme()` takes no arguments and is
called once.

### Packages deliberately not installed

| Package | Why not |
| --- | --- |
| `motion` / `framer-motion` | Every animation here is a fixed keyframe sequence with no gesture tracking or layout animation. CSS `@keyframes` does all of it, works without JavaScript, and runs on the compositor. |
| `i18next-browser-languagedetector` | The detection needed is "check `localStorage`, then `navigator.languages`, then fall back to English" — eleven lines in `i18n/index.ts`. |
| `clsx` / `classnames` | Class names are toggled through `data-*` attributes and CSS attribute selectors instead of string concatenation, so there is nothing to join. |
| A carousel or full-page-scroll library | The section switching is roughly a hundred lines and needs behaviour those libraries do not offer, such as yielding to the inner scroll container. |

---

## Layout

### The "square" is an inset frame, not a literal square

The brief describes a square holding all the content, a few centimetres from the
window edges. Rendering an actual `aspect-ratio: 1` box would waste most of the
width on a 16:9 monitor and would be far taller than the viewport on a phone.

What is rendered instead is a bordered box inset on all four sides, capped at
1440px wide and centred. The geometry is in `_tokens.scss`:

```scss
--frame-inset: clamp(0.875rem, 3.2vmin, 2.75rem);
--frame-inset-top: clamp(3.25rem, 4vmin + 2.25rem, 5rem);
```

At a typical desktop size the side inset lands near 2.5cm, matching the brief's
"a few centimeters".

The top inset is deliberately larger than the other three. The system controls
sit outside the frame in the top-right corner, and they need a band to live in.
That asymmetry also satisfies the brief's requirement that the content be
centred on the frame rather than on the window: because the frame is pushed
down, its centre is not the window's centre.

The inset is a token, so changing the shape later is a one-line edit.

### Reading measure capped at 68 characters

The content panel spans the full width of the frame, as asked. The prose inside
it is capped at `68ch`.

Lines longer than roughly 75 characters make the eye lose its place on the
return sweep, which is why every typographic reference recommends 45–75. On a
1280px screen the uncapped measure would be about 120 characters. The empty
space to the right of the text is the cost, and it reads as intentional margin
rather than as a bug.

This will fill in once real content with images and icons replaces the
placeholder text.

### The system controls share the frame's geometry

The controls sit outside the frame, but their right edge has to line up with the
frame's right border. Giving them `right: var(--frame-inset)` is not enough: the
frame is also capped at `--frame-max-width` and centred, so on a viewport wider
than that cap the frame's edge is further in than the raw inset.

The strip therefore repeats the frame's whole geometry — both insets, the same
`max-width`, the same `margin-inline: auto` — and right-aligns its contents. The
two edges then agree at every width. The strip takes `pointer-events: none` so
that the empty part of it does not sit over the page, and the buttons take
`pointer-events: auto` back.

The last button also carries a negative right margin equal to its own padding,
so what lines up with the border is the icon itself rather than the invisible
edge of its hit area. That padding is set in the MUI theme under `sizeSmall`
rather than in the stylesheet, because MUI's own `sizeSmall` rule is more
specific than a CSS Modules class and would otherwise win.

For the same reason the frame's entrance animation fades without scaling. An
earlier `scale(0.995)` pulled the frame's painted edge a few pixels away from
the controls for the duration of the animation.

---

## Colour and type

### One light theme, one black theme

The original brief asked for a dark page in both modes — pure black for dark,
grey for light. That was revised: the light theme is now genuinely light, warm
and pastel, and only the dark theme stays dark.

The light theme is built on a warm off-white (`#f0ede7` page, `#fbf9f6` frame)
rather than pure white. Pure white against a near-black frame border is harsh at
full screen brightness, and the slight warmth keeps the two themes recognisably
the same design rather than two unrelated skins.

Each theme has one accent and no second colour. Light uses a muted bronze
(`#8c6239`), dark a soft gold (`#d8b878`) — the same hue family at the two
lightnesses each background needs. Keeping a single accent per theme is what
lets it carry meaning: it marks the selected navigation entry, the section
kicker and link hovers, and nothing else competes with it.

Pastel here means the *surfaces* are pastel. The accent and the text are not:
a genuinely pastel accent cannot reach 4.5:1 against an off-white background, so
the accent is a desaturated mid-tone that reads as muted without failing
contrast.

### Measured contrast ratios

Computed against the frame background of each theme (`#fbf9f6` light,
`#0a0b0c` dark):

| Token | Light theme | Dark theme | WCAG AA (4.5:1) |
| --- | --- | --- | --- |
| `--color-text` | 14.61:1 | 17.92:1 | Pass |
| `--color-text-muted` | 6.10:1 | 7.14:1 | Pass |
| `--color-text-faint` | 4.74:1 | 5.16:1 | Pass |
| `--color-accent` | 5.10:1 | 10.36:1 | Pass |

`--color-text-faint` is the token to watch. It is the smallest, quietest text on
the page and carries real content — the date range on each experience entry — so
it has to clear 4.5:1 rather than the 3:1 that would do for decoration. Both
themes were adjusted after measuring; every value in the table above was checked
rather than eyeballed.

### No web fonts

The type stack starts with Segoe UI Variable Display and falls back through the
system UI fonts. Nothing is downloaded.

A web font would cost a render-blocking request and a layout shift on first
paint, on a page whose whole first impression is an animation that has to start
on time. It would also mean a third-party request, or self-hosting and a licence
to track. The system stack is not as distinctive, but it paints immediately.

### Fluid type instead of breakpoint steps

Font sizes are `clamp()` expressions rather than sets of media queries. One
declaration covers every viewport width, sizes change smoothly while a window is
resized instead of jumping at fixed points, and there is one place to adjust
rather than four.

Breakpoints are still used, but only where the layout genuinely rearranges: the
navigation turning horizontal below 768px, and the intro stacking vertically.

---

## Interaction

### Scroll hijacking, with the inner panel taking priority

The brief asks for the window not to scroll while the wheel changes sections.
Taken literally that breaks any section whose content is taller than the frame,
because the overflow becomes unreachable.

`useSectionNavigation` resolves it by giving the content panel first refusal.
While the panel still has room to scroll in the direction of the gesture, the
hook does nothing and the browser scrolls the panel natively. Only at the top or
bottom edge does the input change section. This is the behaviour people already
know from slide-style sites, and it keeps long content readable.

Two guards stop the interaction feeling twitchy:

- a 60px accumulated-distance threshold, so a light trackpad flick does not
  trigger a change;
- a 700ms lock after each change, so one long gesture cannot skip several
  sections.

Both numbers are constants at the top of the hook.

### Listeners on `window`, state in a ref

The wheel and touch listeners are attached once and never re-attached. Their
`useEffect` depends only on `panelRef`; the values they need — current index,
section count, the navigate callback — are read from a ref that is rewritten on
every render.

Re-attaching a non-passive wheel listener on every render is measurably worse,
and a stale-closure bug in this hook would be hard to spot because it would only
appear as an occasional skipped section.

### Exit animations without a transition library

React removes an element from the DOM as soon as it stops being rendered, so an
exit animation needs the old element kept alive for its duration.

`ContentPanel` does this with a small state machine. It reads the current route
element with `useOutlet()` but stores it in state alongside the pathname it came
from. On a route change it sets the phase to `exit`, waits 220ms, then swaps in
the new element and sets the phase to `enter`. The wrapper's `key` is the stored
pathname, so the swap remounts the subtree and restarts the enter animation.

The direction of travel is stored with the element, so moving to a later section
animates upward and moving back animates downward.

The newest outlet element is held in a ref rather than in the effect's
dependencies. Route elements are new objects on every render, so depending on
one directly would re-run the effect forever.

### The intro text really does come out of the pipe

The first version translated each half outward from the separator by a fixed
`1.6em`. That is wrong, and it looked it: a translated element still paints in
full, so at the start of the animation "Costa" sat directly on top of "Software"
and the two halves visibly crossed the `|`.

The fix is a mask. Each half is wrapped in a `.mask` span that stays at the
text's final position and clips to it:

```scss
.mask {
  display: inline-block;
  clip-path: inset(-0.4em 0 -0.4em 0);
}
```

The text inside starts at `translateX(100%)` (the name) or `translateX(-100%)`
(the role), which puts it entirely outside its own mask, tucked behind the
separator, and animates to `translateX(0)`. Because the mask never moves, no
part of either half can appear on the wrong side of the `|` — the constraint is
geometric rather than a matter of tuning a distance.

The negative vertical insets matter: `inset(0 ...)` would clip ascenders and
descenders flat. Negative values let the text overflow vertically while still
being clipped horizontally.

### Intro timing

| Moment | What happens |
| --- | --- |
| 0–600ms | The `\|` fades and scales in |
| 200–1400ms | Both halves slide out of the pipe into place |
| 3200ms | The animation reverses; the page mounts behind the intro |
| 3830ms | Backdrop starts clearing |
| 4100ms | Intro is removed from the tree |

The exit is the exact reverse of the entrance: each half slides back into the
`|` and the separator fades last, once the text is back inside it. An earlier
version had the two halves flying apart instead, which read as the page opening
up but was not what "the opposite direction" describes.

The page is mounted at 3200ms rather than at 4100ms. An earlier version waited
for the intro to unmount, which left roughly 200ms of empty background between
the two. Mounting the page behind the still-opaque backdrop makes the two
cross-fade instead.

The entrance runs for 1200ms and the exit for 900ms — both roughly double the
first draft. At the shorter durations the movement registered as a jump rather
than a slide.

### The intro cannot be skipped

An earlier version had a skip button and an <kbd>Esc</kbd> handler. Both are
gone: at about four seconds the opening is short enough that an escape hatch was
more clutter than help, and the button competed with the text it sat under.

The reduced-motion bypass stays. That is an accessibility requirement rather
than a convenience, and it removes the intro entirely.

The intro plays on every full page load rather than once per session. Making it
conditional on `sessionStorage` was considered and rejected: it makes the first
impression inconsistent, and it is surprising during development.

---

## Accessibility

The choices worth recording, beyond the list in the README:

- **Skip link before the controls.** The tab order is skip link, language,
  theme, navigation, content. Putting the skip link first is the convention, and
  it means one <kbd>Tab</kbd> and one <kbd>Enter</kbd> reaches the content from
  a cold start.
- **`role="status"` rather than `aria-live` on the panel.** Because the section
  changes without a page load, screen readers get no navigation event. A
  separate hidden live region announces the section name, which is quieter than
  making the whole content panel a live region.
- **The panel is focusable.** A scrollable region that cannot be focused cannot
  be scrolled with the keyboard. `tabindex="0"` plus a label makes it a proper
  stop in the tab order.
- **The `|` is `aria-hidden`.** It is a visual divider. Read aloud it becomes
  "vertical line" between the name and the role.
- **Reduced motion is handled twice.** `global.scss` neutralises every animation
  through a media query, and `Intro.tsx` additionally checks the preference in
  JavaScript so the intro is never mounted at all. The media query alone would
  leave the intro on screen as a static card for three seconds.

---

## Build

### Manual vendor chunks

`vite.config.ts` splits React, Material UI and i18next into their own chunks.
Third-party code changes far less often than the app code, so a returning
visitor keeps the cached vendor chunks when only the app chunk changes.

The split is expressed as a function over module ids rather than the object
form, because Rollup's current types only accept a function.

### `dist` is not committed

Netlify runs the build. Committing build output creates noisy diffs and lets the
published site drift from the source.
