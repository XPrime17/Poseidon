---
name: TourForce Tailwind Build Fix
description: Bun doesn't compile Tailwind v4 utilities — must pre-compile with @tailwindcss/cli
type: feedback
---

Bun's built-in CSS bundler does NOT compile Tailwind v4 utility classes. It only passes through the `@layer theme/base` — zero utility classes (`w-56`, `flex`, `rounded-xl`, etc.) get generated.

**Why:** Bun v1.3.8 doesn't integrate with Tailwind v4's content scanning. `@import "tailwindcss"` and `@source` directives are ignored by Bun's CSS processor.

**How to apply:** For TourForce portal (and any Bun + Tailwind v4 project):
1. Pre-compile CSS: `npx @tailwindcss/cli -i styles/index.css -o styles/compiled.css --content 'components/**/*.tsx,pages/**/*.html'`
2. Import `compiled.css` in components, not `index.css`
3. Build step in package.json: `"css": "tailwindcss -i styles/index.css -o styles/compiled.css --content '...'"`
4. Run `bun run css` before `bun run server.ts`
