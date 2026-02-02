# Configure Workflow

Configure SecurityAudit system settings.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Configuring SecurityAudit system"}' \
  > /dev/null 2>&1 &
```

Running the **Configure** workflow in the **SecurityAudit** skill to modify settings...

## Configuration Options

### Change Email Address

```bash
sudo systemctl edit security-audit.service
```

Modify:
```ini
[Service]
Environment="EMAIL_TO=new-email@example.com"
Environment="EMAIL_FROM=security-audit@your-domain.com"
```

Reload:
```bash
sudo systemctl daemon-reload
sudo systemctl restart security-audit.timer
```

### Change Scan Frequency

Edit timer unit:
```bash
sudo systemctl edit security-audit.timer
```

Modify frequency (examples):

**Every 2 hours:**
```ini
[Timer]
OnUnitActiveSec=2h
```

**Every 30 minutes:**
```ini
[Timer]
OnUnitActiveSec=30min
```

**Daily at 2 AM:**
```ini
[Timer]
OnCalendar=daily
OnCalendar=02:00
```

Reload:
```bash
sudo systemctl daemon-reload
sudo systemctl restart security-audit.timer
```

Verify:
```bash
systemctl list-timers security-audit.timer
```

### Customize Wrapper Script

Edit the wrapper to add custom checks or modify email format:

```bash
sudo nano /usr/local/bin/security-audit-wrapper.sh
```

After changes:
```bash
sudo chmod +x /usr/local/bin/security-audit-wrapper.sh
```

Test:
```bash
sudo /usr/local/bin/security-audit-wrapper.sh
```

### Add Custom Lynis Configuration

Create Lynis custom profile:
```bash
sudo tee /etc/lynis/custom.prf > /dev/null <<'EOF'
# Custom Lynis configuration
# Skip certain tests if needed
skip-test=FILE-6310  # Example: skip specific test
EOF
```

Update wrapper to use custom profile:
```bash
sudo nano /usr/local/bin/security-audit-wrapper.sh
```

Change:
```bash
${LYNIS_BIN} audit system --cronjob --quiet --report-file "${REPORT_FILE}"
```

To:
```bash
${LYNIS_BIN} audit system --cronjob --quiet --profile /etc/lynis/custom.prf --report-file "${REPORT_FILE}"
```

### View Current Configuration

```bash
# Timer configuration
systemctl cat security-audit.timer

# Service configuration
systemctl cat security-audit.service

# Next scheduled run
systemctl list-timers security-audit.timer

# Environment variables
systemctl show security-audit.service | grep Environment
```

## Configuration Complete

Settings have been updated. Verify changes with:

```bash
sudo systemctl status security-audit.timer
systemctl list-timers security-audit.timer
```
