'use client';
import { useEffect, useState } from 'react';

export default function Interview({ params }: { params: { token: string } }) {
  const token = params.token;
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [answer, setAnswer] = useState('');
  const [finished, setFinished] = useState(false);

  async function loadSession() {
    setLoading(true);
    const res = await fetch(`/api/session?token=${token}`);
    const data = await res.json();
    setQuestion(data.nextQuestion?.question || '');
    setProgress(data.progress || 0);
    setFinished(data.finished || false);
    setLoading(false);
  }

  useEffect(() => { loadSession(); }, []);

  async function submit() {
    const res = await fetch('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, answer })
    });
    const data = await res.json();
    if (data.finished) setFinished(true);
    setQuestion(data.nextQuestion?.question || '');
    setProgress(data.progress || 0);
    setAnswer('');
  }

  if (loading) return <main className="p-8">Cargando…</main>;
  if (finished) return <main className="p-8"><h1 className="text-xl font-semibold">¡Listo! 🎉</h1><p>Gracias por completar la entrevista. El equipo generará tu Content Pack.</p></main>;

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
        <div className="bg-black h-3" style={{ width: `${Math.round(progress*100)}%` }} />
      </div>
      <div className="p-4 rounded-xl bg-white shadow">
        <p className="text-lg">{question}</p>
      </div>
      <textarea
        className="w-full border rounded-xl p-3 min-h-[140px]"
        placeholder="Escribe tu respuesta aquí…"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button onClick={submit} className="px-5 py-2 rounded-xl bg-black text-white">Enviar</button>
    </main>
  );
}
