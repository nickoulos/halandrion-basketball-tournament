# Dark Street Basketball Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cream heritage palette in `Basketball Registration.dc.html` with a dark street-basketball theme derived from the user's golden-hour court image, driven by CSS custom properties.

**Architecture:** All colour literals (~240 across inline `style` attributes and `renderVals()` template strings) are replaced by `var(--token)` references. Tokens are declared once in the existing `<helmet data-dc-atomics>` block, which injects real CSS into the document. The hero gains a full-bleed court background with a gradient scrim; the heritage photo is re-toned via CSS filters only.

**Tech Stack:** Single-file DC component (custom framework in `support.js`), vanilla CSS custom properties, no build step, no dependencies.

**Spec:** `docs/superpowers/specs/2026-07-15-dark-street-theme-design.md`

## Global Constraints

- **Do not change jersey hex values** in `jerseyList()` — `#1c1c1c`, `#f4efe6`, `#2f5fa8`, `#2f7d4f`, `#c0392b`, `#e6b422`, `#7a4fa0`, `#d97a2b` are tournament data, not theme.
- **Do not change** copy, i18n strings, validation logic, wizard flow (`steps()`, `canProceed()`, `next()`, `prev()`), or `submit()`/`buildPayload()`.
- **No theme toggle.** The cream palette is replaced, not preserved.
- **Never use `#FFF` for text.** Warm off-white `var(--text)` `#EDE6DA` only.
- **Preserve the hard offset shadow technique.** Offsets become black (`var(--ink)`); do not replace with blur.
- **Text contrast must meet WCAG AA** (4.5:1 normal, 3:1 large ≥24px or ≥19px bold). Verified values are in the token table — do not substitute colours without re-checking.
- **File is not under version control.** Task 0 initialises git. Do not skip it — there is no other way to revert a 240-literal change.

## Token Table (authoritative)

Verified contrast, computed not estimated:

| Token | Value | Role | Contrast |
|---|---|---|---|
| `--bg` | `#12100E` | Page base | — |
| `--surface` | `#1C1916` | Cards, panels | — |
| `--surface-2` | `#26221E` | Inputs, insets | — |
| `--text` | `#EDE6DA` | Primary text | 15.31:1 on bg |
| `--muted` | `#9A8F80` | Secondary text | 5.98:1 on bg |
| `--line` | `#E8E2D6` | Court lines | 14.72:1 on bg |
| `--accent` | `#C4562E` | Terracotta **fills only** | — |
| `--accent-text` | `#E0784C` | Terracotta **text/borders** | 6.29:1 bg, 5.80:1 surface |
| `--hi` | `#F0A02B` | Amber highlight, headline accent | 8.83:1 on bg |
| `--ok` | `#4FAE77` | "Free entry" chip | 6.92:1 on bg |
| `--ink` | `#000` | Borders, offset shadows | — |
| `--on-accent` | `#FFFFFF` | Text on terracotta fill | 4.45:1 on `--accent` |

**The `--accent` / `--accent-text` split is load-bearing.** Terracotta `#C4562E` as small text on dark measures 4.26:1 — it FAILS AA. The old `#a5401f` is worse. Every small terracotta label (`#a5401f` at 11-13px: "ΠΟΤΕ/ΠΟΥ/ΚΟΣΤΟΣ" kickers, error messages, nickname text) becomes `--accent-text`. Terracotta as a button *fill* keeps `--accent` with `--on-accent` text on top.

## Literal → token mapping (authoritative)

Opaque hex:

