# Captures the DeepSeek Harness main window to a PNG (visual verification loop).
# Usage: pwsh -File tools/capture-dsh.ps1 [outPath]
param([string]$OutPath = "baseline/screenshots/current-ui.png")

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32Capture {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr hwnd, int dwAttribute, out RECT pvAttribute, int cbAttribute);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
"@

$proc = Get-Process | Where-Object { $_.ProcessName -eq 'DeepSeek Harness' -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $proc) { Write-Error "DeepSeek Harness window not found"; exit 1 }
[Win32Capture]::SetProcessDPIAware() | Out-Null
$h = $proc.MainWindowHandle
[Win32Capture]::ShowWindow($h, 9) | Out-Null
[Win32Capture]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 700
# Privacy/verification guard: only capture when the Harness window really owns
# the foreground, otherwise the screen region may show another app.
$fg = [Win32Capture]::GetForegroundWindow()
if ($fg -ne $h) {
  [Win32Capture]::SetForegroundWindow($h) | Out-Null
  Start-Sleep -Milliseconds 600
  $fg = [Win32Capture]::GetForegroundWindow()
}
if ($fg -ne $h) {
  Write-Error "DeepSeek Harness is not the foreground window (fg=$fg, target=$h); capture aborted to avoid capturing another app"
  exit 1
}
$r = New-Object Win32Capture+RECT
[Win32Capture]::DwmGetWindowAttribute($h, 9, [ref]$r, 16) | Out-Null  # DWMWA_EXTENDED_FRAME_BOUNDS
if ($r.Right -le $r.Left) { [Win32Capture]::GetWindowRect($h, [ref]$r) | Out-Null }
$w = $r.Right - $r.Left; $hh = $r.Bottom - $r.Top
$dir = Split-Path -Parent $OutPath
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
$bmp = New-Object System.Drawing.Bitmap($w, $hh)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($r.Left, $r.Top, 0, 0, (New-Object System.Drawing.Size($w, $hh)))
$full = [System.IO.Path]::GetFullPath($OutPath)
$bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Output "captured ${w}x${hh} -> $full (hwnd $h)"
