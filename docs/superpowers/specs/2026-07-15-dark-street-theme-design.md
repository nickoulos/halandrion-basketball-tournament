# Dark Street Basketball Theme — Design

**Date:** 2026-07-15
**Target:** `Basketball Registration.dc.html`
**Status:** Approved

## Goal

Replace the warm cream "heritage" palette with a dark street-basketball theme derived
from an AI-generated golden-hour court image supplied by the user. The cream theme is
retired — this is a replacement, not an alternate theme.

## Source of the palette

The palette is sampled from the user's court image rather than invented: near-black
asphalt, a hazy amber sun flare on the left, painted white court lines, an orange ball,
and a graffiti wall confined to the background. The image is *warm*, so the existing
terracotta accent (`#C4562E`) and amber (`#D99A2B`) carry over nearly intact — the
redesign shifts the ground, not the brand's accent hues.

## Palette

Declared once as CSS custom properties in the existing `<helmet>` block.

| Token | Value | Role | Origin in image |
|---|---|---|---|
| `--bg` | `#12100E` | Page base | Asphalt in deep shadow |
| `--surface` | `#1C1916` | Cards, wizard panels | One step off the base |
| `--line` | `#E8E2D6` | Court-line strokes, dividers | Painted lines (not pure white) |
| `--text` | `#EDE6DA` | Primary text | Warm off-white — never `#FFF` |
| `--muted` | `#9A8F80` | Secondary text | Hazy mid-distance |
| `--accent` | `#C4562E` | Primary actions (kept) | The ball |
| `--hi` | `#F0A02B` | Headline accent, highlights | Sun flare, left edge |
| `--ink` | `#000` | Borders, offset shadows | — |
| `--ok` | `#4FAE77` | "Free entry" chip | Lifted from `#2F7D4F`, which fails contrast on near-black |

Jersey hex values (`black`, `white`, `blue`, `green`, `red`, `yellow`, `purple`,
`orange` in `jerseyList()`) are **tournament data, not theme** — they are not touched.
Only the card behind them is restyled, so all eight stay distinguishable on dark. The
existing `readable()` luminance helper already flips the number's contrast per jersey,
so black and white jerseys keep working unchanged.

## Design decisions

### Offset shadows go black

The page's signature is hard offset shadows (`box-shadow:0 6px 0 #8F3517`). On a
near-black background a dark-terracotta offset vanishes. The technique is kept but the
offsets become true black — surfaces above are lighter than the base, so the raised
shape still reads. This preserves the personality rather than flattening it.

### Hero

Full-bleed court image behind the hero band.

- `object-position` biased right so the players stay in frame and the open asphalt
  falls under the headline.
- Two-stop gradient overlay: near-opaque black on the left where text lives, thinning
  rightward; plus a bottom fade into `--bg` so there is no hard seam.
- Headline in `--text`; the second line (`παίζει μπάλα` / `plays ball`) in `--hi`
  (amber) rather than terracotta, echoing the sunset.
- Mobile: the image crops toward the players and the gradient goes near-solid, so the
  headline never lands on a busy region.

### Heritage retained, restyled

The Asia Minor heritage photo stays in its hero frame — it ties the page to the
Σύνδεσμος Μικρασιατών ("Roots"), the organising Association. Re-toned from
`sepia(.5) saturate(.9)` on cream to a warmer, slightly dimmed treatment with an
amber-tinted border, reading as a lit archival print on a dark wall rather than a
bright rectangle punched out of the page. Association name and "Roots" subtitle in the
header are unchanged.

### CSS custom properties (structural)

Colour literals are currently hardcoded in ~200 places across two surfaces:

1. Inline `style="..."` attributes throughout the markup.
2. Template strings inside `renderVals()` (`cardStyle`, `swatchStyle`, `nextStyle`,
   `acceptStyle`, `errInputStyle`, `badInputStyle`, `heroH1Style`, …).

All become `var(--token)` references. Same visual result; the next palette change is
eight lines instead of two hundred. This is not opportunistic refactoring — every one
of those literals is already being edited for the theme change.

The `<helmet data-dc-atomics>` block already injects real CSS into the document, so
custom properties are supported without new machinery.

## Scope

Dark throughout — landing page **and** all six wizard steps (tournament, details, team,
nickname, terms, review/success). The wizard holds roughly 40% of the colour literals
and is seen by everyone who registers; a half-dark page would show a visible seam.

## Assets

- **Required:** `assets/court.jpg` — the user's golden-hour court image, to be saved by
  the user (the image arrived via conversation, not on disk).
  Recommended export: ~1920px wide, JPEG q80, under ~400KB. This is a registration form
  opened on phones; a multi-megabyte hero is a real cost.
- `assets/heritage.jpg` — unchanged on disk, restyled in CSS only.

## Verification

- Contrast checked on real text pairs: headline, body, muted, chips, disabled next
  button, error messages.
- All six wizard steps driven in both Greek and English.
- Both `3on3` and `1v1` paths (they produce different step sequences via `steps()`).
- All eight jersey colours confirmed distinguishable on the dark roster card, with
  black and white jerseys checked specifically.

## Out of scope

- No theme toggle. The user chose replacement over a switchable pair.
- No changes to copy, i18n, validation, wizard flow, or submission logic.
- No changes to jersey hex values.

## Notes

- The project is **not a git repository**, so this design cannot be committed. Version
  control is worth raising separately — a 780-line single-file component with no history
  is a risk during a change this wide.
