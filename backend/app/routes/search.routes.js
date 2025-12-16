const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// Ruta para búsqueda tradicional (mantener compatibilidad)
router.get('/search', searchController.traditionalSearch);

// Ruta para búsqueda inteligente con IA (RAG)
router.post('/search/rag', searchController.ragSearch);

// Ruta para autocomplete inteligente
router.get('/search/autocomplete', searchController.autocomplete);

// Ruta para generar embeddings (admin)
router.post('/search/generate-embeddings', searchController.generateEmbeddings);

module.exports = router;