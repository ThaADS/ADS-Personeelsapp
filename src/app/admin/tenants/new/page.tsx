"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTenantPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    contactEmail: "",
    contactName: "",
    address: "",
    phone: "",
    domain: "",
    plan: "FREEMIUM" as "FREEMIUM" | "STANDARD",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Fout ${res.status}`);
      }
      const data = await res.json();
      setSuccess("Tenant aangemaakt.");
      setTimeout(() => router.push("/admin/tenants"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Nieuwe Tenant</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-4">
        {error && <div className="rounded border border-red-300 bg-red-50 text-red-700 p-3 text-sm">{error}</div>}
        {success && <div className="rounded border border-green-300 bg-green-50 text-green-700 p-3 text-sm">{success}</div>}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Bedrijfsnaam</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Domein (optioneel)</label>
            <input name="domain" value={form.domain} onChange={handleChange} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Contact e‑mail</label>
            <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Contact naam</label>
            <input name="contactName" value={form.contactName} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Adres</label>
            <input name="address" value={form.address} onChange={handleChange} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Telefoon</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Plan</label>
            <select name="plan" value={form.plan} onChange={handleChange} className="w-full rounded border px-3 py-2">
              <option value="FREEMIUM">Freemium</option>
              <option value="STANDARD">Standard</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <h2 className="font-bold text-black mb-2">Admin gebruiker</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Naam</label>
              <input name="adminName" value={form.adminName} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">E‑mail</label>
              <input name="adminEmail" type="email" value={form.adminEmail} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Wachtwoord</label>
              <input name="adminPassword" type="password" value={form.adminPassword} onChange={handleChange} required className="w-full rounded border px-3 py-2" />
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button type="submit" disabled={loading} className="rounded bg-blue-600 text-white font-bold px-5 py-2 hover:bg-blue-700">
            {loading ? "Aanmaken..." : "Tenant aanmaken"}
          </button>
          <button type="button" className="rounded border px-5 py-2 font-semibold" onClick={() => router.push('/admin/tenants')}>
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}

