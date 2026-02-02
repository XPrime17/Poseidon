# Install Workflow

Install the SecurityAudit system on the DigitalOcean droplet.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Installing SecurityAudit system"}' \
  > /dev/null 2>&1 &
```

Running the **Install** workflow in the **SecurityAudit** skill to set up hourly vulnerability scanning...

## Prerequisites

- Root or sudo access
- Ubuntu/Debian-based system
- Email server configured (or configure SMTP in wrapper)

## Step 1: Install Lynis

```bash
sudo apt update && sudo apt install lynis -y
```

Verify installation:
```bash
lynis --version
```

## Step 2: Create Wrapper Script

Create `/usr/local/bin/security-audit-wrapper.sh`:

```bash
sudo tee /usr/local/bin/security-audit-wrapper.sh > /dev/null <<'EOF'
#!/bin/bash
#
# security-audit-wrapper.sh
# Runs Lynis security audit and emails findings
#

set -euo pipefail

LYNIS_BIN="/usr/bin/lynis"
LOG_DIR="/var/log/lynis"
REPORT_FILE="${LOG_DIR}/report-$(date +%Y%m%d-%H%M%S).dat"
EMAIL_TO="${EMAIL_TO:-root@localhost}"
EMAIL_FROM="${EMAIL_FROM:-security-audit@localhost}"
HOSTNAME="$(hostname)"

# Ensure log directory exists
mkdir -p "${LOG_DIR}"

# Run Lynis audit
echo "[$(date)] Running Lynis security audit..." | systemd-cat -t security-audit -p info
${LYNIS_BIN} audit system --cronjob --quiet --report-file "${REPORT_FILE}"

# Parse results
WARNINGS=$(grep "^warning\[\]=" "${REPORT_FILE}" | wc -l)
SUGGESTIONS=$(grep "^suggestion\[\]=" "${REPORT_FILE}" | wc -l)
TOTAL_FINDINGS=$((WARNINGS + SUGGESTIONS))

echo "[$(date)] Scan complete: ${WARNINGS} warnings, ${SUGGESTIONS} suggestions" | systemd-cat -t security-audit -p info

# Send email only if findings exist
if [ "${TOTAL_FINDINGS}" -gt 0 ]; then
    TEMP_MAIL=$(mktemp)

    cat > "${TEMP_MAIL}" <<EMAILEOF
Subject: [Security Alert] ${TOTAL_FINDINGS} vulnerabilities found on ${HOSTNAME}
From: ${EMAIL_FROM}
To: ${EMAIL_TO}

Security Audit Report for ${HOSTNAME}
Generated: $(date)

SUMMARY:
  Warnings: ${WARNINGS}
  Suggestions: ${SUGGESTIONS}
  Total Findings: ${TOTAL_FINDINGS}

WARNINGS:
$(grep "^warning\[\]=" "${REPORT_FILE}" | sed 's/warning\[\]=/  - /' | head -20)

SUGGESTIONS:
$(grep "^suggestion\[\]=" "${REPORT_FILE}" | sed 's/suggestion\[\]=/  - /' | head -20)

Full report: ${REPORT_FILE}

---
Automated SecurityAudit System
EMAILEOF

    # Send email (adjust for your SMTP setup)
    # Option 1: Using sendmail (if installed)
    if command -v sendmail &> /dev/null; then
        sendmail -t < "${TEMP_MAIL}"
        echo "[$(date)] Email sent to ${EMAIL_TO}" | systemd-cat -t security-audit -p info
    # Option 2: Using mail command (if installed)
    elif command -v mail &> /dev/null; then
        cat "${TEMP_MAIL}" | mail -s "[Security Alert] ${TOTAL_FINDINGS} vulnerabilities on ${HOSTNAME}" "${EMAIL_TO}"
        echo "[$(date)] Email sent to ${EMAIL_TO}" | systemd-cat -t security-audit -p info
    else
        echo "[$(date)] WARNING: No mail command available. Install sendmail or mail." | systemd-cat -t security-audit -p warning
    fi

    rm -f "${TEMP_MAIL}"
else
    echo "[$(date)] No findings - no email sent" | systemd-cat -t security-audit -p info
fi

# Keep only last 30 days of reports
find "${LOG_DIR}" -name "report-*.dat" -mtime +30 -delete

exit 0
EOF
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/security-audit-wrapper.sh
```

## Step 3: Create Systemd Service

Create `/etc/systemd/system/security-audit.service`:

```bash
sudo tee /etc/systemd/system/security-audit.service > /dev/null <<'EOF'
[Unit]
Description=Security Audit Scanner
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/local/bin/security-audit-wrapper.sh
User=root
StandardOutput=journal
StandardError=journal

# Email configuration (customize these)
Environment="EMAIL_TO=root@localhost"
Environment="EMAIL_FROM=security-audit@localhost"

# Sandboxing (read-only mode enforcement)
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/log/lynis
ReadOnlyPaths=/

[Install]
WantedBy=multi-user.target
EOF
```

## Step 4: Create Systemd Timer

Create `/etc/systemd/system/security-audit.timer`:

```bash
sudo tee /etc/systemd/system/security-audit.timer > /dev/null <<'EOF'
[Unit]
Description=Hourly Security Audit Timer
Requires=security-audit.service

[Timer]
OnBootSec=5min
OnUnitActiveSec=1h
AccuracySec=1min
Persistent=true

[Install]
WantedBy=timers.target
EOF
```

## Step 5: Configure Email (REQUIRED)

Edit the service to set your actual email address:

```bash
sudo systemctl edit security-audit.service
```

Add:
```ini
[Service]
Environment="EMAIL_TO=your-email@example.com"
Environment="EMAIL_FROM=security-audit@your-droplet.com"
```

Save and exit.

## Step 6: Enable and Start

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable timer to start on boot
sudo systemctl enable security-audit.timer

# Start timer now
sudo systemctl start security-audit.timer

# Verify timer is active
sudo systemctl status security-audit.timer
```

## Step 7: Verify Installation

Check timer schedule:
```bash
systemctl list-timers security-audit.timer
```

Run manual test:
```bash
sudo systemctl start security-audit.service
journalctl -u security-audit.service -n 50
```

## Installation Complete

The SecurityAudit system is now:
- ✅ Installed and configured
- ✅ Running hourly via systemd timer
- ✅ Sending email alerts on findings only
- ✅ Operating in read-only mode (no remediation)

**Next steps:**
- Wait for first automated scan (within 1 hour)
- Or run manual scan: `sudo systemctl start security-audit.service`
- View results: See ViewResults workflow
