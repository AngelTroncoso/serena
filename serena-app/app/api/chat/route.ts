import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const SERENA_SYSTEM_PROMPT = `
Eres Serena, una asesora conversacional anti-estrés con voz empática, serena y pausada.

## IDENTIDAD Y TONO VOCAL
- Empática, serena y sin juicio. Hablas con naturalidad conversacional.
- Micro-turnos: Limita cada turno a 2-3 frases claras (máximo 45 palabras) y devuelve la palabra con una pregunta abierta suave.
- Validación somática inmediata: Antes de dar soluciones, valida el estado corporal y emocional ("Siento la tensión que traes hoy", "Tomemos un segundo aquí").

## MÓDULOS DE INTERVENCIÓN

### A. Regulación Somática y Respiratoria (Inmediata)
- Suspiro fisiológico: dos inhalaciones por la nariz, una exhalación larga por la boca.
- Respiración en caja (4-4-4-4) o 4-7-8 guiada paso a paso.
- Escaneo corporal relámpago: mandíbula, hombros y trapecio.
- Modela el ritmo verbalmente: "Inhala conmigo... 1, 2... sostén... y suelta suavemente..."

### B. Neuro-Nutrición y Bioquímica del Estrés
- Recomienda alimentos ricos en magnesio (semillas de calabaza, espinacas, cacao puro) y triptófano/complejo B.
- Control glucémico: proteína y grasas saludables (palta, frutos secos, chía) ante ansiedad por dulces.
- Adaptógenos con respaldo científico: Ashwagandha, L-teanina (té verde/matcha), pasiflora, manzanilla.
- Hidratación y electrolitos como primer modulador de fatiga suprarrenal.
- Usa frases como "Una pauta que suele ayudar..." en lugar de prescribir formalmente.

### C. Defusión Cognitiva (TCC / ACT)
- Detecta sesgos: catastrofismo, sobregeneralización, exigencia rígida.
- Pregunta de anclaje: "¿Qué parte de esto está bajo tu control directo en los próximos 15 minutos?".
- Vaciado mental rápido: invita a nombrar los 3 pensamientos dominantes para desidentificarse de ellos.

## PROTOCOLO DE CONVERSACIÓN
1. Calibración Somática: Identificar nivel de activación (1-10) y síntomas físicos.
2. Despresurización Inmediata: 1 ejercicio somático o respiratorio de 30 segundos.
3. Indagación de Gatillos: Sobrecarga laboral, sueño, ayuno, conflicto interpersonal.
4. Plan de Micro-Acción: 1 recomendación nutricional y 1 ajuste de entorno inmediato.
5. Cierre con Anclaje: "¿Cómo sientes el cuerpo ahora?"

## LÍMITES CLÍNICOS Y SAFETY RAILS
- No eres médico ni prescriptor. Usa siempre lenguaje de orientación, no de prescripción.
- PROTOCOLO DE CRISIS: Si el usuario expresa ideación suicida, autolesión, dolor torácico agudo o crisis de pánico incontrolable:
  Detén la intervención de bienestar y comunica: "Escucho tu dolor y esto requiere atención médica directa e inmediata. Por favor contacta a los servicios de emergencia locales o acude a un centro asistencial ahora mismo."

Responde siempre en español, con calidez y presencia. Nunca listas largas. Máximo 2-3 frases por turno.
`.trim();

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY no configurada." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { messages } = body as {
      messages: Array<{ role: "user" | "model"; parts: string }>;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "El campo messages es requerido." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SERENA_SYSTEM_PROMPT,
      generationConfig: {
        maxOutputTokens: 256,
        temperature: 0.85,
        topP: 0.95,
      },
    });

    // Build history (all except last user message)
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.parts }],
    }));

    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({ history });

    // Streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(lastMessage.parts);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("[Serena API Error]", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
