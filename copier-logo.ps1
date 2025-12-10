# Script pour copier le logo Billz dans le dossier public
# Usage: .\copier-logo.ps1 "CHEMIN_VERS_VOTRE_IMAGE.png"

param(
    [Parameter(Mandatory=$false)]
    [string]$SourcePath = ""
)

Write-Host "🔍 Recherche du logo Billz..." -ForegroundColor Cyan

# Si un chemin est fourni, l'utiliser
if ($SourcePath -and (Test-Path $SourcePath)) {
    $sourceFile = Get-Item $SourcePath
    Write-Host "✅ Fichier trouvé: $($sourceFile.FullName)" -ForegroundColor Green
    
    # Copier vers public/billz-logo.png
    $destPath = Join-Path (Get-Location) "public\billz-logo.png"
    Copy-Item $sourceFile.FullName -Destination $destPath -Force
    Write-Host "✅ Logo copié vers: $destPath" -ForegroundColor Green
    exit 0
}

# Sinon, chercher dans les emplacements communs
$searchPaths = @(
    "$env:USERPROFILE\Public",
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\Documents",
    "$env:USERPROFILE\Pictures"
)

$foundFiles = @()

foreach ($searchPath in $searchPaths) {
    if (Test-Path $searchPath) {
        Write-Host "🔍 Recherche dans: $searchPath" -ForegroundColor Yellow
        $images = Get-ChildItem -Path $searchPath -Filter "*.png" -File -ErrorAction SilentlyContinue | 
                  Where-Object { $_.Name -match "billz|logo|B" -or $_.Length -gt 10000 }
        if ($images) {
            $foundFiles += $images
        }
    }
}

if ($foundFiles.Count -eq 0) {
    Write-Host "❌ Aucune image trouvée automatiquement." -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Instructions manuelles:" -ForegroundColor Cyan
    Write-Host "1. Trouvez votre image du logo 'B'" -ForegroundColor White
    Write-Host "2. Copiez-la dans: $(Join-Path (Get-Location) 'public\billz-logo.png')" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou utilisez ce script avec le chemin:" -ForegroundColor Yellow
    Write-Host "  .\copier-logo.ps1 'C:\chemin\vers\votre\image.png'" -ForegroundColor White
    exit 1
}

if ($foundFiles.Count -eq 1) {
    $sourceFile = $foundFiles[0]
    Write-Host "✅ Image trouvée: $($sourceFile.FullName)" -ForegroundColor Green
    Write-Host "📋 Taille: $([math]::Round($sourceFile.Length/1KB, 2)) KB" -ForegroundColor Cyan
    
    $destPath = Join-Path (Get-Location) "public\billz-logo.png"
    Copy-Item $sourceFile.FullName -Destination $destPath -Force
    Write-Host "✅ Logo copié vers: $destPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 C'est fait ! Redémarrez le serveur (npm run dev) et actualisez la page." -ForegroundColor Green
} else {
    Write-Host "⚠️  Plusieurs images trouvées:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $foundFiles.Count; $i++) {
        Write-Host "  [$i] $($foundFiles[$i].FullName)" -ForegroundColor White
    }
    Write-Host ""
    $choice = Read-Host "Entrez le numéro de l'image à utiliser (0-$($foundFiles.Count-1))"
    if ($choice -match '^\d+$' -and [int]$choice -ge 0 -and [int]$choice -lt $foundFiles.Count) {
        $sourceFile = $foundFiles[[int]$choice]
        $destPath = Join-Path (Get-Location) "public\billz-logo.png"
        Copy-Item $sourceFile.FullName -Destination $destPath -Force
        Write-Host "✅ Logo copié vers: $destPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 C'est fait ! Redémarrez le serveur (npm run dev) et actualisez la page." -ForegroundColor Green
    } else {
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        exit 1
    }
}

