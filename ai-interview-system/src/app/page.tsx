import Link from 'next/link';
export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">AI Interview System</h1>
      <p className="mt-2">Ir al panel de administración.</p>
      <Link href="/admin" className="underline">/admin</Link>
    </main>
  );
}
