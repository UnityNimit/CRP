$Base = "http://localhost:8080/api/v1"
$passed = 0
$failed = 0

function Assert($name, $cond, $detail = "") {
    if ($cond) { Write-Host "PASS: $name"; $script:passed++ }
    else { Write-Host "FAIL: $name $detail"; $script:failed++ }
}

function Login($email, $password = "password123") {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$Base/auth/login" -Method POST -Body $body -ContentType "application/json"
    return $r.token
}

function AuthHeaders($token) {
    return @{ Authorization = "Bearer $token" }
}

$companyToken = Login "hr@techcorp.com"
$hC = AuthHeaders $companyToken

# Find first posting with applicants
$postings = Invoke-RestMethod -Uri "$Base/postings/company?page=0&size=50" -Headers $hC
$targetPosting = $null
$apps = $null
foreach ($p in $postings.content) {
    $list = Invoke-RestMethod -Uri "$Base/company/postings/$($p.id)/applications?page=0&size=500" -Headers $hC
    if ($list.content.Count -gt 0) {
        $targetPosting = $p
        $apps = $list
        break
    }
}

Assert "Found posting with applicants" ($null -ne $targetPosting) "none found"
if (-not $targetPosting) { exit 1 }

$sample = $apps.content[0]
Assert "Response has studentEmail" ($null -ne $sample.studentEmail -and $sample.studentEmail.Length -gt 0) "email=$($sample.studentEmail)"
Assert "Response has studentCgpa" ($null -ne $sample.studentCgpa) "cgpa=$($sample.studentCgpa)"

# Reset one app to APPLIED then bulk shortlist
$target = $apps.content | Select-Object -First 1
Invoke-RestMethod -Uri "$Base/company/applications/$($target.id)/status" -Method PATCH -Body '{"status":"APPLIED"}' -ContentType "application/json" -Headers $hC | Out-Null

$bulkBody = @{ applicationIds = @($target.id); status = "SHORTLISTED" } | ConvertTo-Json
$bulk = Invoke-RestMethod -Uri "$Base/company/applications/bulk-status" -Method POST -Body $bulkBody -ContentType "application/json" -Headers $hC
Assert "Bulk update succeeds" ($bulk.updated -eq 1) "updated=$($bulk.updated)"

# Student sees shortlisted (carol or alice depending on app)
$studentEmail = $sample.studentEmail
$studentPass = if ($studentEmail -eq "carol@student.edu") { "password123" } else { "password123" }
$studentToken = Login $studentEmail $studentPass
$hS = AuthHeaders $studentToken
$studentApps = Invoke-RestMethod -Uri "$Base/student/applications?page=0&size=50" -Headers $hS
$shortlisted = $studentApps.content | Where-Object { $_.id -eq $target.id -and $_.status -eq "SHORTLISTED" }
Assert "Student sees shortlisted application" ($null -ne $shortlisted)

$csvRows = $apps.content | Where-Object { $_.status -ne "REJECTED" }
$hasColumns = ($csvRows[0].studentName -and $csvRows[0].studentEmail -and $null -ne $csvRows[0].studentCgpa -and $csvRows[0].studentBranch)
Assert "CSV export fields available" $hasColumns

Write-Host "`n=== Results: $passed passed, $failed failed ==="
if ($failed -gt 0) { exit 1 }
