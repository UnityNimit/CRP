$Base = "http://localhost:8080/api/v1"
$passed = 0
$failed = 0

function Assert($name, $cond, $detail = "") {
    if ($cond) { Write-Host "PASS: $name"; $script:passed++ }
    else { Write-Host "FAIL: $name $detail"; $script:failed++ }
}

function Login($email, $password) {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$Base/auth/login" -Method POST -Body $body -ContentType "application/json"
    return $r.token
}

function AuthHeaders($token) {
    return @{ Authorization = "Bearer $token" }
}

# Use legacy admin (team admins seed only when DB has zero admins)
$adminToken = Login "admin@campus.edu" "password123"

# Ensure company can post
try {
    $companyToken = Login "hr@techcorp.com" "password123"
} catch {
    Invoke-RestMethod -Uri "$Base/admin/companies/1/approve" -Method POST -Headers (AuthHeaders $adminToken) | Out-Null
    $companyToken = Login "hr@techcorp.com" "password123"
}

$studentToken = Login "alice@student.edu" "password123"
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$deadline = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")

# 1. Create draft
$createBody = @{
    title = "Rev Test Role $ts"
    description = "Original description"
    minCgpa = 7.5
    allowedBranches = @("CSE", "IT")
    gradYear = 2026
    deadline = $deadline
    submit = $false
} | ConvertTo-Json -Depth 5

$draft = Invoke-RestMethod -Uri "$Base/postings" -Method POST -Body $createBody -ContentType "application/json" -Headers (AuthHeaders $companyToken)
Assert "Create draft" ($draft.status -eq "DRAFT") "got $($draft.status)"

# 2. Submit for review
$submitted = Invoke-RestMethod -Uri "$Base/postings/$($draft.id)/submit" -Method POST -Headers (AuthHeaders $companyToken)
Assert "Submit to PENDING_REVIEW" ($submitted.status -eq "PENDING_REVIEW") "got $($submitted.status)"

# 3. Admin requests revision
$revBody = @{ comment = "Please update the job description with more detail." } | ConvertTo-Json
$revised = Invoke-RestMethod -Uri "$Base/postings/$($draft.id)/request-revision" -Method POST -Body $revBody -ContentType "application/json" -Headers (AuthHeaders $adminToken)
Assert "Request revision" ($revised.status -eq "NEEDS_REVISION") "got $($revised.status)"

# 4. Company updates and resubmits
$updateBody = @{
    title = "Rev Test Role $ts (Updated)"
    description = "Updated description with more detail"
    minCgpa = 8.0
    allowedBranches = @("CSE", "IT", "ECE")
    gradYear = 2026
    deadline = $deadline
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri "$Base/postings/$($draft.id)" -Method PUT -Body $updateBody -ContentType "application/json" -Headers (AuthHeaders $companyToken) | Out-Null
$resubmitted = Invoke-RestMethod -Uri "$Base/postings/$($draft.id)/submit" -Method POST -Headers (AuthHeaders $companyToken)
Assert "Resubmit" ($resubmitted.status -eq "PENDING_REVIEW" -and $null -ne $resubmitted.resubmittedAt) "status=$($resubmitted.status)"

# 5. Admin sees field changes
$adminView = Invoke-RestMethod -Uri "$Base/postings/admin?page=0&size=50" -Headers (AuthHeaders $adminToken)
$inQueue = $adminView.content | Where-Object { $_.id -eq $draft.id }
Assert "Admin queue has posting" ($null -ne $inQueue)
Assert "Field changes present" ($inQueue.fieldChanges.Count -gt 0) "count=$($inQueue.fieldChanges.Count)"

# 6. Approve
$approved = Invoke-RestMethod -Uri "$Base/postings/$($draft.id)/approve" -Method POST -Headers (AuthHeaders $adminToken)
Assert "Approve" ($approved.status -eq "APPROVED") "got $($approved.status)"

# 7. Student visibility - only APPROVED
$studentList = Invoke-RestMethod -Uri "$Base/postings?page=0&size=100" -Headers (AuthHeaders $studentToken)
$visible = $studentList.content | Where-Object { $_.id -eq $draft.id }
Assert "Approved posting visible to students" ($null -ne $visible)

# 8. Draft not visible
$draft2Body = @{
    title = "Hidden Draft $ts"
    description = "Should not appear"
    minCgpa = 7.0
    allowedBranches = @("CSE")
    gradYear = 2026
    deadline = $deadline
    submit = $false
} | ConvertTo-Json -Depth 5
$draft2 = Invoke-RestMethod -Uri "$Base/postings" -Method POST -Body $draft2Body -ContentType "application/json" -Headers (AuthHeaders $companyToken)
$studentList2 = Invoke-RestMethod -Uri "$Base/postings?page=0&size=100" -Headers (AuthHeaders $studentToken)
$hidden = $studentList2.content | Where-Object { $_.id -eq $draft2.id }
Assert "Draft not visible to students" ($null -eq $hidden)

# 9. Illegal transition returns 409
try {
    Invoke-RestMethod -Uri "$Base/postings/$($draft2.id)/approve" -Method POST -Headers (AuthHeaders $adminToken)
    Assert "Illegal approve on DRAFT returns 409" $false
} catch {
    Assert "Illegal approve on DRAFT returns 409" ($_.Exception.Response.StatusCode.value__ -eq 409)
}

Write-Host "`n=== Results: $passed passed, $failed failed ==="
if ($failed -gt 0) { exit 1 }
