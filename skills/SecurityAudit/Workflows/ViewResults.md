# ViewResults Workflow

View results from the latest security scan.

## Voice Notification

```bash
curl -s -X POST http://localhost:8888/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Viewing security scan results"}' \
  > /dev/null 2>&1 &
```

Running the **ViewResults** workflow in the **SecurityAudit** skill to display latest scan findings...

## Get Latest Report

```bash
LATEST_REPORT=$(ls -t /var/log/lynis/report-*.dat 2>/dev/null | head -1)

if [ -z "${LATEST_REPORT}" ]; then
    echo "No scan reports found. Run a scan first."
    exit 1
fi

echo "Latest Report: ${LATEST_REPORT}"
REPORT_DATE=$(basename "${LATEST_REPORT}" | sed 's/report-\(.*\)\.dat/\1/')
echo "Generated: ${REPORT_DATE}"
echo ""
```

## Display Summary

```bash
# Extract summary statistics
WARNINGS=$(grep "^warning\[\]=" "${LATEST_REPORT}" | wc -l)
SUGGESTIONS=$(grep "^suggestion\[\]=" "${LATEST_REPORT}" | wc -l)
HARDENING_INDEX=$(grep "^hardening_index=" "${LATEST_REPORT}" | cut -d= -f2)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "           SECURITY AUDIT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Hardening Index: ${HARDENING_INDEX:-N/A}"
echo "Warnings:        ${WARNINGS}"
echo "Suggestions:     ${SUGGESTIONS}"
echo "Total Findings:  $((WARNINGS + SUGGESTIONS))"
echo ""
```

## Display Warnings

```bash
if [ "${WARNINGS}" -gt 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "               WARNINGS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    grep "^warning\[\]=" "${LATEST_REPORT}" | sed 's/warning\[\]=//' | nl
    echo ""
fi
```

## Display Suggestions

```bash
if [ "${SUGGESTIONS}" -gt 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "             SUGGESTIONS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    grep "^suggestion\[\]=" "${LATEST_REPORT}" | sed 's/suggestion\[\]=//' | nl | head -20

    if [ "${SUGGESTIONS}" -gt 20 ]; then
        echo ""
        echo "... and $((SUGGESTIONS - 20)) more suggestions"
    fi
    echo ""
fi
```

## Display Tests Summary

```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "            TESTS PERFORMED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Extract test categories and counts
grep "^test_category_" "${LATEST_REPORT}" | sed 's/test_category_//' | while IFS='=' read category count; do
    printf "%-20s %s\n" "${category}:" "${count}"
done
echo ""
```

## Full Report Location

```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Full report available at:"
echo "${LATEST_REPORT}"
echo ""
echo "View warnings only:"
echo "  grep '^warning\[\]=' ${LATEST_REPORT}"
echo ""
echo "View suggestions only:"
echo "  grep '^suggestion\[\]=' ${LATEST_REPORT}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## Results Displayed

The latest security scan results are shown above. Review warnings and suggestions to understand the security posture of your droplet.
