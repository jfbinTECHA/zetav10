# Build Zeta AI Dashboard Manual PDF with version and timestamp

$version = "1.0"
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$outputFile = "ZetaDashboardManual_v$version`_$timestamp.pdf"
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

if (-Not (Test-Path $chromePath)) {
    Write-Host "Chrome not found. Please install it."
    exit
}

Start-Process $chromePath -ArgumentList "--headless","--disable-gpu","--print-to-pdf=$outputFile","index.html" -Wait
Write-Host "✅ PDF generated: $outputFile"