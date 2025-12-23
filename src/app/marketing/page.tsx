import Link from "next/link";

const features = [
  { title: "Tijdregistratie", desc: "Snel uren registreren met pauzes, GPS en slimme validatie." },
  { title: "Verlof & TVT", desc: "Vakantie en tijd-voor-tijd aanvragen met realtime saldo." },
  { title: "Ziekmeldingen", desc: "Ziekteverzuim melden en opvolgen met UWV-signalen." },
  { title: "Goedkeuringen", desc: "Managers keuren aanvragen efficiënt in bulk of per stuk." },
  { title: "Medewerkers", desc: "Beheer medewerkers, rollen, teams en rechten." },
  { title: "Audit & AVG", desc: "Volledige audit trail, dataminimalisatie en AVG tooling." },
];

export default function MarketingHome() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
              Personeelsbeheer zonder gedoe
            </h1>
            <p className="mt-4 text-black font-medium">
              Uren, verlof, ziekmeldingen en goedkeuringen in één strak ticketsysteem-achtige workflow.
              Snel, veilig en klaar voor groei.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/marketing/pricing" className="inline-flex items-center rounded bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700">Start vanaf €19/mnd</Link>
              <Link href="/marketing/features" className="inline-flex items-center rounded border px-5 py-3 text-gray-800 hover:bg-gray-100">Bekijk alle functies</Link>
            </div>
            <p className="mt-3 text-sm text-gray-500">30 dagen proberen. Geen creditcard nodig.</p>
          </div>
          <div className="bg-white rounded-lg card-glow h-64 sm:h-80" />
        </div>
      </section>

      {/* Feature highlights */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-2xl font-bold mb-6 text-black">Wat je krijgt</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border bg-white p-5 card-glow">
                <h3 className="font-semibold text-black">{f.title}</h3>
                <p className="mt-2 text-sm text-black font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/marketing/features" className="text-blue-700 font-medium hover:underline">Bekijk alle functies →</Link>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="rounded-lg border p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-black">Eerlijke prijzen, direct duidelijk</h3>
              <p className="text-black font-medium">Start voor €19/mnd. Team tot 10 gebruikers voor €29/mnd.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/marketing/pricing" className="inline-flex items-center rounded bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700">Bekijk prijzen</Link>
              <a href="mailto:sales@example.com" className="inline-flex items-center rounded border px-5 py-3 text-gray-800 hover:bg-gray-100">Plan een demo</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
