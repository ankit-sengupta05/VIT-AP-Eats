# Theme — Visual Identity & Design Tokens

**Companion docs:** `prd.md`, `techstack.md`

---

## 1. Why this palette

Most food delivery apps converge on the same visual language — saturated red or orange (Swiggy, Zomato, DoorDash, Grubhub) or teal (Deliveroo) — because red/orange are classic appetite-stimulant colors. The problem: at this point those colors read as "generic food delivery app" rather than as a distinct brand, and a near-identical palette invites direct visual comparison to the market leaders.

This palette keeps the *psychological function* (warmth, appetite, freshness, trust) while avoiding the *specific hues* competitors own.

| Role | Color | Name | Psychology / Food association |
|---|---|---|---|
| **Primary** | `#C1502E` | **Burnt Terracotta** | Warm, earthy red-orange-brown — evokes clay tandoor ovens, roasted/grilled food, spice, hearth-cooked warmth. Stimulates appetite like red/orange but is muted and earthy rather than loud/synthetic, so it reads premium and artisanal instead of "fast-food generic."|
| **Secondary** | `#5C6E4F` | **Deep Sage** | Muted olive-green — signals fresh ingredients, herbs, natural/quality sourcing, and calm trust. Green is used sparingly (not at all) by the major delivery apps, so it's a clear differentiator while still being food-native (herbs, vegetables, freshness). |
| **Neutral base** | `#FAF6F0` (light) / `#2A2622` (ink/text) | **Warm Cream / Charcoal Ink** | Cream gives a warm, appetizing backdrop (like a plate or parchment) instead of clinical white; charcoal ink is softer than pure black, keeping the palette warm end-to-end. |

**This is intentionally a 2-color-plus-neutrals system** (Terracotta + Sage, on Cream/Charcoal) — professional, restrained, and easy to reproduce consistently across a large app surface without becoming visually noisy.

> **⚠️ Note for the design/product owner:** This palette is a **starting recommendation, not a locked brand decision.** Because every color in this system is implemented as a token (CSS variable), swapping the entire brand palette later is a **config change, not a redesign** — see §5. Treat these hex values as a placeholder the team can revisit once a formal brand exercise (or the Stitch designs, once accessible) is available.

---

## 2. Color Tokens

### Brand
```css
--color-primary: #C1502E;        /* Burnt Terracotta */
--color-primary-hover: #A8421F;
--color-primary-active: #8F3818;
--color-primary-subtle: #F5E4DC; /* tinted backgrounds, badges */

--color-secondary: #5C6E4F;      /* Deep Sage */
--color-secondary-hover: #4A5A40;
--color-secondary-active: #3B4833;
--color-secondary-subtle: #E7EBE1;
```

### Neutrals
```css
--color-bg: #FAF6F0;             /* Warm Cream — app background */
--color-surface: #FFFFFF;        /* Cards, sheets, modals */
--color-border: #E7DFD4;
--color-text-primary: #2A2622;   /* Charcoal Ink */
--color-text-secondary: #6B6258;
--color-text-disabled: #A79E92;
```

### Semantic (status/feedback — kept outside the 2-color brand system on purpose)
```css
--color-success: #3F7D4F;   /* order delivered, accepted */
--color-warning: #C98A1F;   /* preparing, delayed */
--color-danger:  #B23A2E;   /* cancelled, error — deliberately close to primary hue family so it doesn't fight the brand */
--color-info:    #3A6EA5;   /* informational states */
```

### Dark mode (Phase 1 proves the token architecture; launch-optional)
```css
--color-bg-dark: #201C19;
--color-surface-dark: #2A2622;
--color-text-primary-dark: #F5EFE7;
--color-primary-dark: #E07249;   /* lightened terracotta for contrast on dark bg */
--color-secondary-dark: #8AA179; /* lightened sage */
```

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Headings | **Fraunces** (or **Lora**) — a warm serif with character | Gives the brand a crafted, editorial food-magazine feel instead of the generic geometric sans most delivery apps use for everything |
| Body/UI | **Inter** | Highly legible at small sizes for dense UI (menus, prices, order lists), pairs cleanly with a serif heading |
| Numeric (prices, ETAs) | **Inter** with tabular figures (`font-variant-numeric: tabular-nums`) | Keeps price columns and timers visually aligned |

```css
--font-heading: 'Fraunces', serif;
--font-body: 'Inter', system-ui, sans-serif;
```

Scale (rem, 16px base):
```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 2rem;
--text-4xl: 2.5rem;
```

---

## 4. Spacing, Radius, Elevation

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;

--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-full: 999px;

--shadow-sm: 0 1px 2px rgba(42,38,34,0.06);
--shadow-md: 0 4px 12px rgba(42,38,34,0.10);
--shadow-lg: 0 12px 32px rgba(42,38,34,0.14);
```

---

## 5. How to change the theme later (important)

Because every visual value in this app is a token defined in `styles/tokens.css` and mirrored into `tailwind.config.ts`, a full rebrand is a **two-file edit**, not a component-by-component rewrite:

1. Update the hex values in `styles/tokens.css` (§2 of this doc).
2. Update the corresponding entries in `tailwind.config.ts` `theme.extend.colors`.
3. Regenerate PWA icons/screenshots if the new brand color affects them (see `manifest.json` `theme_color`/`background_color`, which should also reference `--color-primary` / `--color-bg` at build time).

**Hard rule for engineering (see `prd.md` Phase 1 DoD):** no component may hardcode a hex value, rgb(), or named color directly. Every color reference goes through a token or a Tailwind class mapped to a token. This is what makes "change the theme later" actually true in practice rather than aspirational.

---

## 6. Usage Guidelines

- **Primary (Terracotta)** — primary CTAs ("Add to Cart," "Checkout," "Accept Order"), active nav states, brand marks. Do not use for large full-bleed backgrounds — it's a warm accent, not a wallpaper.
- **Secondary (Sage)** — success-adjacent confirmations, "fresh/veg" indicators, secondary buttons, admin/partner accent contexts to visually separate those surfaces from the customer app.
- **Cream background** — default app background everywhere; keeps the whole product feeling warm rather than clinical-white like most SaaS templates.
- Keep semantic colors (`success`/`warning`/`danger`/`info`) reserved strictly for status meaning — never repurpose them decoratively, so users can trust the color-coding on order status timelines.
