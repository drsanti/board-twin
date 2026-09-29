Add-Type -AssemblyName System.Drawing
$b = New-Object System.Drawing.Bitmap 1024, 1024
$g = [System.Drawing.Graphics]::FromImage($b)
$g.SmoothingMode = 'AntiAlias'
$g.Clear([System.Drawing.Color]::FromArgb(9, 9, 11))
$green = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(34, 197, 94))
$blue  = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(96, 165, 250))
# big LED
$g.FillEllipse($green, 352, 222, 320, 320)
# three small LEDs in a row
$g.FillEllipse($blue, 192, 652, 140, 140)
$g.FillEllipse($blue, 442, 652, 140, 140)
$g.FillEllipse($blue, 692, 652, 140, 140)
$b.Save("$PSScriptRoot\app-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$b.Dispose()
Write-Host "icon written: $PSScriptRoot\app-icon.png"
