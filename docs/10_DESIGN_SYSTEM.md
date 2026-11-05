# Design System

## Colors (hex)
| Token | Hex | Use |
|---|---|---|
| primary | #2563EB | buttons, links |
| primary-dark | #1D4ED8 | hover |
| accent | #10B981 | good scores, success |
| warning | #F59E0B | medium scores |
| danger | #EF4444 | errors, low scores |
| bg | #F8FAFC | page background |
| surface | #FFFFFF | cards |
| text | #0F172A | main text |
| muted | #64748B | secondary text |

## Typography
- Font: Inter (fallback system-ui, sans-serif); code: JetBrains Mono.
- Scale: H1 30/36 bold, H2 24/32 semibold, H3 20/28 semibold, body 16/24, small 14/20, caption 12/16.

## Spacing scale
4, 8, 12, 16, 24, 32, 48, 64 px (Tailwind 1, 2, 3, 4, 6, 8, 12, 16). Page gutter 16 px mobile / 32 px desktop. Max content width 1280 px.

## Buttons, inputs, cards
- Button: 40 px high, 8 px radius, primary (filled), secondary (outline), danger (red). Disabled at 50% opacity; loading shows spinner.
- Input: 40 px high, 1 px border #D1D5DB, 8 px radius, 2 px primary focus ring, inline error text in danger color.
- Card: white surface, 12 px radius, 1 px border, soft shadow, 24 px padding.
- Table: sticky header, zebra rows, row hover, responsive horizontal scroll.

## Icons and imagery
- Lucide icons, 20 px default, stroke 1.75. Charts via Recharts using palette tokens. No stock photos; use simple empty-state illustrations.
