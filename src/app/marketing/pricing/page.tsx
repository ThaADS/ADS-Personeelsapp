const tiers = [
  {
    name: "Basis",
    price: "€19",
    per: "/maand",
    badge: "Start",
    features: [
      "Tot 3 gebruikers",
      "Urenregistratie + validaties",
      "Verlof & TVT",
      "Ziekmeldingen",
      "Goedkeuringen",
      "Auditlog",
    ],
    cta: { label: "Start nu", href: "/login" },
  },
  {
    name: "Team (10 gebruikers)",
    price: "€29",
    per: "/maand",
    badge: "Meest gekozen",
    features: [
      "Tot 10 gebruikers",
      "Alles uit Basis",
      "Teamrollen & RBAC",
      "Extra rapportages",
      "Prioriteitssupport",
    ],
    cta: { label: "Kies Team", href: "/login" },
  },
  {
    name: "Organisatie (20 gebruikers)",
    price: "Op aanvraag",
    per: "",
    badge: "Nieuw",
    features: [
      "Tot 20 gebruikers",
      "Alles uit Team",
      "Uitgebreide compliance tooling",
      "SLA & onboarding",
    ],
    cta: { label: "Contact sales", href: "mailto:sales@example.com" },
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-black">Prijzen</h1>
      <p className="mt-2 text-black font-medium">Eenvoudig en transparant. Maandelijks opzegbaar.</p>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <div key={t.name} className="rounded-lg border bg-white p-6 flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">{t.name}</h2>
              {t.badge && (
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">{t.badge}</span>
              )}
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-black">{t.price}</span>
              <span className="ml-1 text-black font-medium">{t.per}</span>
            </div>
            <ul className="mt-4 text-sm text-black font-medium space-y-2 list-disc pl-5">
              {t.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a href={t.cta.href} className="mt-6 inline-flex items-center justify-center rounded bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700">
              {t.cta.label}
            </a>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border p-6 bg-white">
        <h3 className="font-semibold text-black">Veelgestelde prijsvragen</h3>
        <ul className="mt-3 text-sm text-black font-medium space-y-2">
          <li><strong>Jaarlijks betalen?</strong> Vraag korting aan via sales.</li>
          <li><strong>Extra gebruikers?</strong> Neem contact op voor maatwerk.</li>
          <li><strong>Opzeggen?</strong> Kan maandelijks, zonder gedoe.</li>
        </ul>
      </div>
    </main>
  );
}