| Old | New | Notes |
|---|---|---|
| `#ecdcc0` | `var(--bg)` | page base inverted |
| `#faf3e6` | `var(--surface)` | was light card → now raised dark surface |
| `#f4e9d6` | `var(--text)` | was light-on-dark text → stays text |
| `#f7ecd8` / `#e0c69e` | `var(--surface)` / `var(--surface-2)` | roster card gradient stops |
| `#e7d4b3` | `var(--surface)` | schedule card |
| `#2c211a` | `var(--text)` **when text**, `var(--ink)` **when border/shadow**, `var(--surface)` **when a dark fill on cream** | **46 occurrences — must be read in context, see Task 3** |
| `#5b4a3c` | `var(--muted)` | body text |
| `#6b5540` | `var(--muted)` | field labels |
| `#8a6b4d` | `var(--muted)` | sub-labels |
| `#c9b79c` | `var(--muted)` | format sub |
| `#a5401f` | `var(--accent-text)` | **was failing contrast — this is the fix** |
| `#c4562e` | `var(--accent)` fills / `var(--accent-text)` text | context — see Task 3 |
| `#8f3517` | `var(--ink)` | offset shadows go black |
| `#d99a2b` / `#e6b422` | `var(--hi)` | amber |
| `#2f7d4f` | `var(--ok)` | lifted for contrast |
| `#256b41` | `var(--ok)` | chip text |
| `#3a2c22` | `var(--surface-2)` | hover state |
| `#000` | `var(--ink)` | — |

Translucent — **these invert, they do not darken.** `rgba(44,33,26,α)` is dark ink on cream; on dark it becomes a *light* overlay:

| Old | New |
|---|---|
| `rgba(44,33,26,.05)` → `.08` | `rgba(237,230,218,.05)` → `rgba(237,230,218,.08)` (subtle light wash) |
| `rgba(44,33,26,.12)` → `.2` | `rgba(237,230,218,.12)` → `rgba(237,230,218,.16)` (borders/dividers) |
| `rgba(44,33,26,.22)` → `.35` | `rgba(237,230,218,.2)` → `rgba(237,230,218,.28)` (stronger borders) |
| `rgba(44,33,26,.4)` / `.45` | `rgba(237,230,218,.35)` / `rgba(154,143,128,.5)` |
| `rgba(236,220,192,.82)` / `.92` | `rgba(18,16,14,.85)` / `rgba(18,16,14,.94)` (sticky header / wizard chrome) |
| `rgba(30,22,16,.55)` | `rgba(0,0,0,.72)` (wizard backdrop — deeper on dark) |
| `rgba(196,86,46,α)` | `rgba(196,86,46,α)` **unchanged** (accent tint reads fine) |
| `rgba(217,154,43,α)` / `rgba(230,180,34,α)` | unchanged (amber tint) |
| `rgba(47,125,79,.14)` / `.5` | `rgba(79,174,119,.16)` / `rgba(79,174,119,.5)` |
| `rgba(165,64,31,.06)` / `.1` | `rgba(224,120,76,.1)` / `rgba(224,120,76,.14)` |
| `rgba(255,255,255,.4)` | `rgba(237,230,218,.1)` (roster card inner highlight) |
| `rgba(0,0,0,.3)` / `.5` | unchanged |

Disabled next button: `background:rgba(44,33,26,.2);color:rgba(44,33,26,.45)` → `background:var(--surface-2);color:#857A6D` (3.76:1 — reads disabled, stays legible).

---

### Task 0: Version control + asset

**Files:**
- Create: `.gitignore`
- Required asset: `assets/court.jpg` (user-supplied)

- [ ] **Step 1: Confirm the court image exists**

Run: `ls -la assets/court.jpg`
Expected: the file exists. **If missing, STOP** — the hero in Task 4 has nothing to reference. The image arrived via conversation and must be saved by the user to `assets/court.jpg` (~1920px wide, JPEG q80, <400KB).

- [ ] **Step 2: Check the image weight**

Run: `du -h assets/court.jpg`
Expected: under ~400KB. If significantly larger, flag to the user before proceeding — this is a mobile registration form.

- [ ] **Step 3: Initialise git**

```bash
git init
git add -A
git commit -m "chore: baseline before dark theme redesign"
```

- [ ] **Step 4: Verify the baseline is recoverable**

Run: `git log --oneline && git status --short`
Expected: one commit, clean tree. This is the revert point for a 240-literal change.

---

### Task 1: Token declarations

**Files:**
- Modify: `Basketball Registration.dc.html:15-33` (the `<style>` inside `<helmet data-dc-atomics>`)

**Interfaces:**
- Produces: CSS custom properties `--bg --surface --surface-2 --text --muted --line --accent --accent-text --hi --ok --ink --on-accent`, available to every later task.

