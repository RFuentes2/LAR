/**
 * File Upload Middleware (Multer)
 * Handles CV/PDF file uploads
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create user-specific directory
        const userDir = path.join(uploadDir, req.user ? req.user.id.toString() : 'temp');
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-originalname
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
});

// File filter - allow PDFs and CSVs
const fileFilter = (req, file, cb) => {
    const allowedMimetypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel'];
    const allowedExtensions = ['.pdf', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimetypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Formato no válido. Por favor sube un archivo PDF o CSV válido.'), false);
    }
};

// Max file size from env (default 10MB)
const maxFileSize = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;

// Multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: maxFileSize,
        files: 1, // Only 1 file at a time
    },
});

// Memory storage for quick processing (no disk save)
const uploadMemory = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: maxFileSize,
        files: 1,
    },
});

// Error handler for multer errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `El archivo es demasiado grande. El tamaño máximo es ${process.env.MAX_FILE_SIZE_MB || 10}MB.`,
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Solo puedes subir un archivo a la vez.',
            });
        }
        return res.status(400).json({
            success: false,
            message: `Error al subir el archivo: ${err.message}`,
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    next();
};

module.exports = { upload, uploadMemory, handleUploadError };
