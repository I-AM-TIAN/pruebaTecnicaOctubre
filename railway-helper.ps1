# Railway Deployment Helper
# Este script te ayuda a preparar las variables de entorno para Railway

Write-Host "🚂 Railway Deployment Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Función para generar secretos seguros
function Generate-Secret {
    $bytes = New-Object byte[] 64
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

Write-Host "📋 Variables de Entorno para Railway" -ForegroundColor Green
Write-Host ""

# Generar secretos JWT
$jwtSecret = Generate-Secret
$jwtRefreshSecret = Generate-Secret

Write-Host "Copia y pega estas variables en Railway:" -ForegroundColor Yellow
Write-Host ""

Write-Host "# ============================================" -ForegroundColor Gray
Write-Host "# Base de Datos" -ForegroundColor Gray
Write-Host "# ============================================" -ForegroundColor Gray
Write-Host "DATABASE_URL=`${{Postgres.DATABASE_URL}}" -ForegroundColor White
Write-Host ""

Write-Host "# ============================================" -ForegroundColor Gray
Write-Host "# JWT Secrets (GENERADOS AUTOMÁTICAMENTE)" -ForegroundColor Gray
Write-Host "# ============================================" -ForegroundColor Gray
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White
Write-Host "JWT_REFRESH_SECRET=$jwtRefreshSecret" -ForegroundColor White
Write-Host "JWT_ACCESS_EXPIRATION=15m" -ForegroundColor White
Write-Host "JWT_REFRESH_EXPIRATION=7d" -ForegroundColor White
Write-Host ""

Write-Host "# ============================================" -ForegroundColor Gray
Write-Host "# Servidor" -ForegroundColor Gray
Write-Host "# ============================================" -ForegroundColor Gray
Write-Host "PORT=4001" -ForegroundColor White
Write-Host "NODE_ENV=production" -ForegroundColor White
Write-Host ""

Write-Host "# ============================================" -ForegroundColor Gray
Write-Host "# CORS (Opcional - Agrega tus dominios)" -ForegroundColor Gray
Write-Host "# ============================================" -ForegroundColor Gray
Write-Host "CORS_ORIGIN=https://tu-frontend.com,https://otro-dominio.com" -ForegroundColor White
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Secretos JWT generados con seguridad" -ForegroundColor Green
Write-Host "📝 Copia las variables de arriba a Railway" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Guía completa: RAILWAY_DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host "⚡ Guía rápida: RAILWAY_QUICKSTART.md" -ForegroundColor Yellow
Write-Host ""

# Preguntar si quiere guardar en un archivo
$save = Read-Host "¿Guardar estas variables en 'railway-vars.txt'? (s/n)"
if ($save -eq 's' -or $save -eq 'S') {
    $content = @"
# Railway Environment Variables
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# ============================================
# Base de Datos
# ============================================
DATABASE_URL=`${{Postgres.DATABASE_URL}}

# ============================================
# JWT Secrets
# ============================================
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefreshSecret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ============================================
# Servidor
# ============================================
PORT=4001
NODE_ENV=production

# ============================================
# CORS (Opcional)
# ============================================
CORS_ORIGIN=https://tu-frontend.com,https://otro-dominio.com
"@
    
    $content | Out-File -FilePath "railway-vars.txt" -Encoding UTF8
    Write-Host "✅ Variables guardadas en railway-vars.txt" -ForegroundColor Green
    Write-Host "⚠️  NO subas este archivo a Git" -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona Enter para salir..."
$null = Read-Host
