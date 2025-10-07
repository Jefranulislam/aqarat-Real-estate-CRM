$body = @{
    email = "admin@aqarat.com"
    password = "admin123"
    full_name = "Admin User"
    role = "admin"
    phone = "+1234567890"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10