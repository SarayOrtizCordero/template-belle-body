# build-minify.ps1 — Minifica CSS y JS para produccion
# Uso: .\build-minify.ps1
# Genera archivos comprimidos en dist/ sin tocar el codigo fuente.

$dist = "dist"
$distCss = "$dist\css"
$distJs  = "$dist\js"

New-Item -ItemType Directory -Force $distCss | Out-Null
New-Item -ItemType Directory -Force $distJs  | Out-Null

# --- Minificar CSS ---
$css = Get-Content "css\styles.css" -Raw -Encoding UTF8
$css = $css -replace '/\*[\s\S]*?\*/', ''           # quitar comentarios bloque
$css = [regex]::Replace($css, '\s*\{\s*', '{')
$css = [regex]::Replace($css, '\s*\}\s*', '}')
$css = [regex]::Replace($css, '\s*;\s*', ';')
$css = [regex]::Replace($css, '\s*,\s*', ',')
$css = [regex]::Replace($css, '\s*:\s*(?=[^/])', ':')
$css = [regex]::Replace($css, '\s+', ' ')
$css = $css.Trim()
$css | Out-File -FilePath "$distCss\styles.min.css" -Encoding utf8 -NoNewline

# --- Minificar JS ---
$js = Get-Content "js\script.js" -Raw -Encoding UTF8
$js = $js -replace '/\*[\s\S]*?\*/', ''             # quitar comentarios bloque
$js = $js -replace '(?m)//[^\n]*', ''               # quitar comentarios linea
$js = [regex]::Replace($js, '\s+', ' ')
$js = $js.Trim()
$js | Out-File -FilePath "$distJs\script.min.js" -Encoding utf8 -NoNewline

# --- Reporte ---
$cssOrig = (Get-Item "css\styles.css").Length
$cssMin  = (Get-Item "$distCss\styles.min.css").Length
$jsOrig  = (Get-Item "js\script.js").Length
$jsMin   = (Get-Item "$distJs\script.min.js").Length

Write-Host ""
Write-Host "Minificacion completada:" -ForegroundColor Green
Write-Host ("  styles.css  {0,6} KB  ->  {1,6} KB  ({2:P0} reduccion)" -f [math]::Round($cssOrig/1KB,1), [math]::Round($cssMin/1KB,1), (1-$cssMin/$cssOrig))
Write-Host ("  script.js   {0,6} KB  ->  {1,6} KB  ({2:P0} reduccion)" -f [math]::Round($jsOrig/1KB,1),  [math]::Round($jsMin/1KB,1),  (1-$jsMin/$jsOrig))
Write-Host ""
Write-Host "Archivos en: $((Resolve-Path $dist).Path)" -ForegroundColor Cyan
Write-Host "Para produccion, reemplaza las referencias en el HTML por las rutas dist/." -ForegroundColor Yellow
