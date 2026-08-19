#!/usr/bin/env python3
"""
PipelineRegressionCheck — Layer-1 contract/integrity check for the voice-AI lead pipeline.

RUN THIS AFTER ANY CHANGE to: a lead-pipeline n8n workflow, the Centre Lookup sheet,
or a centre's Retell phone bindings. It cross-validates:

  Centre Lookup sheet  <->  live n8n workflow column refs  <->  Retell inbound bindings  <->  ClickUp

and FAILS (exit 1) on the class of break that silently took EG inbound offline for 10 days
(May-31 2026 refactor keyed the inbound lookup on a column whose value EG didn't have).

Checks:
  A. Column existence — every Centre Lookup column referenced by a live workflow
     (lookupColumn + `Lookup Centre…item.json.<col>`) must exist in the sheet.
     -> catches a column rename that misses a node.
  B. Inbound consistency — every row with inbound_number set must also have
     clickup_inbound_list_id, clickup_user_ids, and centre_email.  (FAIL)
  C. Inbound coverage — every LIVE inbound centre must have inbound_number populated
     AND that number must be bound to an inbound agent in Retell (FAIL).
     Retell inbound-bound numbers with no matching row -> WARN (provisioned, not live).
  D. Outbound — every enabled row must have outbound_number populated (FAIL).
  E. ClickUp list validity — each clickup_inbound_list_id used by a live inbound centre must
     resolve via the ClickUp API (FAIL on 404).

No side effects (read-only). Usage: python3 PipelineRegressionCheck.py
Env: N8N_API_KEY (/root/.env or ~/.claude/.env), CLICKUP_PERSONAL_TOKEN (~/.claude/.env)
"""
import urllib.request, urllib.parse, json, os, re, sys

# ── Config ──────────────────────────────────────────────────────────
SHEET_ID = "1wQAdX3frfxCHK0HmGCKRpzmOx7SFaLP-3nn7AEc0GK0"
N8N_BASE = "https://xprime17.app.n8n.cloud"
RETELL_KEY = os.environ.get("RETELL_API_KEY", "")  # set in ~/.claude/.env (gitignored) — never commit the literal
UA = "Mozilla/5.0"

# Centres whose inbound line is LIVE — these MUST be fully configured (Check C = FAIL).
# Add a centre here the moment its inbound forwarding goes live.
LIVE_INBOUND_CENTRE_IDS = {"east-gwillimbury-on-ca", "st-catharines-on-ca"}
# Retell inbound-bound numbers to ignore in coverage (test/dev lines).
EXCLUDE_INBOUND_NUMBERS = {"12899030611"}  # CNKB-Cekura test number
# Lookup node name prefix used in expressions (both outbound "Lookup Centre" and inbound variant).
LOOKUP_NODE_HINT = "Lookup Centre"

N8N_KEY = os.environ.get("N8N_API_KEY") or os.environ.get("N8N_CLOUD_API_KEY")
CLICKUP = os.environ.get("CLICKUP_PERSONAL_TOKEN")

fails, warns = [], []
def FAIL(m): fails.append(m)
def WARN(m): warns.append(m)

def http(url, headers):
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30))

# ── Load Centre Lookup (CSV export — fresher than gviz, clean strings) ──
def load_sheet():
    import csv, io
    raw = urllib.request.urlopen(urllib.request.Request(
        f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0",
        headers={"User-Agent": UA}), timeout=30).read().decode()
    rd = list(csv.DictReader(io.StringIO(raw)))
    cols = list(rd[0].keys()) if rd else []
    rows = [r for r in rd if r.get("centre_id")]
    return cols, rows

def digits(v):
    return re.sub(r"\D", "", str(v)) if v not in (None, "") else ""

# ── Load live workflows that reference the Centre Lookup sheet ───────
def load_pipeline_workflows():
    data = http(f"{N8N_BASE}/api/v1/workflows?limit=250", {"X-N8N-API-KEY": N8N_KEY, "Accept": "application/json"})
    out = []
    for wf in data.get("data", []):
        if SHEET_ID in json.dumps(wf) and wf.get("active"):
            out.append(wf)
    return out

def referenced_columns(wf):
    """Only columns that actually reference the Centre Lookup sheet:
       (a) lookupColumn of googleSheets nodes whose documentId is SHEET_ID,
       (b) `$('Lookup Centre…').item.json.<col>` expressions (anchored, no JSON spanning)."""
    cols = set()
    for node in wf.get("nodes", []):
        p = node.get("parameters", {})
        if SHEET_ID in json.dumps(p.get("documentId", "")):
            filt = p.get("filtersUI") or p.get("filters") or {}
            for v in (filt.get("values") or []):
                if v.get("lookupColumn"):
                    cols.add(v["lookupColumn"])
    blob = json.dumps(wf)
    cols |= set(re.findall(r"\$\('Lookup Centre[^']*'\)\.item\.json\.([A-Za-z_][A-Za-z0-9_]*)", blob))
    return cols

