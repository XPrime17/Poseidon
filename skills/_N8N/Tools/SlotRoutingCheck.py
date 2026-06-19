#!/usr/bin/env python3
"""
SlotRoutingCheck — guard against inbound voice agents serving the WRONG centre's tour slots.

Root incident (2026-06-18): inbound agents were cloned off the EG template whose
`get_tour_slots` tool pointed at the GENERIC calendar_api endpoint (`/retell/get-slots`,
no centre in the path). calendar_api silently DEFAULTED unknown centre -> east-gwillimbury,
so StCath/Kanata/Burlington inbound callers were read EG's availability (e.g. StCath offered
a Friday slot at a Friday-closed centre). This check makes that whole class of bug loud.

For every LIVE inbound agent (CNKB-*-Inbound, excludes [OFFBOARDED...]):
  C1  get_tour_slots URL is centre-specific  -> /retell/get-slots/<centre>  (NOT the generic path)
  C2  that <centre> is cached in calendar_api (/health) with total_slots > 0
  C3  POST /retell/get-slots/<centre> returns real slots (not the 'unavailable' fallback)
  C4  a non-EG centre's slots are DISTINCT from EG's  (the canary for 'silently defaulting to EG')
Fleet-level:
  C5  the GENERIC endpoint (no centre) returns the safe 'unavailable' message, never a real
      centre's slots  (proves the EG default footgun stays closed)

Exit 0 = PASS (gate clears) | Exit 1 = FAIL (do not ship) | Exit 2 = setup error.

Usage:
  python3 SlotRoutingCheck.py                  # whole fleet (regression gate)
  python3 SlotRoutingCheck.py --agent agent_x  # exactly one agent (onboarding gate; provision-inbound passes the id)
  python3 SlotRoutingCheck.py --centre kanata  # loose name filter (human/debug use)

Env:
  RETELL_API_KEY (or RETELL_KEY)   — Retell API key (in ~/.claude/.env)
  CAL_API_BASE                     — calendar_api base (default http://localhost:5001)
"""
import os, sys, json, urllib.request, urllib.error

RETELL = "https://api.retellai.com"
RK = os.environ.get("RETELL_API_KEY") or os.environ.get("RETELL_KEY")
CAL = os.environ.get("CAL_API_BASE", "http://localhost:5001").rstrip("/")
EG_KEY = "east-gwillimbury"
GENERIC_PATH = "/retell/get-slots"
UNAVAIL_MARK = "unavailable"          # substring of the safe fallback message
SLOTS_MARK = "Available tour times"   # prefix of a real slots payload

def _http(req):
    with urllib.request.urlopen(req, timeout=40) as x:
        return json.loads(x.read())

def retell(path):
    return _http(urllib.request.Request(RETELL + path, headers={"Authorization": f"Bearer {RK}"}))

def cal_slots(centre=None):
    url = CAL + GENERIC_PATH + (f"/{centre}" if centre else "")
    req = urllib.request.Request(url, data=b"{}", method="POST", headers={"Content-Type": "application/json"})
    return _http(req).get("result", "")

def cal_health():
    return _http(urllib.request.Request(CAL + "/health"))

def discover_inbound_agents():
    seen = {}
    for a in retell("/list-agents"):
        nm = a.get("agent_name", "")
        if nm.endswith("-Inbound") and not nm.startswith("[OFFBOARDED"):
            seen[a["agent_id"]] = a            # de-dup version rows by agent_id
    return sorted(seen.values(), key=lambda a: a["agent_name"])

def llm_id_of(a):
    # REST /list-agents nests it under response_engine; tolerate flattened shape too.
    return a.get("llm_id") or (a.get("response_engine") or {}).get("llm_id")

def slot_tool_url(llm_id):
    if not llm_id:
        return None
    for t in retell(f"/get-retell-llm/{llm_id}").get("general_tools", []):
        if t.get("name") == "get_tour_slots":
            return t.get("url", "")
    return None

def centre_from_url(url):
    """Return the centre segment after /retell/get-slots/, or None if generic/absent."""
    if not url:
        return None
    i = url.find(GENERIC_PATH)
    if i < 0:
        return None
    tail = url[i + len(GENERIC_PATH):].strip("/")
    return tail or None   # '' (generic) -> None

