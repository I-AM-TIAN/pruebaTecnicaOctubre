/**
 * Script de prueba para el endpoint de prescripción por audio
 * Ejecutar: node test-audio-endpoint.js
 */

const fs = require('fs');
const path = require('path');

// Configuración
const BASE_URL = 'http://localhost:4001';
const DOCTOR_EMAIL = 'doctor@example.com';
const DOCTOR_PASSWORD = 'password123';
const AUDIO_FILE_PATH = './test/sample-audio.mp3'; // Cambia esto por tu archivo de audio
const PATIENT_ID = 'PATIENT_ID_AQUI'; // Cambia esto por un ID de paciente real

async function testAudioPrescription() {
  console.log('🧪 === Iniciando prueba del endpoint de audio ===\n');

  try {
    // Paso 1: Login
    console.log('1️⃣ Haciendo login como doctor...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: DOCTOR_EMAIL,
        password: DOCTOR_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falló: ${loginResponse.status}`);
    }

    const { access_token } = await loginResponse.json();
    console.log('✅ Login exitoso\n');

    // Paso 2: Verificar que el archivo de audio existe
    console.log('2️⃣ Verificando archivo de audio...');
    if (!fs.existsSync(AUDIO_FILE_PATH)) {
      throw new Error(`❌ Archivo de audio no encontrado: ${AUDIO_FILE_PATH}`);
    }
    console.log(`✅ Archivo encontrado: ${AUDIO_FILE_PATH}\n`);

    // Paso 3: Crear el FormData con el audio
    console.log('3️⃣ Enviando audio para crear prescripción...');
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Agregar el archivo de audio
    formData.append('audio', fs.createReadStream(AUDIO_FILE_PATH));
    
    // Agregar el patientId
    formData.append('patientId', PATIENT_ID);

    const prescriptionResponse = await fetch(`${BASE_URL}/prescriptions/from-audio`, {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${access_token}`,
      },
      body: formData,
    });

    if (!prescriptionResponse.ok) {
      const errorText = await prescriptionResponse.text();
      throw new Error(`Error al crear prescripción: ${prescriptionResponse.status} - ${errorText}`);
    }

    const prescription = await prescriptionResponse.json();
    
    console.log('✅ ¡Prescripción creada exitosamente!\n');
    console.log('📋 === DETALLES DE LA PRESCRIPCIÓN ===');
    console.log(`Código: ${prescription.code}`);
    console.log(`Estado: ${prescription.status}`);
    console.log(`Notas: ${prescription.notes}`);
    console.log(`\n🎤 Transcripción del audio:`);
    console.log(prescription.transcription);
    console.log(`\n💊 Medicamentos (${prescription.items.length}):`);
    prescription.items.forEach((item, index) => {
      console.log(`\n  ${index + 1}. ${item.name}`);
      if (item.dosage) console.log(`     Dosis: ${item.dosage}`);
      if (item.quantity) console.log(`     Cantidad: ${item.quantity}`);
      if (item.instructions) console.log(`     Instrucciones: ${item.instructions}`);
    });

    console.log('\n✅ === Prueba completada exitosamente ===');
    
  } catch (error) {
    console.error('\n❌ === Error en la prueba ===');
    console.error(error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
testAudioPrescription();
