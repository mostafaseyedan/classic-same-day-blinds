# Storefront Design System

This storefront should use one shared visual language across pages and sections.

## Palette

- `shell`: warm background surface
- `slate`: primary text and primary button fill
- `olive`: success, trust, and directional accent
- `brass`: merchandising accent, highlight, and secondary emphasis
- `white`: default elevated card surface

Use `slate` for main copy, `olive` for trust/system accents, and `brass` for commercial emphasis. Do not introduce new section-level colors unless they are added to the Tailwind theme first.

## Typography

- `font-display`: section titles, page titles, major callouts
- sans body: all supporting copy, metadata, controls

Use uppercase eyebrow labels before section titles. Keep body copy short and readable.

## Containers

- `page-section`: standard horizontal padding and vertical rhythm
- `content-shell`: standard max width
- `section-panel`: high-emphasis module container
- `surface-card`: default white card
- `surface-muted`: lower-emphasis shell-tinted card
- `surface-inset`: compact white inset block
- `surface-inset-muted`: compact shell-tinted inset block

Rule:
- Use `section-panel` when multiple subparts belong to one composed module.
- Use `surface-card` for standalone cards.
- Use `surface-muted` for helper or summary blocks.
- Use `surface-inset` and `surface-inset-muted` for inner boxes inside cards, diagrams, lists, and summaries.

## Radius Scale

- `2rem`: page-level shells and major composed sections
- `1.5rem`: standard cards, merchandising cards, and modal shells
- `1rem` (`rounded-xl`): inputs, inset boxes, thumbnails, and compact inner panels
- `full`: buttons, badges, chips, segmented controls

Rule:
- Do not introduce one-off radii like `1.25rem`, `1.35rem`, `1.75rem`, `1.8rem`, or `1.9rem` in component code.
- If a new radius is truly needed, it must first become a shared primitive in `globals.css`.

## Section Headers

- `section-header`: standard title/action row
- `eyebrow`: olive section label
- `eyebrow-accent`: brass section label
- `section-title`: standard display heading
- `section-copy`: standard supporting paragraph

Rule:
- Most sections should start with `eyebrow`, then `section-title`, then `section-copy`.
- Action links or buttons belong on the right side of `section-header`.

## Palette

Additional tokens beyond the five listed above:

- `pine` (#204033): darker olive used exclusively as hover state on `btn-olive` and gradient overlays. Do not use as a base fill color on new surfaces.

## Buttons

- `btn-primary`: slate-filled CTA — main action per section (hover transitions to olive)
- `btn-olive`: olive-filled CTA — trust/contact/action contexts (hover transitions to pine)
- `btn-secondary`: outlined secondary CTA
- `btn-soft`: shell-tinted tertiary action
- `field-input`, `field-input-muted`, `field-textarea`, `field-textarea-muted`: standard form controls
- `pill-chip`, `pill-chip-white`: standard chips and small inline metadata

Rule:
- One primary action per section.
- Use `btn-olive` for contact, quote, and trust-adjacent CTAs where olive green fits the context.
- Secondary actions stay outlined.
- Avoid inventing one-off button or input styles inside sections.

## Interactive Cards

- `card-interactive`: default hoverable merchandising card
- `dialog-shell`: standard product/service modal shell

Rule:
- Product/category/room cards should begin from `card-interactive` and then add only what is unique to that content type.
- Modals should begin from `dialog-shell`, not a page-section radius.

## Visual Density

- Prefer one card with clear hierarchy over multiple nested panels.
- Avoid more than 1-2 badges per card.
- Avoid mixing too many border opacities and custom shadows per section.
- When a concept can be shown visually, prefer a compact SVG/diagram over more copy.

## Refactor Rule

When touching an older section, migrate it toward these primitives instead of adding another custom style string.
