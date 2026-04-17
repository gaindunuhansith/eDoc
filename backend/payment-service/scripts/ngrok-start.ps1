param(
    [int]$Port = 8085,
    [string]$WebhookPath = "/api/v1/payments/webhook/notify",
    [string]$NgrokCommand = "ngrok"
)

$null = Start-Process -FilePath $NgrokCommand -ArgumentList @("http", $Port.ToString()) -PassThru

$publicUrl = $null
for ($i = 0; $i -lt 20; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -Method Get
        $httpsTunnel = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
        if ($httpsTunnel) {
            $publicUrl = $httpsTunnel.public_url
            break
        }
    } catch {
    }
    Start-Sleep -Seconds 1
}

if (-not $publicUrl) {
    throw "Unable to resolve ngrok public URL. Ensure ngrok is installed and authtoken is configured."
}

$notifyUrl = "$publicUrl$WebhookPath"
$envFile = Join-Path $PSScriptRoot "..\.env.ngrok"
Set-Content -Path $envFile -Value "PAYHERE_NOTIFY_URL=$notifyUrl"

Write-Output "Ngrok public URL: $publicUrl"
Write-Output "Webhook notify URL: $notifyUrl"
Write-Output "Saved: $envFile"
Write-Output "Use this when starting payment-service: `$env:PAYHERE_NOTIFY_URL='$notifyUrl'"
