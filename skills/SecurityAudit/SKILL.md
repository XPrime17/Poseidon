---
name: SecurityAudit
description: Hourly automated security vulnerability scanner for DigitalOcean droplets AND Moltbot/Clawdbot. USE WHEN security audit, vulnerability scan, droplet security, scan server, security monitoring, vulnerability assessment, security check, moltbot security, bot security, OR configure security scanning.
---

# SecurityAudit

Automated hourly security vulnerability scanning for DigitalOcean droplets running as systemd service.

## Customization

**Before executing, check for user customizations at:**
`~/.claude/skills/PAI/USER/SKILLCUSTOMIZATIONS/SecurityAudit/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.

## 🚨 MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)

**You MUST send this notification BEFORE doing anything else when this skill is invoked.**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:8888/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the SecurityAudit skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **SecurityAudit** skill to ACTION...
   ```

**This is not optional. Execute this curl command immediately upon skill invocation.**

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Install** | "install security audit", "set up security scanning" | `Workflows/Install.md` |
| **Configure** | "configure security audit", "change scan settings" | `Workflows/Configure.md` |
| **RunScan** | "run security scan", "scan now", "check vulnerabilities" | `Workflows/RunScan.md` |
| **ViewResults** | "show scan results", "view vulnerabilities", "security report" | `Workflows/ViewResults.md` |
| **MoltbotAudit** | "moltbot security", "bot security audit", "scan moltbot" | `Workflows/MoltbotAudit.md` |
| **Uninstall** | "remove security audit", "uninstall scanner" | `Workflows/Uninstall.md` |

## Scanner Capabilities

The security audit scanner checks:
- **Outdated packages** - System packages with available security updates
- **Open ports** - Unexpected listening services
- **SSH configuration** - Weak settings (PermitRootLogin, PasswordAuthentication)
- **Unpatched CVEs** - Known vulnerabilities in installed packages
- **File permissions** - World-writable files, improper sudo config
- **Running services** - Unnecessary or vulnerable services
- **Firewall rules** - ufw/iptables configuration weaknesses
- **User accounts** - Accounts without passwords, weak configurations

## How It Works

**Scanner:** Lynis (industry-standard security auditing tool)
**Frequency:** Hourly via systemd timer
**Mode:** Read-only (no automated remediation)
**Notifications:** Email sent only when vulnerabilities detected

**System Architecture:**
```
systemd timer (hourly)
  ↓
wrapper script
  ↓
lynis audit system
  ↓
parse results → if findings → send email
```

## Examples

**Example 1: Install security scanning**
```
User: "Install the security audit system"
→ Invokes Install workflow
→ Installs Lynis via apt
→ Creates systemd service and timer
→ Creates email wrapper script
→ Enables and starts timer
→ Confirms hourly scanning active
```

**Example 2: Run immediate scan**
```
User: "Run a security scan now"
→ Invokes RunScan workflow
→ Executes lynis audit system
→ Displays findings summary
→ Reports vulnerability count
```

**Example 3: View last scan results**
```
User: "Show me the latest security scan results"
→ Invokes ViewResults workflow
→ Reads latest Lynis log
→ Formats findings for readability
→ Highlights critical issues
```

## Quick Reference

- **Lynis Database:** `/var/lib/lynis/`
- **Scan Logs:** `/var/log/lynis/`
- **Service:** `security-audit.service`
- **Timer:** `security-audit.timer`
- **Wrapper Script:** `/usr/local/bin/security-audit-wrapper.sh`
- **Email Config:** Set in wrapper script or user customization
