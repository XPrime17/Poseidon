---
capture_type: LEARNING
timestamp: 2026-04-25 20:09:44 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Found and fixed — three issues stacked: missing HOME var, wrong wait strategy, and lazy-loaded content. EG now has all 40 camps back in the KB. The nightly run tonight will get it right.

**Date:** 2026-04-25
**Auto-captured:** Yes

---

## Summary

N/A

## Analysis

N/A

## Actions Taken

N/A

## Results

N/A

## Current Status

N/A

## Next Steps

N/A

---

<details>
<summary>Full Response</summary>

## 6. VERIFY

**40 camps found, all 10 weeks, 4,316 chars auto-generated, 5,305 total with manual section.** Working perfectly under systemd now.

The root cause was three things:
1. **Missing `HOME` env var** — Playwright/Chromium needs `HOME` to find browser profile
2. **`networkidle` hangs** under systemd — switched to `commit` + explicit wait
3. **Lazy-loaded camp cards** — the page only renders all 10 weeks after scrolling down

## 7. LEARN

The fix was:
- `wait_until="commit"` (fastest, just wait for server response)
- 5-second wait for initial JS render
- `window.scrollBy(0, 2000)` to trigger lazy-loaded camp cards
- 3-second wait for lazy content to render
- `--no-sandbox` Chromium flag (required when running as root under systemd)
- `HOME=/root` and `PLAYWRIGHT_BROWSERS_PATH` in the systemd service

Tonight's 2 AM crawl will now get the full 10-week camp schedule for every centre.

🗣️ Poseidon: Found and fixed — three issues stacked: missing HOME var, wrong wait strategy, and lazy-loaded content. EG now has all 40 camps back in the KB. The nightly run tonight will get it right.

</details>
