"use client";

import { useEffect, useState } from 'react';

interface Tpl { id: string; name: string; subject: string; html: string }

export default function EmailTemplatesPage() {
  const [items, setItems] = useState<Tpl[]>([]);
  const [active, setActive] = useState<Tpl | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/email-templates');
      if (!res.ok) throw new Error('Laden mislukt');
      const data = await res.json();
      setItems(data.items);
      setActive(data.items[0] || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Onbekende fout');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!active) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/email-templates/${active.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(active) });
      if (!res.ok) throw new Error('Opslaan mislukt');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Onbekende fout'); } finally { setLoading(false); }
  };

  const createNew = async () => {
    const name = prompt('Naam van template?');
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch('/api/email-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, subject: 'Onderwerp', html: '<p>Inhoud</p>' }) });
      if (!res.ok) throw new Error('Aanmaken mislukt');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Onbekende fout'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">E‑mailtemplates</h1>
        <button onClick={createNew} className="rounded bg-blue-600 text-white font-bold px-4 py-2 hover:bg-blue-700">Nieuwe template</button>
      </div>
      {error && <div className="rounded border border-red-300 bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 card-glow">
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id}>
                <button className={`w-full text-left px-3 py-2 rounded ${active?.id===it.id ? 'bg-blue-50 font-bold' : 'hover:bg-gray-50'}`} onClick={() => setActive(it)}>{it.name}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-2 bg-white rounded-lg p-4 card-glow">
          {!active ? (
            <p>Selecteer of maak een template</p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold mb-1">Naam</label>
                <input value={active.name} onChange={(e)=> setActive({...active, name:e.target.value})} className="w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Onderwerp</label>
                <input value={active.subject} onChange={(e)=> setActive({...active, subject:e.target.value})} className="w-full rounded border px-3 py-2" />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-1">HTML</label>
                  <textarea value={active.html} onChange={(e)=> setActive({...active, html:e.target.value})} rows={14} className="w-full rounded border px-3 py-2 font-mono text-xs" />
                  <div className="mt-3 flex gap-2">
                    <button onClick={save} disabled={loading} className="rounded bg-blue-600 text-white font-bold px-4 py-2 hover:bg-blue-700">Opslaan</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Preview</label>
                  <div className="rounded border p-2 h-[360px] overflow-auto" dangerouslySetInnerHTML={{ __html: active.html }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

