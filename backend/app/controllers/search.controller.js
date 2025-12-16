const Evento = require('../models/evento.model');
const embeddingService = require('../services/embeddingService');

exports.traditionalSearch = async (req, res, next) => {
    // Tu lógica actual de búsqueda por filtros
    try {
        const { query, limit = 10, offset = 0, category, ciudad, price_min, price_max } = req.query;

        const searchQuery = Evento.find({ isActive: true });

        if (query) {
            searchQuery.or([
                { nombre: { $regex: query, $options: 'i' } },
                { ciudad: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]);
        }

        // Aplicar filtros
        if (category) searchQuery.where('category', category);
        if (ciudad) searchQuery.where('ciudad', ciudad);
        if (price_min) searchQuery.where('price').gte(price_min);
        if (price_max) searchQuery.where('price').lte(price_max);

        const [eventos, total] = await Promise.all([
            searchQuery.skip(parseInt(offset)).limit(parseInt(limit)).exec(),
            Evento.countDocuments(searchQuery.getQuery())
        ]);

        res.json({
            success: true,
            data: eventos,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

    } catch (error) {
        next(error);
    }
};

exports.ragSearch = async (req, res, next) => {
    try {
        const { query, limit = 10, sessionId = 'default' } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'La consulta de búsqueda es requerida'
            });
        }

        console.log(`🔍 Búsqueda IA: "${query}"`);

        // 1. Generar embedding de la consulta
        const queryEmbedding = await embeddingService.getEmbedding(query);

        // 2. Buscar eventos por similitud coseno
        const eventos = await Evento.find({
            isActive: true,
            embedding: { $exists: true, $ne: null }
        });

        // 3. Calcular similitud para cada evento
        const eventosConSimilitud = eventos.map(evento => {
            if (!evento.embedding || !Array.isArray(evento.embedding)) {
                return { evento, similarity: 0 };
            }

            const similarity = embeddingService.cosineSimilarity(
                queryEmbedding,
                evento.embedding
            );

            return {
                evento: evento.toObject(),
                similarity
            };
        });

        // 4. Filtrar y ordenar por similitud
        const resultados = eventosConSimilitud
            .filter(item => item.similarity > 0.3) // Umbral mínimo
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .map(item => ({
                ...item.evento,
                relevanceScore: item.similarity,
                relevancePercentage: Math.round(item.similarity * 100)
            }));

        // 5. Si no hay resultados con embeddings, buscar por texto
        if (resultados.length === 0) {
            console.log('⚠️  Sin embeddings, usando búsqueda por texto');
            const eventosTexto = await Evento.find({
                isActive: true,
                $or: [
                    { nombre: { $regex: query, $options: 'i' } },
                    { ciudad: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            }).limit(limit);

            resultados.push(...eventosTexto.map(e => ({
                ...e.toObject(),
                relevanceScore: 0.5,
                relevancePercentage: 50,
                note: 'Búsqueda por texto (sin embeddings)'
            })));
        }

        // 6. Generar resumen inteligente de los resultados
        const summary = await generateSearchSummary(query, resultados);

        res.json({
            success: true,
            query,
            summary,
            results: resultados,
            meta: {
                totalFound: resultados.length,
                hasEmbeddings: eventos.some(e => e.embedding),
                sessionId,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error en búsqueda RAG:', error);
        next(error);
    }
};

exports.autocomplete = async (req, res, next) => {
    try {
        const { q, limit = 5 } = req.query;

        if (!q || q.length < 2) {
            return res.json({ success: true, suggestions: [] });
        }

        // Búsqueda en múltiples campos
        const suggestions = await Evento.find({
            $or: [
                { nombre: { $regex: q, $options: 'i' } },
                { ciudad: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ],
            isActive: true
        })
            .select('nombre ciudad category slug image price')
            .limit(parseInt(limit));

        // También sugerir preguntas comunes
        const commonQueries = [
            "Eventos este fin de semana",
            "Conciertos en Barcelona",
            "Deportes en Madrid",
            "Teatro y cultura",
            "Eventos gratuitos",
            "Festivales de música",
            "Ferias y exposiciones",
            "Eventos familiares",
            "Deportes extremos",
            "Cursos y talleres"
        ].filter(item =>
            item.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3);

        res.json({
            success: true,
            query: q,
            suggestions: suggestions.map(e => ({
                type: 'event',
                nombre: e.nombre,
                ciudad: e.ciudad,
                category: e.category,
                slug: e.slug,
                image: e.image?.[0],
                price: e.price
            })),
            suggestedQueries: commonQueries.map(text => ({
                type: 'query',
                text,
                icon: '🤖'
            }))
        });

    } catch (error) {
        next(error);
    }
};

exports.generateEmbeddings = async (req, res, next) => {
    try {
        console.log('🚀 Generando embeddings para búsqueda...');

        const eventos = await Evento.find({
            embedding: { $exists: false }
        }).limit(req.body.limit || 100);

        let processed = 0;

        for (const evento of eventos) {
            const textForEmbedding = `
        ${evento.nombre || ''}
        ${evento.category || ''}
        ${evento.ciudad || ''}
        ${evento.description || ''}
        ${evento.slug_category?.join(' ') || ''}
      `.trim();

            if (textForEmbedding) {
                const embedding = await embeddingService.getEmbedding(textForEmbedding);
                evento.embedding = embedding;
                evento.embeddingUpdatedAt = new Date();
                await evento.save();
                processed++;
                console.log(`✅ ${processed}. ${evento.nombre}`);
            }
        }

        res.json({
            success: true,
            message: `Embeddings generados para ${processed} eventos`,
            processed,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error generando embeddings:', error);
        next(error);
    }
};

// Función auxiliar para generar resumen
async function generateSearchSummary(query, results) {
    try {
        // Aquí podrías usar el LLM para generar un resumen inteligente
        // Por ahora, hacemos uno simple

        const categories = [...new Set(results.map(r => r.category).filter(Boolean))];
        const cities = [...new Set(results.map(r => r.ciudad).filter(Boolean))];

        if (results.length === 0) {
            return {
                message: `No se encontraron eventos para "${query}"`,
                suggestion: 'Intenta con otras palabras clave o elimina filtros'
            };
        }

        return {
            message: `Encontrados ${results.length} eventos para "${query}"`,
            categories: categories.slice(0, 3),
            cities: cities.slice(0, 3),
            priceRange: results.length > 0 ? {
                min: Math.min(...results.map(r => r.price || 0)),
                max: Math.max(...results.map(r => r.price || 0)),
                avg: Math.round(results.reduce((sum, r) => sum + (r.price || 0), 0) / results.length)
            } : null,
            dateRange: results.length > 0 ? {
                earliest: results.reduce((min, r) =>
                    r.startDate && (!min || new Date(r.startDate) < new Date(min)) ? r.startDate : min, null
                ),
                latest: results.reduce((max, r) =>
                    r.endDate && (!max || new Date(r.endDate) > new Date(max)) ? r.endDate : max, null
                )
            } : null
        };
    } catch (error) {
        console.error('Error generando resumen:', error);
        return {
            message: `Se encontraron ${results.length} eventos`,
            note: 'Resumen no disponible'
        };
    }
}