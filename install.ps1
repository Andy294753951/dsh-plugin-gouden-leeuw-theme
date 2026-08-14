[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string] $ArtworkPath,

  [string] $DshProfile = 'web',

  [string] $DshHome = (Join-Path ([Environment]::GetFolderPath('UserProfile')) '.dsh')
)

$ErrorActionPreference = 'Stop'
$packageName = 'dsh-plugin-gouden-leeuw-theme'
$beginMarker = '# BEGIN dsh-plugin-gouden-leeuw-theme (managed by install.ps1)'
$endMarker = '# END dsh-plugin-gouden-leeuw-theme'
$repoRoot = $PSScriptRoot

$artwork = Get-Item -LiteralPath $ArtworkPath -ErrorAction Stop
if ($artwork.PSIsContainer) {
  throw "ArtworkPath must point to an image file: $ArtworkPath"
}

$allowedExtensions = '.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'
if ($allowedExtensions -notcontains $artwork.Extension.ToLowerInvariant()) {
  throw "Unsupported artwork format '$($artwork.Extension)'. Use PNG, JPEG, WebP, AVIF, or GIF."
}

$dsh = Get-Command dsh -ErrorAction Stop
$node = Get-Command node -ErrorAction Stop

Write-Host 'Building the client bundle...'
& $node.Source (Join-Path $repoRoot 'scripts\build.mjs')
if ($LASTEXITCODE -ne 0) { throw "Theme build failed with exit code $LASTEXITCODE." }

Write-Host "Installing $packageName into the '$DshProfile' profile..."
& $dsh.Source plugin --profile $DshProfile add $repoRoot
if ($LASTEXITCODE -ne 0) { throw "DSH plugin installation failed with exit code $LASTEXITCODE." }

$profileRoot = Join-Path (Join-Path $DshHome 'profiles') $DshProfile
$patchPath = Join-Path $profileRoot 'cordis.patch.yml'
if (-not (Test-Path -LiteralPath $patchPath)) {
  throw "DSH profile patch was not found: $patchPath"
}

$yamlArtworkPath = $artwork.FullName.Replace("'", "''")
$managedBlock = @"
$beginMarker
- id: gouden-leeuw-theme
  disabled: false
  config:
    artworkPath: '$yamlArtworkPath'
$endMarker
"@

$encoding = [System.Text.UTF8Encoding]::new($false)
$content = [System.IO.File]::ReadAllText($patchPath)
$pattern = '(?ms)^# BEGIN dsh-plugin-gouden-leeuw-theme \(managed by install\.ps1\)\r?\n.*?^# END dsh-plugin-gouden-leeuw-theme\r?\n?'
$content = [regex]::Replace($content, $pattern, '').TrimEnd()
$meaningful = (($content -split '\r?\n') | Where-Object {
  $line = $_.Trim()
  $line.Length -gt 0 -and -not $line.StartsWith('#')
}) -join [Environment]::NewLine

if ($meaningful.Trim() -eq '[]') {
  $content = [regex]::Replace(
    $content,
    '(?m)^\s*\[\]\s*$',
    [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $managedBlock.Trim() }
  )
} else {
  if ($content.Length -gt 0) { $content += [Environment]::NewLine + [Environment]::NewLine }
  $content += $managedBlock.Trim()
}
$content += [Environment]::NewLine
[System.IO.File]::WriteAllText($patchPath, $content, $encoding)

Write-Host ''
Write-Host 'Gouden Leeuw theme installed.' -ForegroundColor Green
Write-Host "Restart 'dsh web' to activate it. Your artwork remains at: $($artwork.FullName)"
