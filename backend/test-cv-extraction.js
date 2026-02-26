/**
 * Test script for CV analysis service
 */
require('dotenv').config();
const { extractProfileFromCV } = require('./src/services/openai.service');

const dummyCVText = `
JUAN PÉREZ
Ingeniero de Software Senior
Ciudad de México

RESUMEN
Profesional con más de 10 años de experiencia en desarrollo web full-stack, especializado en arquitecturas escalables y liderazgo técnico.

EXPERIENCIA
Tech Solutions SA - Lead Developer (2018 - Presente)
- Liderazgo de un equipo de 15 personas.
- Implementación de microservicios con Node.js y React.
- Reducción del tiempo de despliegue en un 40%.

Web Innovators - Senior Developer (2014 - 2018)
- Desarrollo de aplicaciones con Ruby on Rails.
- Optimización de bases de datos PostgreSQL.

EDUCACIÓN
Licenciatura en Ciencias de la Computación
Universidad Nacional Autónoma de México (Graduado 2013)

HABILIDADES
JavaScript, TypeScript, React, Node.js, AWS, Kubernetes, Liderazgo, Agile.

IDIOMAS
Español (Nativo), Inglés (C1)
`;

async function testExtraction() {
    console.log('--- Probando extracción de perfil desde CV ---');
    try {
        const profile = await extractProfileFromCV(dummyCVText);
        console.log('\nPerfil extraído:');
        console.log(JSON.stringify(profile, null, 2));
        console.log('\n--- Prueba de extracción finalizada con éxito ---');
    } catch (error) {
        console.error('\nError al analizar el CV:');
        console.error(error.message);
    }
}

testExtraction();
