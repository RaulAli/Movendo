require('dotenv').config();

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-gte-small';

class EmbeddingService {
    constructor() {
        this.cache = new Map();
    }

    async getEmbedding(text) {
        try {
            // Verificar cache
            const cacheKey = text.trim().toLowerCase();
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            // Obtener embedding de LM Studio
            const response = await fetch(`${LM_STUDIO_URL}/v1/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: EMBEDDING_MODEL,
                    input: text,
                    encoding_format: 'float'
                })
            });

            if (!response.ok) {
                throw new Error(`Embedding error: ${response.statusText}`);
            }

            const data = await response.json();
            const embedding = data.data[0].embedding;

            // Guardar en cache
            this.cache.set(cacheKey, embedding);
            return embedding;
        } catch (error) {
            console.error('❌ Error en EmbeddingService:', error.message);
            // Retornar embedding de fallback
            return new Array(1024).fill(0);
        }
    }

    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

        const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
        const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
        const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

        if (normA === 0 || normB === 0) return 0;
        return dot / (normA * normB);
    }
}

module.exports = new EmbeddingService();