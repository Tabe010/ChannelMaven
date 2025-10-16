'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Row = {
  id: string; partner_name: string; topic: string; status: string; progress: number; created_at: string
}

export default function AdminPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/sessions');
      const data = await res.json();
      setRows(data.rows || []);
    })();
  }, []);

  return (
    <main className="p-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sesiones</h1>
        <Link href="/admin/new" className="px-4 py-2 rounded-xl bg-black text-white">Nueva sesión</Link>
      </header>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b"><th>Partner</th><th>Tema</th><th>Estado</th><th>Progreso</th><th>Creado</th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-b">
              <td>{r.partner_name}</td>
              <td>{r.topic}</td>
              <td>{r.status}</td>
              <td>{Math.round(r.progress * 100)}%</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
