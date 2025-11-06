# 🎤 API Documentation: Create Prescription from Audio

## Endpoint Overview

Este endpoint permite a los doctores crear prescripciones médicas simplemente grabando un audio con los detalles de los medicamentos. El sistema automáticamente transcribe el audio y extrae la información estructurada usando IA.

---

## 📋 Endpoint Details

### **POST** `/prescriptions/from-audio`

Crea una nueva prescripción médica a partir de un archivo de audio dictado por el doctor.

---

## 🔐 Authentication

**Tipo:** Bearer Token  
**Rol requerido:** `doctor`  

Debes incluir el token de acceso del doctor en el header de autorización:

```
Authorization: Bearer {access_token}
```

---

## 📤 Request

### Headers

```http
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

### Body (form-data)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `audio` | **File** | ✅ Sí | Archivo de audio con la prescripción dictada |
| `patientId` | **String** | ✅ Sí | ID del paciente al que se le prescribe |

### Formatos de audio soportados

- ✅ MP3 (`.mp3`)
- ✅ OGG (`.ogg`)
- ✅ WAV (`.wav`)
- ✅ M4A (`.m4a`)
- ✅ WEBM (`.webm`)

### Tamaño máximo recomendado
- **Duración:** 10-60 segundos
- **Tamaño:** Máximo 10MB

---

## 🎤 Ejemplo de Audio

El doctor debe dictar claramente:

```
"Ibuprofeno 400 miligramos, 20 tabletas, tomar una cada 8 horas después de las comidas.
Amoxicilina 500 miligramos, 14 cápsulas, tomar una cada 12 horas durante 7 días.
Nota: Tomar con abundante agua"
```

### Recomendaciones para grabar:
- ✅ Hablar claro y despacio
- ✅ Pronunciar bien los nombres de los medicamentos
- ✅ Incluir dosis, cantidad e instrucciones
- ✅ Grabar en un ambiente silencioso
- ✅ Usar un buen micrófono (teléfono, laptop, etc.)

---

## 📥 Response

### Success Response (201 Created)

```json
{
  "id": "clxxx123abc",
  "code": "RX-ABC123XYZ",
  "status": "pending",
  "notes": "Prescripción creada por audio. Transcripción: Ibuprofeno 400 miligramos...",
  "createdAt": "2025-11-06T14:30:00.000Z",
  "consumedAt": null,
  "patientId": "clxxx456def",
  "authorId": "clxxx789ghi",
  "items": [
    {
      "id": "clxxx001",
      "name": "Ibuprofeno",
      "dosage": "400mg",
      "quantity": 20,
      "instructions": "Tomar una cada 8 horas después de las comidas",
      "prescriptionId": "clxxx123abc"
    },
    {
      "id": "clxxx002",
      "name": "Amoxicilina",
      "dosage": "500mg",
      "quantity": 14,
      "instructions": "Tomar una cada 12 horas durante 7 días",
      "prescriptionId": "clxxx123abc"
    }
  ],
  "patient": {
    "id": "clxxx456def",
    "user": {
      "name": "Juan Pérez",
      "email": "juan@example.com"
    }
  },
  "author": {
    "id": "clxxx789ghi",
    "specialty": "Medicina General",
    "user": {
      "name": "Dr. María García",
      "email": "doctor@example.com"
    }
  },
  "transcription": "Ibuprofeno 400 miligramos, 20 tabletas, tomar una cada 8 horas después de las comidas. Amoxicilina 500 miligramos, 14 cápsulas, tomar una cada 12 horas durante 7 días. Nota: Tomar con abundante agua",
  "aiProcessed": true
}
```

### Error Responses

#### 400 Bad Request - Audio no proporcionado
```json
{
  "statusCode": 400,
  "message": "Audio file is required",
  "error": "Bad Request"
}
```

#### 400 Bad Request - patientId faltante
```json
{
  "statusCode": 400,
  "message": "patientId is required",
  "error": "Bad Request"
}
```

#### 401 Unauthorized - Token inválido o ausente
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### 403 Forbidden - No es doctor
```json
{
  "statusCode": 403,
  "message": "Solo los doctores pueden crear prescripciones",
  "error": "Forbidden"
}
```

#### 404 Not Found - Paciente no existe
```json
{
  "statusCode": 404,
  "message": "Paciente no encontrado",
  "error": "Not Found"
}
```

#### 500 Internal Server Error - Error al procesar
```json
{
  "statusCode": 500,
  "message": "Error al procesar el audio y crear la prescripción: ...",
  "error": "Internal Server Error"
}
```

---

## 🌐 Implementación en Frontend

### Usando Fetch API (JavaScript/TypeScript)

```javascript
async function createPrescriptionFromAudio(audioFile, patientId, token) {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('patientId', patientId);

  try {
    const response = await fetch('http://localhost:4001/prescriptions/from-audio', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const prescription = await response.json();
    return prescription;
  } catch (error) {
    console.error('Error creating prescription:', error);
    throw error;
  }
}

// Uso
const audioFile = document.getElementById('audioInput').files[0];
const patientId = 'clxxx456def';
const token = 'eyJhbGc...';

createPrescriptionFromAudio(audioFile, patientId, token)
  .then(prescription => {
    console.log('Prescription created:', prescription);
    alert(`Prescripción creada: ${prescription.code}`);
  })
  .catch(error => {
    alert('Error: ' + error.message);
  });
```

### Usando Axios (React/Vue/Angular)

```typescript
import axios from 'axios';

interface CreatePrescriptionResponse {
  id: string;
  code: string;
  status: string;
  items: Array<{
    name: string;
    dosage?: string;
    quantity?: number;
    instructions?: string;
  }>;
  transcription: string;
  aiProcessed: boolean;
}

async function createPrescriptionFromAudio(
  audioFile: File,
  patientId: string,
  token: string
): Promise<CreatePrescriptionResponse> {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('patientId', patientId);

  try {
    const response = await axios.post<CreatePrescriptionResponse>(
      'http://localhost:4001/prescriptions/from-audio',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Error al crear prescripción');
    }
    throw error;
  }
}
```

### Componente React Completo

```tsx
import React, { useState, useRef } from 'react';
import axios from 'axios';

interface Patient {
  id: string;
  user: {
    name: string;
  };
}

export default function AudioPrescriptionForm() {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'prescription-audio.webm', { type: 'audio/webm' });
        setAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al iniciar grabación:', error);
      alert('No se pudo acceder al micrófono');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile || !selectedPatient) {
      alert('Por favor selecciona un paciente y graba el audio');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('patientId', selectedPatient);

      const token = localStorage.getItem('access_token'); // O de donde guardes el token

      const response = await axios.post(
        'http://localhost:4001/prescriptions/from-audio',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert(`¡Prescripción creada! Código: ${response.data.code}`);
      console.log('Prescription:', response.data);
      
      // Resetear formulario
      setAudioFile(null);
      setSelectedPatient('');
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Seleccionar Paciente</label>
        <select 
          value={selectedPatient} 
          onChange={(e) => setSelectedPatient(e.target.value)}
          required
        >
          <option value="">-- Seleccionar --</option>
          {/* Cargar pacientes dinámicamente */}
        </select>
      </div>

      <div>
        <label>Audio de Prescripción</label>
        <div className="space-x-2">
          {!isRecording ? (
            <button type="button" onClick={startRecording}>
              🎤 Iniciar Grabación
            </button>
          ) : (
            <button type="button" onClick={stopRecording}>
              ⏹️ Detener Grabación
            </button>
          )}
          
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          />
        </div>
        {audioFile && <p>✅ Audio: {audioFile.name}</p>}
      </div>

      <button type="submit" disabled={isLoading || !audioFile || !selectedPatient}>
        {isLoading ? 'Procesando...' : '📝 Crear Prescripción'}
      </button>
    </form>
  );
}
```

---

## 🔄 Flujo Completo

```
1. Doctor se autentica → Obtiene token JWT
2. Doctor selecciona paciente → Obtiene patientId
3. Doctor graba/sube audio → Archivo de audio
4. Frontend envía: audio + patientId + token
5. Backend:
   ├─ Valida autenticación (JWT)
   ├─ Valida rol de doctor
   ├─ Transcribe audio (ElevenLabs API)
   ├─ Estructura datos (OpenAI API)
   └─ Crea prescripción en DB
6. Frontend recibe prescripción creada
7. Mostrar código QR, PDF, o confirmación
```

---

## ⚠️ Consideraciones Importantes

1. **Tamaño del archivo:** Limitar a 10MB en el frontend antes de enviar
2. **Timeout:** La petición puede tardar 10-30 segundos (transcripción + IA)
3. **Feedback al usuario:** Mostrar loader/spinner mientras procesa
4. **Manejo de errores:** Implementar reintentos en caso de falla
5. **Validación del audio:** Verificar que el archivo tenga contenido antes de enviar
6. **Formato recomendado:** MP3 o WEBM para mejor compatibilidad

---

## 🧪 Testing

### Herramientas recomendadas:
- **Postman/Thunder Client:** Para pruebas manuales
- **Jest + Supertest:** Para tests automatizados
- **Grabadora de voz:** Del sistema operativo o dispositivo móvil

### Audio de prueba:
Puedes crear un archivo de prueba diciendo:
> "Paracetamol 500 miligramos, 10 tabletas, tomar una cada 6 horas en caso de dolor o fiebre"

---

## 📞 Soporte

Para dudas o problemas con este endpoint, contactar al equipo de backend.
