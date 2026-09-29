# Phase 1 design system

The Phase 1 tokens live in `src/index.css` and are exposed as Tailwind
utilities in `tailwind.config.js`. They are presentation primitives; they do
not contain marketing or SEO copy.

## Colour roles

| Token | Use |
| --- | --- |
| `accent` / `text-accent` | Gold fills, dark-surface labels and decorative accents |
| `accent-ink` / `text-accent-ink` | Small text and icons on white or light surfaces |
| `surface-warm` / `bg-surface-warm` | Warm ivory section background |
| `surface-subtle` / `bg-surface-subtle` | Neutral image and UI surface |

The separate `accent-ink` role keeps the brand gold visually present while
making small labels and icons readable on light backgrounds.

## Layout roles

- `design-container` provides a shared 80rem content width and mobile gutters.
- `design-section` and `design-section-compact` provide responsive vertical rhythm.
- `surface-card` is the default institutional card surface.
- `surface-card-interactive` adds a restrained hover treatment.
- `media-frame` provides clipping, stable framing and object-fit behaviour for
  responsive photography.

Existing page classes remain valid while page templates are migrated in later
phases.

## Motion contract

Phase 1 establishes the visual tokens only. Later animation work should use
opacity/transform, keep transitions short, avoid scroll hijacking, and honour
the existing `prefers-reduced-motion` rules.

