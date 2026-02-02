# Uninstall Workflow

Remove the SecurityAudit system from the droplet.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Uninstalling SecurityAudit system"}' \
  > /dev/null 2>&1 &
```

Running the **Uninstall** workflow in the **SecurityAudit** skill to remove security scanning...

## Step 1: Stop and Disable Timer

```bash
sudo systemctl stop security-audit.timer
sudo systemctl disable security-audit.timer
```

## Step 2: Stop Service

```bash
sudo systemctl stop security-audit.service
sudo systemctl disable security-audit.service
```

## Step 3: Remove Systemd Units

```bash
sudo rm /etc/systemd/system/security-audit.service
sudo rm /etc/systemd/system/security-audit.timer
```

## Step 4: Remove Wrapper Script

```bash
sudo rm /usr/local/bin/security-audit-wrapper.sh
```

## Step 5: Reload Systemd

```bash
sudo systemctl daemon-reload
sudo systemctl reset-failed
```

## Step 6: (Optional) Remove Lynis

If you no longer need Lynis for other purposes:

```bash
sudo apt remove lynis -y
sudo apt autoremove -y
```

## Step 7: (Optional) Remove Logs

If you want to clean up scan logs:

```bash
sudo rm -rf /var/log/lynis/
```

⚠️ **Warning:** This deletes historical scan data.

## Verification

Confirm removal:

```bash
# Verify timer is gone
systemctl list-timers | grep security-audit

# Verify service is gone
systemctl list-unit-files | grep security-audit

# Verify wrapper is removed
ls -la /usr/local/bin/security-audit-wrapper.sh
```

All commands should return empty or "No such file or directory".

## Uninstall Complete

The SecurityAudit system has been removed from your droplet.

**What was removed:**
- ✅ Systemd timer (hourly trigger)
- ✅ Systemd service
- ✅ Wrapper script
- ✅ (Optional) Lynis package
- ✅ (Optional) Scan logs
