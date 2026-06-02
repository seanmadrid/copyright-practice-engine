# Design Language: Legal Education and Law Exam Prep | Global Leaders | BARBRI

> Extracted from `https://www.barbri.com/` on June 2, 2026
> 1300 elements analyzed

This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.

## Color Palette

### Primary Colors

| Role | Hex | RGB | HSL | Usage Count |
|------|-----|-----|-----|-------------|
| Primary | `#001722` | rgb(0, 23, 34) | hsl(199, 100%, 7%) | 30 |
| Secondary | `#464f57` | rgb(70, 79, 87) | hsl(208, 11%, 31%) | 1942 |
| Accent | `#869c9e` | rgb(134, 156, 158) | hsl(185, 11%, 57%) | 1 |

### Neutral Colors

| Hex | HSL | Usage Count |
|-----|-----|-------------|
| `#000000` | hsl(0, 0%, 0%) | 282 |
| `#ffffff` | hsl(0, 0%, 100%) | 205 |
| `#212529` | hsl(210, 11%, 15%) | 79 |
| `#ececec` | hsl(0, 0%, 93%) | 19 |
| `#f2f7fc` | hsl(210, 63%, 97%) | 8 |
| `#343a40` | hsl(210, 10%, 23%) | 1 |
| `#cccccc` | hsl(0, 0%, 80%) | 1 |
| `#2e2e2e` | hsl(0, 0%, 18%) | 1 |

### Background Colors

Used on large-area elements: `#ffffff`, `#ececec`, `#f2f7fc`, `#001722`

### Text Colors

Text color palette: `#000000`, `#464f57`, `#ffffff`, `#235ba8`, `#212529`, `#2a5488`, `#155724`, `#001722`

### Full Color Inventory

| Hex | Contexts | Count |
|-----|----------|-------|
| `#464f57` | text, border, background | 1942 |
| `#000000` | text, border | 282 |
| `#ffffff` | background, text, border | 205 |
| `#212529` | text, border | 79 |
| `#2a5488` | border, text | 71 |
| `#001722` | background, text, border | 30 |
| `#235ba8` | text, border | 21 |
| `#ececec` | background | 19 |
| `#f2f7fc` | background, border | 8 |
| `#155724` | text, border | 7 |
| `#343a40` | background | 1 |
| `#cccccc` | border | 1 |
| `#869c9e` | background | 1 |
| `#2e2e2e` | background | 1 |

## Typography

### Font Families

- **Nunito** — used for all (1122 elements)
- **Times** — used for body (106 elements)
- **Bitter** — used for all (36 elements)
- **Material Symbols Rounded** — used for body (23 elements)
- **babri-icons** — used for body (8 elements)

### Type Scale

| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |
|-----------|------------|--------|-------------|----------------|---------|
| 75px | 4.6875rem | 700 | 75px | normal | span |
| 64px | 4rem | 600 | 80px | normal | h1, span |
| 54px | 3.375rem | 500 | 68px | normal | h2 |
| 50px | 3.125rem | 400 | 50px | normal | i |
| 48px | 3rem | 400 | 48px | normal | span |
| 36px | 2.25rem | 500 | 36px | normal | div |
| 28px | 1.75rem | 400 | 40px | normal | div |
| 24px | 1.5rem | 300 | 36px | normal | div, a, img, span |
| 22px | 1.375rem | 300 | 24px | normal | p, h2 |
| 21px | 1.3125rem | 400 | 21px | normal | i |
| 20px | 1.25rem | 300 | 20px | normal | a, span, button, div |
| 19px | 1.1875rem | 400 | 19px | normal | i, a |
| 18px | 1.125rem | 500 | 48px | normal | a, span, p, strong |
| 16px | 1rem | 400 | normal | normal | html, head, title, meta |
| 15px | 0.9375rem | 300 | 0px | normal | sup |

### Heading Scale

```css
h1 { font-size: 64px; font-weight: 600; line-height: 80px; }
h2 { font-size: 54px; font-weight: 500; line-height: 68px; }
h3 { font-size: 24px; font-weight: 300; line-height: 36px; }
h2 { font-size: 22px; font-weight: 300; line-height: 24px; }
```

### Body Text

```css
body { font-size: 16px; font-weight: 400; line-height: normal; }
```

