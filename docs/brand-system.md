# Norsk helsenett brand implementation

## Authoritative reference

- Source: [Norsk helsenett digital profile guide](https://brandpad.io/norsk-helsenett/)
- Retrieved: 2026-07-15
- Scope reviewed: concept, logo placement and clearspace, design element, colour palette, typography, illustration, icon style, and co-branding guidance.

## Implemented tokens

| Role | Brandpad name | Value |
| --- | --- | --- |
| Primary dark | Mørk grønn primær | `#015945` |
| Primary light | Lys grønn primær | `#7BEFB2` |
| Deep background | Grønn 1 | `#002920` |
| Secondary green | Grønn 2 | `#247360` |
| Active/accent green | Grønn 3 | `#02A67F` |
| Pale green | Grønn 4 | `#C4F2DA` |
| Neutral surface | Varm grå | `#F7F5F4` |
| Information accent | Blå 1 | `#00467A` |
| Action/warning accent | Gul 1 | `#FFC46B` |
| Consequence accent | Oransje 1 | `#E85800` |

The tokens are declared centrally in `src/styles.css` and reused in the React UI and procedural Three.js scene.

## Typography

The profile font Helvetica Now requires a separate commercial licence and is not included. The guide identifies Arial as Norsk helsenett's system font, so the application uses `Arial, Helvetica, sans-serif` for all interface and display text. No remote font is requested and no font file is bundled.

## Placement and connection concept

The brand reference prefers the primary logo at the upper or lower left and specifies clearspace around it. Both application routes therefore place the brand lockup at the upper left with generous padding. The landing page uses an original linked-circle field and the lockup uses an original inline connection glyph to express the published connection concept without copying a downloadable design element.

## Logo and asset decision

The Brandpad download links establish provenance, but the public page does not state an item-level redistribution licence for the logo archive, design-element archive, illustrations, or icon package. Those assets are not imported. The current lockup is accessible text plus project-authored SVG geometry; it must not be represented as the official NHN logo. If an authorised official logo is supplied later, its exact file, source, usage permission, checksum, clearspace, variants, and reviewer must be added to the asset manifest before replacement.

## Accessibility checks

- Primary buttons use light green on deep green.
- Focus indicators use the primary light green and do not rely on colour alone.
- Yellow/orange accents are paired with labels or consequence text.
- The Playwright Axe scan covers the landing page and game entry route.
- High-contrast mode remains available independently of the brand palette.
