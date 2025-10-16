import OpenAI from 'openai';
import { SlotState, NextQuestion } from './types';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function decideNextQuestion(
  slots: SlotState[],
  lastAnswer: string,
  language: 'es' | 'en' = 'es'
): Promise<NextQuestion> {
  const sys =
    language === 'es'
      ? `Eres un entrevistador de marketing B2B. Tienes una matriz de slots con pesos.
En cada turno debes:
1) Elegir el slot con menor score efectivo (coverage*confidence*weight), priorizando los marcados como bloqueadores.
2) Formular UNA sola pregunta precisa para llenar ese slot.
3) Evitar preguntas dobles; pedir ejemplos concretos si falta especificidad.`
      : `You are a B2B marketing interviewer. You have a weighted slot matrix.
Each turn:
1) Pick the slot with the lowest effective score (coverage*confidence*weight), prioritizing blockers.
2) Ask ONE precise question to fill that slot.
3) Avoid double questions; ask for concrete examples if specificity is missing.`;

  const user = JSON.stringify({ slots, lastAnswer });

  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: sys },
      {
        role: 'user',
        content:
          (language === 'es'
            ? 'Devuelve JSON con {"target_slot","question","why_this_question"}.'
            : 'Return JSON with {"target_slot","question","why_this_question"}.') +
          `\nINPUT:${user}`
      }
    ]
  });

  const text = res.choices[0]?.message?.content ?? '{"target_slot":"meta","question":"","why_this_question":""}';
  return JSON.parse(text) as NextQuestion;
}

export async function scoreAnswer(
  slot: SlotState,
  answer: string
): Promise<Pick<SlotState, 'coverage' | 'confidence'>> {
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Evalúa coverage (0,0.5,1) y confidence (0,0.5,1) según si la respuesta es específica, accionable y consistente.'
      },
      { role: 'user', content: JSON.stringify({ slot, answer }) }
    ]
  });
  const text = res.choices[0]?.message?.content ?? '{"coverage":0,"confidence":0}';
  return JSON.parse(text);
}

export async function generateContentPack(
  consolidatedSlots: SlotState[],
  qaLog: { question: string; answer: string }[],
  language: 'es' | 'en' = 'es'
) {
  const sys =
    language === 'es'
      ? 'Genera: 1) Brief SEO, 2) Outline+draft de blog (1200–1600), 3) 5 social stills ES/EN con idea visual, 4) 3 guiones de video ES/EN (60–90s), 5) 10 hooks, 10 CTAs, 20 keywords long-tail. Señala disclaimers necesarios.'
      : 'Produce: 1) SEO brief, 2) Blog outline+draft (1200–1600), 3) 5 social stills EN/ES w/ visual idea, 4) 3 video scripts EN/ES (60–90s), 5) 10 hooks, 10 CTAs, 20 long-tail keywords. Flag any required disclaimers.';

  const user = JSON.stringify({ consolidatedSlots, qaLog });

  const res = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.3,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: user }
    ]
  });
  return res.choices[0]?.message?.content ?? '';
}