### Font Weights in Use

`300` (1010x), `400` (175x), `500` (57x), `200` (23x), `600` (22x), `700` (13x)

## Spacing

**Base unit:** 2px

| Token | Value | Rem |
|-------|-------|-----|
| spacing-2 | 2px | 0.125rem |
| spacing-15 | 15px | 0.9375rem |
| spacing-24 | 24px | 1.5rem |
| spacing-28 | 28px | 1.75rem |
| spacing-48 | 48px | 3rem |
| spacing-58 | 58px | 3.625rem |
| spacing-80 | 80px | 5rem |
| spacing-100 | 100px | 6.25rem |
| spacing-106 | 106px | 6.625rem |
| spacing-180 | 180px | 11.25rem |

## Border Radii

| Label | Value | Count |
|-------|-------|-------|
| xs | 1px | 44 |
| sm | 4px | 1 |
| md | 8px | 5 |
| lg | 16px | 30 |
| full | 50px | 1 |
| full | 100px | 1 |

## Box Shadows

**md** — blur: 5px
```css
box-shadow: rgba(140, 150, 158, 0.35) 3px 3px 5px 0px;
```

**lg** — blur: 30px
```css
box-shadow: rgba(127, 137, 161, 0.25) 0px 0px 30px 0px;
```

## CSS Custom Properties

### Colors

```css
--eswIconFillColor: #FFF;
```

### Spacing

```css
--eswIconFontSize: 16px;
```

### Other

```css
--eswButtonRight: 30px;
--eswButtonBottom: 25px;
```

### Semantic

```css
success: [object Object];
warning: [object Object];
error: [object Object];
info: [object Object];
```

## Breakpoints

| Name | Value | Type |
|------|-------|------|
| xs | 320px | max-width |
| 400px | 400px | min-width |
| sm | 425px | max-width |
| sm | 426px | min-width |
| sm | 530px | max-width |
| 550px | 550px | max-width |
| sm | 576px | max-width |
| sm | 600px | max-width |
| sm | 640px | max-width |
| md | 764px | max-width |
| md | 768px | max-width |
| md | 769px | min-width |
| 890px | 890px | min-width |
| 896px | 896px | max-width |
| 897px | 897px | min-width |
| lg | 992px | max-width |
| lg | 1023px | max-width |
| lg | 1024px | min-width |
| 1200px | 1200px | max-width |
| xl | 1280px | min-width |
| 1366px | 1366px | max-width |
| 1367px | 1367px | min-width |
| 1920px | 1920px | max-width |

## Transitions & Animations

**Easing functions:** `[object Object]`, `[object Object]`

**Durations:** `0.15s`, `0.3s`

### Common Transitions

```css
transition: all;
transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
transition: 0.3s ease-out;
transition: opacity 0.15s linear;
```

### Keyframe Animations

**spinner-border**
```css
@keyframes spinner-border {
  100% { transform: rotate(360deg); }
}
```

**spinner-grow**
```css
@keyframes spinner-grow {
  0% { transform: scale(0); }
  50% { opacity: 1; }
}
```

**progress-bar-stripes**
```css
@keyframes progress-bar-stripes {
  0% { background-position: 1rem 0px; }
  100% { background-position: 0px 0px; }
}
```

**loading-animation-circle**
```css
@keyframes loading-animation-circle {
  100% { transform: rotate(360deg); }
}
```

**loading-animation-squares-box-1**
```css
@keyframes loading-animation-squares-box-1 {
  0% { left: 0px; opacity: 0.4; top: 0px; transform: scale(1); }
  25% { left: calc(100% - 1em); opacity: 0.4; top: 0px; transform: scale(1); }
  50% { left: calc(100% - 1.5em); opacity: 1; top: calc(100% - 1.5em); transform: scale(2); }
  75% { left: 0.5em; opacity: 1; top: calc(100% - 1.5em); transform: scale(2); }
}
```

**loading-animation-squares-box-2**
```css
@keyframes loading-animation-squares-box-2 {
  0% { left: calc(100% - 1.5em); opacity: 1; top: calc(100% - 1.5em); transform: scale(2); }
  25% { left: 0.5em; opacity: 1; top: calc(100% - 1.5em); transform: scale(2); }
  50% { left: 0px; opacity: 0.4; top: 0px; transform: scale(1); }
  75% { left: calc(100% - 1em); opacity: 0.4; top: 0px; transform: scale(1); }
}
```

