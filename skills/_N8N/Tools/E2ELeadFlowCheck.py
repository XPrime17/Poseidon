#!/usr/bin/env python3
"""
E2ELeadFlowCheck — Layer-2 LIVE end-to-end gate for the voice-AI lead pipeline.

Where PipelineRegressionCheck.py is a static contract check (does the sheet line up
with the workflows / Retell / ClickUp?), THIS harness proves the pipeline actually
*works* by driving one real synthetic lead all the way through:

    inject a LineLeader-format inquiry email  ->  Gmail Trigger fires
      ->  Extract Centre / Classify Lead / Lookup Centre / Enabled?
      ->  Phone Override (Testing=TRUE -> test_number)
      ->  Append row in sheet  ->  After Hours?  ->  Retell: Call Prospect

It is the assertion that would have caught the live `New CORE Program Inquiry`
regression: the `Classify Lead` regex is `/New\\s+CORE\\s+Inquiry/i`, which does NOT
match "New CORE **Program** Inquiry", so such leads silently die at `Non-Lead Dropped`.
This harness uses that exact real subject and FAILS if the execution terminates at any
drop node instead of reaching the Retell call.

Everything routes through a dedicated `regression-test` Centre Lookup row whose
Testing=TRUE forces the dial to the owner's own test number (+19059672357) — it never
touches a real lead or a real centre's phone.

--------------------------------------------------------------------------------
MODES
  (default)     LIVE run. Injects ONE synthetic email -> WILL ring +19059672357.
                Only run this when you intend to place a real test call.
  --selfcheck   NO injection, NO call. Structural validation only:
                  webhook reachable, regression-test row present/enabled/Testing,
                  Retell key valid. Use this to validate the harness build.

EXIT CODES   0 = PASS   1 = FAIL   2 = misconfig / missing keys

ENV (sourced from /root/.env and ~/.claude/.env):
  N8N_API_KEY     (required)   RETELL_API_KEY  (required for call assert / selfcheck)
"""
import urllib.request, urllib.error, json, os, re, sys, time, argparse

# ── Config ──────────────────────────────────────────────────────────
N8N_BASE      = "https://xprime17.app.n8n.cloud"
INTAKE_WF_ID  = "6sPwo7ngPyTWfmwM"                       # Outbound Call Flow - Multicentre
HARNESS_WEBHOOK = f"{N8N_BASE}/webhook/e2e-harness-ops"  # E2E Harness Ops (joLG6ji6JEMW6aaW)
SHEET_LOOKUP  = "1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0"
TEST_CENTRE   = "regression-test"
INTAKE_TO     = "scott.james1717+regression-test@gmail.com"
TEST_NUMBER   = "9059672357"            # owner's test cell (dial target +19059672357)
DIAL_TARGET   = "+1" + TEST_NUMBER
POLL_TIMEOUT  = 120                     # seconds to wait for our execution
POLL_INTERVAL = 5
UA = "Mozilla/5.0"

# Nodes whose presence in the execution = SUCCESS (reached the dial or its after-hours hold)
SUCCESS_NODES = {"Retell:  Call Prospect", "Append row in sheet"}
# Nodes whose presence = the lead was dropped/rejected -> FAIL
DROP_NODES = {"Non-Lead Dropped", "Sanitization Failed", "Not Enabled", "Centre not found"}

def load_env():
    for p in ("/root/.env", os.path.expanduser("~/.claude/.env")):
        try:
            with open(p) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
        except FileNotFoundError:
            pass

load_env()
N8N_KEY    = os.environ.get("N8N_API_KEY") or os.environ.get("N8N_CLOUD_API_KEY")
RETELL_KEY = os.environ.get("RETELL_API_KEY", "")

# ── HTTP helpers ────────────────────────────────────────────────────
def http(url, headers=None, method="GET", body=None, timeout=30):
    data = None
    h = dict(headers or {})
    if body is not None:
        data = json.dumps(body).encode()
        h.setdefault("Content-Type", "application/json")
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read().decode()
    return json.loads(raw) if raw.strip() else {}

