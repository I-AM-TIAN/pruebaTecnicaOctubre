# Guía para probar el endpoint desde Thunder Client / Postman

## Paso 1: Login como Doctor

**Endpoint:** `POST http://localhost:4001/auth/login`
**Headers:** 
- Content-Type: application/json

**Body (JSON):**
```json
{
  "email": "doctor@example.com",
  "password": "password123"
}
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

**Acción:** Copia el `access_token`

---

## Paso 2: Obtener un Patient ID (opcional si ya lo tienes)

**Endpoint:** `GET http://localhost:4001/patients`
**Headers:**
- Authorization: Bearer {access_token}

**Acción:** Copia el `id` de un paciente

---

## Paso 3: Crear prescripción desde audio

**Endpoint:** `POST http://localhost:4001/prescriptions/from-audio`
**Headers:**
- Authorization: Bearer {access_token}

**Body Type:** `form-data` (¡MUY IMPORTANTE!)

**Form Data:**
| Key | Type | Value |
|-----|------|-------|
| audio | File | Selecciona tu archivo de audio (mp3, ogg, wav, etc.) |
| patientId | Text | El ID del paciente (ej: clxxx123) |

---

## 🎤 Ejemplo de lo que puede decir el doctor en el audio:

"Prescripción para el paciente. Ibuprofeno 400 miligramos, 20 tabletas, tomar una cada ocho horas después de las comidas. Amoxicilina 500 miligramos, 14 cápsulas, tomar una cada doce horas durante siete días."

---

## ✅ Respuesta esperada:

```json
{
  "id": "clxxx123",
  "code": "RX-ABC123XYZ",
  "status": "pending",
  "notes": "Prescripción creada por audio. Transcripción: ...",
  "patientId": "clxxx456",
  "authorId": "clxxx789",
  "items": [
    {
      "id": "clxxx001",
      "name": "Ibuprofeno",
      "dosage": "400mg",
      "quantity": 20,
      "instructions": "Tomar una cada ocho horas después de las comidas"
    },
    {
      "id": "clxxx002",
      "name": "Amoxicilina",
      "dosage": "500mg",
      "quantity": 14,
      "instructions": "Tomar una cada doce horas durante siete días"
    }
  ],
  "transcription": "Prescripción para el paciente...",
  "aiProcessed": true
}
```
