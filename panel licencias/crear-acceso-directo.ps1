# D-CLOCK — Crear acceso directo en el escritorio
$panelDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$vbsPath   = Join-Path $panelDir "iniciar-panel.vbs"
$iconPath  = Join-Path $panelDir "public\D-CLOCKlogo.png"
$shortcut  = Join-Path ([Environment]::GetFolderPath("Desktop")) "D-CLOCK Panel.lnk"

$shell = New-Object -ComObject WScript.Shell
$lnk   = $shell.CreateShortcut($shortcut)

$lnk.TargetPath       = "wscript.exe"
$lnk.Arguments        = "`"$vbsPath`""
$lnk.WorkingDirectory = $panelDir
$lnk.Description      = "D-CLOCK Panel de Licencias"
$lnk.WindowStyle      = 1

# Convertir PNG a ICO para el icono del acceso directo
$icoPath = Join-Path $panelDir "public\D-CLOCKlogo.ico"

Add-Type -AssemblyName System.Drawing
try {
    $png = [System.Drawing.Image]::FromFile($iconPath)
    $bmp = New-Object System.Drawing.Bitmap($png)
    $icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
    $fs = [System.IO.File]::OpenWrite($icoPath)
    $icon.Save($fs)
    $fs.Close()
    $bmp.Dispose()
    $png.Dispose()
    $lnk.IconLocation = "$icoPath,0"
} catch {
    # Si falla la conversion, usar icono de wscript
    $lnk.IconLocation = "wscript.exe,0"
}

$lnk.Save()

Write-Host ""
Write-Host "  Acceso directo creado en el escritorio:" -ForegroundColor Green
Write-Host "  D-CLOCK Panel.lnk" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Haz doble clic en el icono para abrir el panel." -ForegroundColor White
Write-Host ""
