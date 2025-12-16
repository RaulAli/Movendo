require('dotenv').config();

const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';
const LLM_MODEL = process.env.LLM_MODEL || 'microsoft/phi-3-mini-4k-instruct';

class LLMService {
    constructor() {
        this.conversationHistory = new Map();
    }

    async generateResponse(prompt, context, sessionId = 'default') {
        try {
            const history = this.conversationHistory.get(sessionId) || [];

            const messages = [
                {
                    role: 'system',
                    content: `Eres un asistente especializado en eventos. 
                    Responde ÚNICAMENTE basándote en la información proporcionada.
                    Si no hay información relevante, di "No tengo información sobre eso en mi base de datos de eventos."
                    
                    CONTEXTO DE EVENTOS:
                    ${context}`
                },
                ...history.slice(-4),
                { role: 'user', content: prompt }
            ];

            const response = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: LLM_MODEL,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`LLM error: ${response.status}`);
            }

            const data = await response.json();
            const answer = data.choices[0].message.content;

            // Actualizar historial
            history.push(
                { role: 'user', content: prompt },
                { role: 'assistant', content: answer }
            );

            if (history.length > 10) {
                history.splice(0, 2);
            }

            this.conversationHistory.set(sessionId, history);

            return answer;
        } catch (error) {
            console.error('❌ Error en LLMService:', error.message);
            return 'Lo siento, hubo un error al procesar tu pregunta.';
        }
    }

    clearHistory(sessionId = 'default') {
        this.conversationHistory.delete(sessionId);
    }
}

module.exports = new LLMService();