- [ ] **Step 1: Add the `:root` block and re-point body/globals**

Replace lines 16-22 (from `*{box-sizing:border-box}` through the `::selection` rule) with:

```css
  :root{
    --bg:#12100E; --surface:#1C1916; --surface-2:#26221E;
    --text:#EDE6DA; --muted:#9A8F80; --line:#E8E2D6;
    --accent:#C4562E; --accent-text:#E0784C; --hi:#F0A02B;
    --ok:#4FAE77; --ink:#000; --on-accent:#FFFFFF;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--text);font-family:'Alegreya Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  a{color:var(--accent-text);text-decoration:none}
  a:hover{color:var(--hi)}
  input,button,textarea{font-family:inherit}
  input:focus,textarea:focus{outline:none}
  ::selection{background:var(--accent);color:var(--on-accent)}
```

Leave the `@keyframes` blocks (lines 23-32) untouched — they carry no colour.

- [ ] **Step 2: Verify tokens resolve**

Open the file in a browser. Expected: page background is near-black `#12100E`, body text warm off-white. Most components still show cream (they carry their own literals — later tasks fix them). **The page will look broken and half-cream at this checkpoint. That is expected.**

- [ ] **Step 3: Commit**

```bash
git add "Basketball Registration.dc.html"
git commit -m "feat: declare dark theme tokens in helmet"
```

---

### Task 2: Hero court background

**Files:**
- Modify: `Basketball Registration.dc.html:36-37` (page wrapper + fixed gradient layer), `:57` (hero `<section>`)

**Interfaces:**
- Consumes: tokens from Task 1; `assets/court.jpg` from Task 0.

- [ ] **Step 1: Replace the fixed radial-gradient wash (line 37)**

The current cream-tinted wash is wrong on dark. Replace that `<div>` with:

```html
  <div style="position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(120% 90% at 82% -10%,rgba(240,160,43,.10),transparent 55%),radial-gradient(110% 80% at -10% 100%,rgba(196,86,46,.08),transparent 60%)"></div>
```

- [ ] **Step 2: Give the hero section its court background**

Replace the opening tag of the hero `<section>` (line 57) with:

```html
    <section style="position:relative;padding:60px 0 40px;display:grid;grid-template-columns:1.1fr .9fr;gap:44px;align-items:center">
      <div style="position:absolute;inset:-60px -50vw 0;z-index:-1;background-image:linear-gradient(90deg,rgba(18,16,14,.96) 0%,rgba(18,16,14,.88) 38%,rgba(18,16,14,.55) 70%,rgba(18,16,14,.35) 100%),linear-gradient(0deg,var(--bg) 0%,transparent 22%),url('assets/court.jpg');background-size:cover,cover,cover;background-position:center,center,72% center;background-repeat:no-repeat"></div>
```

The `-50vw` insets bleed the image past the `max-width:1120px` main. The first gradient is the left-to-right scrim keeping the headline readable; the second fades the bottom into the page base. `background-position:72% center` biases the crop toward the players.

- [ ] **Step 3: Verify the hero reads correctly**

Open in a browser at ~1200px wide. Expected: the court image fills the hero edge-to-edge, players visible on the right, headline sitting over near-solid dark on the left with no hard seam at the bottom.

- [ ] **Step 4: Verify mobile crop**

Narrow the window to 400px. Expected: the headline never sits on a busy/bright region of the image. If it does, raise the first gradient's mid-stops toward `.95`.

- [ ] **Step 5: Commit**

```bash
git add "Basketball Registration.dc.html"
git commit -m "feat: full-bleed court image hero with scrim"
```

---

### Task 3: Landing page markup literals

**Files:**
- Modify: `Basketball Registration.dc.html:39-131` (header, hero content, info strip, schedule card, footer)

**Interfaces:**
- Consumes: tokens from Task 1.

**`#2c211a` disambiguation — this is the one that bites.** All 46 occurrences are one of three roles. Read each in context:
- `color:#2c211a` → `var(--text)`
- `border:*px solid #2c211a` / `box-shadow:0 Npx 0 #2c211a` → `var(--ink)`
- `background:#2c211a` (a *dark* fill on the old *cream* page — the format card at :72, the register button at :52, the scoreboard at :297) → `var(--surface)`, since a dark fill on a dark page must now be a raised surface, not a hole.

