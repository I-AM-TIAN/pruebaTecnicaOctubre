# ✅ Checklist para Probar el Endpoint de Prescripción por Audio

## 📋 Pre-requisitos

### 1. Variables de entorno configuradas
- [ ] Copia `.env.example` a `.env`
- [ ] Configura `ELEVENLABS_API_KEY` en `.env`
- [ ] Configura `OPENAI_API_KEY` en `.env`
- [ ] (Opcional) Configura `OPENAI_MODEL` (por defecto: gpt-4o-mini)

### 2. Base de datos y servidor
- [ ] Base de datos PostgreSQL corriendo (`docker-compose up -d`)
- [ ] Ejecutar migraciones de Prisma (`npm run prisma:migrate`)
- [ ] Ejecutar seed para crear usuarios de prueba (`npm run prisma:seed`)
- [ ] Servidor NestJS corriendo (`npm run start:dev`)

### 3. Datos de prueba
- [ ] Verificar que existe un doctor en la DB (email: doctor@example.com)
- [ ] Verificar que existe al menos un paciente en la DB
- [ ] Anotar el ID de un paciente para la prueba

---

## 🎯 Pasos para probar

### Opción A: Thunder Client / Postman (Recomendado)

#### Paso 1: Login
1. [ ] Abrir Thunder Client o Postman
2. [ ] Crear request `POST http://localhost:4001/auth/login`
3. [ ] Body (JSON):
   ```json
   {
     "email": "doctor@example.com",
     "password": "password123"
   }
   ```
4. [ ] Ejecutar y copiar el `access_token`

#### Paso 2: Obtener Patient ID (si no lo tienes)
1. [ ] Request `GET http://localhost:4001/patients`
2. [ ] Header: `Authorization: Bearer {token}`
3. [ ] Copiar el `id` de cualquier paciente

#### Paso 3: Preparar el audio
1. [ ] Grabar un audio con una prescripción de prueba
2. [ ] Guardar como `sample-audio.mp3` en la carpeta `test/`
3. [ ] Ejemplo de dictado:
   > "Ibuprofeno 400 miligramos, 20 tabletas, tomar una cada 8 horas. Amoxicilina 500 miligramos, 14 cápsulas, una cada 12 horas por 7 días"

#### Paso 4: Crear prescripción desde audio
1. [ ] Request `POST http://localhost:4001/prescriptions/from-audio`
2. [ ] Header: `Authorization: Bearer {token}`
3. [ ] Body type: **form-data** (¡importante!)
4. [ ] Agregar campos:
   - `audio` (File): Seleccionar el archivo de audio
   - `patientId` (Text): Pegar el ID del paciente
5. [ ] Ejecutar request
6. [ ] Verificar respuesta exitosa con la prescripción creada

---

### Opción B: Script de Node.js

1. [ ] Instalar form-data: `npm install form-data`
2. [ ] Editar `test-audio-endpoint.js`:
   - Cambiar `PATIENT_ID` por un ID real
   - Verificar ruta del audio en `AUDIO_FILE_PATH`
3. [ ] Ejecutar: `node test-audio-endpoint.js`
4. [ ] Verificar la salida en consola

---

### Opción C: Script de PowerShell

1. [ ] Editar `test-audio-prescription.ps1`:
   - Cambiar `$patientId` por un ID real
   - Verificar ruta del audio en `$audioFilePath`
2. [ ] Ejecutar: `.\test-audio-prescription.ps1`
3. [ ] Verificar la salida en consola

---

## 🔍 Verificación

### Revisar en la base de datos
```sql
-- Ver la prescripción creada
SELECT * FROM prescriptions ORDER BY "createdAt" DESC LIMIT 1;

-- Ver los items de la prescripción
SELECT * FROM prescription_items 
WHERE "prescriptionId" = 'ID_DE_LA_PRESCRIPCION';
```

### Revisar logs del servidor
- [ ] Verificar logs de transcripción de ElevenLabs
- [ ] Verificar logs de estructuración de OpenAI
- [ ] Verificar que no hay errores

---

## 🐛 Troubleshooting

### Error: "OpenAI API key not configured"
- ✅ Verifica que `OPENAI_API_KEY` está en `.env`
- ✅ Reinicia el servidor después de agregar la variable

### Error: "ElevenLabs API key not configured"
- ✅ Verifica que `ELEVENLABS_API_KEY` está en `.env`
- ✅ Reinicia el servidor

### Error: "Audio file is required"
- ✅ Asegúrate de enviar el campo `audio` como **File** en form-data
- ✅ No uses JSON, debe ser multipart/form-data

### Error: "patientId is required"
- ✅ Verifica que estás enviando el campo `patientId` en el form-data
- ✅ Verifica que el ID del paciente existe en la base de datos

### Error: "No se pudo transcribir el audio"
- ✅ Verifica que el archivo de audio es válido
- ✅ Verifica que el audio tiene contenido audible
- ✅ Revisa los logs de ElevenLabs para más detalles

### Error: "No se pudieron extraer medicamentos del audio"
- ✅ Verifica que el audio menciona medicamentos claramente
- ✅ Intenta con un audio más claro y estructurado
- ✅ Revisa la transcripción en los logs

---

## 📊 Respuesta esperada exitosa

```json
{
  "id": "clxxx123",
  "code": "RX-ABC123XYZ",
  "status": "pending",
  "notes": "Prescripción creada por audio. Transcripción: ...",
  "createdAt": "2025-11-06T...",
  "consumedAt": null,
  "patientId": "clxxx456",
  "authorId": "clxxx789",
  "items": [
    {
      "id": "clxxx001",
      "name": "Ibuprofeno",
      "dosage": "400mg",
      "quantity": 20,
      "instructions": "Tomar una cada 8 horas"
    }
  ],
  "patient": {
    "id": "clxxx456",
    "user": {
      "name": "Juan Pérez",
      "email": "juan@example.com"
    }
  },
  "author": {
    "id": "clxxx789",
    "specialty": "Medicina General",
    "user": {
      "name": "Dr. María García",
      "email": "doctor@example.com"
    }
  },
  "transcription": "Ibuprofeno 400 miligramos, 20 tabletas...",
  "aiProcessed": true
}
```
