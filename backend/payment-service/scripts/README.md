# Ngrok Webhook Testing

1. Start the tunnel:

```powershell
./scripts/ngrok-start.ps1
```

2. Export the generated notify URL for the current shell:

```powershell
$env:PAYHERE_NOTIFY_URL = (Get-Content .env.ngrok | ForEach-Object { $_.Split('=')[1] })
```

3. Start the payment service.

4. Configure PayHere webhook callback URL to the value of `PAYHERE_NOTIFY_URL`.

5. Stop ngrok when done:

```powershell
./scripts/ngrok-stop.ps1
```