- [ ] **Step 1: Header (lines 39-54)**

Apply the mapping table. Specifically:
- `:39` header background `rgba(236,220,192,.82)` → `rgba(18,16,14,.85)`; border-bottom `rgba(44,33,26,.12)` → `rgba(237,230,218,.12)`
- `:41` logo border `#2c211a` → `var(--ink)`, `box-shadow:0 3px 0 #8f3517` → `0 3px 0 var(--ink)`, `background:#2c211a` → `var(--surface)`
- `:42` heritage img filter → `sepia(.35) saturate(1.1) contrast(1.05) brightness(.88)` (re-tone per spec: lit archival print, not a bright rectangle)
- `:43` overlay → `radial-gradient(circle,rgba(240,160,43,.12),rgba(18,16,14,.55))`
- `:47` brandSub `color:#8a6b4d` → `var(--muted)`
- `:51` lang button border `rgba(44,33,26,.25)` → `rgba(237,230,218,.25)`, `color:#2c211a` → `var(--text)`
- `:52` register button `background:#2c211a` → `var(--surface)`, `color:#f4e9d6` → `var(--text)`, `box-shadow:0 4px 0 #000` → `0 4px 0 var(--ink)`, `style-hover` → `background:var(--surface-2)`

- [ ] **Step 2: Hero content (lines 58-86)**

- `:59` kicker chip: bg `rgba(196,86,46,.14)` unchanged, border `rgba(196,86,46,.4)` unchanged, `color:#a5401f` → `var(--accent-text)`
- `:60` **headline second line `color:#c4562e` → `var(--hi)`** (the amber accent — a spec decision, not a mechanical swap)
- `:61` body `color:#5b4a3c` → `var(--muted)`
- `:63` CTA: `background:#c4562e` → `var(--accent)`, `color:#faf3e6` → `var(--on-accent)`, all three `#8f3517` shadows → `var(--ink)`
- `:65` free chip: `rgba(47,125,79,.14)` → `rgba(79,174,119,.16)`, border `rgba(47,125,79,.5)` → `rgba(79,174,119,.5)`, `color:#256b41` → `var(--ok)`
- `:66` prize chip: `color:#a5401f` → `var(--accent-text)`
- `:71` hatch `rgba(217,154,43,.18)` unchanged
- `:72` format card: `border:6px solid #2c211a` → `var(--ink)`, `background:#2c211a` → `var(--surface)`, `box-shadow:0 12px 0 #8f3517,0 22px 36px rgba(44,33,26,.35)` → `0 12px 0 var(--ink),0 22px 36px rgba(0,0,0,.5)`
- `:74` `color:#e6b422` → `var(--hi)`; `:76` `color:#c9b79c` → `var(--muted)`
- `:78-79` 3on3/1v1 chips: `color:#e6b422` → `var(--hi)`
- `:82` ball: `background:#c4562e` → `var(--accent)`, `border:5px solid #2c211a` → `var(--ink)`, `box-shadow:0 6px 0 #8f3517` → `0 6px 0 var(--ink)`
- `:83-84` ball cross `background:#2c211a` → `var(--ink)`

- [ ] **Step 3: Info strip (lines 89-108)**

All dashed borders `rgba(44,33,26,.22)` → `rgba(237,230,218,.2)`. All three kickers `color:#a5401f` → `var(--accent-text)`. All three subs `color:#5b4a3c` → `var(--muted)`. Cost big `color:#2f7d4f` → `var(--ok)`.

- [ ] **Step 4: Schedule card + footer (lines 110-130)**

