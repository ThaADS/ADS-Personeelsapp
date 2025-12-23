const faqs = [
  {
    q: "Is er een proefperiode?",
    a: "Ja, je kunt 30 dagen gratis proberen zonder creditcard.",
  },
  {
    q: "Hoe werkt de prijsstelling?",
    a: "Basis is €19/mnd. Team (tot 10 gebruikers) is €29/mnd. Voor 20 gebruikers bieden we een organisatietier op aanvraag.",
  },
  {
    q: "Kan ik maandelijks opzeggen?",
    a: "Ja, je kunt maandelijks opzeggen zonder gedoe.",
  },
  {
    q: "Hebben jullie exportmogelijkheden?",
    a: "Ja, je kunt data exporteren (CSV/XLSX) en rapportages maken.",
  },
  {
    q: "Ondersteunen jullie SSO of 2FA?",
    a: "Wachtwoord-authenticatie is standaard. SSO/2FA staat op de roadmap; neem contact op voor planning.",
  },
  {
    q: "Hoe zit het met AVG?",
    a: "We volgen AVG-principes, bieden verwerkersovereenkomst en tooling voor inzage/verwijderen op verzoek.",
  },
];

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-black">Veelgestelde vragen</h1>
      <p className="mt-2 text-black font-medium">Staat je vraag er niet bij? Mail ons gerust.</p>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold text-black">{f.q}</h2>
            <p className="mt-2 text-sm text-black font-medium">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border p-6 bg-white">
        <h3 className="font-semibold text-black">Nog vragen?</h3>
        <p className="mt-2 text-sm text-black font-medium">Neem contact op met ons team. We helpen je graag op weg.</p>
        <div className="mt-4 flex gap-3">
          <a href="mailto:support@example.com" className="inline-flex items-center rounded bg-blue-600 px-5 py-3 text-white font-bold hover:bg-blue-700">Neem contact op</a>
          <a href="/marketing/pricing" className="inline-flex items-center rounded border px-5 py-3 text-black font-semibold hover:bg-gray-100">Bekijk prijzen</a>
        </div>
      </div>
    </main>
  );
}
