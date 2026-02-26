/**
 * Test script for Recommendation service
 */
require('dotenv').config();
const { generateRecommendation } = require('./src/services/openai.service');

const dummyProfile = {
    name: "Juan Pérez",
    currentRole: "Lead Developer",
    industry: "Tecnología de la Información",
    yearsOfExperience: 10,
    skills: ["Node.js", "React", "AWS", "Microservicios", "Liderazgo técnico"],
    summary: "Líder técnico con pasión por las arquitecturas escalables y el desarrollo de equipos de alto rendimiento."
};

async function testRecommendation() {
    console.log('--- Probando generación de recomendación de especialidad ---');
    try {
        const recommendation = await generateRecommendation(dummyProfile);
        console.log('\nRecomendación generada:');
        console.log(JSON.stringify(recommendation, null, 2));
        console.log('\n--- Prueba de recomendación finalizada con éxito ---');
    } catch (error) {
        console.error('\nError al generar la recomendación:');
        console.error(error.message);
    }
}

testRecommendation();