- `:110` `border:2px solid #2c211a` → `var(--ink)`, `background:#e7d4b3` → `var(--surface)`, `box-shadow:0 8px 0 rgba(44,33,26,.18)` → `0 8px 0 var(--ink)`
- `:111` barber stripe `#c4562e`/`#2c211a` → `var(--accent)`/`var(--ink)`
- `:114` `color:#a5401f` → `var(--accent-text)`; `:116` `color:#5b4a3c` → `var(--muted)`
- `:118-120` chips: bg `rgba(44,33,26,.07)` → `rgba(237,230,218,.06)`, border `rgba(44,33,26,.35)` → `rgba(237,230,218,.28)`, `color:#6b5540` → `var(--muted)`
- `:123` TBA ghost `rgba(44,33,26,.14)` → `rgba(237,230,218,.12)`
- `:127` footer border `rgba(44,33,26,.15)` → `rgba(237,230,218,.12)`, `color:#6b5540` → `var(--muted)`

- [ ] **Step 5: Verify no cream survives on the landing page**

Run: `grep -nE '#ecdcc0|#faf3e6|#f4e9d6|#e7d4b3|#5b4a3c|#6b5540|#8a6b4d|#a5401f|#8f3517|rgba\(44,33,26' "Basketball Registration.dc.html" | awk -F: '$1 < 132'`
Expected: **no output.** Any hit is a missed literal in the landing markup.

- [ ] **Step 6: Visual check**

Open in a browser. Expected: landing page fully dark, headline amber on the court image, chips legible, offset shadows still reading as raised.

- [ ] **Step 7: Commit**

```bash
git add "Basketball Registration.dc.html"
git commit -m "feat: dark palette for landing page markup"
```

---

### Task 4: Wizard chrome + steps markup

**Files:**
- Modify: `Basketball Registration.dc.html:135-382`

**Interfaces:**
- Consumes: tokens from Task 1. Same `#2c211a` disambiguation rule as Task 3.

- [ ] **Step 1: Backdrop, shell, header, footer nav (135-147, 374-379)**

- `:135` backdrop `rgba(30,22,16,.55)` → `rgba(0,0,0,.72)`
- `:136` panel `background:#ecdcc0` → `var(--bg)`
- `:138` / `:375` chrome `rgba(236,220,192,.92)` → `rgba(18,16,14,.94)`; borders `rgba(44,33,26,.12)` → `rgba(237,230,218,.12)`
- `:141` close button border `rgba(44,33,26,.25)` → `rgba(237,230,218,.25)`, `color:#2c211a` → `var(--text)`, hover `rgba(44,33,26,.08)` → `rgba(237,230,218,.08)`
- `:143` progress track `rgba(44,33,26,.14)` → `rgba(237,230,218,.12)`; `:144` fill `linear-gradient(90deg,#c4562e,#d99a2b)` → `linear-gradient(90deg,var(--accent),var(--hi))`
- `:146` `color:#8a6b4d` → `var(--muted)`

- [ ] **Step 2: Details / team / nickname / terms / review step bodies (152-369)**

