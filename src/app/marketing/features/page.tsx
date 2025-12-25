import {
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const sections = [
  {
    title: "Urenregistratie",
    icon: ClockIcon,
    gradient: "from-cyan-500 to-blue-600",
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
    icon: CalendarIcon,
    gradient: "from-emerald-500 to-teal-600",
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
    icon: ShieldCheckIcon,
    gradient: "from-rose-500 to-pink-600",
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
    title: "Goedkeuringen",
    icon: CheckCircleIcon,
    gradient: "from-amber-500 to-orange-600",
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
    icon: UserGroupIcon,
    gradient: "from-violet-500 to-purple-600",
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
    icon: ChartBarIcon,
    gradient: "from-indigo-500 to-blue-600",
    points: [
      "Dashboards en KPI's (marge, inzet, verzuim)",
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
    title: "Roadmap Features",
    icon: CogIcon,
    gradient: "from-slate-500 to-gray-600",
    points: [
      "Mobiele PWA + offline invoer",
      "SSO/2FA authenticatie",
      "Webhook/API-koppelingen",
      "Import/export medewerkers en stamdata",
      "Bewerkbare e-mailtemplates via editor",
      "Melding-voorkeuren per medewerker",
    ],
    usecases: [
      "Snelle adoptie op de werkvloer",
      "Veilig en koppelbaar met bestaande tools",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Alle functies op een rij
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Alles wat je nodig hebt om personeelsprocessen soepel te laten lopen
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s) => (
            <div
              key={s.title}
              className="group relative backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-violet-500/50 hover:shadow-2xl transition-all duration-300"
            >
              {/* Gradient border on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-sm`}></div>

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${s.gradient} mb-4`}>
                <s.icon className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-xl font-bold text-white mb-3">{s.title}</h2>

              <ul className="space-y-2 mb-4">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start text-sm text-gray-300">
                    <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              {s.usecases && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">
                    Use cases
                  </div>
                  <ul className="space-y-1">
                    {s.usecases.map((u: string) => (
                      <li key={u} className="text-xs text-gray-400 italic">
                        &ldquo;{u}&rdquo;
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start demo vanaf €19/mnd
            </a>
            <a
              href="mailto:info@ads-personeelsapp.nl"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all"
            >
              Vraag een demo aan
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
