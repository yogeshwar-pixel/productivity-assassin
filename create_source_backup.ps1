$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$backupName = "ProductivityAssassin_Backup_$timestamp"
$source = Get-Location
$destination = "$source\$backupName"

Write-Host "Starting Backup..."

New-Item -ItemType Directory -Path $destination | Out-Null

$folders = @("app", "assets", "backend", "chrome-extension", "components", "constants", "context", "hooks", "scripts", "utils", ".vscode")

foreach ($folder in $folders) {
    if (Test-Path "$source\$folder") {
        Write-Host "Copying $folder..."
        New-Item -ItemType Directory -Path "$destination\$folder" -Force | Out-Null
        robocopy "$source\$folder" "$destination\$folder" /E /XD node_modules .git .expo dist coverage build release_build .firebase .vercel /XF *.log *.lock /NFL /NDL /NJH /NJS /nc /ns /np
    }
}

Write-Host "Copying root files..."
$files = Get-ChildItem -Path $source -File | Where-Object { $_.Name -match "\.(json|js|ts|tsx|md|yml|yaml|ps1|bat|sh|config)$" -or $_.Name -eq ".env" -or $_.Name -eq ".gitignore" }

foreach ($file in $files) {
    Copy-Item $file.FullName "$destination"
}

$zipFile = "$source\${backupName}.zip"
Write-Host "Compressing to $zipFile..."
Compress-Archive -Path "$destination" -DestinationPath $zipFile

Remove-Item -Path $destination -Recurse -Force

Write-Host "Backup Complete: $zipFile"