Apply the mapping table throughout. Key items:
- All `<h2>` inherit `var(--text)` — no change needed
- All step subs `color:#5b4a3c` → `var(--muted)`; all field labels `color:#6b5540` → `var(--muted)`
- `:215`, `:269`, `:274`, `:303` inputs: `background:#faf3e6` → `var(--surface-2)`, `color:#2c211a` → `var(--text)`, borders `rgba(44,33,26,.25)`/`.18` → `rgba(237,230,218,.25)`/`.18`, `style-focus="border-color:#c4562e"` → `border-color:var(--hi)` (amber focus ring — brighter than terracotta on dark, and terracotta borders sit near the contrast floor)
- `:228` roster card gradient `radial-gradient(120% 140% at 50% 0%,#f7ecd8,#e0c69e)` → `radial-gradient(120% 140% at 50% 0%,var(--surface-2),var(--surface))`; border `#2c211a` → `var(--ink)`; inset highlight `rgba(255,255,255,.4)` → `rgba(237,230,218,.1)`
- `:229` `rgba(44,33,26,.05)` → `rgba(237,230,218,.05)`
- `:233` player card `background:#faf3e6` → `var(--surface)`, `border:3px solid #2c211a` → `var(--ink)`, `box-shadow:0 7px 0 rgba(44,33,26,.22)` → `0 7px 0 var(--ink)`
- **`:243-246` jersey armhole scoops and collar are `background:#faf3e6` — these must match the player card fill exactly or the jersey silhouette breaks.** Both become `var(--surface)`. Verify visually; this is the most fragile spot in the file.
- `:236` jersey shadow `rgba(44,33,26,.15)` → `rgba(0,0,0,.5)`
- `:255` `color:#a5401f` → `var(--accent-text)`; `:260` `rgba(44,33,26,.4)` → `var(--muted)`
- `:266` player rows `background:#faf3e6` → `var(--surface)`, border `rgba(44,33,26,.2)` → `rgba(237,230,218,.16)`
- `:267` number badge `border:2px solid #2c211a` → `var(--ink)` (keep `{{ p.hex }}` and `{{ p.badgeFg }} `— jersey data)
- `:272` captain tag `color:#a5401f` → `var(--accent-text)`
- `:274` nick input `color:#a5401f` → `var(--accent-text)`
- `:276` remove button border `rgba(44,33,26,.2)` → `rgba(237,230,218,.2)`, `color:#a5401f` → `var(--accent-text)`, hover `rgba(165,64,31,.1)` → `rgba(224,120,76,.14)`
- `:284` add-sub dashed `rgba(44,33,26,.35)` → `rgba(237,230,218,.28)`, `color:#6b5540` → `var(--muted)`, hover `#c4562e` → `var(--accent-text)`
- `:297` scoreboard `background:#2c211a;border:2px solid #2c211a` → `background:var(--surface);border:2px solid var(--ink)`, `box-shadow:0 8px 0 rgba(0,0,0,.3)` unchanged; `:298` `color:#e6b422` → `var(--hi)`; `:299` `color:#f4e9d6` → `var(--text)`
- `:316` term rows `background:#faf3e6` → `var(--surface)`, border `rgba(44,33,26,.16)` → `rgba(237,230,218,.14)`
- `:317` term number `background:rgba(196,86,46,.14)` unchanged, `border:2px solid #c4562e` → `var(--accent-text)`, `color:#a5401f` → `var(--accent-text)`
- `:320` `color:#5b4a3c` → `var(--muted)`
- `:345` summary rows `background:#faf3e6` → `var(--surface)`, border `rgba(44,33,26,.14)` → `rgba(237,230,218,.14)`; `:346` `color:#a5401f` → `var(--accent-text)`; `:347` `color:#2c211a` → `var(--text)`
- `:352` submit error `rgba(165,64,31,.1)` → `rgba(224,120,76,.12)`, `border:2px solid #a5401f` → `var(--accent-text)`, `color:#a5401f` → `var(--accent-text)`
- `:358` success ball `background:#c4562e` → `var(--accent)`, `border:5px solid #2c211a` → `var(--ink)`, `box-shadow:0 8px 0 #8f3517` → `0 8px 0 var(--ink)`; `:359-360` cross → `var(--ink)`
- `:363` `color:#5b4a3c` → `var(--muted)`; `:364` `color:#8a6b4d` → `var(--muted)`
- `:365` done button `background:#2c211a` → `var(--surface)`, `color:#f4e9d6` → `var(--text)`, `box-shadow:0 5px 0 #000` → `0 5px 0 var(--ink)`

- [ ] **Step 3: Verify no cream survives in markup**

Run: `grep -nE '#ecdcc0|#faf3e6|#f4e9d6|#e7d4b3|#f7ecd8|#e0c69e|#5b4a3c|#6b5540|#8a6b4d|#a5401f|#8f3517|#c9b79c|rgba\(44,33,26|rgba\(236,220,192|rgba\(30,22,16' "Basketball Registration.dc.html" | awk -F: '$1 < 385'`
Expected: **no output.**

- [ ] **Step 4: Commit**

```bash
git add "Basketball Registration.dc.html"
git commit -m "feat: dark palette for wizard markup"
```

---

### Task 5: `renderVals()` template strings

**Files:**
- Modify: `Basketball Registration.dc.html:606-755` (inside `renderVals()`)

**Interfaces:**
- Consumes: tokens from Task 1.

These are JS template strings building `style` attributes. `var(--x)` works identically inside them — they end up as CSS. **Do not touch `jerseyList()` (511-523).**

- [ ] **Step 1: Line 608 — roster fallback colour**

