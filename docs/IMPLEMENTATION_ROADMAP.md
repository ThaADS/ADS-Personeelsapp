# Complete Implementatie Roadmap - Mobiele Verbeteringen CKW Personeelsapp

## 📋 Executive Summary

Dit document beschrijft de complete implementatie roadmap voor het mobiel-vriendelijk maken van de CKW Personeelsapp en het toevoegen van ontbrekende functionaliteit. De focus ligt op optimale gebruikerservaring voor medewerkers die de app dagelijks op hun telefoon gebruiken.

**Geschatte doorlooptijd:** 4-6 weken (afhankelijk van beschikbare resources)
**Prioriteit:** HOOG - Impact op dagelijks gebruik door alle medewerkers

---

## 🎯 Doelstellingen

### Primaire Doelen
1. **Mobiele UX verbeteren** - Geen horizontaal scrollen, touch-friendly interfaces
2. **Efficiency verhogen** - Snellere tijdregistratie, minder clicks
3. **Transparantie** - Duidelijk verlof saldo, status inzicht
4. **Manager efficiency** - Bulk acties, snelle goedkeuringen

### Success Metrics
- ✅ 100% van tabellen hebben mobiele card view
- ✅ Alle touch targets minimaal 44x44px
- ✅ Time-to-clock-in < 5 seconden (was: ~30 seconden)
- ✅ 90% van gebruikers kan zonder instructie navigeren
- ✅ Verlof saldo zichtbaar binnen 2 clicks

---

## 🏗️ Architectuur Overzicht

### Responsive Strategie
```
Mobile First Approach
├── < 768px (Mobile)  → Card layouts, stacked forms
├── 768-1024px (Tablet) → Hybrid: Cards + condensed tables
└── > 1024px (Desktop) → Full tables, multi-column layouts
```

### Component Strategie
```
Shared Components
├── /components/mobile/
│   ├── CardView.tsx          # Generic card wrapper
│   ├── TimesheetCard.tsx     # Timesheet specific card
│   ├── VacationCard.tsx      # Vacation specific card
│   ├── EmployeeCard.tsx      # Employee specific card
│   └── QuickActionButton.tsx # Dashboard quick actions
├── /components/dashboard/
│   ├── StatCard.tsx          # Statistics display
│   ├── VacationBalance.tsx   # Vacation balance widget
│   └── QuickClockIn.tsx      # Quick clock in/out
└── /components/filters/
    ├── DateRangeFilter.tsx   # Date range picker
    └── StatusFilter.tsx      # Status dropdown filter
```

---

## 📅 FASE 1: KRITIEKE FIXES (Week 1-2)

### Sprint 1.1: Sessie Fix & Basis Setup
**Duur:** 2-3 dagen
**Prioriteit:** 🔴 KRITIEK

#### Taken
1. **Sessie probleem oplossen**
   - [ ] Gebruiker moet browser cookies wissen en opnieuw inloggen
   - [ ] Test met alle 3 accounts (admin, manager, user)
   - [ ] Valideer dat session callbacks correct worden aangeroepen
   - [ ] Controleer JWT token in browser DevTools

2. **Development Environment Setup**
   - [ ] Maak feature branch: `feature/mobile-improvements`
   - [ ] Setup component directories structuur
   - [ ] Installeer eventuele extra dependencies (geen nieuwe nodig)
   - [ ] Create development checklist

#### Acceptatie Criteria
- ✅ Inloggen werkt zonder "Niet geautoriseerd" errors
- ✅ Session blijft actief gedurende 24 uur
- ✅ Alle API endpoints returnen 200 status
- ✅ getTenantContext() retourneert gebruiker data

#### Deliverables
- Werkende authenticatie voor alle roles
- Feature branch gereed voor development
- Component folder structuur

---

### Sprint 1.2: GPS Knoppen & Touch Targets
**Duur:** 1 dag
**Prioriteit:** 🔴 KRITIEK

#### Implementatie Details

**File:** `src/app/(dashboard)/timesheet/page.tsx`

**Huidige implementatie:**
```tsx
<button
  type="button"
  onClick={() => captureLocation('start')}
  className="mt-2 inline-flex items-center px-3 py-1 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
>
  Gebruik mijn locatie (start)
</button>
```

**Nieuwe implementatie:**
```tsx
<button
  type="button"
  onClick={() => captureLocation('start')}
  className="mt-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm min-h-[44px]"
>
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
  Startlocatie vastleggen
</button>
```

**Verbeteringen:**
- ✅ Touch target: 44px+ hoogte (min-h-[44px])
- ✅ Volledige breedte op mobiel (w-full sm:w-auto)
- ✅ Grotere padding: py-3 (was py-1)
- ✅ Duidelijk icoon (locatie pin)
- ✅ Betere labeling
- ✅ Active state voor tactile feedback

#### Taken
- [ ] Update GPS knoppen in timesheet form (2 knoppen)
- [ ] Test op verschillende schermgroottes
- [ ] Valideer touch target met Chrome DevTools
- [ ] Test GPS capture functionaliteit

#### Acceptatie Criteria
- ✅ Touch targets minimaal 44x44px
- ✅ Knoppen goed zichtbaar op kleine schermen
- ✅ GPS capture werkt na klik
- ✅ Visual feedback bij klikken (active state)

---

### Sprint 1.3: Tijdregistratie Mobiele Cards
**Duur:** 3 dagen
**Prioriteit:** 🔴 KRITIEK

#### Component Specificatie

**Nieuw bestand:** `src/components/mobile/TimesheetCard.tsx`

