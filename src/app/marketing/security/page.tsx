const items = [
  {
    title: "Dataveiligheid",
    desc: "Versleuteling in transit (HTTPS/TLS) en op schijf. Dagelijkse back-ups en versielogging.",
  },
  {
    title: "Toegangsbeheer (RBAC)",
    desc: "Fijngranulaire rollen (Admin, Manager, User) en per-tenant isolatie.",
  },
  {
    title: "Audit trail",
    desc: "Elke belangrijke actie wordt gelogd (wie, wat, wanneer, vanuit welk IP).",
  },
  {
    title: "AVG / GDPR",
    desc: "Dataminimalisatie, inzage/verwijderen op verzoek, verwerkersovereenkomst beschikbaar.",
  },
  {
    title: "Authenticatie",
    desc: "E-mail + wachtwoord met sterke hashing. Ondersteuning voor SSO/2FA op roadmap.",
  },
  {
    title: "Monitoring & Incidenten",
    desc: "Statuspagina, uptime-monitoring en verantwoordelijk meldingskanaal (responsible disclosure).",
  },
];

export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-black">Beveiliging</h1>
      <p className="mt-2 text-black font-medium">Wij nemen veiligheid en privacy uiterst serieus.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((i) => (
          <div key={i.title} className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold text-black">{i.title}</h2>
            <p className="mt-2 text-sm text-black font-medium">{i.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border p-6 bg-white">
        <h3 className="font-semibold text-black">Compliance & gegevenslocatie</h3>
        <p className="mt-2 text-sm text-black font-medium">
          We volgen best practices voor applicatie- en databeveiliging. Gegevens worden binnen de EU opgeslagen
          (of conform overeengekomen verwerkersovereenkomst). Neem contact op voor de meest recente beveiligingsmaatregelen
          en pentest-rapporten.
        </p>
        <div className="mt-4 flex gap-3">
          <a href="mailto:security@example.com" className="inline-flex items-center rounded border px-5 py-3 text-black font-semibold hover:bg-gray-100">Security contact</a>
          <a href="#" className="inline-flex items-center rounded bg-blue-600 px-5 py-3 text-white font-bold hover:bg-blue-700">Download factsheet</a>
        </div>
      </div>
    </main>
  );
}