`const hex=st.team.jersey||'#8a6b4d';` → `const hex=st.team.jersey||'#6E655A';`

This is the placeholder jersey before a colour is picked. It must stay a neutral grey (not a token) because `readable()` at :633 parses it with `parseInt(c.slice(1,3),16)` — **a `var(--x)` string would break that math.** Keep it a literal hex.

- [ ] **Step 2: Line 634 — badge foreground**

`const badgeFg = readable(hex)?'#2c211a':'#faf3e6';` → `const badgeFg = readable(hex)?'#12100E':'#EDE6DA';`

Also literal, not tokens — same reason: this value is compared and passed as data.

- [ ] **Step 3: Lines 619-621 — tournament option cards**

```js
        cardStyle:`display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:2px;padding:20px 18px;border-radius:16px;cursor:pointer;transition:transform .15s;font-family:'Alegreya Sans',sans-serif;`+
          (sel? 'background:var(--accent);color:var(--on-accent);border:3px solid var(--ink);box-shadow:0 6px 0 var(--ink);'
              : 'background:var(--surface);color:var(--text);border:3px solid rgba(237,230,218,.18);box-shadow:0 4px 0 var(--ink);')};
```

- [ ] **Step 4: Lines 627-628 — jersey swatches**

```js
        swatchStyle:`width:30px;height:30px;border-radius:9px;background:${j.hex};cursor:pointer;transition:transform .12s;`+
          (sel? 'border:3px solid var(--ink);box-shadow:0 0 0 3px var(--hi);transform:scale(1.08);':'border:2px solid rgba(237,230,218,.35);')};
```

`${j.hex}` stays — jersey data. The unselected border lifts to `.35` so the black jersey swatch (`#1c1c1c`) stays visible against `--surface`.

- [ ] **Step 5: Lines 708-710 — input styles**

```js
    const errInputStyle="border:2px solid rgba(237,230,218,.25);border-radius:12px;padding:13px 15px;font-size:16px;background:var(--surface-2);color:var(--text);";
    const badInputStyle="border:2px solid var(--accent-text);border-radius:12px;padding:13px 15px;font-size:16px;background:rgba(224,120,76,.1);color:var(--text);";
    const errMsgStyle="font:500 12px/1.4 'Alegreya Sans',sans-serif;color:var(--accent-text);margin-top:1px";
```

- [ ] **Step 6: Line 715 — format big**

`color:#f4e9d6` → `color:var(--text)`

- [ ] **Step 7: Lines 739-750 — checkboxes**

Both `self15Style` and `acceptStyle` (they are structurally identical):

```js
      self15Style:`display:flex;align-items:center;gap:14px;width:100%;text-align:left;margin-top:20px;border-radius:14px;padding:16px 18px;font:600 15px 'Alegreya Sans',sans-serif;cursor:pointer;transition:transform .12s;`+
        (self15? 'background:var(--surface-2);color:var(--text);border:2px solid var(--hi);':'background:var(--surface);color:var(--text);border:2px solid rgba(237,230,218,.3);'),
      self15BoxStyle:`flex:none;width:28px;height:28px;border-radius:8px;font:700 16px/24px 'Oswald',sans-serif;text-align:center;`+
        (self15? 'background:var(--hi);color:var(--ink);border:2px solid var(--hi);':'background:transparent;border:2px solid rgba(237,230,218,.4);'),
```

Checked state changes from "dark fill" to "amber-bordered raised surface" — on a dark page a dark fill no longer signals *on*.

Apply the identical pattern to `acceptStyle` / `acceptBoxStyle` with `acceptOn`.

- [ ] **Step 8: Lines 753-754 — next/back buttons**

```js
      nextStyle: nextBase + (canGo? 'background:var(--accent);color:var(--on-accent);box-shadow:0 5px 0 var(--ink);cursor:pointer;':'background:var(--surface-2);color:#857A6D;cursor:not-allowed;'),
      backStyle:"background:transparent;border:2px solid rgba(237,230,218,.25);border-radius:999px;padding:11px 22px;font:600 14px 'Oswald',sans-serif;letter-spacing:.05em;text-transform:uppercase;color:var(--text);cursor:pointer;",
```