**lfr-drop-active**
```css
@keyframes lfr-drop-active {
  0% { background-color: rgb(235, 235, 235); border-color: rgb(221, 221, 221); }
  50% { background-color: rgb(221, 237, 222); border-color: rgb(119, 221, 119); transform: scale(1.1); }
  75% { background-color: rgb(221, 237, 222); border-color: rgb(119, 221, 119); }
  100% { background-color: rgb(235, 235, 235); border-color: rgb(221, 221, 221); }
}
```

**progress-bar-stripes**
```css
@keyframes progress-bar-stripes {
  0% { background-position: 40px 0px; }
  100% { background-position: 0px 0px; }
}
```

**highlight-animation**
```css
@keyframes highlight-animation {
  0% { background-color: rgb(255, 255, 204); }
  100% { background-color: transparent; }
}
```

**onetrust-fade-in**
```css
@keyframes onetrust-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

## Component Patterns

Detected UI component patterns and their most common styles:

### Buttons (51 instances)

```css
.button {
  background-color: rgb(0, 23, 34);
  color: rgb(255, 255, 255);
  font-size: 18px;
  font-weight: 500;
  padding-top: 0px;
  padding-right: 16px;
  border-radius: 5px;
}
```

### Cards (42 instances)

```css
.card {
  background-color: rgb(236, 236, 236);
  border-radius: 0px;
  box-shadow: rgba(127, 137, 161, 0.25) 0px 0px 30px 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Inputs (6 instances)

```css
.input {
  color: rgb(0, 0, 0);
  border-color: rgb(0, 0, 0);
  border-radius: 0px;
  font-size: 16px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Links (110 instances)

```css
.link {
  color: rgb(255, 255, 255);
  font-size: 14px;
  font-weight: 300;
}
```

### Navigation (98 instances)

```css
.navigatio {
  background-color: rgb(255, 255, 255);
  color: rgb(70, 79, 87);
  padding-top: 0px;
  padding-bottom: 0px;
  padding-left: 0px;
  padding-right: 0px;
  position: relative;
  box-shadow: rgba(127, 137, 161, 0.25) 0px 0px 30px 0px;
}
```

### Footer (9 instances)

```css
.foote {
  background-color: rgb(0, 23, 34);
  color: rgb(70, 79, 87);
  padding-top: 0px;
  padding-bottom: 0px;
  font-size: 16px;
}
```

### Dropdowns (80 instances)

```css
.dropdown {
  background-color: rgb(255, 255, 255);
  border-radius: 0px;
  box-shadow: rgba(127, 137, 161, 0.25) 0px 0px 30px 0px;
  border-color: rgb(70, 79, 87) rgb(70, 79, 87) rgb(215, 215, 215);
  padding-top: 15px;
}
```

### Badges (3 instances)

```css
.badge {
  color: rgb(42, 84, 136);
  font-size: 36px;
  font-weight: 500;
  padding-top: 0px;
  padding-right: 0px;
  border-radius: 0px;
}
```

### Tooltips (1 instances)

```css
.tooltip {
  color: rgb(70, 79, 87);
  font-size: 16px;
  border-radius: 0px;
  padding-top: 0px;
  padding-right: 0px;
}
```

### Switches (11 instances)

```css
.switche {
  border-radius: 0px;
  border-color: rgb(70, 79, 87);
}
```

## Component Clusters

Reusable component instances grouped by DOM structure and style similarity:

### Button — 6 instances, 1 variant

**Variant 1** (6 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(70, 79, 87);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(70, 79, 87);
  font-size: 16px;
  font-weight: 400;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgb(0, 23, 34);
  color: rgb(255, 255, 255);
  padding: 0px 16px 0px 16px;
  border-radius: 5px;
  border: 0px none rgb(255, 255, 255);
  font-size: 18px;
  font-weight: 500;
```

### Button — 25 instances, 2 variants

**Variant 1** (2 instances)

```css
  background: rgb(255, 255, 255);
  color: rgb(0, 23, 34);
  padding: 0px 16px 0px 16px;
  border-radius: 5px;
  border: 1px solid rgb(0, 23, 34);
  font-size: 18px;
  font-weight: 500;
```

**Variant 2** (23 instances)

```css
  background: rgb(0, 23, 34);
  color: rgb(255, 255, 255);
  padding: 0px 16px 0px 16px;
  border-radius: 5px;
  border: 0px none rgb(255, 255, 255);
  font-size: 18px;
  font-weight: 500;
```

### Card — 4 instances, 2 variants

**Variant 1** (1 instance)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(70, 79, 87);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(70, 79, 87);
  font-size: 16px;
  font-weight: 300;
```

**Variant 2** (3 instances)

```css
  background: rgb(236, 236, 236);
  color: rgb(70, 79, 87);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(70, 79, 87);
  font-size: 16px;
  font-weight: 300;
```

### Card — 3 instances, 1 variant

**Variant 1** (3 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(70, 79, 87);
  padding: 48px 32px 106px 32px;
  border-radius: 0px;
  border: 0px none rgb(70, 79, 87);
  font-size: 16px;
  font-weight: 300;
```

### Button — 12 instances, 1 variant

**Variant 1** (12 instances)

```css
  background: rgb(236, 236, 236);
  color: rgb(70, 79, 87);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(70, 79, 87);
  font-size: 16px;
  font-weight: 300;
```

### Card — 12 instances, 1 variant

**Variant 1** (12 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(70, 79, 87);
  padding: 106px 24px 180px 24px;
  border-radius: 0px;
  border: 0px none rgb(70, 79, 87);
  font-size: 16px;
  font-weight: 300;
```

### Card — 6 instances, 1 variant

**Variant 1** (6 instances)

```css
  background: rgba(0, 0, 0, 0);
  color: rgb(70, 79, 87);
  padding: 0px 0px 0px 0px;
  border-radius: 0px;
  border: 0px none rgb(70, 79, 87);
  font-size: 18px;
  font-weight: 300;
```

### Button — 1 instance, 1 variant

**Variant 1** (1 instance)

```css
  background: rgb(46, 46, 46);
  color: rgb(0, 0, 0);
  padding: 0px 0px 0px 0px;
  border-radius: 50%;
  border: 0px none rgb(0, 0, 0);
  font-size: 16px;
  font-weight: 400;
```

## Layout System

**0 grid containers** and **142 flex containers** detected.

### Container Widths

| Max Width | Padding |
|-----------|---------|
| 55% | 0px |
| 100% | 0px |
| 25% | 15px |
| 50% | 15px |
| 33.3333% | 15px |
| 75% | 15px |

### Flex Patterns

| Direction/Wrap | Count |
|----------------|-------|
| row/wrap | 34x |
| column/nowrap | 56x |
| row/nowrap | 52x |

## Accessibility (WCAG 2.1)

**Overall Score: 100%** — 27 passing, 0 failing color pairs

### Passing Color Pairs

| Foreground | Background | Ratio | Level |
|------------|------------|-------|-------|
| `#ffffff` | `#001722` | 18.33:1 | AAA |
| `#ffffff` | `#464f57` | 8.35:1 | AAA |
| `#001722` | `#ffffff` | 18.33:1 | AAA |

## Design System Score

**Overall: 81/100 (Grade: B)**

| Category | Score |
|----------|-------|
| Color Discipline | 92/100 |
| Typography Consistency | 50/100 |
| Spacing System | 100/100 |
| Shadow Consistency | 100/100 |
| Border Radius Consistency | 90/100 |
| Accessibility | 100/100 |
| CSS Tokenization | 50/100 |

**Strengths:** Tight, disciplined color palette, Well-defined spacing scale, Clean elevation system, Consistent border radii, Strong accessibility compliance

**Issues:**
- 5 font families — consider limiting to 2 (heading + body)
- 1536 !important rules — prefer specificity over overrides
- 96% of CSS is unused — consider purging
- 16844 duplicate CSS declarations

## Z-Index Map

**7 unique z-index values** across 4 layers.

| Layer | Range | Elements |
|-------|-------|----------|
| modal | 1000,99999 | ul.d.r.o.p.d.o.w.n.-.m.e.n.u. .d.r.o.p.d.o.w.n.-.m.e.n.u.-.r.i.g.h.t, nav.b.g.-.d.a.r.k. .c.a.d.m.i.n. .q.u.i.c.k.-.a.c.c.e.s.s.-.n.a.v. .t.e.x.t.-.c.e.n.t.e.r. .t.e.x.t.-.w.h.i.t.e, div.d.r.o.p.d.o.w.n.-.m.e.n.u. .n.a.v.b.a.r._.a.r.e.a._.m.o.b.i.l.e |
| dropdown | 999,999 | div.e.m.b.e.d.d.e.d.M.e.s.s.a.g.i.n.g.C.o.n.v.e.r.s.a.t.i.o.n.B.u.t.t.o.n.W.r.a.p.p.e.r |
| sticky | 99,99 | button.d.r.o.p.d.o.w.n.-.t.o.g.g.l.e. .g.l.o.b.a.l.-.t.o.g.g.l.e. .m.a.t.e.r.i.a.l._.d.r.o.p.d.o.w.n._.a.r.r.o.w, button.d.r.o.p.d.o.w.n.-.t.o.g.g.l.e. .g.l.o.b.a.l.-.t.o.g.g.l.e. .m.a.t.e.r.i.a.l._.d.r.o.p.d.o.w.n._.a.r.r.o.w, button.d.r.o.p.d.o.w.n.-.t.o.g.g.l.e. .g.l.o.b.a.l.-.t.o.g.g.l.e. .m.a.t.e.r.i.a.l._.d.r.o.p.d.o.w.n._.a.r.r.o.w |
| base | 0,1 | a.n.a.v.-.l.i.n.k. .d.r.o.p.d.o.w.n.-.t.o.g.g.l.e, a.d.r.o.p.d.o.w.n.-.i.t.e.m. .n.a.v.i.g.a.t.i.o.n._.m.e.n.u, a.d.r.o.p.d.o.w.n.-.i.t.e.m. .n.a.v.i.g.a.t.i.o.n._.m.e.n.u |

**Issues:**
- [object Object]

## SVG Icons

**1 unique SVG icons** detected. Dominant style: **filled**.

| Size Class | Count |
|------------|-------|
| lg | 1 |

**Icon colors:** `rgb(255, 255, 255)`

## Font Files

| Family | Source | Weights | Styles |
|--------|--------|---------|--------|
| Bitter | self-hosted | 600, bold | normal |
| Nunito | self-hosted | 300, 500, bold, normal | normal |
| Material Symbols Rounded | self-hosted | 300 | normal |
| Material Symbols Outlined | self-hosted | 100 700 | normal |
| babri-icons | self-hosted | normal | normal |
| barbri-social-icons | self-hosted | normal | normal |

## Image Style Patterns

| Pattern | Count | Key Styles |
|---------|-------|------------|
| thumbnail | 21 | objectFit: fill, borderRadius: 0px, shape: square |
| general | 3 | objectFit: fill, borderRadius: 0px, shape: square |
| hero | 2 | objectFit: cover, borderRadius: 0px, shape: square |

**Aspect ratios:** 4:3 (12x), 1:1 (7x), 3:2 (3x), 2.75:1 (2x), 3.76:1 (1x), 3.72:1 (1x)

## Motion Language

**Feel:** smooth · **Scroll-linked:** yes

### Duration Tokens

| name | value | ms |
|---|---|---|
| `xs` | `150ms` | 150 |
| `md` | `300ms` | 300 |

### Easing Families

- **ease-in-out** (73 uses) — `ease`
- **linear** (1 uses) — `linear`

## Component Anatomy

### button — 45 instances

**Slots:** label
**Variants:** primary · secondary
**Sizes:** md

| variant | count | sample label |
|---|---|---|
| primary | 24 | Contact Us |
| default | 19 | keyboard_arrow_down |
| secondary | 2 | Access CLE + CPE |

### card — 25 instances

**Slots:** media

## Brand Voice

**Tone:** friendly · **Pronoun:** you-only · **Headings:** Title Case (tight)

### Top CTA Verbs

- **view** (16)
- **keyboard** (5)
- **law** (5)
- **access** (3)
- **us** (3)
- **sqe** (2)
- **lsat** (2)
- **learn** (2)

### Button Copy Patterns

- "keyboard_arrow_down" (5×)
- "view bar prep" (2×)
- "view sqe prep" (2×)
- "view paralegal courses" (2×)
- "contact us" (1×)
- "access cle + cpe" (1×)
- "close" (1×)
- "view professional development" (1×)
- "us pre-law

take the first step in your legal education journey by preparing for law school with barbri’s proven lsat prep courses, study aids, and law school a" (1×)
- "view pre-law prep" (1×)

### Sample Headings

> BARBRI is the Trusted Global Leader in Legal Education
> Discover Personalized US Bar + SQE Prep Plus Expert Professional Development
> BARBRI Bar Review
> BARBRI SQE Prep
> BARBRI for Professionals
> BARBRI is the Trusted Global Leader in Legal Education
> BARBRI is the Trusted Global Leader in Legal Education
> Discover Personalized US Bar + SQE Prep Plus Expert Professional Development
> BARBRI Bar Review
> BARBRI SQE Prep

## Page Intent

**Type:** `landing` (confidence 0.31)
**Description:** BARBRI is the worldwide leader in legal exam prep for the U.S. bar exam, SQE, MPRE, and CLE, professional development, and legal practice skills. Learn more.

Alternates: blog-post (0.35)

## Section Roles

Reading order (top→bottom): testimonials → nav → nav → nav → testimonials → content → nav → testimonials → content → content → content → content → testimonials → testimonials → content → content → testimonial → testimonial → content → content → testimonial → testimonial → hero → hero → testimonial → testimonial → content → content → testimonial → testimonial → testimonial → testimonial → testimonials → testimonials → cta → cta → content → content → testimonial → testimonial → content → content → pricing → pricing → testimonials → testimonials → hero → hero → testimonials → testimonials → footer → content → testimonials → content

| # | Role | Heading | Confidence |
|---|------|---------|------------|
| 0 | testimonials | — | 0.4 |
| 1 | nav | — | 0.9 |
| 2 | nav | — | 0.4 |
| 3 | nav | — | 0.9 |
| 4 | testimonials | — | 0.4 |
| 5 | content | — | 0.3 |
| 6 | nav | — | 0.9 |
| 7 | testimonials | BARBRI is the Trusted Global Leader in Legal Education | 0.4 |
| 8 | content | BARBRI is the Trusted Global Leader in Legal Education | 0.3 |
| 9 | content | BARBRI is the Trusted Global Leader in Legal Education | 0.3 |
| 10 | content | — | 0.3 |
| 11 | content | — | 0.3 |
| 12 | testimonials | Discover Personalized US Bar + SQE Prep Plus Expert Professional Development | 0.4 |
| 13 | testimonials | Discover Personalized US Bar + SQE Prep Plus Expert Professional Development | 0.4 |
| 14 | content | BARBRI Helps You Achieve Your Ambitions | 0.3 |
| 15 | content | BARBRI Helps You Achieve Your Ambitions | 0.3 |
| 16 | testimonial | BARBRI Bar Prep: Meets You Where You Are | 0.8 |
| 17 | testimonial | BARBRI Bar Prep: Meets You Where You Are | 0.8 |
| 18 | content | — | 0.3 |
| 19 | content | — | 0.3 |

## Material Language

**Label:** `flat` (confidence 0)

| Metric | Value |
|--------|-------|
| Avg saturation | 0.287 |
| Shadow profile | soft |
| Avg shadow blur | 0px |
| Max radius | 100px |
| backdrop-filter in use | no |
| Gradients | 0 |

## Imagery Style

**Label:** `flat-illustration` (confidence 0.019)
**Counts:** total 26, svg 14, icon 0, screenshot-like 0, photo-like 0
**Dominant aspect:** square-ish
**Radius profile on images:** square

## Component Library

**Detected:** `bootstrap` (confidence 0.9)

Evidence:
- bootstrap utility hits: 6

## Quick Start

To recreate this design in a new project:

1. **Install fonts:** Add `Nunito` from Google Fonts or your font provider
2. **Import CSS variables:** Copy `variables.css` into your project
3. **Tailwind users:** Use the generated `tailwind.config.js` to extend your theme
4. **Design tokens:** Import `design-tokens.json` for tooling integration
