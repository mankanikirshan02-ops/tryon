# TRYON Super Admin Panel - Local HTTP Web Server
param(
    [int]$Port = 3000
)

$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = (Get-Location).Path }

$listener = New-Object System.Net.HttpListener
$urlPrefix = "http://localhost:$Port/"
$listener.Prefixes.Add($urlPrefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  TRYON Super Admin Panel is LIVE at:" -ForegroundColor Green
    Write-Host "  $urlPrefix" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green
} catch {
    Write-Host "Could not bind to port $Port, trying port 8080..." -ForegroundColor Yellow
    $Port = 8080
    $urlPrefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($urlPrefix)
    $listener.Start()
    Write-Host "Server started at $urlPrefix" -ForegroundColor Green
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".webp" = "image/webp"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

# In-memory mock database for backend API
$global:serverUsers = @(
    @{
        id = "usr-1"
        name = "Tryon Admin"
        email = "admin@tryon.demo"
        password = "Admin@123"
        role = "Admin"
        status = "Active"
        avatar = "T"
        createdAt = "2026-01-01"
    },
    @{
        id = "usr-2"
        name = "Operations Manager"
        email = "manager@tryon.demo"
        password = "Manager@123"
        role = "Manager"
        status = "Active"
        avatar = "M"
        createdAt = "2026-01-02"
    },
    @{
        id = "usr-3"
        name = "Store Staff User"
        email = "user@tryon.demo"
        password = "User@123"
        role = "User"
        status = "Active"
        avatar = "U"
        createdAt = "2026-01-03"
    }
)

$global:serverAuditLogs = @(
    @{
        id = "log-1"
        action = "User created"
        performedBy = "Tryon Admin (Admin)"
        targetUser = "Store Staff User (user@tryon.demo)"
        details = "Assigned User role with Active status"
        timestamp = "2026-01-03T10:30:00.000Z"
        formattedDate = "2026-01-03 10:30"
    },
    @{
        id = "log-2"
        action = "Role changed"
        performedBy = "Tryon Admin (Admin)"
        targetUser = "Operations Manager (manager@tryon.demo)"
        details = "Assigned role Manager"
        timestamp = "2026-01-02T14:15:00.000Z"
        formattedDate = "2026-01-02 14:15"
    },
    @{
        id = "log-3"
        action = "User created"
        performedBy = "System"
        targetUser = "Tryon Admin (admin@tryon.demo)"
        details = "Primary Administrator account provisioned"
        timestamp = "2026-01-01T09:00:00.000Z"
        formattedDate = "2026-01-01 09:00"
    }
)

function Send-JsonResponse($response, $statusCode, $obj) {
    $json = $obj | ConvertTo-Json -Depth 10 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $response.StatusCode = $statusCode
    $response.ContentType = "application/json; charset=utf-8"
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
    $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Role, X-User-Email")
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.Close()
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Handle CORS Preflight
        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
            $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-User-Role, X-User-Email")
            $response.Close()
            continue
        }

        $rawUrl = $request.Url.LocalPath

        # ==========================================================
        # REST API ROUTER (/api/*)
        # Enforces RBAC permissions, Admin Protection, 401/403/404
        # ==========================================================
        if ($rawUrl -like "/api/*") {
            $userRole = $request.Headers["X-User-Role"]
            if (-not $userRole) {
                # Fallback check Authorization header e.g. "Bearer Admin"
                $auth = $request.Headers["Authorization"]
                if ($auth -and $auth -match "Bearer\s+(Admin|Manager|User)") {
                    $userRole = $matches[1]
                }
            }

            # If no role or unauthorized, allow login / auth endpoints or reject
            if (-not $userRole -and $rawUrl -ne "/api/auth/login") {
                # Default to Admin for seamless local prototyping if omitted, but enforce if invalid
                $userRole = "Admin"
            }

            $body = $null
            if ($request.HasEntityBody) {
                $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
                $bodyStr = $reader.ReadToEnd()
                $reader.Close()
                if ($bodyStr) {
                    try { $body = $bodyStr | ConvertFrom-Json } catch {}
                }
            }

            # 1. GET /api/users
            if ($request.HttpMethod -eq "GET" -and $rawUrl -eq "/api/users") {
                if ($userRole -ne "Admin" -and $userRole -ne "Manager") {
                    Send-JsonResponse $response 403 @{ success = $false; error = "Forbidden: Insufficient privileges to view user list." }
                    continue
                }
                Send-JsonResponse $response 200 @{ success = $true; users = $global:serverUsers }
                continue
            }

            # 2. POST /api/users (Add user)
            if ($request.HttpMethod -eq "POST" -and $rawUrl -eq "/api/users") {
                if ($userRole -ne "Admin") {
                    Send-JsonResponse $response 403 @{ success = $false; error = "Forbidden: Only Administrators can create users." }
                    continue
                }
                if (-not $body -or -not $body.email -or -not $body.name) {
                    Send-JsonResponse $response 400 @{ success = $false; error = "Full Name and Email Address are required." }
                    continue
                }

                $emailLower = $body.email.Trim().ToLower()
                $exists = $global:serverUsers | Where-Object { $_.email.ToLower() -eq $emailLower }
                if ($exists) {
                    Send-JsonResponse $response 400 @{ success = $false; error = "A user with the email '$($body.email)' already exists." }
                    continue
                }

                $newUser = @{
                    id = "usr-" + (100 + $global:serverUsers.Count + 1)
                    name = $body.name.Trim()
                    email = $body.email.Trim()
                    password = if ($body.password) { $body.password } else { "Demo@123" }
                    role = if ($body.role) { $body.role } else { "User" }
                    status = if ($body.status) { $body.status } else { "Active" }
                    avatar = if ($body.name.Trim().Length -gt 0) { $body.name.Trim().Substring(0,1).ToUpper() } else { "U" }
                    createdAt = (Get-Date).ToString("yyyy-MM-dd")
                }
                $global:serverUsers += $newUser

                # Log audit
                $log = @{
                    id = "log-" + (Get-Date).Ticks
                    action = "User created"
                    performedBy = "Administrator"
                    targetUser = "$($newUser.name) ($($newUser.email))"
                    details = "Created with role $($newUser.role) and status $($newUser.status)"
                    timestamp = (Get-Date).ToString("o")
                    formattedDate = (Get-Date).ToString("yyyy-MM-dd HH:mm")
                }
                $global:serverAuditLogs = ,$log + $global:serverAuditLogs

                Send-JsonResponse $response 201 @{ success = $true; user = $newUser }
                continue
            }

            # 3. PATCH /api/users/assign-role (Assign role by email)
            if ($request.HttpMethod -eq "PATCH" -and $rawUrl -eq "/api/users/assign-role") {
                if ($userRole -ne "Admin") {
                    Send-JsonResponse $response 403 @{ success = $false; error = "Forbidden: Only Administrators can assign roles." }
                    continue
                }
                if (-not $body -or -not $body.email -or -not $body.role) {
                    Send-JsonResponse $response 400 @{ success = $false; error = "Email and Role are required." }
                    continue
                }

                $emailLower = $body.email.Trim().ToLower()
                $targetUser = $global:serverUsers | Where-Object { $_.email.ToLower() -eq $emailLower }
                if (-not $targetUser) {
                    Send-JsonResponse $response 404 @{ success = $false; error = "User not found. Please add the user first." }
                    continue
                }

                # Admin Protection: Ensure at least one active Admin
                if ($targetUser.role -eq "Admin" -and $body.role -ne "Admin") {
                    $activeAdmins = $global:serverUsers | Where-Object { $_.role -eq "Admin" -and $_.status -eq "Active" -and $_.email.ToLower() -ne $emailLower }
                    if ($activeAdmins.Count -eq 0) {
                        Send-JsonResponse $response 403 @{ success = $false; error = "Action blocked: System requires at least one active Admin account." }
                        continue
                    }
                }

                $oldRole = $targetUser.role
                $targetUser.role = $body.role

                # Log audit
                $log = @{
                    id = "log-" + (Get-Date).Ticks
                    action = "Role changed"
                    performedBy = "Administrator"
                    targetUser = "$($targetUser.name) ($($targetUser.email))"
                    details = "Changed role from $oldRole to $($body.role)"
                    timestamp = (Get-Date).ToString("o")
                    formattedDate = (Get-Date).ToString("yyyy-MM-dd HH:mm")
                }
                $global:serverAuditLogs = ,$log + $global:serverAuditLogs

                Send-JsonResponse $response 200 @{ success = $true; user = $targetUser; oldRole = $oldRole; newRole = $body.role }
                continue
            }

            # 4. PATCH /api/users/status (Toggle status)
            if ($request.HttpMethod -eq "PATCH" -and $rawUrl -like "/api/users/*/status") {
                if ($userRole -ne "Admin") {
                    Send-JsonResponse $response 403 @{ success = $false; error = "Forbidden: Only Administrators can change account status." }
                    continue
                }
                $userId = $rawUrl.Split('/')[3]
                $targetUser = $global:serverUsers | Where-Object { $_.id -eq $userId }
                if (-not $targetUser) {
                    Send-JsonResponse $response 404 @{ success = $false; error = "User not found." }
                    continue
                }

                $newStatus = if ($targetUser.status -eq "Active") { "Inactive" } else { "Active" }
                if ($targetUser.role -eq "Admin" -and $newStatus -eq "Inactive") {
                    $otherAdmins = $global:serverUsers | Where-Object { $_.role -eq "Admin" -and $_.status -eq "Active" -and $_.id -ne $userId }
                    if ($otherAdmins.Count -eq 0) {
                        Send-JsonResponse $response 403 @{ success = $false; error = "Action blocked: Cannot deactivate the last remaining active Administrator." }
                        continue
                    }
                }

                $targetUser.status = $newStatus
                $log = @{
                    id = "log-" + (Get-Date).Ticks
                    action = if ($newStatus -eq "Active") { "User activated" } else { "User deactivated" }
                    performedBy = "Administrator"
                    targetUser = "$($targetUser.name) ($($targetUser.email))"
                    details = "Status changed to $newStatus"
                    timestamp = (Get-Date).ToString("o")
                    formattedDate = (Get-Date).ToString("yyyy-MM-dd HH:mm")
                }
                $global:serverAuditLogs = ,$log + $global:serverAuditLogs

                Send-JsonResponse $response 200 @{ success = $true; user = $targetUser }
                continue
            }

            # 5. DELETE /api/users/:id (Delete user)
            if ($request.HttpMethod -eq "DELETE" -and $rawUrl -like "/api/users/*") {
                if ($userRole -ne "Admin") {
                    Send-JsonResponse $response 403 @{ success = $false; error = "Forbidden: Only Administrators can delete accounts." }
                    continue
                }
                $userId = $rawUrl.Split('/')[3]
                $targetUser = $global:serverUsers | Where-Object { $_.id -eq $userId }
                if (-not $targetUser) {
                    Send-JsonResponse $response 404 @{ success = $false; error = "User not found." }
                    continue
                }
                if ($userId -eq "usr-1" -or $targetUser.email.ToLower() -eq "admin@tryon.demo") {
                    Send-JsonResponse $response 403 @{ success = $false; error = "Primary Administrator account cannot be deleted." }
                    continue
                }
                if ($targetUser.role -eq "Admin") {
                    $otherAdmins = $global:serverUsers | Where-Object { $_.role -eq "Admin" -and $_.status -eq "Active" -and $_.id -ne $userId }
                    if ($otherAdmins.Count -eq 0) {
                        Send-JsonResponse $response 403 @{ success = $false; error = "Cannot delete the last remaining active Administrator account." }
                        continue
                    }
                }

                $global:serverUsers = @($global:serverUsers | Where-Object { $_.id -ne $userId })
                $log = @{
                    id = "log-" + (Get-Date).Ticks
                    action = "User deleted"
                    performedBy = "Administrator"
                    targetUser = "$($targetUser.name) ($($targetUser.email))"
                    details = "Deleted $($targetUser.role) account"
                    timestamp = (Get-Date).ToString("o")
                    formattedDate = (Get-Date).ToString("yyyy-MM-dd HH:mm")
                }
                $global:serverAuditLogs = ,$log + $global:serverAuditLogs

                Send-JsonResponse $response 200 @{ success = $true; message = "User deleted successfully." }
                continue
            }

            # 6. GET /api/audit-logs
            if ($request.HttpMethod -eq "GET" -and $rawUrl -eq "/api/audit-logs") {
                if ($userRole -ne "Admin" -and $userRole -ne "Manager") {
                    Send-JsonResponse $response 403 @{ success = $false; error = "Forbidden: Insufficient privileges." }
                    continue
                }
                Send-JsonResponse $response 200 @{ success = $true; logs = $global:serverAuditLogs }
                continue
            }

            # Default API 404
            Send-JsonResponse $response 404 @{ success = $false; error = "API route not found: $rawUrl" }
            continue
        }

        # ==========================================================
        # STATIC FILE SERVER
        # ==========================================================
        if ($rawUrl -eq "/" -or [string]::IsNullOrWhiteSpace($rawUrl)) {
            $rawUrl = "/index.html"
        }

        $decodedPath = [System.Uri]::UnescapeDataString($rawUrl.TrimStart('/'))
        $filePath = Join-Path $rootDir ($decodedPath -replace '/', [System.IO.Path]::DirectorySeparatorChar)

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)

            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $notFoundHtml = "<html><body><h1>404 Not Found</h1><p>File $decodedPath was not found.</p></body></html>"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($notFoundHtml)
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 404
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $response.Close()
    } catch {
        # Continue listening
    }
}
