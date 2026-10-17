Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\chugh\.gemini\antigravity-ide\brain\31cd1888-1a22-4085-a9da-5decbaf5586a\deck_painted_hull_full_1792253008011.jpg"
$dstPath = "c:\VarunPash\public\assets\sprites\deck_painted_hull.png"

$srcBmp = New-Object System.Drawing.Bitmap($srcPath)
$srcW = $srcBmp.Width
$srcH = $srcBmp.Height
Write-Host "Source image: $srcW x $srcH"

# Target canvas: 16 tiles x 24 tiles @ 64px = 1024 x 1536
$targetW = 1024
$targetH = 1536

# Scale maintaining aspect ratio:
# src is 848 x 1264 -> ratio 848/1264 = 0.67088
# target is 1024 x 1536 -> ratio 1024/1536 = 0.66667 (almost identical 2:3 ratio!)
# Fit within 1024 x 1536:
$scale = [Math]::Min($targetW / $srcW, $targetH / $srcH)
$scaledW = [int][Math]::Round($srcW * $scale)
$scaledH = [int][Math]::Round($srcH * $scale)
$offX = [int][Math]::Round(($targetW - $scaledW) / 2)
$offY = [int][Math]::Round(($targetH - $scaledH) / 2)

Write-Host "Scaled: $scaledW x $scaledH, Offset: ($offX, $offY)"

# 1. First resize src to scaledW x scaledH with high quality bicubic
$scaledBmp = New-Object System.Drawing.Bitmap($scaledW, $scaledH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($scaledBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($srcBmp, 0, 0, $scaledW, $scaledH)
$g.Dispose()
$srcBmp.Dispose()

# 2. Flood fill transparency from the outside boundary
# Lock bits for fast pixel processing
$rect = New-Object System.Drawing.Rectangle(0, 0, $scaledW, $scaledH)
$bmpData = $scaledBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $bmpData.Stride
$bytes = [byte[]]::new($stride * $scaledH)
[System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $bytes, 0, $bytes.Length)

# Queue-based flood fill for outer near-white pixels (luminance > 235 and low saturation)
$visited = [bool[]]::new($scaledW * $scaledH)
$queue = New-Object System.Collections.Generic.Queue[int]

function IsWhite($x, $y) {
    if ($x -lt 0 -or $x -ge $scaledW -or $y -lt 0 -or $y -ge $scaledH) { return $false }
    $idx = $y * $stride + $x * 4
    $b = $bytes[$idx]
    $g = $bytes[$idx + 1]
    $r = $bytes[$idx + 2]
    # Check if pixel is white or near-white background
    if ($r -gt 225 -and $g -gt 225 -and $b -gt 225) { return $true }
    return $false
}

# Add all 4 border edges to flood fill queue
for ($x = 0; $x -lt $scaledW; $x++) {
    if (IsWhite $x 0) { $queue.Enqueue(0 * $scaledW + $x); $visited[0 * $scaledW + $x] = $true }
    if (IsWhite $x ($scaledH - 1)) { $queue.Enqueue(($scaledH - 1) * $scaledW + $x); $visited[($scaledH - 1) * $scaledW + $x] = $true }
}
for ($y = 0; $y -lt $scaledH; $y++) {
    if (IsWhite 0 $y) { $queue.Enqueue($y * $scaledW + 0); $visited[$y * $scaledW + 0] = $true }
    if (IsWhite ($scaledW - 1) $y) { $queue.Enqueue($y * $scaledW + ($scaledW - 1)); $visited[$y * $scaledW + ($scaledW - 1)] = $true }
}

$dx = @(1, -1, 0, 0)
$dy = @(0, 0, 1, -1)

while ($queue.Count -gt 0) {
    $curr = $queue.Dequeue()
    $cx = $curr % $scaledW
    $cy = [int][Math]::Floor($curr / $scaledW)

    # Set pixel to fully transparent
    $idx = $cy * $stride + $cx * 4
    $bytes[$idx + 3] = 0 # Alpha = 0

    for ($i = 0; $i -lt 4; $i++) {
        $nx = $cx + $dx[$i]
        $ny = $cy + $dy[$i]
        if ($nx -ge 0 -and $nx -lt $scaledW -and $ny -ge 0 -and $ny -lt $scaledH) {
            $npos = $ny * $scaledW + $nx
            if (-not $visited[$npos] -and (IsWhite $nx $ny)) {
                $visited[$npos] = $true
                $queue.Enqueue($npos)
            }
        }
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $bmpData.Scan0, $bytes.Length)
$scaledBmp.UnlockBits($bmpData)

# 3. Create final canvas (1024 x 1536) and draw the transparent ship centered
$finalBmp = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$finalG = [System.Drawing.Graphics]::FromImage($finalBmp)
$finalG.Clear([System.Drawing.Color]::Transparent)
$finalG.DrawImage($scaledBmp, $offX, $offY)
$finalG.Dispose()
$scaledBmp.Dispose()

# Save final PNG
$finalBmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
$finalBmp.Dispose()

Write-Host "Successfully saved transparent PNG to $dstPath"