# ── Run ─────────────────────────────────────────────────────────────
def main():
    if not N8N_KEY: print("FATAL: no N8N_API_KEY in env"); sys.exit(2)
    cols, rows = load_sheet()
    headers = {c for c in cols if c and len(c) > 1}
    rows_by_cid = {r["centre_id"]: r for r in rows}

    # A. column existence
    wfs = load_pipeline_workflows()
    for wf in wfs:
        for col in referenced_columns(wf):
            if col not in headers:
                FAIL(f"[A] workflow '{wf['name']}' references Centre Lookup column '{col}' which does not exist in the sheet")

    # B. inbound consistency — clickup_inbound_list_id (col P) replaced the dead
    # clickup_list_id (col N) in the 2026-06-09 per-centre Inbound/Outbound restructure
    for r in rows:
        if digits(r.get("inbound_number")):
            for need in ("clickup_inbound_list_id", "clickup_user_ids", "centre_email"):
                if not r.get(need):
                    FAIL(f"[B] centre '{r['centre_id']}' has inbound_number set but '{need}' is empty")

    # Retell inbound bindings (optional — needs RETELL_API_KEY in env)
    inbound_bound = None
    if RETELL_KEY:
        rt = http("https://api.retellai.com/list-phone-numbers", {"Authorization": f"Bearer {RETELL_KEY}"})
        # Retell moved bindings from singular inbound_agent_id -> inbound_agents[] (2026-03 deprecation); accept either
        inbound_bound = {digits(p.get("phone_number")) for p in rt if p.get("inbound_agent_id") or p.get("inbound_agents")}
    else:
        WARN("[C] Retell binding check skipped (no RETELL_API_KEY in env)")
    sheet_inbound = {digits(r.get("inbound_number")) for r in rows if digits(r.get("inbound_number"))}

    # C. inbound coverage — live centres must be fully wired
    for cid in LIVE_INBOUND_CENTRE_IDS:
        r = rows_by_cid.get(cid)
        if not r:
            FAIL(f"[C] LIVE inbound centre '{cid}' has no Centre Lookup row"); continue
        num = digits(r.get("inbound_number"))
        if not num:
            FAIL(f"[C] LIVE inbound centre '{cid}' has empty inbound_number")
        elif inbound_bound is not None and num not in inbound_bound:
            FAIL(f"[C] LIVE inbound centre '{cid}' inbound_number {num} is not bound to any inbound agent in Retell")
    # stray bound numbers (provisioned, not configured) -> WARN
    if inbound_bound is not None:
        for num in inbound_bound - sheet_inbound - EXCLUDE_INBOUND_NUMBERS:
            WARN(f"[C] Retell number {num} has an inbound agent bound but no Centre Lookup row with inbound_number={num} (fine if not live; wire before activating)")

    # D. outbound populated for enabled centres
    for r in rows:
        en = str(r.get("enabled")).strip().lower() in ("true", "1")
        if en and not digits(r.get("outbound_number")):
            FAIL(f"[D] enabled centre '{r['centre_id']}' has empty outbound_number")

    # E. clickup list validity for live inbound centres
    if CLICKUP:
        seen = {}
        for cid in LIVE_INBOUND_CENTRE_IDS:
            r = rows_by_cid.get(cid)
            lid = r and r.get("clickup_inbound_list_id")
            if not lid: continue
            lid = str(int(lid)) if isinstance(lid, float) else str(lid)
            if lid in seen: continue
            try:
                http(f"https://api.clickup.com/api/v2/list/{lid}", {"Authorization": CLICKUP}); seen[lid] = True
            except Exception as e:
                FAIL(f"[E] clickup_list_id {lid} (centre '{cid}') did not resolve: {e}")
    else:
        WARN("[E] skipped ClickUp list validation (no CLICKUP_PERSONAL_TOKEN)")

    # ── Report ──
    print(f"Pipeline regression check — {len(wfs)} live pipeline workflows, {len(rows)} centres\n")
    for w in warns: print(f"  WARN  {w}")
    for f in fails: print(f"  FAIL  {f}")
    print()
    if fails:
        print(f"RESULT: FAIL ({len(fails)} failures, {len(warns)} warnings)"); sys.exit(1)
    print(f"RESULT: PASS ({len(warns)} warnings)"); sys.exit(0)

if __name__ == "__main__":
    main()
