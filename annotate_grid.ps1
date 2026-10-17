Add-Type -AssemblyName System.Drawing

$img = [System.Drawing.Bitmap]::FromFile("c:\VarunPash\public\assets\sprites\deck_painted_hull.png")
$bmp = New-Object System.Drawing.Bitmap($img.Width, $img.Height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)

$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 255, 255, 0), 1)
$font = New-Object System.Drawing.Font("Arial", 8, [System.Drawing.FontStyle]::Bold)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 0, 0, 0))

for ($x = 0; $x -le 1024; $x += 64) {
    $g.DrawLine($pen, $x, 0, $x, 1536)
}
for ($y = 0; $y -le 1536; $y += 64) {
    $g.DrawLine($pen, 0, $y, 1024, $y)
}

for ($col = 0; $col -lt 16; $col++) {
    for ($row = 0; $row -lt 24; $row++) {
        $str = "$col,$row"
        $px = $col * 64 + 2
        $py = $row * 64 + 2
        $g.FillRectangle($bgBrush, $px, $py, 32, 14)
        $g.DrawString($str, $font, $brush, [float]$px, [float]$py)
    }
}

$g.Dispose()
$img.Dispose()
$outPath = "C:\Users\chugh\.gemini\antigravity-ide\brain\31cd1888-1a22-4085-a9da-5decbaf5586a\deck_grid_annotated.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "Grid generated successfully at $outPath"