- [ ] **Step 9: Verify no cream survives anywhere**

Run: `grep -nE '#ecdcc0|#faf3e6|#f4e9d6|#e7d4b3|#5b4a3c|#6b5540|#8a6b4d|#a5401f|#8f3517|#2c211a|rgba\(44,33,26|rgba\(236,220,192' "Basketball Registration.dc.html"`
Expected: **no output.** This covers the whole file.

- [ ] **Step 10: Verify jersey data untouched**

Run: `grep -nE "#1c1c1c|#f4efe6|#2f5fa8|#2f7d4f|#c0392b|#e6b422|#7a4fa0|#d97a2b" "Basketball Registration.dc.html"`
Expected: exactly the 8 lines inside `jerseyList()` (511-523) and nothing else.

- [ ] **Step 11: Commit**

```bash
git add "Basketball Registration.dc.html"
git commit -m "feat: dark palette for renderVals style strings"
```

---

### Task 6: End-to-end verification

**Files:** none modified unless defects are found.

- [ ] **Step 1: Drive the 3on3 path in Greek**

Open the file in a browser. Click ΕΓΓΡΑΦΗ. Walk: tournament (pick Ομαδικό) → details (fill all four fields) → team (name, jersey, roster) → terms (both checkboxes) → review → submit.
Expected: every step dark, all text legible, no cream flash, no invisible input.

- [ ] **Step 2: Drive the 1v1 path in English**

Toggle EN. Reopen. Pick Solo → details → nickname → terms → review → submit.
Expected: scoreboard preview reads amber-on-surface; success screen dark.

- [ ] **Step 3: Drive the "both" path**

Pick Both. Expected: team *and* nickname steps appear (`steps()` yields 6); progress bar reaches 100%.

- [ ] **Step 4: Check all 8 jerseys on the roster card**

Cycle every swatch. Expected: all 8 distinguishable against `--surface`; **black `#1c1c1c` still visible** (relies on the `.35` swatch border from Task 5 Step 4); **white `#f4efe6` does not blow out**; the number flips contrast automatically via `readable()`.

- [ ] **Step 5: Check the jersey silhouette**

Look at a player card closely. Expected: armhole scoops and collar match the card fill exactly — the tank shape reads correctly, with no visible seam where `var(--surface)` meets the card.

- [ ] **Step 6: Check validation states**

On details, type `abc` in email and blur; clear first name and blur; type `12345` in mobile and blur.
Expected: all three error borders and messages render `--accent-text` and are clearly legible on dark.

- [ ] **Step 7: Check the disabled next button**

On a fresh tournament step with nothing picked. Expected: next reads as disabled but the label is legible (3.76:1), not invisible.

- [ ] **Step 8: Mobile pass**

Narrow to 400px. Walk the 3on3 path again.
Expected: hero headline never on a busy image region; wizard usable; no horizontal scroll.

- [ ] **Step 9: Commit any fixes**

```bash
git add "Basketball Registration.dc.html"
git commit -m "fix: dark theme verification fixes"
```

---

## Self-review notes

- **Spec coverage:** palette → Task 1; hero → Task 2; heritage re-tone → Task 3 Step 1; CSS variables → Tasks 1/3/4/5; wizard scope → Tasks 4/5; jersey data preserved → Global Constraints + Task 5 Steps 1-2 + Task 6 Step 4; verification → Task 6.
- **Spec deviation (deliberate):** the spec's single `--accent` is split into `--accent` (fills) and `--accent-text` (`#E0784C`). Terracotta text on dark measures 4.26:1 and fails AA; the spec's own "contrast checked on real text pairs" requirement forces this. Same reason `--ok` moved `#2F7D4F` → `#4FAE77`.
- **Spec addition:** `--surface-2` and `--on-accent` were not in the spec's table; inputs need a distinct inset from cards, and white-on-terracotta (4.45:1) is the only fill/label pair that passes.
- **Fragile spots flagged:** `#2c211a`'s three roles (Task 3); jersey armholes needing an exact fill match (Task 4 Step 2); `readable()`/`badgeFg` needing literal hex, not tokens (Task 5 Steps 1-2).
