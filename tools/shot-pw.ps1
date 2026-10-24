# Capture a window by handle with PrintWindow (works while occluded).
param(
  [long]$Hwnd = 0,
  [string]$OutPath = '.ref/screenshots-archive/pw-test.png',
  [string]$TitleContains = 'DeepSeek Harness'
)

Add-Type -TypeDefinition @"
using System;using System.Text;using System.Runtime.InteropServices;
public class Pw{
 public delegate bool EnumProc(IntPtr h,IntPtr l);
 [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
 [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb,IntPtr l);
 [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetWindowTextW(IntPtr h,StringBuilder s,int n);
 [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h,out RECT r);
 [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h,int a,out RECT r,int c);
 [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h,IntPtr hdc,uint flags);
 [StructLayout(LayoutKind.Sequential)] public struct RECT{public int Left,Top,Right,Bottom;}
 public static IntPtr Find(string match){SetProcessDPIAware();IntPtr best=IntPtr.Zero;long area=0;
  EnumWindows((h,l)=>{if(!IsWindowVisible(h))return true;var sb=new StringBuilder(512);GetWindowTextW(h,sb,512);if(!sb.ToString().Contains(match))return true;RECT r;GetWindowRect(h,out r);long a=(long)(r.Right-r.Left)*(r.Bottom-r.Top);if(a>area){area=a;best=h;}return true;},IntPtr.Zero);return best;}
 public static RECT Rect(IntPtr h){RECT r;DwmGetWindowAttribute(h,9,out r,16);if(r.Right<=r.Left)GetWindowRect(h,out r);return r;}
}
"@

$h = if ($Hwnd -ne 0) { [IntPtr]$Hwnd } else { [Pw]::Find($TitleContains) }
if ($h -eq [IntPtr]::Zero) { Write-Error 'window not found'; exit 1 }
$r = [Pw]::Rect($h)
$w = $r.Right - $r.Left
$hh = $r.Bottom - $r.Top
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap($w, $hh)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
[Pw]::PrintWindow($h, $hdc, 2) | Out-Null
$g.ReleaseHdc($hdc)
$g.Dispose()
$out = Join-Path (Get-Location) $OutPath
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output ("hwnd={0} rect={1},{2},{3},{4} -> {5}" -f $h, $r.Left, $r.Top, $w, $hh, $OutPath)
