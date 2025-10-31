# Script de Ayuda para Deployment en Railway

Write-Host "🚂 Railway Deployment Helper" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Este script debe ejecutarse desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Verificando estructura del proyecto..." -ForegroundColor Green

# Verificar archivos necesarios
$requiredFiles = @(
    "package.json",
    "railway.toml",
    "nixpacks.toml",
    "Dockerfile",
    "prisma/schema.prisma",
    ".env.example"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (falta)" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n❌ Faltan archivos necesarios. Por favor verifica." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Todos los archivos de configuración están presentes`n" -ForegroundColor Green

# Generar JWT Secrets
Write-Host "🔐 Generando JWT Secrets seguros..." -ForegroundColor Cyan
Write-Host "Copia estos valores a Railway:`n" -ForegroundColor Yellow

$jwtSecret = node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
$jwtRefreshSecret = node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

Write-Host "JWT_SECRET=" -NoNewline -ForegroundColor White
Write-Host $jwtSecret -ForegroundColor Green

Write-Host "JWT_REFRESH_SECRET=" -NoNewline -ForegroundColor White
Write-Host $jwtRefreshSecret -ForegroundColor Green

Write-Host "`n📋 Otras variables a configurar en Railway:" -ForegroundColor Cyan
Write-Host "DATABASE_URL=" -NoNewline -ForegroundColor White
Write-Host '${{Postgres.DATABASE_URL}}' -ForegroundColor Magenta -NoNewline
Write-Host " (usar referencia)" -ForegroundColor Gray

Write-Host "JWT_ACCESS_EXPIRATION=" -NoNewline -ForegroundColor White
Write-Host "15m" -ForegroundColor Green

Write-Host "JWT_REFRESH_EXPIRATION=" -NoNewline -ForegroundColor White
Write-Host "7d" -ForegroundColor Green

Write-Host "CORS_ORIGIN=" -NoNewline -ForegroundColor White
Write-Host "https://tu-frontend-url.com" -ForegroundColor Yellow -NoNewline
Write-Host " (opcional)" -ForegroundColor Gray

Write-Host "`n📚 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Sube tu código a GitHub si aún no lo has hecho" -ForegroundColor White
Write-Host "2. Ve a https://railway.app y crea un nuevo proyecto" -ForegroundColor White
Write-Host "3. Conecta tu repositorio de GitHub" -ForegroundColor White
Write-Host "4. Agrega una base de datos PostgreSQL" -ForegroundColor White
Write-Host "5. Configura las variables de entorno mostradas arriba" -ForegroundColor White
Write-Host "6. Railway desplegará automáticamente tu aplicación`n" -ForegroundColor White

Write-Host "📖 Para más detalles, lee:" -ForegroundColor Cyan
Write-Host "  • RAILWAY_QUICKSTART.md (guía rápida 5 minutos)" -ForegroundColor White
Write-Host "  • RAILWAY_DEPLOYMENT.md (guía completa detallada)`n" -ForegroundColor White

Write-Host "✨ ¡Listo para desplegar!" -ForegroundColor Green