```tsx
interface TimesheetCardProps {
  entry: TimesheetEntry;
  onDetailsClick: (id: string) => void;
}

export function TimesheetCard({ entry, onDetailsClick }: TimesheetCardProps) {
  const { hours, minutes } = calculateWorkTime(entry);
  const hasGpsData = entry.startLat !== null || entry.endLat !== null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Date + Status */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {new Date(entry.date).toLocaleDateString("nl-NL", {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {hours}u {minutes}m
          </div>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      {/* Time Details */}
      <div className="space-y-2 mb-3 bg-gray-50 rounded-lg p-3">
        <DetailRow
          label="Tijd"
          value={`${entry.startTime} - ${entry.endTime}`}
        />
        <DetailRow
          label="Pauze"
          value={`${entry.breakDuration} min`}
        />
      </div>

      {/* Description */}
      {entry.description && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-600 font-medium mb-1">
            Omschrijving:
          </div>
          <div className="text-sm text-gray-700">{entry.description}</div>
        </div>
      )}

      {/* Footer: GPS + Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <GPSIndicator hasData={hasGpsData} />
        <button
          onClick={() => onDetailsClick(entry.id)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
        >
          Details
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
```

#### Implementatie in page.tsx

```tsx
// Mobile Card View (< 768px)
<div className="block md:hidden space-y-3 p-4">
  {timesheets.map((entry) => (
    <TimesheetCard
      key={entry.id}
      entry={entry}
      onDetailsClick={(id) => router.push(`/timesheet/${id}`)}
    />
  ))}
</div>

// Desktop Table View (>= 768px)
<div className="hidden md:block">
  <table className="min-w-full divide-y divide-gray-200">
    {/* Existing table code */}
  </table>
</div>
```

#### Taken
- [ ] Create TimesheetCard component
- [ ] Create shared StatusBadge component
- [ ] Create shared DetailRow component
- [ ] Create shared GPSIndicator component
- [ ] Update timesheet page.tsx met responsive views
- [ ] Test op iPhone SE (320px), iPhone 12 (390px), iPad (768px)
- [ ] Valideer data weergave correctheid

#### Acceptatie Criteria
- ✅ Card view zichtbaar op < 768px
- ✅ Table view zichtbaar op >= 768px
- ✅ Alle data correct weergegeven in cards
- ✅ GPS status duidelijk zichtbaar
- ✅ Status badges met correcte kleuren
- ✅ Smooth transitions bij resize

#### Geschatte Impact
- **Time savings:** 60% minder scroll tijd op mobiel
- **User satisfaction:** Van frustratie naar plezierige ervaring

---

## 📅 FASE 2: CORE FUNCTIONALITEIT (Week 3)

### Sprint 2.1: Verlof & Ziekmelding Mobiele Cards
**Duur:** 2 dagen
**Prioriteit:** 🟡 HOOG

#### Component: VacationCard.tsx

```tsx
interface VacationCardProps {
  request: VacationRequest;
}

export function VacationCard({ request }: VacationCardProps) {
  const days = calculateDaysBetween(request.startDate, request.endDate);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <VacationTypeIcon type={request.type} />
          <div className="text-lg font-bold text-gray-900 mt-1">
            {getVacationTypeLabel(request.type)}
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Date Range */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-xs text-gray-600">Van</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatDate(request.startDate)}
            </div>
          </div>
          <ArrowRightIcon className="w-5 h-5 text-gray-400 mx-2" />
          <div className="text-center flex-1">
            <div className="text-xs text-gray-600">Tot</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatDate(request.endDate)}
            </div>
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-purple-600">{days}</span>
          <span className="text-sm text-gray-600 ml-1">
            {days === 1 ? 'dag' : 'dagen'}
          </span>
        </div>
      </div>

      {/* Description */}
      {request.description && (
        <div className="p-3 bg-gray-50 rounded-lg mb-3">
          <div className="text-xs text-gray-500 mb-1">Reden:</div>
          <div className="text-sm text-gray-700">{request.description}</div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500">
        Ingediend op {formatDateTime(request.submittedAt)}
      </div>
    </div>
  );
}
```

#### Taken
- [ ] Create VacationCard component
- [ ] Create SickLeaveCard component
- [ ] Create VacationTypeIcon component
- [ ] Update vacation page.tsx
- [ ] Update sick-leave page.tsx
- [ ] Add date formatting utilities
- [ ] Test alle verlof types (vacation, special, unpaid)

#### Acceptatie Criteria
- ✅ Cards tonen correcte datum ranges
- ✅ Dagen worden correct berekend
- ✅ Verlof types hebben unieke iconen/kleuren
- ✅ Status duidelijk zichtbaar

---

### Sprint 2.2: Medewerkers Mobiele Cards
**Duur:** 2 dagen
**Prioriteit:** 🟡 HOOG

#### Component: EmployeeCard.tsx

