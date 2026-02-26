/**
 * OpenAI Service
 * Handles all AI interactions: CV analysis, recommendations, chat
 */

const { openai, OPENAI_MODEL } = require('../config/openai');
const { SPECIALIZATIONS, getSpecializationNamesForPrompt } = require('../utils/specializations');

const ensureOpenAIConfigured = () => {
    if (!openai) {
        const error = new Error('OPENAI_API_KEY is not configured.');
        error.statusCode = 503;
        throw error;
    }
};

/**
 * Analyze CV text and extract structured profile data
 * @param {string} cvText - Raw text extracted from CV/PDF
 * @returns {Object} Extracted profile data
 */
const extractProfileFromCV = async (cvText) => {
    ensureOpenAIConfigured();

    const prompt = `Eres un experto en análisis de CVs y perfiles profesionales. 
Analiza el siguiente CV y extrae la información estructurada en formato JSON.

CV:
"""
${cvText}
"""

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "name": "nombre completo del candidato",
  "currentRole": "cargo o rol actual más reciente",
  "yearsOfExperience": número estimado de años de experiencia,
  "industry": "industria o sector principal",
  "skills": ["habilidad1", "habilidad2", ...],
  "education": [
    {
      "degree": "título o grado",
      "field": "campo de estudio",
      "institution": "institución",
      "year": año de graduación o null
    }
  ],
  "experience": [
    {
      "title": "cargo",
      "company": "empresa",
      "duration": "duración",
      "description": "descripción breve"
    }
  ],
  "languages": ["idioma1", "idioma2"],
  "certifications": ["certificación1", ...],
  "summary": "resumen profesional de 2-3 oraciones"
}`;

    const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
};

/**
 * Generate specialization recommendation based on profile
 * @param {Object} profile - Extracted profile data
 * @param {string} sourceType - 'pdf' or 'linkedin'
 * @returns {Object} Recommendation with specialization, reasoning, and match score
 */
const generateRecommendation = async (profile, sourceType = 'pdf') => {
    ensureOpenAIConfigured();

    const specializationsList = getSpecializationNamesForPrompt();

    const prompt = `Eres un asesor académico experto de LAR University, una institución de educación ejecutiva de élite.

Tu tarea es analizar la Hoja de Vida (CV) de un candidato y recomendar el Sprint de especialización más adecuada de nuestro catálogo.

PERFIL DEL CANDIDATO:
- Nombre: ${profile.name || 'No especificado'}
- Rol actual: ${profile.currentRole || 'No especificado'}
- Industria: ${profile.industry || 'No especificada'}
- Años de experiencia: ${profile.yearsOfExperience || 'No especificado'}
- Habilidades: ${(profile.skills || []).join(', ') || 'No especificadas'}
- Resumen: ${profile.summary || 'No disponible'}

SPRINTS DISPONIBLES EN LAR UNIVERSITY:
${specializationsList}

INSTRUCCIONES:
1. Analiza el CV y determina qué Sprint complementa mejor su trayectoria.
2. La recomendación debe ser un Sprint que POTENCIE su perfil actual.
3. Si el candidato es analista de datos, recomienda el Sprint de ANALÍTICA DE DATOS.
4. Proporciona un score de compatibilidad del 0 al 100.
5. Explica el razonamiento de forma motivadora, mencionando siempre el nombre del Sprint.

Responde ÚNICAMENTE con un JSON válido:
{
  "primarySpecialization": "NOMBRE_DEL_SPRINT",
  "primarySpecializationId": "id-del-sprint",
  "secondarySpecializations": ["OTRO_SPRINT", "OTRO_SPRINT"],
  "matchScore": número del 0 al 100,
  "reasoning": "Explicación personalizada de 3-4 oraciones de por qué este Sprint es perfecto para el candidato",
  "keyStrengths": ["fortaleza1", "fortaleza2", "fortaleza3"],
  "growthAreas": ["área de crecimiento1", "área de crecimiento2"]
}

Los IDs válidos son: comunicacion, emprendimiento, finanzas, talento, tecnologia, ia-automatizacion, mercado-cliente, operaciones, analitica-datos`;

    const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Find the matching specialization from our catalog
    const specializationKey = Object.keys(SPECIALIZATIONS).find(
        (key) =>
            SPECIALIZATIONS[key].id === result.primarySpecializationId ||
            SPECIALIZATIONS[key].name === result.primarySpecialization
    );

    const specialization = specializationKey
        ? SPECIALIZATIONS[specializationKey]
        : Object.values(SPECIALIZATIONS)[0];

    return {
        ...result,
        specialization,
        subjects: specialization.subjects,
        sprintUrl: specialization.sprintUrl,
    };
};

