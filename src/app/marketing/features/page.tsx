const sections = [
  {
    title: "Urenregistratie",
    points: [
      "Start/stop of handmatige invoer met pauzes",
      "Slimme validatie: weekend, lange/korte dagen, pauzechecks",
      "GPS-verificatie en notities (voor buitendienst)",
      "Export (CSV/XLSX/PDF) en volledige audittrail",
      "Automatische herinneringen voor tijdsverantwoording",
    ],
    usecases: [
      "Monteurs boeken onderweg via mobiel en besparen tot 20 min/dag",
      "Teamleads zien ontbrekende uren en sturen automatisch reminders",
      "Projectadministratie exporteert uren direct naar verloning/boekhouding",
    ],
  },
  {
    title: "Verlof & Tijd-voor-tijd",
    points: [
      "Vakantieaanvragen met realtime saldi",
      "TVT-aanvragen en automatische berekening",
      "Goedkeurstromen per rol/tenant",
      "Overzichtskalender, historie en rapportages",
    ],
    usecases: [
      "Medewerkers vragen verlof via mobiel; managers keuren onderweg goed",
      "Automatische saldo‑updates en duidelijkheid voor HR",
      "Urenbanken (TVT) inzichtelijk per team",
    ],
  },
  {
    title: "Ziekmeldingen",
    points: [
      "Eenvoudig ziek melden met reden en bijlagen",
      "UWV-signalen (drempels en herinneringen)",
      "Opvolging en herstelverwachting",
      "Rapportage ziekteverzuim en doorlooptijden",
    ],
    usecases: [
      "Teamleads ontvangen reminders bij opvolgmomenten",
      "HR heeft direct rapportages voor management",
    ],
  },
  {
    title: "Goedkeuringen (ticketsysteem-stijl)",
    points: [
      "Centrale lijst met filters en tabs",
      "Bulk- en inline-actie met opmerkingen",
      "Slimme signalen vanuit validatieregels",
      "Volledige logging van beslissingen",
    ],
    usecases: [
      "Managers keuren in bulk tijd en verlof; minder klikwerk",
      "Opmerkingen en audittrail voor compliance",
    ],
  },
  {
    title: "Medewerkers & Rollen",
    points: [
      "Teams, rollen (Admin, Manager, User)",
      "Fijngranulaire rechten (RBAC)",
      "Uitnodigen en deactiveren",
      "Multi-tenant klaar",
    ],
    usecases: [
      "Beperk toegang tot gevoelige data (AVG)",
      "Schaal naar meerdere vestigingen/labels",
    ],
  },
  {
    title: "Beheer & Rapportage",
    points: [
      "Dashboards en KPI’s (marge, inzet, verzuim)",
      "Exports naar CSV/XLSX/PDF",
      "Auditlog (wie deed wat en wanneer)",
      "Integraties (o.a. Stripe, e-mail, webhooks)",
    ],
    usecases: [
      "Directe rapportage voor MT; minder Excel-werk",
      "Audits sneller afronden door volledige logging",
    ],
  },
  {
    title: "Must‑haves",
    points: [
      "Mobiele PWA + offline invoer (roadmap)",
      "SSO/2FA (roadmap)",
      "Webhook/API‑koppelingen",
      "Import/export medewerkers en stamdata",
      "Achteraf bewerkbare e‑mailtemplates via editor",
      "Melding‑voorkeuren per medewerker (opt‑in/uit)",
    ],
    usecases: [
      "Snelle adoptie op de werkvloer",
      "Veilig en koppelbaar met bestaande tools",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-black">Functies</h1>
      <p className="mt-2 text-black font-medium">Alles wat je nodig hebt om personeelsprocessen soepel te laten lopen.</p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((s) => (
          <div key={s.title} className="rounded-lg border bg-white p-5 card-glow">
            <h2 className="font-semibold text-black">{s.title}</h2>
            <ul className="mt-3 list-disc pl-5 text-sm text-black font-medium space-y-1">
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {s.usecases && (
              <div className="mt-3">
                <div className="text-sm font-bold text-black mb-1">Use cases</div>
                <ul className="list-disc pl-5 text-sm text-black font-medium space-y-1">
                  {s.usecases.map((u: string) => (
                    <li key={u}>{u}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <a href="/marketing/pricing" className="inline-flex items-center rounded bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700">Aan de slag vanaf €19/mnd</a>
        <a href="mailto:sales@example.com" className="inline-flex items-center rounded border px-5 py-3 text-gray-800 hover:bg-gray-100">Vraag een demo aan</a>
      </div>
    </main>
  );
}