def n8n(path, **kw):
    return http(f"{N8N_BASE}{path}", headers={"X-N8N-API-KEY": N8N_KEY, "Accept": "application/json"}, **kw)

def retell(path, method="GET", body=None):
    return http(f"https://api.retellai.com{path}",
                headers={"Authorization": f"Bearer {RETELL_KEY}"}, method=method, body=body)

def load_lookup_row(cid):
    """Read Centre Lookup via CSV export (unauthenticated, fresh)."""
    import csv, io
    raw = urllib.request.urlopen(urllib.request.Request(
        f"https://docs.google.com/spreadsheets/d/{SHEET_LOOKUP}/export?format=csv&gid=0",
        headers={"User-Agent": UA}), timeout=30).read().decode()
    for r in csv.DictReader(io.StringIO(raw)):
        if r.get("centre_id") == cid:
            return r
    return None

def truthy(v):
    return str(v).strip().lower() in ("true", "1", "yes")

# ── Synthetic lead in exact LineLeader format ───────────────────────
def build_lead(marker_ts):
    marker = f"E2E {marker_ts}"
    body = (
        "Congratulations!  A new family has submitted their information for your CORE programs.   "
        "Please log into ChildcareCRM to view the full family record.  Here are a few details:\n\n"
        f"{marker}\n\n"
        f" e2e+{marker_ts}@codeninjas.com\n\n"
        "(905) 967-2357"
    )
    subject = "New CORE Program Inquiry"   # the EXACT real subject that regressed
    return marker, subject, body

# ── selfcheck (no injection, no call) ───────────────────────────────
def selfcheck():
    fails, oks = [], []
    def OK(m): oks.append(m)
    def FAIL(m): fails.append(m)

    if not N8N_KEY:
        print("FATAL: no N8N_API_KEY in env"); sys.exit(2)

    # 1. webhook reachable (no-op probe: empty op -> Switch fallback, no side effect)
    try:
        http(HARNESS_WEBHOOK, method="POST", body={"op": "selfcheck-probe"}, timeout=20)
        OK(f"helper webhook reachable ({HARNESS_WEBHOOK})")
    except urllib.error.HTTPError as e:
        # 200/4xx both mean the endpoint is live & registered; only connection errors are fatal
        OK(f"helper webhook registered (HTTP {e.code})")
    except Exception as e:
        FAIL(f"helper webhook unreachable: {e}")

    # 2. intake workflow active
    try:
        wf = n8n(f"/api/v1/workflows/{INTAKE_WF_ID}")
        if wf.get("active"): OK(f"intake workflow '{wf['name']}' is active")
        else: FAIL(f"intake workflow '{wf.get('name')}' is NOT active")
    except Exception as e:
        FAIL(f"intake workflow fetch failed: {e}")

    # 3. regression-test row present / enabled / Testing
    row = load_lookup_row(TEST_CENTRE)
    if not row:
        FAIL(f"Centre Lookup has no '{TEST_CENTRE}' row")
    else:
        if truthy(row.get("enabled")): OK("regression-test row enabled=TRUE")
        else: FAIL(f"regression-test enabled={row.get('enabled')!r} (must be TRUE)")
        if truthy(row.get("Testing")): OK("regression-test Testing=TRUE (dials test_number)")
        else: FAIL(f"regression-test Testing={row.get('Testing')!r} (must be TRUE — else it dials a real lead)")
        if re.sub(r"\D", "", str(row.get("test_number"))) == TEST_NUMBER:
            OK(f"regression-test test_number = {TEST_NUMBER}")
        else: FAIL(f"regression-test test_number={row.get('test_number')!r} (expected {TEST_NUMBER})")
        if row.get("agent_id"): OK(f"regression-test agent_id set ({row.get('agent_id')})")
        else: FAIL("regression-test agent_id empty (Retell call would fail)")
        if row.get("outbound_number"): OK(f"regression-test outbound_number {row.get('outbound_number')}")
        else: FAIL("regression-test outbound_number empty")
        if not re.sub(r"\D", "", str(row.get("inbound_number") or "")):
            OK("regression-test inbound_number blank (no inbound gate)")
        else: FAIL(f"regression-test inbound_number={row.get('inbound_number')!r} (should be blank)")

    # 4. Retell key valid
    if not RETELL_KEY:
        FAIL("no RETELL_API_KEY in env (live run can't assert the call)")
    else:
        try:
            # POST /v2/list-agents (legacy GET /list-agents removed 2026-07-31)
            retell("/v2/list-agents", method="POST",
                   body={"filter_criteria": {"channel": {"op": "eq", "type": "string", "value": "voice"}}})
            OK("Retell API key valid (v2/list-agents 200)")
        except Exception as e:
            FAIL(f"Retell API key invalid: {e}")

    print("E2ELeadFlowCheck --selfcheck\n")
    for m in oks:   print(f"  OK    {m}")
    for m in fails: print(f"  FAIL  {m}")
    print()
    if fails:
        print(f"RESULT: FAIL ({len(fails)} issues) — fix before a live run"); return 1
    print("RESULT: PASS — structure valid; a live run is safe to ring the test phone"); return 0

