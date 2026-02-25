/**
 * CV Controller
 * Uses in-memory store (no DB). TODO: migrate to PostgreSQL.
 */

const { analyses, users } = require('../store/memoryStore');
const { extractTextFromFile } = require('../services/pdf.service');
const { extractProfileFromCV, generateRecommendation } = require('../services/openai.service');

/**
 * POST /api/cv/upload
 */
const uploadCV = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Por favor sube un archivo PDF o CSV con tu información.',
            });
        }

        const filePath = req.file.path;
        const filename = req.file.originalname;

        // Create analysis record
        const analysis = analyses.create({
            userId: req.user.id,
            sourceType: filename.toLowerCase().endsWith('.csv') ? 'csv' : 'pdf',
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: filePath,
            },
        });

        analyses.update(analysis.id, { status: 'processing' });

        // Extract text from file
        console.log(`📄 Extracting text from file: ${filename}`);
        let extractResult;
        try {
            extractResult = await extractTextFromFile(filePath, filename);
        } catch (err) {
            analyses.update(analysis.id, {
                status: 'failed',
                errorMessage: err.message,
            });
            return res.status(422).json({
                success: false,
                message: err.message,
            });
        }

        const { text } = extractResult;

        if (!text || text.length < 50) {
            analyses.update(analysis.id, {
                status: 'failed',
                errorMessage: 'No se pudo extraer suficiente contenido del archivo.',
            });
            return res.status(422).json({
                success: false,
                message: 'No se pudo leer el contenido del archivo. Asegúrate de que no esté vacío y sea un formato válido.',
            });
        }

        // Analyze with OpenAI
        console.log(`🤖 Analyzing content with OpenAI (${analysis.sourceType})...`);
        let extractedProfile;
        try {
            extractedProfile = await extractProfileFromCV(text);
        } catch (aiErr) {
            console.error('❌ OpenAI Extraction Error:', aiErr.message);
            analyses.update(analysis.id, { status: 'failed', errorMessage: 'Error al extraer perfil con IA' });
            return res.status(502).json({ success: false, message: 'La IA no pudo procesar el contenido del archivo. Intenta con un archivo más claro.' });
        }

        console.log(`🎯 Generating specialization recommendation...`);
        let recommendation;
        try {
            recommendation = await generateRecommendation(extractedProfile, analysis.sourceType);
        } catch (aiErr) {
            console.error('❌ OpenAI Recommendation Error:', aiErr.message);
            analyses.update(analysis.id, { status: 'failed', errorMessage: 'Error al generar recomendación' });
            return res.status(502).json({ success: false, message: 'Hubo un error al generar tu recomendación personalizada.' });
        }

        // Save results safely
        const updated = analyses.update(analysis.id, {
            rawText: text.substring(0, 5000),
            extractedProfile,
            recommendation: {
                primarySpecialization: recommendation?.specialization?.name || recommendation?.primarySpecialization || 'General',
                secondarySpecializations: recommendation?.secondarySpecializations || [],
                matchScore: recommendation?.matchScore || 0,
                reasoning: recommendation?.reasoning || 'No se pudo generar un razonamiento detallado.',
                subjects: recommendation?.subjects || [],
                sprintUrl: recommendation?.sprintUrl || '#',
            },
            status: 'completed',
            processedAt: new Date().toISOString(),
        });

        // Update user reference
        users.update(req.user.id, {
            cvAnalysisId: analysis.id,
            recommendedSpecialization: recommendation?.specialization?.name || recommendation?.primarySpecialization,
        });

        res.status(200).json({
            success: true,
            message: 'Análisis completado exitosamente',
            data: {
                cvAnalysisId: updated.id,
                profile: extractedProfile,
                recommendation: updated.recommendation,
            },
        });
    } catch (error) {
        console.error('🔥 Fatal Upload Error:', error);
        next(error);
    }
};

/**
 * POST /api/cv/linkedin
 */
const analyzeLinkedIn = async (req, res, next) => {
    try {
        const { linkedinUrl, linkedinSummary } = req.body;

        if (!linkedinUrl) {
            return res.status(400).json({
                success: false,
                message: 'Por favor proporciona tu URL de LinkedIn.',
            });
        }

        if (linkedinSummary && linkedinSummary.length > 50) {
            const analysis = analyses.create({
                userId: req.user.id,
                sourceType: 'linkedin',
                linkedinUrl,
                rawText: linkedinSummary,
            });

            analyses.update(analysis.id, { status: 'processing' });

            const extractedProfile = await extractProfileFromCV(linkedinSummary);
            const recommendation = await generateRecommendation(extractedProfile, 'linkedin');

            const updated = analyses.update(analysis.id, {
                extractedProfile,
                recommendation: {
                    primarySpecialization: recommendation.specialization?.name || recommendation.primarySpecialization,
                    secondarySpecializations: recommendation.secondarySpecializations || [],
                    matchScore: recommendation.matchScore,
                    reasoning: recommendation.reasoning,
                    subjects: recommendation.subjects || [],
                    springUrl: recommendation.springUrl,
                },
                status: 'completed',
                processedAt: new Date().toISOString(),
            });

            users.update(req.user.id, {
                cvAnalysisId: analysis.id,
                linkedinUrl,
                recommendedSpecialization: recommendation.specialization?.name,
            });

            return res.status(200).json({
                success: true,
                message: '¡Perfil de LinkedIn analizado exitosamente!',
                data: {
                    cvAnalysisId: updated.id,
                    profile: extractedProfile,
                    recommendation: {
                        specialization: recommendation.specialization,
                        matchScore: recommendation.matchScore,
                        reasoning: recommendation.reasoning,
                        subjects: recommendation.subjects,
                        springUrl: recommendation.springUrl,
                        secondarySpecializations: recommendation.secondarySpecializations,
                    },
                },
            });
        }

        // No summary provided — ask user to paste it
        return res.status(200).json({
            success: true,
            requiresManualInput: true,
            message:
                'Para analizar tu perfil de LinkedIn, por favor copia y pega el texto de tu perfil (sección "Acerca de" y experiencia) en el siguiente mensaje del chat.',
            linkedinUrl,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/cv/my-analysis
 */
const getMyAnalysis = async (req, res, next) => {
    try {
        const analysis = analyses.findLatestCompleted(req.user.id);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró ningún análisis de CV. Por favor sube tu CV.',
            });
        }

        res.status(200).json({
            success: true,
            data: { analysis },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/cv/history
 */
const getAnalysisHistory = async (req, res, next) => {
    try {
        const allAnalyses = analyses.findByUserId(req.user.id).map((a) => {
            const { rawText, ...rest } = a; // exclude raw text
            return rest;
        });

        res.status(200).json({
            success: true,
            data: { analyses: allAnalyses, total: allAnalyses.length },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { uploadCV, analyzeLinkedIn, getMyAnalysis, getAnalysisHistory };
