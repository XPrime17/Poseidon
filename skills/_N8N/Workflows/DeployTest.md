# DeployTest — Push Changes to n8n Test Workflow

## When to Use
- User wants to deploy workflow changes for review
- New n8n nodes need to be pushed to a test environment
- Creating a test clone of a production workflow

## Prerequisites
- `N8N_API_KEY` must be set in `/root/.env`
- Target test workflow must exist (or will be created)
- Know which production workflow to base from

## API Reference

```
BASE_URL = https://xprime17.app.n8n.cloud/api/v1
AUTH_HEADER = X-N8N-API-KEY: $N8N_API_KEY
```

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List workflows | GET | `/workflows` |
| Get workflow | GET | `/workflows/{id}` |
| Create workflow | POST | `/workflows` |
| Update workflow | PUT | `/workflows/{id}` |
| Activate | POST | `/workflows/{id}/activate` |
| Deactivate | POST | `/workflows/{id}/deactivate` |

**Important:** n8n cloud uses PUT (not PATCH) for updates. The PUT body MUST include `name`, `nodes`, `connections`, and `settings`.

## Workflow Steps

### Step 1: Load Environment
```bash
source /root/.env
```

### Step 2: Fetch Current Test Workflow
```bash
curl -s "https://xprime17.app.n8n.cloud/api/v1/workflows/{WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" > /tmp/n8n-current.json
```

### Step 3: Prepare New Nodes
Build new n8n nodes as JSON objects. Each node needs:
- `id` — unique identifier
- `name` — display name
- `type` — n8n node type (e.g., `n8n-nodes-base.if`, `n8n-nodes-base.gmail`)
- `typeVersion` — version number
- `position` — `[x, y]` array for canvas placement
- `parameters` — node-specific config
- `credentials` — if the node needs auth (use IDs from Credentials Registry in SKILL.md)

### Step 4: Create Sticky Note (MANDATORY)
**Every deployment MUST wrap new nodes in a sticky note.** The sticky note serves as a visual changelog for Scott's review.

```json
{
  "id": "sticky-{feature-slug}",
  "name": "Sticky Note: {Feature Name}",
  "type": "n8n-nodes-base.stickyNote",
  "typeVersion": 1,
  "position": [x - 60, y - 110],
  "parameters": {
    "content": "## {emoji} {Feature Name} (NEW)\n\n**Added:** {YYYY-MM-DD}\n**Issue:** #{issue_number} - {issue_title}\n\n**What it does:**\n{description_of_what_nodes_do}\n\n**Nodes added:**\n- {node_1_name}\n- {node_2_name}\n\n**To deploy:** Copy these nodes + this sticky note to the production workflow.",
    "width": 580,
    "height": 280,
    "color": 4
  }
}
```

**Sticky note positioning:** Place the sticky note at `[leftmost_node_x - 60, topmost_node_y - 110]` so it visually wraps all new nodes.

**Color codes:** 1=blue, 2=green, 3=yellow, 4=orange, 5=red, 6=pink, 7=purple

### Step 5: Add to Workflow
Using Python (preferred for JSON manipulation):

```python
import json

# Load current workflow
with open('/tmp/n8n-current.json') as f:
    workflow = json.load(f)

# Add new nodes + sticky note
workflow['nodes'].extend([new_node_1, new_node_2, sticky_note])

# Add connections
workflow['connections']['Source Node'] = {
    "main": [[{"node": "Target Node", "type": "main", "index": 0}]]
}

# Build PUT payload (MUST include name)
payload = {
    "name": workflow['name'],
    "nodes": workflow['nodes'],
    "connections": workflow['connections'],
    "settings": workflow.get('settings', {"executionOrder": "v1"})
}

with open('/tmp/n8n-update.json', 'w') as f:
    json.dump(payload, f)
```

### Step 6: Push to n8n Cloud
```bash
source /root/.env && curl -s -X PUT \
  "https://xprime17.app.n8n.cloud/api/v1/workflows/{WORKFLOW_ID}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/n8n-update.json > /tmp/n8n-response.json
```

### Step 7: Verify and Report
After push, verify:
1. Response status is 200
2. Node count matches expected
3. Sticky note is present
4. New connections are wired correctly

Report to Scott:
- Test workflow URL: `https://xprime17.app.n8n.cloud/workflow/xYZhARzmBwQYhtRA`
- Number of nodes added
- Sticky note summary
- Reminder: "Review in n8n, then manually copy to production when ready"

## Quality Gates

- [ ] New nodes have unique IDs
- [ ] Sticky note wraps all new nodes visually
- [ ] Sticky note describes what was added, when, and why
- [ ] PUT payload includes `name`, `nodes`, `connections`, `settings`
- [ ] Test workflow remains inactive
- [ ] No production workflow was modified
- [ ] Credentials use IDs from the registry (not hardcoded names)

## Creating a New Test Workflow (Clone)

If no test workflow exists yet:

```bash
# GET production workflow
curl -s "https://xprime17.app.n8n.cloud/api/v1/workflows/{PROD_ID}" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" > /tmp/n8n-prod.json

# Create clone via POST
python3 -c "
import json
with open('/tmp/n8n-prod.json') as f:
    wf = json.load(f)
payload = {
    'name': '[TEST] ' + wf['name'],
    'nodes': wf['nodes'],
    'connections': wf['connections'],
    'settings': wf.get('settings', {'executionOrder': 'v1'})
}
with open('/tmp/n8n-clone.json', 'w') as f:
    json.dump(payload, f)
"

curl -s -X POST "https://xprime17.app.n8n.cloud/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/n8n-clone.json
```