def main():
    if not RK:
        print("FATAL: no RETELL_API_KEY/RETELL_KEY in env"); sys.exit(2)
    only = None
    if "--centre" in sys.argv:
        only = sys.argv[sys.argv.index("--centre") + 1]
    agent_id = None
    if "--agent" in sys.argv:
        agent_id = sys.argv[sys.argv.index("--agent") + 1]

    try:
        health = cal_health()
        cache = health.get("slots_cache", {})
        eg_slots = cal_slots(EG_KEY)
        generic_result = cal_slots(None)
    except Exception as e:
        print(f"FATAL: calendar_api unreachable at {CAL}: {e}"); sys.exit(2)

    fails, warns, lines = [], [], []

    # C5 — fleet: generic endpoint must NOT serve real slots
    if SLOTS_MARK in generic_result and UNAVAIL_MARK not in generic_result:
        fails.append("C5 generic endpoint /retell/get-slots returned REAL slots (EG-default footgun is back!)")
        lines.append("  [FAIL] C5 generic endpoint serves real slots — should be 'unavailable'")
    else:
        lines.append("  [PASS] C5 generic endpoint returns safe 'unavailable' (no silent default)")

    if agent_id:
        # Onboarding gate: check exactly the agent provision-inbound just created/found.
        a = retell(f"/get-agent/{agent_id}")
        a.setdefault("agent_id", agent_id)
        a.setdefault("agent_name", a.get("agent_name", agent_id))
        agents = [a]
    else:
        agents = discover_inbound_agents()
        if only:
            agents = [a for a in agents if (only.lower() in a["agent_name"].lower())]
            if not agents:
                print(f"FATAL: no live inbound agent matches --centre '{only}'"); sys.exit(2)

    for a in agents:
        name = a["agent_name"]
        url = slot_tool_url(llm_id_of(a))
        centre = centre_from_url(url)
        tag = f"{name} ({a['agent_id']})"

        if centre is None:
            fails.append(f"C1 {name}: get_tour_slots URL is GENERIC ({url!r}) -> will default to EG")
            lines.append(f"  [FAIL] C1 {tag}: generic slot URL {url!r}")
            continue
        lines.append(f"  [PASS] C1 {tag}: routes to /{centre}")

        # C2 cached
        c = cache.get(centre)
        if not c or not c.get("total_slots"):
            fails.append(f"C2 {name}: centre '{centre}' not cached / 0 slots in calendar_api")
            lines.append(f"  [FAIL] C2 {tag}: '{centre}' not cached or empty")
            continue
        lines.append(f"  [PASS] C2 {tag}: '{centre}' cached ({c['total_slots']} slots)")

        # C3 real slots via the exact endpoint the agent calls
        try:
            s = cal_slots(centre)
        except Exception as e:
            fails.append(f"C3 {name}: endpoint error for '{centre}': {e}")
            lines.append(f"  [FAIL] C3 {tag}: endpoint error {e}"); continue
        if SLOTS_MARK not in s:
            fails.append(f"C3 {name}: '{centre}' returned no real slots ({s[:50]!r})")
            lines.append(f"  [FAIL] C3 {tag}: no real slots")
            continue
        lines.append(f"  [PASS] C3 {tag}: serves real slots")

        # C4 distinct-from-EG canary (skip for EG itself)
        if centre != EG_KEY:
            if s.strip() == eg_slots.strip():
                fails.append(f"C4 {name}: '{centre}' slots are IDENTICAL to EG — likely defaulting to EG")
                lines.append(f"  [FAIL] C4 {tag}: slots identical to EG (default leak)")
            else:
                lines.append(f"  [PASS] C4 {tag}: slots distinct from EG")

    scope = (f"--agent {agent_id}" if agent_id else
             f"--centre {only}" if only else f"{len(agents)} live inbound agents")
    print(f"Slot routing check — {scope}, calendar_api={CAL}\n")
    print("\n".join(lines))
    for w in warns:
        print(f"\n  WARN  {w}")
    if fails:
        print(f"\nRESULT: FAIL ({len(fails)} issue(s))")
        for f in fails:
            print(f"  - {f}")
        sys.exit(1)
    print(f"\nRESULT: PASS")
    sys.exit(0)

if __name__ == "__main__":
    main()
