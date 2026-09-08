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

### "Personal site" rather than "portfolio"

The repository, the app folder and the prose all said *portfolio*. A portfolio
shows work — projects someone built, with something to look at. This site shows
a biography, a job history and two links, which is a CV rendered as a web page.
The word was describing an intention rather than the thing that exists.

Renaming was chosen over the alternative of making the word true by adding a
projects section. That section is still worth building, but the label should
match what is on the page today rather than what might be there later.

`netlify.toml` pins the build settings, so renaming the app folder is a one-line
change to `base` in that file. Settings there override the ones stored in the
dashboard, which is also why the build stays reproducible from the repository
alone and does not depend on undocumented dashboard state.

The Netlify project itself was deliberately **not** renamed. It is called
`brunoccst` and serves `brunoccst.netlify.app` — the name is the site owner's,
not the word being replaced. Renaming it would swap a personal URL for a generic
one and break every link already shared, in exchange for nothing.

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

This will fill in further once images and icons join the text.

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

The fix is a mask. Each half is wrapped in a span that stays at the text's final
position and clips to it. The text inside starts fully outside its own mask —
`translateX(100%)` for the name, `translateX(-100%)` for the role — and animates
to `translateX(0)`. Because the mask never moves, no part of either half can
appear on the wrong side of the `|`. The constraint is geometric rather than a
matter of tuning a distance.

Clipping at the text's own edge was not enough on its own. The halves are
separated from the `|` by a `0.45em` flex gap, so the clip edge sat that far
from the character and the text appeared out of thin air beside it — which read
as an invisible box around the separator. Each mask now reaches across the gap:

```scss
$gap: 0.45em;
$reach: $gap;

.maskStart {
  clip-path: inset(-0.4em (-$reach) -0.4em 0);
}
```

The start offsets grow to match (`translateX(calc(100% + #{$reach}))`), so the
text is still fully hidden at rest. The clip edge now lands on the separator
itself, and the text emerges from the character rather than from the space next
to it.

Two details make that safe:

- The separator is given `position: relative; z-index: 1`. `clip-path` creates a
  stacking context, so without this the second mask — later in the DOM — would
  paint its text over the pipe. Raised, the pipe stays on top and the halves
  slide out from behind it.
- `$reach` equals the gap exactly, no more. The pipe's own box is only about
  `0.19em` wide, so overshooting by even `0.08em` puts the masks over most of
  the character.

The negative vertical insets matter too: `inset(0 ...)` would clip ascenders and
descenders flat. Negative values let the text overflow vertically while still
being clipped horizontally.

### Intro timing

| Moment | What happens |
| --- | --- |
| 0–350ms | The `\|` fades in |
| 350–1550ms | Both halves slide out of the pipe into place |
| 3200ms | The halves start sliding back; the page mounts behind the intro |
| 4100ms | Both halves are gone; the `\|` starts fading out |
| 4150ms | Backdrop starts clearing |
| 4450ms | The `\|` has gone and the intro is removed from the tree |

The separator brackets the sequence. It fades in before the words arrive and out
after they have left, and at 350ms it is roughly a third of their duration, so
it reads as the thing they come from rather than as another moving part.

That ordering needs `animation-fill-mode: both` on the separator's leaving
animation, not `forwards`. The animation is delayed by the full length of the
words' exit, and during a delay an element falls back to its own style rules —
here `opacity: 0`. With `forwards` alone the pipe blinked out the instant the
exit began and reappeared 900ms later to fade; `both` holds the `from` keyframe
through the delay.

The exit is the exact reverse of the entrance: each half slides back into the
`|` and the separator fades last, once the text is back inside it. An earlier
version had the two halves flying apart instead, which read as the page opening
up but was not what "the opposite direction" describes.

The page is mounted at 3200ms rather than at 4450ms. An earlier version waited
for the intro to unmount, which left roughly 200ms of empty background between
the two. Mounting the page behind the still-opaque backdrop makes the two
cross-fade instead.

