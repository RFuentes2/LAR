# 🚀 LAR University - Guía de Pruebas de API (Backend)

Esta guía te ayudará a probar todas las funcionalidades del backend sin necesidad de un frontend, usando herramientas como **Postman**, **Insomnia** o simplemente **cURL**.

> **Nota importante:** Actualmente usamos un almacenamiento en memoria (`MemoryStore`). Si reinicias el servidor (`npm run dev`), todos los usuarios, chats y análisis se borrarán.

---

## 1. Flujo de Autenticación

### A. Registro de Usuario
**Endpoint:** `POST /api/auth/register`
**Cuerpo (JSON):**
```json
{
  "name": "Prueba Usuario",
  "email": "test@lar.edu",
  "password": "password123"
}
```

### B. Login (Para obtener el Token)
**Endpoint:** `POST /api/auth/login`
**Cuerpo (JSON):**
```json
{
  "email": "test@lar.edu",
  "password": "password123"
}
```
> **IMPORTANTE:** Copia el campo `token` de la respuesta. Deberás enviarlo en el encabezado de todas las siguientes peticiones como:
> `Authorization: Bearer TU_TOKEN_AQUÍ`

---

## 2. Análisis de CV (Inteligencia Artificial)

### A. Subir un CV (PDF)
**Endpoint:** `POST /api/cv/upload`
**Tipo:** `form-data`
**Header:** `Authorization: Bearer <token>`
**Body:** Key `cv` (selecciona un archivo PDF de tu computadora).

### B. Ver mi Análisis Actual
**Endpoint:** `GET /api/cv/my-analysis`
**Header:** `Authorization: Bearer <token>`

---

## 3. Chat y Asesoría (OpenAI Integration)

### A. Crear un nuevo Chat
**Endpoint:** `POST /api/chat`
**Header:** `Authorization: Bearer <token>`
**Cuerpo (JSON):**
```json
{
  "title": "Dudas sobre IA",
  "cvAnalysisId": "ID_DE_TU_ANALISIS" (Opcional)
}
```

### B. Enviar un Mensaje al Chat
**Endpoint:** `POST /api/chat/:chatId/message`
**Header:** `Authorization: Bearer <token>`
**Cuerpo (JSON):**
```json
{
  "content": "¿Qué especialización me recomiendas para mejorar mis habilidades en liderazgo?"
}
```
> La respuesta incluirá `userMessage` y `assistantMessage` (la respuesta de OpenAI).

---

## 4. Scripts de Prueba Automatizados (Node.js)

He creado un script que hace todo este flujo por ti para que veas que el chat responde bien:

```bash
node test-full-flow.js
```

*(El script `test-full-flow.js` se encargará de registrarse, loguearse y enviarle una pregunta al chat usando tu API Key).*
