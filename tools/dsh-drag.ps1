# Simulate a drag inside the DSH window and capture mid-drag.
# Usage (via scriptblock):
#   & $sb -X 326 -Y 500 -DX 40 -OutPath .ref/screenshots-archive/drag.png [-DY 0] [-AfterPath ...]
param(
  [int]$X = 326,
  [int]$Y = 500,
  [int]$DX = 40,
  [int]$DY = 0,
  [string]$OutPath = ".ref/screenshots-archive/drag.png",
  [string]$AfterPath = "",
  [string]$TitleContains = "DeepSeek Harness",
  [int]$Steps = 8
)

Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @"
using System;using System.Text;using System.Runtime.InteropServices;
public class DshDrag{
 public delegate bool EP(IntPtr h,IntPtr l);
 [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
 [DllImport("user32.dll")] public static extern bool EnumWindows(EP cb,IntPtr l);
 [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetWindowTextW(IntPtr h,StringBuilder s,int n);
 [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h,int c);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] public static extern void keybd_event(byte vk,byte scan,uint flags,UIntPtr extra);
 public static void Focus(IntPtr h){ if(GetForegroundWindow()==h) return; ShowWindow(h,9); keybd_event(0x12,0,0,UIntPtr.Zero); System.Threading.Thread.Sleep(60); keybd_event(0x12,0,2,UIntPtr.Zero); System.Threading.Thread.Sleep(120); SetForegroundWindow(h);}
 [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h,out RECT r);
 [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h,int a,out RECT r,int c);
 [DllImport("user32.dll")] public static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")] public static extern void mouse_event(uint f,uint dx,uint dy,uint d,int extra);
 [StructLayout(LayoutKind.Sequential)] public struct RECT{public int Left,Top,Right,Bottom;}
 public static IntPtr Hwnd=IntPtr.Zero;
 public static IntPtr Find(string m){SetProcessDPIAware();IntPtr best=IntPtr.Zero;long area=0;
  EnumWindows((h,l)=>{if(!IsWindowVisible(h))return true;var sb=new StringBuilder(512);GetWindowTextW(h,sb,512);if(!sb.ToString().Contains(m))return true;RECT r;GetWindowRect(h,out r);long a=(long)(r.Right-r.Left)*(r.Bottom-r.Top);if(a>area){area=a;best=h;}return true;},IntPtr.Zero);Hwnd=best;return best;}
 public static string Rect(){RECT r;DwmGetWindowAttribute(Hwnd,9,out r,16);if(r.Right<=r.Left)GetWindowRect(Hwnd,out r);return r.Left+","+r.Top+","+(r.Right-r.Left)+","+(r.Bottom-r.Top);}
 public static void Down(int x,int y){SetCursorPos(x,y);System.Threading.Thread.Sleep(80);mouse_event(0x0002,0,0,0,0);}
 public static void MoveTo(int x,int y){SetCursorPos(x,y);}
 public static void Up(){mouse_event(0x0004,0,0,0,0);}
}
"@

$h = [DshDrag]::Find($TitleContains)
if ($h -eq [IntPtr]::Zero) { Write-Error "DSH window not found"; exit 1 }
[DshDrag]::Focus($h)
Start-Sleep -Milliseconds 500
$r = [DshDrag]::Rect().Split(',')
$ox = [int]$r[0]; $oy = [int]$r[1]
$sx = $ox + $X; $sy = $oy + $Y

function Shot([string]$path) {
  $dir = Split-Path -Parent $path
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
  $full = [System.IO.Path]::GetFullPath($path)
  $bmp = New-Object System.Drawing.Bitmap($w, $hh)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($ox, $oy, 0, 0, (New-Object System.Drawing.Size($w, $hh)))
  $g.Dispose(); $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}

$w = [int]$r[2]; $hh = [int]$r[3]
[DshDrag]::Down($sx, $sy)
Start-Sleep -Milliseconds 120
for ($i = 1; $i -le $Steps; $i++) {
  [DshDrag]::MoveTo($sx + [int]($DX * $i / $Steps), $sy + [int]($DY * $i / $Steps))
  Start-Sleep -Milliseconds 25
}
Start-Sleep -Milliseconds 200
Shot $OutPath
Write-Output "mid-drag capture: $OutPath (at ${sx},${sy} +${DX},+${DY})"
# return to the original splitter position so the user's layout is unchanged, then release
[DshDrag]::MoveTo($sx, $sy)
Start-Sleep -Milliseconds 180
[DshDrag]::Up()
Start-Sleep -Milliseconds 300
if ($AfterPath) { Shot $AfterPath; Write-Output "after capture: $AfterPath" }
Write-Output "done"