The entrance runs for 1200ms and the exit for 900ms — both roughly double the
first draft. At the shorter durations the movement registered as a jump rather
than a slide.

### The intro cannot be skipped

An earlier version had a skip button and an <kbd>Esc</kbd> handler. Both are
gone: at about four and a half seconds the opening is short enough that an
escape hatch was more clutter than help, and the button competed with the text
it sat under.

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

---

## Content

### The CV is the only source

The section text was written from `CV_BrunoCarvalhoDaCosta.pdf`. A cross-check
against the LinkedIn profile was intended but not possible: the profile is
served behind a login wall, and an unauthenticated fetch returns a sign-in page
with no profile content on it.

The cross-check was eventually done from screenshots of the profile supplied by
hand, and it was worth doing: the CV listed one DocuWare role of "Software
Engineer" running to the present, when the role had become Team Lead in April
2024, and it described a move to Germany as permanent when there had been a year
back in Brazil in between. Everything from May 2016 onwards has now been
corrected against the profile. The two roles before that still rest on the CV
alone. See [KNOWN-ISSUES.md](KNOWN-ISSUES.md).

### The heading leads with the current title

The heading reads "Team Lead & Software Engineer". It was the other way round
until the profile confirmed which title is current: leading the team is the job,
and writing code is roughly a fifth of it.

Both halves are kept rather than just the title. Dropping "Software Engineer"
would misrepresent a lead who is still in the codebase every week, and for an
engineering audience the second half is the part that says what kind of lead this
is.

### No direct contact details anywhere

The CV carries a mobile number, a home address and an email address. None of the
three is on the site, and none is in the repository.

A personal site is a public, indexed page. A home address on one is a personal
safety question rather than a privacy preference, and a phone number attracts
recruiters and spam callers indefinitely, with no way to withdraw it once it has
been scraped. The email was included at first, on the reasoning that some direct
route to make contact is the point of the Links section; it was then removed on
request. The same scraping argument applies to it, and LinkedIn already provides
a contact route that can be closed off later.

The practical consequence is that the only ways to reach the site's owner are
LinkedIn and GitHub. That is deliberate, not an oversight.

### Locations are given at country level only

The CV names a city of residence, and each role carries the town its employer
sits in. On the site all of that is reduced to "Germany" or "Brazil".

Withholding a street address achieves little if the surrounding prose still
names the city, and two employer towns in the same metropolitan area narrow it
just as effectively as stating it outright. Country level is the coarsest
granularity that still carries the useful signal — which market someone works
in, and that the move from Brazil actually happened.

The city where the career began was removed from the prose too, on request, even
though it is past tense and does not describe where anyone lives now.

One reference to that region survives: the university is still named. It is an
education credential with real professional value, which puts it in a different
category from a place of residence, so it was left for its owner to decide on.
It does undercut the removal, though — the university is in the city that was
just taken out, and one search closes the gap. The choice is between naming the
degree and withholding the region; it cannot be both.

The cost of all of this is city-level matching in recruiter searches, which is a
real loss and was accepted knowingly.

### Experience entries gained `location` and `stack`

The CV gives each role a place and a list of technologies. Dropping them would
have thrown away most of what distinguishes one entry from another, so
`ExperienceItem` grew two fields. The technology names stay in English in both
locales — they are product names, not vocabulary.

### `LinksSection` still handles `mailto:`, with no `mailto:` to handle

`LinksSection` marks external links with `target="_blank"`, `rel="noopener
noreferrer"` and a hidden "(opens in a new tab)". A `mailto:` link hands off to a
mail client rather than opening a tab, so `isExternal` excludes it from all
three: announcing a tab that never appears is worse than saying nothing.

No `mailto:` entry survives, so that branch is currently unreachable. It was
kept rather than deleted because it encodes a rule about how links render, not a
special case for one row. The link entries are data in the locale files, which
is where a mail address would be added back, and adding one there should not
require also remembering to change a component. Deleting the branch would make
that a silent accessibility bug the next time.
