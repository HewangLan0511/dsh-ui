# DPI-aware capture of the DeepSeek Harness window (visual verification loop).
# Usage (bypass execution policy by invoking as scriptblock if needed):
#   $sb = [scriptblock]::Create((Get-Content .\tools\shot.ps1 -Raw))
#   & $sb -OutPath .ref\screenshots-archive\win.png [-Crop x,y,w,h] [-TitleContains text] [-NoForeground]
param(
  [string]$OutPath = ".ref/screenshots-archive/win.png",
  [string]$Crop = "",
  [string]$TitleContains = "DeepSeek Harness",
  [switch]$NoForeground
)

Add-Type -AssemblyName System.Drawing

Add-Type -TypeDefinition @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class DshWin {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr l);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowTextW(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int a, out RECT r, int c);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int nCmdShow);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  public static IntPtr Hwnd = IntPtr.Zero;
  public static string Title = "";
  public static string Find(string match) {
    SetProcessDPIAware();
    IntPtr found = IntPtr.Zero; string title = "";
    EnumWindows((h, l) => {
      if (!IsWindowVisible(h)) return true;
      var sb = new StringBuilder(512);
      GetWindowTextW(h, sb, 512);
      string s = sb.ToString();
      if (s.Contains(match)) { found = h; title = s; return false; }
      return true;
    }, IntPtr.Zero);
    Hwnd = found; Title = title;
    return found == IntPtr.Zero ? "not found" : ("hwnd=" + found + " title=" + title);
  }
  public static string Focus() {
    ShowWindow(Hwnd, 9);
    SetForegroundWindow(Hwnd);
    return GetForegroundWindow() == Hwnd ? "focused" : "not-foreground";
  }
  public static string Rect() {
    RECT r;
    DwmGetWindowAttribute(Hwnd, 9, out r, 16);
    if (r.Right <= r.Left) GetWindowRect(Hwnd, out r);
    return r.Left + "," + r.Top + "," + (r.Right - r.Left) + "," + (r.Bottom - r.Top);
  }
}
"@

$found = [DshWin]::Find($TitleContains)
if ($found -eq 'not found') { Write-Error "window containing '$TitleContains' not found"; exit 1 }
if (-not $NoForeground) {
  $f = [DshWin]::Focus()
  if ($f -ne 'focused') { Write-Warning "window is not foreground ($f); capture may include other windows" }
  Start-Sleep -Milliseconds 450
}
$rect = [DshWin]::Rect().Split(',')
$x = [int]$rect[0]; $y = [int]$rect[1]; $w = [int]$rect[2]; $h = [int]$rect[3]
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($x, $y, 0, 0, (New-Object System.Drawing.Size($w, $h)))
$g.Dispose()

$dir = Split-Path -Parent $OutPath
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
$full = [System.IO.Path]::GetFullPath($OutPath)

if ($Crop) {
  $cs = if ($Crop -is [array]) { $Crop -join ',' } else { $Crop }
  $c = $cs.Split(',')
  $cx = [int]$c[0]; $cy = [int]$c[1]; $cw = [int]$c[2]; $ch = [int]$c[3]
  if ($cx -lt 0) { $cx = 0 }; if ($cy -lt 0) { $cy = 0 }
  if ($cx + $cw -gt $w) { $cw = $w - $cx }; if ($cy + $ch -gt $h) { $ch = $h - $cy }
  if ($cw -gt 0 -and $ch -gt 0) {
    $bmp2 = New-Object System.Drawing.Bitmap($cw, $ch)
    $g2 = [System.Drawing.Graphics]::FromImage($bmp2)
    $g2.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $cw, $ch)), (New-Object System.Drawing.Rectangle($cx, $cy, $cw, $ch)), [System.Drawing.GraphicsUnit]::Pixel)
    $g2.Dispose()
    $bmp2.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp2.Dispose()
  } else {
    Write-Error "invalid crop $cs for window ${w}x${h}"; exit 1
  }
} else {
  $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)
}
$bmp.Dispose()
Write-Output "$found rect=$x,$y,${w}x${h} -> $full"
