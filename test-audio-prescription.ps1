# Script para probar el endpoint de prescripción por audio
# Asegúrate de tener un archivo de audio en la carpeta test/

# 1. Primero, haz login como doctor para obtener el token
Write-Host "=== Login como Doctor ===" -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4001/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body (@{
        email = "doctor@example.com"
        password = "password123"
    } | ConvertTo-Json)

$token = $loginResponse.access_token
Write-Host "Token obtenido: $token" -ForegroundColor Green

# 2. Obtener la lista de pacientes para seleccionar uno
Write-Host "`n=== Obteniendo pacientes ===" -ForegroundColor Cyan
# Asume que ya tienes un paciente creado, si no, créalo primero

# 3. Enviar el audio con el patientId
Write-Host "`n=== Creando prescripción desde audio ===" -ForegroundColor Cyan

# Reemplaza estos valores:
$patientId = "PATIENT_ID_AQUI"  # Reemplazar con un ID de paciente real
$audioFilePath = ".\test\sample-audio.mp3"  # Reemplazar con tu archivo de audio

if (Test-Path $audioFilePath) {
    # Crear el form data
    $form = @{
        audio = Get-Item -Path $audioFilePath
        patientId = $patientId
    }

    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4001/prescriptions/from-audio" `
            -Method Post `
            -Headers @{
                Authorization = "Bearer $token"
            } `
            -Form $form

        Write-Host "`n✅ Prescripción creada exitosamente!" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 10)
    } catch {
        Write-Host "`n❌ Error al crear la prescripción:" -ForegroundColor Red
        Write-Host $_.Exception.Message
    }
} else {
    Write-Host "❌ Archivo de audio no encontrado: $audioFilePath" -ForegroundColor Red
}