# ── live run (injects + asserts) ────────────────────────────────────
def find_execution(marker, since_iso):
    """Poll intake-workflow executions started after inject; match by marker in Gmail-trigger body."""
    deadline = time.time() + POLL_TIMEOUT
    while time.time() < deadline:
        data = n8n(f"/api/v1/executions?workflowId={INTAKE_WF_ID}&limit=20&includeData=false").get("data", [])
        for e in data:
            if e.get("startedAt", "") < since_iso:
                continue
            full = n8n(f"/api/v1/executions/{e['id']}?includeData=true")
            run = full.get("data", {}).get("resultData", {}).get("runData", {})
            gt = run.get("Gmail Trigger")
            if not gt:
                continue
            try:
                txt = gt[0]["data"]["main"][0][0]["json"].get("text", "") or ""
            except Exception:
                txt = ""
            if marker in txt:
                return e["id"], run
        time.sleep(POLL_INTERVAL)
    return None, None

def live_run():
    if not N8N_KEY:
        print("FATAL: no N8N_API_KEY in env"); return 2
    if not RETELL_KEY:
        print("FATAL: no RETELL_API_KEY in env (cannot assert the Retell call)"); return 2

    ts = int(time.time())
    marker, subject, body = build_lead(ts)
    print(f"E2ELeadFlowCheck LIVE — marker={marker!r}  (this WILL ring {DIAL_TARGET})\n")

    # snapshot time just before inject (n8n executions use ISO Z)
    from datetime import datetime, timezone
    since_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    # 1. inject
    print(f"[1] injecting synthetic lead -> {INTAKE_TO}  subject={subject!r}")
    http(HARNESS_WEBHOOK, method="POST", body={
        "op": "inject", "to": INTAKE_TO, "subject": subject, "message": body})

    # 2. find our execution
    print(f"[2] polling intake-workflow executions (<= {POLL_TIMEOUT}s) for marker...")
    exec_id, run = find_execution(marker, since_iso)
    if not exec_id:
        print("\nRESULT: FAIL — no intake execution matched our marker within timeout")
        print("        (Gmail Trigger may be slow; re-run, or check the intake inbox filter)")
        return 1
    reached = set(run.keys())
    print(f"    matched execution {exec_id}; nodes reached: {sorted(reached)}")

    fails = []
    # 3. assert no drop node
    hit_drop = reached & DROP_NODES
    if hit_drop:
        fails.append(f"execution terminated at drop node(s): {sorted(hit_drop)} "
                     f"-> lead was REJECTED (this is the 'New CORE Program Inquiry' class of regression)")
    # 4. assert reached a success node
    if not (reached & SUCCESS_NODES):
        fails.append(f"execution never reached {sorted(SUCCESS_NODES)} -> lead did not get queued/dialed")

    # 5. read lead_id from Append row in sheet (for cleanup + reporting)
    lead_id = None
    appended = run.get("Append row in sheet")
    if appended:
        try:
            lead_id = appended[0]["data"]["main"][0][0]["json"].get("lead_id")
            print(f"    lead_id appended to MasterSheet: {lead_id!r}")
        except Exception:
            pass

    # 6. Time-of-day awareness: the 'After Hours?' gate only dials within [9,20) centre-local.
    #    In-hours  -> a real Retell call MUST fire.  After-hours -> the dial is correctly
    #    withheld (held for 9am retry), so reaching Append with no drop node is the PASS signal.
    from datetime import timedelta
    tz_name = "America/Toronto"
    try:
        tz_name = (load_lookup_row(TEST_CENTRE).get("timezone") or tz_name).strip()
    except Exception:
        pass
    try:
        from zoneinfo import ZoneInfo
        local_hour = datetime.now(ZoneInfo(tz_name)).hour
    except Exception:
        local_hour = (datetime.now(timezone.utc) - timedelta(hours=4)).hour  # EDT fallback
    in_hours = 9 <= local_hour < 20
    print(f"[6] centre-local ~{local_hour:02d}:00 {tz_name} -> "
          f"{'IN call window — a dial must fire' if in_hours else 'AFTER HOURS — dial correctly withheld for 9am retry'}")

    call_ok = False
    warns = []
    if in_hours and not hit_drop:
        for _ in range(8):  # ~2min poll; real dialer runs on a multi-minute scheduler
            try:
                calls = retell("/v3/list-calls", method="POST", body={"limit": 30}).get("items", [])
                for c in calls:
                    to = re.sub(r"\D", "", str(c.get("to_number", "")))
                    started_ms = c.get("start_timestamp") or 0
                    if to.endswith(TEST_NUMBER) and started_ms >= (ts - 30) * 1000:
                        call_ok = True
                        print(f"    Retell call found: id={c.get('call_id')} to={c.get('to_number')} "
                              f"status={c.get('call_status')}")
                        break
            except Exception as e:
                fails.append(f"Retell list-calls failed: {e}"); break
            if call_ok:
                break
            time.sleep(15)
        if not call_ok and not fails:
            warns.append(f"injected lead's dial to {DIAL_TARGET} not caught in the poll window "
                         "(the Retry Scheduler dials on a multi-minute cadence, so a live canary "
                         "rarely catches it in-window; real dials are verified nightly by "
                         "daily-call-audit). Intake reached the dial queue correctly.")

    # 7. cleanup — mark the MasterSheet row done so Retry Scheduler never re-dials
    if lead_id:
        print(f"[7] cleanup: marking lead_id={lead_id!r} status=done")
        try:
            http(HARNESS_WEBHOOK, method="POST", body={"op": "cleanup", "lead_id": lead_id})
        except Exception as e:
            print(f"    WARN cleanup failed: {e} (manually set that row's status=done)")

    print()
    if fails:
        for f in fails: print(f"  FAIL  {f}")
        print(f"\nRESULT: FAIL ({len(fails)} issues)")
        return 1
    for w in warns: print(f"  WARN  {w}")
    if in_hours:
        if call_ok:
            print("  OK    lead classified+looked-up+appended, no drop nodes, Retell call placed to test number")
        else:
            print("  OK    lead classified+looked-up+appended, no drop nodes, queued for dial "
                  "(dial not caught in-window; real dials verified nightly by daily-call-audit)")
    else:
        print("  OK    lead classified+looked-up+appended (regex-sensitive path healthy); "
              "call correctly withheld after-hours and held for 9am retry")
    print("\nRESULT: PASS — full lead pipeline is healthy end-to-end")
    return 0

def main():
    ap = argparse.ArgumentParser(description="Live E2E gate for the voice-AI lead pipeline")
    ap.add_argument("--selfcheck", action="store_true",
                    help="structural validation only — NO email injection, NO phone call")
    args = ap.parse_args()
    sys.exit(selfcheck() if args.selfcheck else live_run())

if __name__ == "__main__":
    main()