```tsx
interface EmployeeCardProps {
  employee: Employee;
  canManage: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function EmployeeCard({ employee, canManage, onView, onEdit }: EmployeeCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Header: Avatar + Name */}
      <div className="flex items-start space-x-3 mb-3">
        <Avatar
          src={employee.image}
          name={employee.name}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-gray-900 truncate">
            {employee.name || 'Geen naam'}
          </div>
          <div className="text-sm text-gray-500 truncate">{employee.email}</div>
          {employee.employeeId && (
            <div className="text-xs text-gray-400">#{employee.employeeId}</div>
          )}
        </div>
        <RoleBadge role={employee.role} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <InfoBox
          icon={<BriefcaseIcon />}
          label="Afdeling"
          value={employee.department || '-'}
        />
        <InfoBox
          icon={<UserIcon />}
          label="Functie"
          value={employee.position || '-'}
        />
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg">
        {employee.phone && (
          <a
            href={`tel:${employee.phone}`}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <PhoneIcon className="w-4 h-4 mr-2" />
            {employee.phone}
          </a>
        )}
        <a
          href={`mailto:${employee.email}`}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <EnvelopeIcon className="w-4 h-4 mr-2" />
          {employee.email}
        </a>
      </div>

      {/* Start Date */}
      {employee.startDate && (
        <div className="text-xs text-gray-500 mb-3">
          In dienst sinds {formatDate(employee.startDate)}
        </div>
      )}

      {/* Actions */}
      {canManage && (
        <div className="flex space-x-2">
          <button
            onClick={() => onView(employee.id)}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
          >
            Bekijken
          </button>
          <button
            onClick={() => onEdit(employee.id)}
            className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
          >
            Bewerken
          </button>
        </div>
      )}
    </div>
  );
}
```

#### Taken
- [ ] Create EmployeeCard component
- [ ] Create Avatar component
- [ ] Create InfoBox component
- [ ] Create RoleBadge component
- [ ] Update employees page.tsx
- [ ] Add click-to-call and click-to-email
- [ ] Test manager vs user permissions

#### Acceptatie Criteria
- ✅ Contact info klikbaar (tel: en mailto:)
- ✅ Avatar toont initialen indien geen foto
- ✅ Rol badges met correcte kleuren
- ✅ Actieknoppen alleen voor managers
- ✅ Responsive op alle schermgroottes

---

### Sprint 2.3: Dashboard Widgets
**Duur:** 2 dagen
**Prioriteit:** 🟡 HOOG

#### Widget 1: Quick Clock In/Out

**File:** `src/components/dashboard/QuickClockIn.tsx`

```tsx
export function QuickClockInWidget() {
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');

  const handleClockIn = async () => {
    // Capture GPS
    const location = await captureGPSLocation();

    // Create timesheet entry
    const entry = await createTimesheetEntry({
      startTime: new Date(),
      startLat: location.lat,
      startLng: location.lng,
    });

    setIsWorking(true);
    setStartTime(new Date());

    // Save to localStorage for persistence
    localStorage.setItem('activeTimesheet', JSON.stringify(entry));
  };

  const handleClockOut = async () => {
    const location = await captureGPSLocation();
    const activeEntry = JSON.parse(localStorage.getItem('activeTimesheet'));

    // Update timesheet entry
    await updateTimesheetEntry(activeEntry.id, {
      endTime: new Date(),
      endLat: location.lat,
      endLng: location.lng,
    });

    setIsWorking(false);
    setStartTime(null);
    localStorage.removeItem('activeTimesheet');

    // Show success message
    toast.success('Uren geregistreerd!');
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Snel Registreren</h3>

      {isWorking ? (
        <>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold mb-2">{elapsedTime}</div>
            <div className="text-sm text-blue-100">
              Gestart om {startTime?.toLocaleTimeString('nl-NL')}
            </div>
          </div>
          <button
            onClick={handleClockOut}
            className="w-full bg-white text-blue-600 font-semibold py-4 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            <StopIcon className="w-6 h-6 mr-2" />
            Clock Out
          </button>
        </>
      ) : (
        <button
          onClick={handleClockIn}
          className="w-full bg-white text-blue-600 font-semibold py-4 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center"
        >
          <PlayIcon className="w-6 h-6 mr-2" />
          Clock In
        </button>
      )}

      <div className="mt-3 text-xs text-blue-100 text-center">
        GPS locatie wordt automatisch vastgelegd
      </div>
    </div>
  );
}
```

#### Widget 2: Vacation Balance

**File:** `src/components/dashboard/VacationBalance.tsx`

