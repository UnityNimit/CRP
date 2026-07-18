$Base = "http://localhost:8080/api/v1"
$passed = 0
$failed = 0

function Assert($name, $cond, $detail = "") {
    if ($cond) { Write-Host "PASS: $name"; $script:passed++ }
    else { Write-Host "FAIL: $name $detail"; $script:failed++ }
}

$admin = Invoke-RestMethod -Uri "$Base/auth/login" -Method POST -Body '{"email":"admin@campus.edu","password":"password123"}' -ContentType "application/json"
$hA = @{ Authorization = "Bearer $($admin.token)" }

# Trust score for TechCorp (company id 1)
$trust = Invoke-RestMethod -Uri "$Base/admin/companies/1/trust-score" -Headers $hA
Assert "Trust score endpoint returns companyName" ($null -ne $trust.companyName)
Assert "Trust score has riskLevel" ($trust.riskLevel -in @('HIGH','MEDIUM','LOW','UNKNOWN'))
Assert "Trust score has summary" ($null -ne $trust.summary)

if ($trust.sampleOk) {
    Assert "Sample ok has ghostRate" ($null -ne $trust.ghostRate)
    Assert "Sample ok has trustScore" ($null -ne $trust.trustScore)
} else {
    Assert "Thin history is UNKNOWN" ($trust.riskLevel -eq 'UNKNOWN')
}

# Analytics leaderboard
$analytics = Invoke-RestMethod -Uri "$Base/admin/analytics/summary" -Headers $hA
Assert "Analytics has ghostLeaderboard" ($null -ne $analytics.ghostLeaderboard)

# Admin pending includes companyTrust
$pending = Invoke-RestMethod -Uri "$Base/postings/admin?page=0&size=5" -Headers $hA
if ($pending.content.Count -gt 0) {
    Assert "Pending posting has companyTrust" ($null -ne $pending.content[0].companyTrust)
    Assert "Pending trust matches company" ($pending.content[0].companyTrust.companyId -eq $pending.content[0].companyId)
} else {
    Write-Host "SKIP: no pending postings in queue"
}

Write-Host "`n=== Results: $passed passed, $failed failed ==="
if ($failed -gt 0) { exit 1 }