/**
 * Generate a chat response in the context of the conversation
 * @param {Array} messages - Conversation history
 * @param {Object} userProfile - User's extracted profile (optional)
 * @param {Object} recommendation - Current recommendation (optional)
 * @returns {string} AI response
 */
const generateChatResponse = async (messages, userProfile = null, recommendation = null) => {
    ensureOpenAIConfigured();

    const systemPrompt = `Eres un asesor académico experto y amigable de LAR University, una institución de educación ejecutiva de élite. 
Tu nombre es "LAR Advisor" y tu misión es ayudar a los profesionales a encontrar la especialización perfecta para potenciar su carrera.

${userProfile ? `PERFIL DEL USUARIO:
- Nombre: ${userProfile.name || 'el usuario'}
- Rol: ${userProfile.currentRole || 'profesional'}
- Industria: ${userProfile.industry || 'no especificada'}
- Habilidades: ${(userProfile.skills || []).slice(0, 5).join(', ')}
` : ''}

${recommendation ? `RECOMENDACIÓN ACTUAL:
- Especialización recomendada: ${recommendation.specialization?.name || recommendation.primarySpecialization}
- Score de compatibilidad: ${recommendation.matchScore}%
- Materias: ${(recommendation.subjects || []).join(', ')}
` : ''}

INSTRUCCIONES:
- Responde siempre en español
- Sé motivador, profesional y cercano
- Si el usuario pregunta sobre la especialización recomendada, explica los beneficios
- Si el usuario quiere explorar otras opciones, muéstrate abierto y explica las alternativas
- Mantén respuestas concisas pero informativas (máximo 3-4 párrafos)
- Usa emojis ocasionalmente para hacer la conversación más amigable
- Siempre invita al usuario a dar el siguiente paso`;

    const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        })),
    ];

    const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800,
    });

    return response.choices[0].message.content;
};

/**
 * Analyze LinkedIn profile from URL (scraping not available, uses AI with URL context)
 * @param {string} linkedinUrl - LinkedIn profile URL
 * @returns {Object} Profile data and recommendation
 */
const analyzeLinkedInProfile = async (linkedinUrl) => {
    ensureOpenAIConfigured();

    // Note: Direct LinkedIn scraping requires their API or a third-party service.
    // This implementation asks the user to paste their LinkedIn summary instead.
    const prompt = `Eres un experto en análisis de perfiles profesionales de LinkedIn.

El usuario ha proporcionado su URL de LinkedIn: ${linkedinUrl}

Como no podemos acceder directamente al perfil, genera un mensaje amigable explicando que:
1. Por políticas de privacidad, no podemos acceder directamente a LinkedIn
2. Pídele que copie y pegue su resumen de LinkedIn o descripción de su perfil
3. O que suba su CV en PDF como alternativa

Responde en español de forma amigable y profesional.`;

    const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
    });

    return {
        requiresManualInput: true,
        message: response.choices[0].message.content,
    };
};

module.exports = {
    extractProfileFromCV,
    generateRecommendation,
    generateChatResponse,
    analyzeLinkedInProfile,
};