```tsx
export function VacationBalanceWidget() {
  const [balance, setBalance] = useState<VacationBalance | null>(null);

  useEffect(() => {
    fetchVacationBalance();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Verlof Saldo</h3>
        <Link href="/vacation" className="text-sm text-blue-600 hover:text-blue-800">
          Aanvragen →
        </Link>
      </div>

      {balance ? (
        <>
          {/* Main Balance */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-purple-600 mb-1">
              {balance.remaining}
            </div>
            <div className="text-sm text-gray-600">dagen beschikbaar</div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Gebruikt: {balance.used}</span>
              <span>Totaal: {balance.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{ width: `${(balance.used / balance.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-purple-50 rounded-lg p-2">
              <div className="text-lg font-semibold text-purple-600">
                {balance.used}
              </div>
              <div className="text-xs text-gray-600">Gebruikt</div>
            </div>
            <div className="bg-pink-50 rounded-lg p-2">
              <div className="text-lg font-semibold text-pink-600">
                {balance.pending}
              </div>
              <div className="text-xs text-gray-600">Aangevraagd</div>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <div className="text-lg font-semibold text-green-600">
                {balance.remaining}
              </div>
              <div className="text-xs text-gray-600">Resterend</div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Spinner />
        </div>
      )}
    </div>
  );
}
```

#### API Endpoint voor Vacation Balance

**File:** `src/app/api/vacation-balance/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const context = await getTenantContext();
  if (!context) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  // Calculate vacation balance
  const currentYear = new Date().getFullYear();

  const vacations = await prisma.vacationRequest.findMany({
    where: {
      tenantId: context.tenantId,
      employeeId: context.userId,
      type: 'VACATION',
      startDate: {
        gte: new Date(`${currentYear}-01-01`),
        lte: new Date(`${currentYear}-12-31`),
      },
    },
  });

  const used = vacations
    .filter(v => v.status === 'APPROVED')
    .reduce((sum, v) => sum + v.totalDays, 0);

  const pending = vacations
    .filter(v => v.status === 'PENDING')
    .reduce((sum, v) => sum + v.totalDays, 0);

  // Get user's total vacation days (from contract)
  const user = await prisma.user.findUnique({
    where: { id: context.userId },
    select: { totalVacationDays: true },
  });

  const total = user?.totalVacationDays || 25; // Default 25 days
  const remaining = total - used - pending;

  return NextResponse.json({
    total,
    used,
    pending,
    remaining,
  });
}
```

#### Taken
- [ ] Create QuickClockIn widget
- [ ] Create VacationBalance widget
- [ ] Create vacation-balance API endpoint
- [ ] Add totalVacationDays field to User model
- [ ] Update dashboard page.tsx
- [ ] Add localStorage persistence for clock-in
- [ ] Add elapsed time counter
- [ ] Test clock in/out flow

#### Acceptatie Criteria
- ✅ Clock in creates timesheet entry
- ✅ GPS wordt automatisch vastgelegd
- ✅ Elapsed time teller werkt
- ✅ Clock out slaat uren op
- ✅ Vacation balance toont correcte data
- ✅ Progress bar visualiseert verbruik

---

## 📅 FASE 3: FILTERS & ENHANCEMENT (Week 4)

### Sprint 3.1: Tijdregistratie Filters
**Duur:** 2 dagen
**Prioriteit:** 🟡 MEDIUM

#### Component: DateRangeFilter

```tsx
export function DateRangeFilter({ onChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()));

  const presets = [
    { value: 'today', label: 'Vandaag', getRange: () => [startOfDay(new Date()), endOfDay(new Date())] },
    { value: 'week', label: 'Deze week', getRange: () => [startOfWeek(new Date()), endOfWeek(new Date())] },
    { value: 'month', label: 'Deze maand', getRange: () => [startOfMonth(new Date()), endOfMonth(new Date())] },
    { value: 'custom', label: 'Custom', getRange: () => [startDate, endDate] },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map(p => (
          <button
            key={p.value}
            onClick={() => {
              setPreset(p.value);
              const [start, end] = p.getRange();
              onChange(start, end);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              preset === p.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {preset === 'custom' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Van</label>
            <input
              type="date"
              value={formatDateForInput(startDate)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setStartDate(date);
                onChange(date, endDate);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Tot</label>
            <input
              type="date"
              value={formatDateForInput(endDate)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setEndDate(date);
                onChange(startDate, date);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Component: StatusFilter

```tsx
export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const statuses = [
    { value: 'all', label: 'Alle', count: null },
    { value: 'PENDING', label: 'In behandeling', color: 'yellow' },
    { value: 'APPROVED', label: 'Goedgekeurd', color: 'green' },
    { value: 'REJECTED', label: 'Afgekeurd', color: 'red' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map(status => (
        <button
          key={status.value}
          onClick={() => onChange(status.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            value === status.value
              ? `bg-${status.color}-600 text-white`
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {status.label}
          {status.count !== null && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-white bg-opacity-30 rounded text-xs">
              {status.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
```

#### Implementatie in Timesheet Page

```tsx
export default function TimesheetPage() {
  const [filters, setFilters] = useState({
    startDate: startOfWeek(new Date()),
    endDate: endOfWeek(new Date()),
    status: 'all',
  });

  const fetchTimesheets = async () => {
    const params = new URLSearchParams({
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
      ...(filters.status !== 'all' && { status: filters.status }),
      page: pagination.page.toString(),
      limit: '10',
    });

    const response = await fetch(`/api/timesheets?${params}`);
    // ... rest of fetch logic
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <DateRangeFilter
          onChange={(start, end) => {
            setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
            fetchTimesheets();
          }}
        />
        <StatusFilter
          value={filters.status}
          onChange={(status) => {
            setFilters(prev => ({ ...prev, status }));
            fetchTimesheets();
          }}
        />
      </div>

      {/* Rest of page */}
    </div>
  );
}
```

#### API Update

**File:** `src/app/api/timesheets/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const context = await getTenantContext();
  if (!context) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const where: any = {
    tenantId: context.tenantId,
    userId: context.userId,
  };

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  if (status && status !== 'all') {
    where.status = status;
  }

  const [timesheets, total] = await Promise.all([
    prisma.timesheet.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.timesheet.count({ where }),
  ]);

  return NextResponse.json({
    items: timesheets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
```

#### Taken
- [ ] Create DateRangeFilter component
- [ ] Create StatusFilter component
- [ ] Add date-fns library for date utilities
- [ ] Update timesheet API with filter support
- [ ] Add URL params for shareable filtered views
- [ ] Test all filter combinations
- [ ] Add loading states during filter changes

#### Acceptatie Criteria
- ✅ Preset filters (today/week/month) werken
- ✅ Custom date range werkt
- ✅ Status filter toont correcte resultaten
- ✅ Filters zijn combineerbaar
- ✅ URL wordt updated met filter params
- ✅ Page reload behoudt filters

---

## 📅 FASE 4: ADVANCED FEATURES (Week 5-6)

### Sprint 4.1: Foto Upload bij Tijdregistratie
**Duur:** 3 dagen
**Prioriteit:** 🟢 MEDIUM

#### Database Schema Update

**Prisma Schema:**
```prisma
model Timesheet {
  id             String   @id @default(cuid())
  // ... existing fields
  photos         TimesheetPhoto[]
}

model TimesheetPhoto {
  id           String    @id @default(cuid())
  timesheetId  String
  timesheet    Timesheet @relation(fields: [timesheetId], references: [id], onDelete: Cascade)
  url          String
  thumbnailUrl String?
  uploadedAt   DateTime  @default(now())
  fileSize     Int
  mimeType     String

  @@index([timesheetId])
}
```

#### Component: PhotoUpload

```tsx
export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async () => {
    // Mobile: Open camera
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate files
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size < 5 * 1024 * 1024;
      return isImage && isUnder5MB;
    });

    // Create previews
    const newPreviews = await Promise.all(
      validFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );

    setPhotos(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    onUpload([...photos, ...validFiles]);
  };

  const handleRemove = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    onUpload(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Capture Button */}
      <button
        type="button"
        onClick={handleCapture}
        className="w-full flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
      >
        <CameraIcon className="w-5 h-5 mr-2" />
        Foto toevoegen van werkplek
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Max 5 MB per foto • JPG, PNG
      </div>
    </div>
  );
}
```

#### Upload Handler

**File:** `src/lib/upload/photo-upload.ts`

```typescript
import { put } from '@vercel/blob';

export async function uploadTimesheetPhotos(
  files: File[],
  timesheetId: string
): Promise<TimesheetPhoto[]> {
  const uploads = await Promise.all(
    files.map(async (file) => {
      // Upload to Vercel Blob Storage
      const blob = await put(`timesheets/${timesheetId}/${file.name}`, file, {
        access: 'public',
        addRandomSuffix: true,
      });

      // Create thumbnail (optional)
      const thumbnail = await createThumbnail(file);
      const thumbnailBlob = thumbnail
        ? await put(`timesheets/${timesheetId}/thumbs/${file.name}`, thumbnail, {
            access: 'public',
            addRandomSuffix: true,
          })
        : null;

      return {
        url: blob.url,
        thumbnailUrl: thumbnailBlob?.url || blob.url,
        fileSize: file.size,
        mimeType: file.type,
      };
    })
  );

  // Save to database
  const photos = await prisma.timesheetPhoto.createMany({
    data: uploads.map(upload => ({
      timesheetId,
      ...upload,
    })),
  });

  return photos;
}

async function createThumbnail(file: File): Promise<File | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Resize to max 200x200
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            resolve(null);
          }
        }, 'image/jpeg', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

#### Taken
- [ ] Add Timesheet Photo model to Prisma schema
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Install @vercel/blob package
- [ ] Create PhotoUpload component
- [ ] Add photo upload to timesheet form
- [ ] Implement upload handler
- [ ] Add thumbnail generation
- [ ] Display photos in timesheet details
- [ ] Add photo lightbox viewer
- [ ] Test on iOS Safari and Chrome Android

#### Acceptatie Criteria
- ✅ Camera opent op mobiel apparaat
- ✅ Meerdere foto's kunnen worden toegevoegd
- ✅ Previews tonen geselecteerde foto's
- ✅ Upload werkt (max 5MB)
- ✅ Thumbnails worden gegenereerd
- ✅ Foto's zichtbaar in details view

---

### Sprint 4.2: Bulk Goedkeuringen (Manager)
**Duur:** 2 dagen
**Prioriteit:** 🟢 MEDIUM

#### Component: BulkApprovalBar

```tsx
export function BulkApprovalBar({
  selectedIds,
  onApprove,
  onReject,
  onClear
}: BulkApprovalBarProps) {
  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-gray-900">
            {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} geselecteerd
          </div>
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Wis selectie
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onReject}
            className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 inline mr-1" />
            Afkeuren
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <CheckIcon className="w-5 h-5 inline mr-1" />
            Goedkeuren
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### API Endpoint: Bulk Approval

**File:** `src/app/api/timesheets/bulk-approve/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const context = await getTenantContext();

  // Check permission
  if (!hasPermission(context, Permission.APPROVE_TIMESHEETS)) {
    return NextResponse.json({ error: "Geen toestemming" }, { status: 403 });
  }

  const { timesheetIds, action, reason } = await request.json();

  // Validate
  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: "Ongeldige actie" }, { status: 400 });
  }

  if (action === 'reject' && !reason) {
    return NextResponse.json({ error: "Reden vereist voor afkeuring" }, { status: 400 });
  }

  // Update all timesheets
  const result = await prisma.timesheet.updateMany({
    where: {
      id: { in: timesheetIds },
      tenantId: context.tenantId,
      status: 'PENDING', // Only update pending items
    },
    data: {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      approvedBy: context.userId,
      approvedAt: new Date(),
      ...(reason && { rejectionReason: reason }),
    },
  });

  // Create audit logs
  await prisma.auditLog.createMany({
    data: timesheetIds.map(id => ({
      tenantId: context.tenantId,
      userId: context.userId,
      action: `TIMESHEET_${action.toUpperCase()}`,
      entityType: 'TIMESHEET',
      entityId: id,
      details: JSON.stringify({ reason }),
    })),
  });

  // Send notifications (if implemented)
  // await sendBulkNotifications(timesheetIds, action);

  return NextResponse.json({
    success: true,
    updated: result.count,
  });
}
```

#### Manager Approvals Page Enhancement

```tsx
export default function ApprovalsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleSelectAll = () => {
    if (selectedIds.length === timesheets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(timesheets.map(t => t.id));
    }
  };

  const handleBulkApprove = async () => {
    const response = await fetch('/api/timesheets/bulk-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timesheetIds: selectedIds,
        action: 'approve',
      }),
    });

    if (response.ok) {
      toast.success(`${selectedIds.length} tijdregistraties goedgekeurd`);
      setSelectedIds([]);
      fetchTimesheets();
    }
  };

  const handleBulkReject = async (reason: string) => {
    const response = await fetch('/api/timesheets/bulk-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timesheetIds: selectedIds,
        action: 'reject',
        reason,
      }),
    });

    if (response.ok) {
      toast.success(`${selectedIds.length} tijdregistraties afgekeurd`);
      setSelectedIds([]);
      setShowRejectModal(false);
      fetchTimesheets();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Select All */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Goedkeuringen</h1>
        <button
          onClick={handleSelectAll}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {selectedIds.length === timesheets.length ? 'Deselecteer' : 'Selecteer'} alles
        </button>
      </div>

      {/* Timesheet Cards with Checkboxes */}
      <div className="space-y-3">
        {timesheets.map(timesheet => (
          <div
            key={timesheet.id}
            className={`relative ${selectedIds.includes(timesheet.id) ? 'ring-2 ring-blue-500' : ''}`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(timesheet.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(prev => [...prev, timesheet.id]);
                } else {
                  setSelectedIds(prev => prev.filter(id => id !== timesheet.id));
                }
              }}
              className="absolute top-4 right-4 w-5 h-5 text-blue-600 rounded"
            />
            <TimesheetCard entry={timesheet} />
          </div>
        ))}
      </div>

      {/* Bulk Approval Bar */}
      <BulkApprovalBar
        selectedIds={selectedIds}
        onApprove={handleBulkApprove}
        onReject={() => setShowRejectModal(true)}
        onClear={() => setSelectedIds([])}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          count={selectedIds.length}
          onConfirm={handleBulkReject}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </div>
  );
}
```

#### Taken
- [ ] Create BulkApprovalBar component
- [ ] Create RejectModal component
- [ ] Create bulk-approve API endpoint
- [ ] Add checkbox selection to timesheet cards
- [ ] Add "Select All" functionality
- [ ] Update approvals page
- [ ] Add audit logging
- [ ] Test with large selections (100+ items)

#### Acceptatie Criteria
- ✅ Checkboxes in manager view
- ✅ Select all werkt correct
- ✅ Bulk approve werkt
- ✅ Bulk reject vraagt om reden
- ✅ Success toast met aantal items
- ✅ Audit logs worden aangemaakt
- ✅ Alleen PENDING items kunnen worden goedgekeurd

---

### Sprint 4.3: Export Functionaliteit
**Duur:** 2 dagen
**Prioriteit:** 🟢 LOW

#### Component: ExportButton

```tsx
export function ExportButton({ filters }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const params = new URLSearchParams({
        format,
        startDate: filters.startDate.toISOString(),
        endDate: filters.endDate.toISOString(),
        ...(filters.status !== 'all' && { status: filters.status }),
      });

      const response = await fetch(`/api/timesheets/export?${params}`);
      const blob = await response.blob();

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tijdregistratie-${format === 'pdf' ? 'export.pdf' : 'export.xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export succesvol gedownload');
    } catch (error) {
      toast.error('Export mislukt');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as 'pdf' | 'excel')}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="pdf">PDF</option>
        <option value="excel">Excel</option>
      </select>

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
      >
        {isExporting ? (
          <>
            <Spinner className="w-4 h-4 mr-2" />
            Exporteren...
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Exporteer
          </>
        )}
      </button>
    </div>
  );
}
```

#### API: PDF Export

**File:** `src/app/api/timesheets/export/route.ts`

```typescript
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  const context = await getTenantContext();
  if (!context) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'pdf';
  const startDate = new Date(searchParams.get('startDate') || '');
  const endDate = new Date(searchParams.get('endDate') || '');
  const status = searchParams.get('status');

  // Fetch timesheets
  const timesheets = await prisma.timesheet.findMany({
    where: {
      tenantId: context.tenantId,
      userId: context.userId,
      date: { gte: startDate, lte: endDate },
      ...(status && status !== 'all' && { status }),
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { date: 'desc' },
  });

  if (format === 'pdf') {
    return generatePDF(timesheets, context);
  } else {
    return generateExcel(timesheets, context);
  }
}

async function generatePDF(timesheets: any[], context: any) {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(chunks);
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=tijdregistratie.pdf',
      },
    });
  });

  // Header
  doc.fontSize(20).text('Tijdregistratie Export', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Medewerker: ${timesheets[0]?.user.name}`, { align: 'left' });
  doc.text(`Periode: ${formatDate(timesheets[0]?.date)} - ${formatDate(timesheets[timesheets.length - 1]?.date)}`);
  doc.moveDown();

  // Table
  timesheets.forEach((entry) => {
    const { hours, minutes } = calculateWorkTime(entry);
    doc.fontSize(10);
    doc.text(`${formatDate(entry.date)} | ${entry.startTime}-${entry.endTime} | ${hours}u ${minutes}m | ${entry.status}`, {
      continued: false,
    });
    doc.moveDown(0.5);
  });

  // Summary
  const totalHours = timesheets.reduce((sum, entry) => {
    const { hours, minutes } = calculateWorkTime(entry);
    return sum + hours + minutes / 60;
  }, 0);

  doc.moveDown();
  doc.fontSize(12).text(`Totaal: ${Math.floor(totalHours)}u ${Math.round((totalHours % 1) * 60)}m`, { align: 'right' });

  doc.end();
}

async function generateExcel(timesheets: any[], context: any) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tijdregistratie');

  // Headers
  worksheet.columns = [
    { header: 'Datum', key: 'date', width: 15 },
    { header: 'Start', key: 'startTime', width: 10 },
    { header: 'Einde', key: 'endTime', width: 10 },
    { header: 'Pauze (min)', key: 'breakDuration', width: 12 },
    { header: 'Totaal Uren', key: 'totalHours', width: 12 },
    { header: 'Omschrijving', key: 'description', width: 30 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  // Data
  timesheets.forEach((entry) => {
    const { hours, minutes } = calculateWorkTime(entry);
    worksheet.addRow({
      date: formatDate(entry.date),
      startTime: entry.startTime,
      endTime: entry.endTime,
      breakDuration: entry.breakDuration,
      totalHours: `${hours}u ${minutes}m`,
      description: entry.description || '-',
      status: entry.status,
    });
  });

  // Style header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' },
  };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=tijdregistratie.xlsx',
    },
  });
}
```

#### Taken
- [ ] Install pdfkit and exceljs packages
- [ ] Create ExportButton component
- [ ] Create export API endpoint
- [ ] Implement PDF generation
- [ ] Implement Excel generation
- [ ] Add export button to timesheet page
- [ ] Test with large datasets (500+ entries)
- [ ] Add company logo to PDF header

#### Acceptatie Criteria
- ✅ PDF export werkt met correct format
- ✅ Excel export werkt met formulas
- ✅ Filters worden toegepast op export
- ✅ Totalen correct berekend
- ✅ Download start automatisch
- ✅ File heeft logische naam met datum

---

## 📅 FASE 5: TOEKOMST FEATURES (Week 6+)

### Future Sprint: PWA & Offline Mode
**Duur:** 5 dagen
**Prioriteit:** 🟢 LOW (Toekomst)

#### Service Worker Setup

**File:** `public/sw.js`

```javascript
const CACHE_NAME = 'ckw-pwa-v1';
const OFFLINE_URL = '/offline.html';

const CACHE_URLS = [
  '/',
  '/login',
  '/dashboard',
  '/timesheet',
  '/offline.html',
  '/manifest.json',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-timesheets') {
    event.waitUntil(syncTimesheets());
  }
});

async function syncTimesheets() {
  const db = await openDB();
  const pendingTimesheets = await db.getAll('pending-timesheets');

  for (const timesheet of pendingTimesheets) {
    try {
      await fetch('/api/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timesheet.data),
      });
      await db.delete('pending-timesheets', timesheet.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

#### Manifest File

**File:** `public/manifest.json`

```json
{
  "name": "CKW Personeelsapp",
  "short_name": "CKW",
  "description": "Tijdregistratie en verlof management",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

#### IndexedDB for Offline Storage

**File:** `src/lib/offline/db.ts`

```typescript
import { openDB, DBSchema } from 'idb';

interface CKWDatabase extends DBSchema {
  'pending-timesheets': {
    key: string;
    value: {
      id: string;
      data: any;
      createdAt: Date;
    };
  };
  'cached-data': {
    key: string;
    value: {
      key: string;
      data: any;
      cachedAt: Date;
    };
  };
}

export async function getDB() {
  return openDB<CKWDatabase>('ckw-db', 1, {
    upgrade(db) {
      db.createObjectStore('pending-timesheets', { keyPath: 'id' });
      db.createObjectStore('cached-data', { keyPath: 'key' });
    },
  });
}

export async function savePendingTimesheet(data: any) {
  const db = await getDB();
  const id = crypto.randomUUID();

  await db.add('pending-timesheets', {
    id,
    data,
    createdAt: new Date(),
  });

  // Request background sync
  if ('serviceWorker' in navigator && 'sync' in self.registration) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-timesheets');
  }

  return id;
}

export async function getPendingTimesheets() {
  const db = await getDB();
  return db.getAll('pending-timesheets');
}
```

#### Taken
- [ ] Create service worker
- [ ] Create manifest.json
- [ ] Generate app icons (72px - 512px)
- [ ] Setup IndexedDB
- [ ] Implement offline timesheet storage
- [ ] Add sync functionality
- [ ] Create offline fallback page
- [ ] Test on iOS and Android
- [ ] Submit to app stores (optional)

#### Acceptatie Criteria
- ✅ App is installeerbaar op mobiel
- ✅ Offline mode werkt voor tijdregistratie
- ✅ Background sync werkt
- ✅ Cached data blijft beschikbaar offline
- ✅ "Add to Home Screen" prompt toont

---

## 📊 TESTING STRATEGY

### Manual Testing Checklist

#### Mobiele Devices
- [ ] iPhone SE (320px width)
- [ ] iPhone 12/13 (390px width)
- [ ] iPhone 14 Pro Max (430px width)
- [ ] Samsung Galaxy S21 (360px width)
- [ ] iPad Mini (768px width)
- [ ] iPad Pro (1024px width)

#### Browsers
- [ ] Chrome Android
- [ ] Safari iOS
- [ ] Samsung Internet
- [ ] Firefox Mobile

#### Orientations
- [ ] Portrait (staand)
- [ ] Landscape (liggend)

#### User Roles
- [ ] USER - basis medewerker functionaliteit
- [ ] MANAGER - goedkeuringen en medewerkers view
- [ ] TENANT_ADMIN - volledige toegang
- [ ] SUPERUSER - multi-tenant beheer

### Automated Testing

#### Unit Tests (Vitest)

**File:** `src/components/mobile/__tests__/TimesheetCard.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TimesheetCard } from '../TimesheetCard';

describe('TimesheetCard', () => {
  const mockEntry = {
    id: '1',
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 30,
    description: 'Test werk',
    status: 'PENDING',
    startLat: 52.0,
    startLng: 5.0,
    endLat: null,
    endLng: null,
  };

  it('renders timesheet details correctly', () => {
    render(<TimesheetCard entry={mockEntry} onDetailsClick={jest.fn()} />);

    expect(screen.getByText(/7u 30m/)).toBeInTheDocument();
    expect(screen.getByText(/09:00 - 17:00/)).toBeInTheDocument();
    expect(screen.getByText(/Test werk/)).toBeInTheDocument();
  });

  it('shows GPS indicator when location available', () => {
    render(<TimesheetCard entry={mockEntry} onDetailsClick={jest.fn()} />);

    expect(screen.getByText(/GPS geverifieerd/)).toBeInTheDocument();
  });

  it('calls onDetailsClick when button clicked', () => {
    const handleClick = jest.fn();
    render(<TimesheetCard entry={mockEntry} onDetailsClick={handleClick} />);

    fireEvent.click(screen.getByText(/Details/));
    expect(handleClick).toHaveBeenCalledWith('1');
  });

  it('displays correct status badge', () => {
    render(<TimesheetCard entry={mockEntry} onDetailsClick={jest.fn()} />);

    const badge = screen.getByText(/In behandeling/);
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });
});
```

#### Integration Tests (Playwright)

**File:** `tests/e2e/timesheet-mobile.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Timesheet Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('should display card view on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'gebruiker@ckw.nl');
    await page.fill('[name="password"]', 'Gebruiker123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');
    await page.click('text=Tijdregistratie');

    // Should show card view, not table
    await expect(page.locator('.block.md\\:hidden')).toBeVisible();
    await expect(page.locator('.hidden.md\\:block')).not.toBeVisible();
  });

  test('should allow GPS capture', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await page.goto('/timesheet');

    await page.click('text=Nieuwe registratie');
    await page.click('text=Startlocatie vastleggen');

    // Should show GPS coordinates
    await expect(page.locator('text=/Startlocatie: .*/')).toBeVisible();
  });

  test('touch targets should be 44px minimum', async ({ page }) => {
    await page.goto('/timesheet');
    await page.click('text=Nieuwe registratie');

    const gpsButton = page.locator('button:has-text("Startlocatie vastleggen")');
    const box = await gpsButton.boundingBox();

    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
```

### Performance Testing

**Targets:**
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.0s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Largest Contentful Paint < 2.5s

**Tools:**
- Lighthouse CI
- WebPageTest
- Chrome DevTools Performance

---

## 📈 ROLLOUT STRATEGY

### Phase 1: Internal Testing (Week 1-2)
- Deploy to staging environment
- Internal team testing (5-10 users)
- Bug fixes and iterations

### Phase 2: Beta Testing (Week 3)
- Select 20-30 beta users
- Gather feedback via Google Forms
- Monitor error logs (Sentry)
- Performance monitoring (Vercel Analytics)

### Phase 3: Gradual Rollout (Week 4)
- 25% of users
- Monitor metrics daily
- 50% of users (if stable)
- 100% rollout

### Phase 4: Post-Launch (Week 5+)
- Collect user feedback
- Address issues
- Plan next iteration

---

## 🎯 SUCCESS METRICS

### User Satisfaction
- Target: 90% positive feedback
- Measure: In-app survey after 1 week

### Performance
- Mobile load time < 2s (target: 80% of users)
- Zero layout shifts (CLS = 0)

### Adoption
- 70% of users use mobile within first month
- Quick Clock In usage: 50% of all timesheets

### Efficiency
- Time to register hours: < 30s (was 2-3 minutes)
- Manager approval time: -60% with bulk actions

---

## 🛠️ DEPENDENCIES

### NPM Packages
```json
{
  "dependencies": {
    "date-fns": "^2.30.0",
    "pdfkit": "^0.13.0",
    "exceljs": "^4.3.0",
    "@vercel/blob": "^0.15.0",
    "idb": "^7.1.1"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.5.0"
  }
}
```

### External Services
- Vercel Blob Storage (voor foto uploads)
- Sentry (error tracking)
- Vercel Analytics (performance monitoring)

---

## 📞 SUPPORT & MAINTENANCE

### Documentation
- [ ] Component Storybook
- [ ] API documentation
- [ ] User manual (Nederlands)
- [ ] Admin guide

### Training
- [ ] Video tutorials voor medewerkers
- [ ] Manager training sessie
- [ ] Admin dashboard walkthrough

### Monitoring
- Error tracking: Sentry
- Performance: Vercel Analytics
- User behavior: Google Analytics 4

---

## ✅ DEFINITION OF DONE

Elk feature is "done" wanneer:
- [ ] Code is geschreven en getest
- [ ] Unit tests >= 80% coverage
- [ ] E2E tests passeren
- [ ] Mobile testing compleet (iOS + Android)
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] Product owner approval

---

## 🚀 NEXT STEPS

**Immediate (Nu):**
1. Fix sessie probleem - gebruiker moet cookies wissen
2. Setup feature branch `feature/mobile-improvements`
3. Begin met Sprint 1.2 (GPS knoppen)

**Deze Week:**
4. Complete Fase 1 (GPS + Timesheet cards)
5. Test op echte mobiele devices
6. Demo aan stakeholders

**Volgende Week:**
7. Start Fase 2 (Verlof/Ziekmelding cards)
8. Begin Dashboard widgets

Klaar om te beginnen? 🎯
