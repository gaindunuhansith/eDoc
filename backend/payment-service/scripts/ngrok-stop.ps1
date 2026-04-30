$ngrokProcesses = Get-Process -Name ngrok -ErrorAction SilentlyContinue
if ($ngrokProcesses) {
    $ngrokProcesses | Stop-Process -Force
    Write-Output "Stopped ngrok processes."
} else {
    Write-Output "No ngrok process found."
}
