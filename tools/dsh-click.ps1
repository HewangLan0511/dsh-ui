# Click at window-relative coordinates in the DeepSeek Harness window (DPI aware).
# Usage (via scriptblock): & $sb -X 1580 -Y 78 [-RestoreMinimized]
param(
  [int]$X = 0,
  [int]$Y = 0,
  [switch]$RestoreMinimized,
  [string]$TitleContains = "DeepSeek Harness"
)

Add-Type -TypeDefinition @"
using System;using System.Text;using System.Runtime.InteropServices;
public class DshClick{
 public delegate bool EnumProc(IntPtr h,IntPtr l);
 [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
 [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb,IntPtr l);
 [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetWindowTextW(IntPtr h,StringBuilder s,int n);
 [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h,int c);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] public static extern void keybd_event(byte vk,byte scan,uint flags,UIntPtr extra);
 public static void Focus(IntPtr h){ if(GetForegroundWindow()==h) return; ShowWindow(h,9); keybd_event(0x12,0,0,UIntPtr.Zero); System.Threading.Thread.Sleep(60); keybd_event(0x12,0,2,UIntPtr.Zero); System.Threading.Thread.Sleep(120); SetForegroundWindow(h);}
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
 [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h,out RECT r);
 [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h,int a,out RECT r,int c);
 [DllImport("user32.dll")] public static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")] public static extern void mouse_event(uint f,uint dx,uint dy,uint d,int extra);
 [StructLayout(LayoutKind.Sequential)] public struct RECT{public int Left,Top,Right,Bottom;}
 public static IntPtr Hwnd=IntPtr.Zero;
 public static IntPtr Find(string match){SetProcessDPIAware();IntPtr best=IntPtr.Zero;long area=0;
  EnumWindows((h,l)=>{if(!IsWindowVisible(h))return true;var sb=new StringBuilder(512);GetWindowTextW(h,sb,512);if(!sb.ToString().Contains(match))return true;RECT r;GetWindowRect(h,out r);long a=(long)(r.Right-r.Left)*(r.Bottom-r.Top);if(a>area){area=a;best=h;}return true;},IntPtr.Zero);Hwnd=best;return best;}
 public static string Rect(){RECT r;DwmGetWindowAttribute(Hwnd,9,out r,16);if(r.Right<=r.Left)GetWindowRect(Hwnd,out r);return r.Left+","+r.Top+","+(r.Right-r.Left)+","+(r.Bottom-r.Top);}
}
"@

$h = [DshClick]::Find($TitleContains)
if ($h -eq [IntPtr]::Zero) { Write-Error "DSH window not found"; exit 1 }
$wasMin = [DshClick]::IsIconic($h)
if ($wasMin -or $RestoreMinimized) { [DshClick]::ShowWindow($h, 9) | Out-Null; Start-Sleep -Milliseconds 500 }
# Only steal focus when needed: re-focusing a window can dismiss an open popup/menu
# before the click lands (which swallowed the "Settings" menu row in earlier tries).
if ([DshClick]::GetForegroundWindow() -ne $h) {
  [DshClick]::Focus($h)
  Start-Sleep -Milliseconds 350
} else {
  Start-Sleep -Milliseconds 60
}
$r = [DshClick]::Rect().Split(',')
$sx = [int]$r[0] + $X
$sy = [int]$r[1] + $Y
[DshClick]::SetCursorPos($sx, $sy) | Out-Null
Start-Sleep -Milliseconds 120
[DshClick]::mouse_event(0x0002, 0, 0, 0, 0)   # left down
Start-Sleep -Milliseconds 60
[DshClick]::mouse_event(0x0004, 0, 0, 0, 0)   # left up
Write-Output "clicked window($X,$Y) -> screen($sx,$sy) rect=$($r -join ',') wasMinimized=$wasMin"
if ($wasMin) { Start-Sleep -Milliseconds 300; [DshClick]::ShowWindow($h, 6) | Out-Null }
