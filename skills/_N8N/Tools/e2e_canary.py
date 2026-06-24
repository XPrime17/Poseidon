#!/usr/bin/env python3
"""
e2e_canary.py — systemd entrypoint for the weekly E2E lead-flow canary.

Runs E2ELeadFlowCheck.py (LIVE — rings the test phone), captures its output, and on
FAIL/misconfig emails scott.james@codeninjas.com via Resend (Mozilla UA, Cloudflare-1010
safe). On PASS it stays silent. Intended to be invoked only by e2e-leadflow-check.service
on the Thursday 19:00 America/Toronto timer.

Exit code mirrors the harness (0 PASS, 1 FAIL, 2 misconfig).
"""
import os, sys, json, subprocess, urllib.request
from datetime import datetime, timezone

HERE       = os.path.dirname(os.path.abspath(__file__))
HARNESS    = os.path.join(HERE, "E2ELeadFlowCheck.py")
TO_EMAIL   = "scott.james@codeninjas.com"
FROM_EMAIL = os.environ.get("AUDIT_FROM_EMAIL", "onboarding@resend.dev")
RESEND_KEY = os.environ.get("RESEND_API_KEY", "").strip()
UA         = "Mozilla/5.0 (PAI/e2e-canary; droplet)"  # MUST be set — Cloudflare-1010 footgun

def email_failure(summary):
    if not RESEND_KEY:
        print("WARN: no RESEND_API_KEY — cannot email failure alert", file=sys.stderr)
        return
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    html = (
        f"<h2>E2E lead-flow canary FAILED</h2>"
        f"<p>The weekly end-to-end voice-AI lead pipeline check failed at {ts}.</p>"
        f"<p>A synthetic <code>New CORE Program Inquiry</code> lead did not reach the Retell "
        f"dial stage (or the call was not placed). Leads may be silently dropping. "
        f"This is the same failure class as the Classify-Lead regex regression.</p>"
        f"<pre style='background:#f5f5f5;padding:12px;border-radius:6px;white-space:pre-wrap'>"
        f"{summary}</pre>"
        f"<p>Investigate workflow <code>6sPwo7ngPyTWfmwM</code> (Outbound Call Flow - Multicentre) "
        f"and re-run <code>python3 E2ELeadFlowCheck.py --selfcheck</code>.</p>"
    )
    body = json.dumps({"from": FROM_EMAIL, "to": [TO_EMAIL],
                       "subject": "ALERT: E2E lead-flow canary FAILED", "html": html}).encode()
    req = urllib.request.Request("https://api.resend.com/emails", data=body, method="POST",
            headers={"Authorization": f"Bearer {RESEND_KEY}", "Content-Type": "application/json",
                     "User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(f"RESEND status={r.status}")
    except Exception as e:
        print(f"WARN: Resend send failed: {e}", file=sys.stderr)

def main():
    proc = subprocess.run([sys.executable, HARNESS], capture_output=True, text=True, timeout=600)
    out = (proc.stdout or "") + (("\n--- stderr ---\n" + proc.stderr) if proc.stderr else "")
    print(out)
    if proc.returncode != 0:
        email_failure(out.strip() or f"(no output, exit {proc.returncode})")
    sys.exit(proc.returncode)

if __name__ == "__main__":
    main()
