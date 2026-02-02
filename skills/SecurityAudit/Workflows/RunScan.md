# RunScan Workflow

Run an immediate security scan (outside the hourly schedule).

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Running security vulnerability scan"}' \
  > /dev/null 2>&1 &
```

Running the **RunScan** workflow in the **SecurityAudit** skill to perform immediate vulnerability scan...

## Execute Manual Scan

```bash
sudo systemctl start security-audit.service
```

## Monitor Progress

```bash
journalctl -u security-audit.service -f
```

(Press Ctrl+C to stop following)

## View Summary

```bash
journalctl -u security-audit.service -n 20 --no-pager
```

## Check for Findings

```bash
# Get latest report file
LATEST_REPORT=$(ls -t /var/log/lynis/report-*.dat 2>/dev/null | head -1)

if [ -n "${LATEST_REPORT}" ]; then
    echo "Latest report: ${LATEST_REPORT}"
    echo ""

    # Count findings
    WARNINGS=$(grep "^warning\[\]=" "${LATEST_REPORT}" | wc -l)
    SUGGESTIONS=$(grep "^suggestion\[\]=" "${LATEST_REPORT}" | wc -l)

    echo "Results:"
    echo "  Warnings: ${WARNINGS}"
    echo "  Suggestions: ${SUGGESTIONS}"
    echo "  Total: $((WARNINGS + SUGGESTIONS))"
    echo ""

    if [ $((WARNINGS + SUGGESTIONS)) -gt 0 ]; then
        echo "Top warnings:"
        grep "^warning\[\]=" "${LATEST_REPORT}" | sed 's/warning\[\]=/  - /' | head -5
        echo ""
        echo "For full results: cat ${LATEST_REPORT} | grep 'warning\[\]\|suggestion\[\]'"
    else
        echo "✅ No vulnerabilities detected"
    fi
else
    echo "No report files found. Scan may still be running."
fi
```

## Expected Output

```
[timestamp] Running Lynis security audit...
[timestamp] Scan complete: X warnings, Y suggestions
[timestamp] Email sent to user@example.com
```

Or if no findings:
```
[timestamp] Running Lynis security audit...
[timestamp] Scan complete: 0 warnings, 0 suggestions
[timestamp] No findings - no email sent
```

## Scan Complete

The manual scan has finished. If vulnerabilities were found, an email was sent to the configured address.
