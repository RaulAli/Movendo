const Evento = require('../models/evento.model');
const embeddingService = require('./embeddingService');
const llmService = require('./llmService');

class RAGService {
    async searchEvents(query, limit = 10) {
        try {
            // Primero intentar búsqueda por texto en campos relevantes
            const textResults = await Evento.find({
                $or: [
                    { nombre: { $regex: query, $options: 'i' } },
                    { ciudad: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } },
                    { slug_category: { $regex: query, $options: 'i' } }
                ]
            }).limit(limit * 2);

            // Si no hay resultados, obtener eventos activos
            let candidates = textResults.length > 0
                ? textResults
                : await Evento.find({ isActive: true }).limit(50);

            // Si los eventos tienen embeddings, calcular similitud
            const queryEmbedding = await embeddingService.getEmbedding(query);

            const scoredEvents = candidates
                .filter(evento => evento.embedding && Array.isArray(evento.embedding))
                .map(evento => ({
                    evento: evento.toObject(),
                    similarity: embeddingService.cosineSimilarity(queryEmbedding, evento.embedding)
                }))
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);

            // Si no hay embeddings, devolver los primeros eventos
            if (scoredEvents.length === 0) {
                return candidates.slice(0, limit).map(evento => ({
                    evento: evento.toObject(),
                    similarity: 0.5
                }));
            }

            return scoredEvents;
        } catch (error) {
            console.error('❌ Error buscando eventos:', error);
            throw error;
        }
    }

    async askQuestion(question, sessionId = 'default') {
        try {
            console.log(`🔍 Buscando eventos para: "${question}"`);

            // 1. Buscar eventos relevantes
            const relevantEvents = await this.searchEvents(question);

            // 2. Construir contexto
            const context = relevantEvents
                .map(item => `
Evento: ${item.evento.nombre || 'Sin nombre'}
Categoría: ${item.evento.category || 'General'}
Ciudad: ${item.evento.ciudad || 'No especificada'}
Fecha inicio: ${item.evento.startDate ? new Date(item.evento.startDate).toLocaleDateString() : 'No especificada'}
Fecha fin: ${item.evento.endDate ? new Date(item.evento.endDate).toLocaleDateString() : 'No especificada'}
Precio: ${item.evento.price ? `$${item.evento.price}` : 'Gratis'}
Stock disponible: ${item.evento.stock || 'No especificado'}
Estado: ${item.evento.status || 'Activo'}
---
                `.trim())
                .join('\n\n');

            console.log(`📚 Encontrados ${relevantEvents.length} eventos relevantes`);

            // 3. Generar respuesta
            const answer = await llmService.generateResponse(question, context, sessionId);

            // 4. Preparar fuentes
            const sources = relevantEvents
                .filter(item => item.similarity > 0.3)
                .map(item => ({
                    id: item.evento._id,
                    nombre: item.evento.nombre || 'Evento sin nombre',
                    category: item.evento.category || 'General',
                    ciudad: item.evento.ciudad || 'No especificada',
                    price: item.evento.price,
                    startDate: item.evento.startDate,
                    similarity: parseFloat(item.similarity.toFixed(3)),
                    image: item.evento.image,
                    slug: item.evento.slug
                }));

            return {
                answer,
                sources,
                eventCount: relevantEvents.length,
                sessionId
            };
        } catch (error) {
            console.error('❌ Error en RAGService:', error);
            throw error;
        }
    }

    async generateEventEmbeddings() {
        try {
            const eventos = await Evento.find({ embedding: { $exists: false } });

            console.log(`📊 Generando embeddings para ${eventos.length} eventos...`);

            for (const evento of eventos) {
                // Crear texto para embedding
                const eventText = `
                    ${evento.nombre || ''}
                    ${evento.category || ''}
                    ${evento.ciudad || ''}
                    ${evento.description || ''}
                `.trim();

                if (eventText) {
                    const embedding = await embeddingService.getEmbedding(eventText);
                    evento.embedding = embedding;
                    evento.updatedAt = new Date();
                    await evento.save();
                    console.log(`✅ Embedding generado para: ${evento.nombre}`);
                }
            }

            return { success: true, processed: eventos.length };
        } catch (error) {
            console.error('❌ Error generando embeddings:', error);
            throw error;
        }
    }

    async getStats() {
        try {
            const totalEvents = await Evento.countDocuments();
            const eventsWithEmbeddings = await Evento.countDocuments({ embedding: { $exists: true } });
            const categories = await Evento.distinct('category');

            return {
                totalEvents,
                eventsWithEmbeddings,
                categories: categories.filter(c => c),
                hasEmbeddings: eventsWithEmbeddings > 0
            };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            throw error;
        }
    }
}

module.exports = new RAGService();