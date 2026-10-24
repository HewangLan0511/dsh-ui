# Clicks at a screen position inside the DeepSeek Harness window.
# Usage: pwsh -File tools/click-dsh.ps1 -X 400 -Y 300 [-Double]
param([int]$X, [int]$Y, [switch]$Double)
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class MouseClickWin {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int X, int Y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint data, UIntPtr extra);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT r);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
"@
$proc = Get-Process | Where-Object { $_.ProcessName -eq 'DeepSeek Harness' -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $proc) { Write-Error "window not found"; exit 1 }
[MouseClickWin]::SetProcessDPIAware() | Out-Null
[MouseClickWin]::ShowWindow($proc.MainWindowHandle, 9) | Out-Null
[MouseClickWin]::SetForegroundWindow($proc.MainWindowHandle) | Out-Null
Start-Sleep -Milliseconds 300
$r = New-Object MouseClickWin+RECT
[MouseClickWin]::GetWindowRect($proc.MainWindowHandle, [ref]$r) | Out-Null
$absX = $r.Left + $X
$absY = $r.Top + $Y
[MouseClickWin]::SetCursorPos($absX, $absY) | Out-Null
Start-Sleep -Milliseconds 120
[MouseClickWin]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero) # left down
Start-Sleep -Milliseconds 60
[MouseClickWin]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero) # left up
if ($Double) {
  Start-Sleep -Milliseconds 80
  [MouseClickWin]::mouse_event(0x0002, 0, 0, 0, [UIntPtr]::Zero)
  Start-Sleep -Milliseconds 60
  [MouseClickWin]::mouse_event(0x0004, 0, 0, 0, [UIntPtr]::Zero)
}
Write-Output "clicked window-relative ($X,$Y) -> screen ($absX,$absY)"
