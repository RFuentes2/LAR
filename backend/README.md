# LAR University Backend API

Backend Node.js/Express para el sistema de recomendación de especializaciones de LAR University.

## 🚀 Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: MongoDB + Mongoose
- **IA**: OpenAI GPT-4o
- **Autenticación**: JWT (jsonwebtoken)
- **Upload**: Multer
- **PDF Parsing**: pdf-parse
- **Seguridad**: Helmet, CORS, Rate Limiting

## 📁 Estructura del Proyecto

```
backend/
├── server.js                    # Entry point
├── .env                         # Variables de entorno (no commitear)
├── .env.example                 # Template de variables
├── src/
│   ├── config/
│   │   ├── database.js          # Conexión MongoDB
│   │   └── openai.js            # Cliente OpenAI
│   ├── controllers/
│   │   ├── auth.controller.js   # Registro, login, perfil
│   │   ├── chat.controller.js   # Historial de conversaciones
│   │   ├── cv.controller.js     # Upload y análisis de CV
│   │   ├── recommendation.controller.js  # Recomendaciones
│   │   └── user.controller.js   # Gestión de usuario
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification
│   │   ├── errorHandler.js      # Error handling global
│   │   └── upload.middleware.js # Multer file upload
│   ├── models/
│   │   ├── User.js              # Modelo de usuario
│   │   ├── Chat.js              # Modelo de chat/conversación
│   │   └── CVAnalysis.js        # Modelo de análisis de CV
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── chat.routes.js
│   │   ├── cv.routes.js
│   │   ├── recommendation.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   ├── openai.service.js    # Lógica de IA (análisis CV, recomendaciones, chat)
│   │   └── pdf.service.js       # Extracción de texto de PDFs
│   └── utils/
│       └── specializations.js   # Catálogo de especializaciones
└── uploads/                     # CVs subidos (gitignored)
```

## ⚙️ Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Edita el archivo `.env` con tus valores:
```env
MONGODB_URI=mongodb://localhost:27017/lar-university
OPENAI_API_KEY=sk-tu-api-key-aqui
JWT_SECRET=tu-secreto-jwt-seguro
```

### 3. Iniciar MongoDB
Asegúrate de tener MongoDB corriendo localmente, o usa MongoDB Atlas.

### 4. Ejecutar el servidor
```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start
```

## 📡 API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener perfil actual |
| PUT | `/api/auth/update-profile` | Actualizar perfil |
| PUT | `/api/auth/change-password` | Cambiar contraseña |

### CV Analysis
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/cv/upload` | Subir y analizar CV (PDF) |
| POST | `/api/cv/linkedin` | Analizar perfil LinkedIn |
| GET | `/api/cv/my-analysis` | Obtener último análisis |
| GET | `/api/cv/history` | Historial de análisis |

### Chat
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/chat` | Listar todos los chats |
| POST | `/api/chat` | Crear nuevo chat |
| GET | `/api/chat/:id` | Obtener chat específico |
| POST | `/api/chat/:id/message` | Enviar mensaje |
| DELETE | `/api/chat/:id` | Eliminar chat |
| PUT | `/api/chat/:id/title` | Renombrar chat |

### Recommendations
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/recommendations/specializations` | Catálogo completo |
| GET | `/api/recommendations/specializations/:id` | Una especialización |
| GET | `/api/recommendations/my-recommendation` | Mi recomendación |
| POST | `/api/recommendations/regenerate` | Regenerar recomendación |

### Health Check
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servidor |

## 🎯 Especializaciones Disponibles

1. **COMUNICACIÓN** - Liderazgo comunicacional
2. **EMPRENDIMIENTO** - Startups y negocios
3. **FINANZAS** - Finanzas corporativas avanzadas
4. **TALENTO** - Gestión de personas y equipos
5. **TECNOLOGÍA** - Transformación digital
6. **IA Y AUTOMATIZACIÓN** - Inteligencia Artificial
7. **MERCADO Y CLIENTE** - Marketing avanzado
8. **OPERACIONES Y ENTORNO** - Supply chain y operaciones
9. **ANALÍTICA DE DATOS** - Data science para directivos

## 🔐 Autenticación

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <jwt_token>
```

## 📦 Despliegue (Google Cloud Run)

```bash
# Build Docker image
docker build -t lar-university-backend .

# Deploy to Cloud Run
gcloud run deploy lar-university-backend \
  --image lar-university-backend \
  --platform managed \
  --region us-central1
```
