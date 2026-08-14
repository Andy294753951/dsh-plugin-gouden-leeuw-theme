[CmdletBinding()]
param(
  [string] $DshProfile = 'web',

  [string] $DshHome = (Join-Path ([Environment]::GetFolderPath('UserProfile')) '.dsh')
)

$ErrorActionPreference = 'Stop'
$packageName = 'dsh-plugin-gouden-leeuw-theme'
$profileRoot = Join-Path (Join-Path $DshHome 'profiles') $DshProfile
$patchPath = Join-Path $profileRoot 'cordis.patch.yml'
$encoding = [System.Text.UTF8Encoding]::new($false)

if (Test-Path -LiteralPath $patchPath) {
  $content = [System.IO.File]::ReadAllText($patchPath)
  $pattern = '(?ms)^# BEGIN dsh-plugin-gouden-leeuw-theme \(managed by install\.ps1\)\r?\n.*?^# END dsh-plugin-gouden-leeuw-theme\r?\n?'
  $content = [regex]::Replace($content, $pattern, '').TrimEnd()
  $meaningful = (($content -split '\r?\n') | Where-Object {
    $line = $_.Trim()
    $line.Length -gt 0 -and -not $line.StartsWith('#')
  }) -join [Environment]::NewLine
  if ($meaningful.Trim().Length -eq 0) {
    if ($content.Length -gt 0) { $content += [Environment]::NewLine + [Environment]::NewLine }
    $content += '[]'
  }
  if ($content.Length -gt 0) { $content += [Environment]::NewLine }
  [System.IO.File]::WriteAllText($patchPath, $content, $encoding)
}

$dsh = Get-Command dsh -ErrorAction Stop
& $dsh.Source plugin --profile $DshProfile remove $packageName
if ($LASTEXITCODE -ne 0) { throw "DSH plugin removal failed with exit code $LASTEXITCODE." }

Write-Host 'Gouden Leeuw theme removed. Restart dsh web to finish.' -ForegroundColor Green
Write-Host 'The artwork file was not changed or deleted.'
