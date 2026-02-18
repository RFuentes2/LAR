/**
 * TEST FULL FLOW: Register -> Login -> Create Chat -> Send Message
 * This script demonstrates the backend functionality including OpenAI responses.
 */
require('dotenv').config();
const axios = require('axios');

const PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${PORT}/api`;

const testData = {
    name: "Candidato de Prueba",
    email: `test_${Date.now()}@example.com`,
    password: "password123"
};

async function runTest() {
    console.log('🚀 Iniciando Prueba de Flujo Completo...');

    try {
        // 1. Registro
        console.log('\n1. Registrando usuario...');
        const regRes = await axios.post(`${API_URL}/auth/register`, testData);
        console.log('✅ Registro exitoso.');
        const token = regRes.data.data.token;

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Login (verificación)
        console.log('2. Verificando login...');
        await axios.post(`${API_URL}/auth/login`, {
            email: testData.email,
            password: testData.password
        });
        console.log('✅ Login exitoso.');

        // 3. Crear un Chat
        console.log('3. Creando un nuevo chat...');
        const chatRes = await axios.post(`${API_URL}/chat`, {
            title: "Prueba de Asesoría AI"
        }, config);
        const chatId = chatRes.data.data.chat.id;
        console.log(`✅ Chat creado con ID: ${chatId}`);

        // 4. Enviar Mensaje (Prueba de OpenAI)
        console.log('\n4. Enviando pregunta al asesor AI...');
        console.log('❓ Pregunta: "¿Qué especialización me recomiendas para escalar arquitecturas con Node.js?"');

        const msgRes = await axios.post(`${API_URL}/chat/${chatId}/message`, {
            content: "¿Qué especialización me recomiendas para escalar arquitecturas con Node.js?"
        }, config);

        console.log('\n🤖 Respuesta del Asesor LAR:');
        console.log('---------------------------------------------------------');
        console.log(msgRes.data.data.assistantMessage.content);
        console.log('---------------------------------------------------------');

        console.log('\n✨ ¡Prueba finalizada con éxito! El backend está procesando mensajes correctamente.');

    } catch (error) {
        console.error('\n❌ Error en la prueba:');
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
        console.log('\nTip: Asegúrate de que el servidor esté corriendo con "npm run dev"');
    }
}

runTest();
