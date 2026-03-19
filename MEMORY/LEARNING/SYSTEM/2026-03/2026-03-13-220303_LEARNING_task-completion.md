---
capture_type: LEARNING
timestamp: 2026-03-13 22:03:03 UTC
auto_captured: true
tags: [auto-capture]
---

# Quick Learning: Task Completion

**Date:** 2026-03-13
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

📋 **SUMMARY:**
- **Root cause:** AI extractor (`Get customer info1`) mistook centre name "Canton" for the customer's first name "Grayson"
- **Fix:** Added `LOCATION NAME WARNING` section to the extraction prompt listing all centre names and explicitly forbidding their use as customer names
- **Deployed:** Outbound Call Flow updated and active on n8n cloud
- Retry Scheduler is unaffected (it reads `First` from the sheet, so the fix at the extraction stage prevents the bad data from ever being written)

🗣️ **Poseidon:** Done, Scott. The AI extractor now has an explicit warning listing all centre names and instructions to never use them as customer names. Next time a Canton lead comes in, it'll correctly extract "Grayson" instead of "Canton."

</details>
