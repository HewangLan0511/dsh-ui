# DevTools console evaluator for the DeepSeek Harness Electron window.
# Usage: pwsh -File tools/devtools-eval.ps1 -Script "copy(document.title)" -Out out.txt
param(
  [Parameter(Mandatory = $true)][string]$Script,
  [string]$Out = "baseline/screenshots/devtools-result.txt"
)
Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class DevToolsWin {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@
$proc = Get-Process | Where-Object { $_.ProcessName -eq 'DeepSeek Harness' -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $proc) { Write-Error "window not found"; exit 1 }
$h = $proc.MainWindowHandle
[DevToolsWin]::ShowWindow($h, 9) | Out-Null
[DevToolsWin]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 500
$ws = New-Object -ComObject WScript.Shell
# Open DevTools (already open toggles it closed; caller should open once and reuse)
$ws.SendKeys('^+j')
Start-Sleep -Milliseconds 1500
Set-Clipboard -Value $Script
Start-Sleep -Milliseconds 200
# Chromium paste protection: type "allow pasting" once, harmless if already allowed.
$ws.SendKeys('allow pasting')
$ws.SendKeys('{ENTER}')
Start-Sleep -Milliseconds 400
$ws.SendKeys('^v')
Start-Sleep -Milliseconds 300
$ws.SendKeys('{ENTER}')
Start-Sleep -Milliseconds 1500
$result = Get-Clipboard -Raw
$dir = Split-Path -Parent $Out
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
Set-Content -Path $Out -Value $result -Encoding UTF8
Write-Output "saved $Out ($($result.Length) chars)"
