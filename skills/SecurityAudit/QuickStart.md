# SecurityAudit QuickStart Guide

## What This Skill Does

The SecurityAudit skill installs an automated security vulnerability scanner on your DigitalOcean droplet. It runs hourly, checks for security issues, and emails you only when problems are found.

**Key Features:**
- Runs automatically every hour via systemd
- Read-only operation (never modifies your system)
- Email alerts only when vulnerabilities detected
- Uses Lynis, an industry-standard security auditing tool

---

## What Lynis Checks

The security scanner examines eight critical security domains:

| Domain | What It Checks |
|--------|---------------|
| **Outdated Packages** | System packages with available security updates, vulnerable package versions |
| **Open Ports** | Unexpected listening services, exposed network interfaces |
| **SSH Configuration** | PermitRootLogin, PasswordAuthentication, protocol version, weak ciphers |
| **Unpatched CVEs** | Known vulnerabilities in installed packages from vulnerability databases |
| **File Permissions** | World-writable files, improper SUID/SGID bits, sudo configuration |
| **Running Services** | Unnecessary daemons, vulnerable services, disabled security services |
| **Firewall Rules** | ufw/iptables configuration, open ports without firewall rules |
| **User Accounts** | Accounts without passwords, unused accounts, weak configurations |

**Note:** Lynis performs 200+ individual tests grouped into these domains.

---

## Expected First-Run Experience

### Installation (~2 minutes)

1. Lynis installs via apt package manager
2. Wrapper script created at `/usr/local/bin/security-audit-wrapper.sh`
3. Systemd service and timer configured
4. Timer starts immediately

### First Scan (~3-5 minutes)

Within 5 minutes of installation, the first scan runs automatically. You will likely receive an email because:

- Most fresh systems have some recommendations
- Default configurations often have hardening suggestions
- Package updates may be available

**This is normal.** Warnings and suggestions on first scan do not indicate a compromised system.

### Ongoing Operation

- Scans run hourly (configurable)
- Emails sent ONLY when new findings detected
- Clean scans produce no email (silent operation)
- Logs retained for 30 days at `/var/log/lynis/`

---

## Interpreting Results

### Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **Warnings** | Security issues requiring attention | Review and remediate when possible |
| **Suggestions** | Hardening recommendations | Implement based on your threat model |

### Common Findings (Normal)

These findings are common on new systems and not critical:

- "Configure minimum password age" - Password policy tuning
- "Configure maximum password age" - Password policy tuning
- "Install a PAM module for password strength" - Optional hardening
- "Enable firewall logging" - Optional auditing
- "Disable USB storage if not needed" - Depends on use case

### Findings That Need Attention

These should be investigated promptly:

- "SSH permits root login" - Security risk, should disable
- "SSH permits password authentication" - Use keys instead
- "Found world-writable file" - Check if intentional
- "Found vulnerable package version" - Update the package
- "Firewall not enabled" - Enable ufw/iptables

### Hardening Index

Lynis calculates a hardening score (0-100):
- **80-100**: Well hardened
- **60-79**: Average security
- **Below 60**: Needs improvement

---

## Troubleshooting

### No Emails Received

1. **Check if scan ran:**
   ```bash
   journalctl -u security-audit.service -n 20
   ```

2. **Check for findings:**
   ```bash
   LATEST=$(ls -t /var/log/lynis/report-*.dat | head -1)
   grep "^warning\[\]\|^suggestion\[\]" "$LATEST" | wc -l
   ```
   If count is 0, no findings = no email (correct behavior).

3. **Check email configuration:**
   ```bash
   systemctl show security-audit.service | grep EMAIL
   ```

4. **Verify sendmail/mail is installed:**
   ```bash
   which sendmail || which mail
   ```

### Timer Not Running

```bash
# Check timer status
systemctl status security-audit.timer

# Check next run time
systemctl list-timers security-audit.timer

# Restart timer if needed
sudo systemctl restart security-audit.timer
```

### Scan Fails

```bash
# View full log
journalctl -u security-audit.service -e

# Check Lynis directly
sudo lynis audit system --cronjob --quiet
```

### Too Many Emails

If you receive too many emails, you can:

1. **Skip specific tests:**
   ```bash
   echo "skip-test=TEST-ID" | sudo tee -a /etc/lynis/custom.prf
   ```

2. **Change frequency to daily:**
   ```bash
   sudo systemctl edit security-audit.timer
   # Add: OnCalendar=daily
   ```

3. **Review and fix underlying issues** (recommended)

---

## Quick Reference

| Item | Location |
|------|----------|
| Wrapper Script | `/usr/local/bin/security-audit-wrapper.sh` |
| Systemd Service | `/etc/systemd/system/security-audit.service` |
| Systemd Timer | `/etc/systemd/system/security-audit.timer` |
| Scan Logs | `/var/log/lynis/report-*.dat` |
| Lynis Database | `/var/lib/lynis/` |
| Custom Profile | `/etc/lynis/custom.prf` (create if needed) |

## Commands

| Action | Command |
|--------|---------|
| Check timer status | `systemctl list-timers security-audit.timer` |
| Run manual scan | `sudo systemctl start security-audit.service` |
| View latest log | `journalctl -u security-audit.service -n 50` |
| View latest report | `cat $(ls -t /var/log/lynis/report-*.dat \| head -1)` |
| Stop timer | `sudo systemctl stop security-audit.timer` |
| Disable permanently | `sudo systemctl disable security-audit.timer` |

---

## Need Help?

Use these skill commands:
- `run security scan` - Immediate manual scan
- `view scan results` - See latest findings
- `configure security audit` - Change settings
- `uninstall security audit` - Remove the system
