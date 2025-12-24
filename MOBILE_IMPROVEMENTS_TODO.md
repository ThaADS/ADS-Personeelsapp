# Mobiele Verbeteringen - Nog Te Doen

## ⚠️ PRIORITY 1: Verlof & Ziekmelding Tabellen

### Verlof Pagina (`src/app/(dashboard)/vacation/page.tsx`)
**Probleem:** Brede tabel met 6 kolommen - horizontaal scrollen vereist op mobiel

**Oplossing:**
Zelfde aanpak als tijdregistratie:
- Card layout voor mobiel (`<768px`)
- Desktop tabel voor grotere schermen (`≥768px`)

**Mobiele card moet tonen:**
- Type verlof (Vakantie/Speciaal/Onbetaald)
- Datum range (van-tot)
- Aantal dagen in groot lettertype
- Status badge
- Omschrijving
- Details/Bewerken knoppen

### Ziekmelding Pagina (`src/app/(dashboard)/sick-leave/page.tsx`)
**Probleem:** Zelfde tabel probleem

**Oplossing:**
- Card layout voor mobiel
- Desktop tabel voor grotere schermen

**Mobiele card moet tonen:**
- Startdatum (en einddatum indien bekend)
- Aantal dagen (indien bekend)
- Status
- Reden (indien ingevuld)
- Details knop

---

## ⚠️ PRIORITY 2: Medewerkers Pagina

### Medewerkers Pagina (`src/app/(dashboard)/employees/page.tsx`)
**Probleem:** Zeer brede tabel met 6 kolommen + acties

**Oplossing:**
Card layout voor mobiel met:
- Naam + avatar/initialen
- Afdeling en functie
- Email en telefoon (klikbare links)
- Rol badge
- Startdatum
- Actieknoppen (Bekijken/Bewerken) voor managers

---

## 📱 PRIORITY 3: Ontbrekende Mobiele Functionaliteit

### Quick Actions
1. **Quick Clock In/Out Button**
   - Snelle "Clock In Now" knop op dashboard
   - 1-tap tijdregistratie met automatische GPS capture
   - Clock Out knop met berekende uren sinds Clock In

### Media Upload
2. **Foto bij Tijdregistratie**
   - Camera knop naast GPS knoppen
   - Direct foto maken van werkplek
   - Thumbnail preview in formulier
   - Opslaan in database

### Verlof Saldo Dashboard
3. **Vakantiedagen Overzicht**
   - Widget op dashboard: "Je hebt nog X dagen verlof"
   - Indicator: gebruikt / totaal beschikbaar
   - Direct link naar verlof aanvragen

### Filters & Zoeken
4. **Tijdregistratie Filters**
   - Datum range picker (deze week/maand/custom)
   - Status filter (alle/goedgekeurd/in behandeling/afgekeurd)
   - Zoeken op omschrijving

### Notificaties
5. **Push Notificaties** (toekomstige feature)
   - Manager keurt uren goed/af → medewerker krijgt notificatie
   - Nieuwe verlofaanvraag → manager krijgt notificatie
   - PWA met service worker voor push notifications

### Bulk Acties (Manager)
6. **Meerdere Tijdregistraties Goedkeuren**
   - Checkbox per tijdregistratie
   - "Alles goedkeuren" knop
   - Efficiency voor managers met veel medewerkers

### Export Functie
7. **PDF/Excel Export**
   - Tijdregistraties exporteren naar PDF
   - Excel export voor loonadministratie
   - Filter toepassen voor specifieke periode

### Offline Support
8. **Offline Mode** (toekomstige feature)
   - Service Worker implementeren
   - Tijdregistraties lokaal opslaan
   - Sync wanneer online
   - Indicator: "Je bent offline - 3 registraties wachten op sync"

---

## 🎨 UI/UX Verbeteringen

### Touch Targets
- ✅ GPS knoppen nu 44x44px+ (DONE)
- ❌ Alle andere knoppen controleren op minimum touch target
- ❌ Links in tabellen/cards minimaal 44px hoog maken

### Formulier Inputs
- Input fields hebben goede hoogte voor touch (lijkt goed)
- Date/time pickers zijn native mobile-friendly
- Textarea's hebben goede minimum hoogte

### Loading States
- Alle formulieren hebben al loading states met disabled buttons
- Skeleton loaders aanwezig in meerdere pagina's
- Goed!

### Error States
- Error messages aanwezig maar kunnen duidelijker
- Misschien toast notifications toevoegen voor betere UX

---

## 🔧 Technische Verbeteringen

### Performance
- Lazy loading voor tabellen/cards
- Virtualisatie voor zeer lange lijsten
- Image optimization voor avatar/foto's

### Accessibility
- ARIA labels toevoegen waar ontbrekend
- Keyboard navigation verbeteren
- Focus states duidelijk maken
- Screen reader support

### PWA Features
- Manifest.json aanmaken
- Service Worker voor offline support
- Install prompt voor "Add to Home Screen"
- App icons in verschillende formaten

---

## 📊 Dashboard Widgets (Ontbrekend)

Huidige dashboard heeft:
- ✅ Welkom header
- ✅ Statistieken cards (uren, goedgekeurd, wachtend, verlof)
- ✅ Snelle acties cards
- ✅ Recente activiteit placeholder

**Toevoegen:**
1. **Deze week samenvatting**
   - Gewerkte uren deze week
   - Geplande uren vs gewerkte uren
   - Progress bar visualisatie

2. **Aankomend verlof**
   - Lijst van goedgekeurde verlofaanvragen
   - Countdown naar volgende vakantie

3. **Pending acties**
   - Voor managers: aantal wachtende goedkeuringen
   - Voor medewerkers: aantal in behandeling zijnde aanvragen

4. **Verlof saldo**
   - Grote indicator met resterende dagen
   - Breakdown: vakantie/ATV/special leave

---

## 🔍 Testing Checklist

### Mobiele Browsers
- [ ] Chrome Android
- [ ] Safari iOS
- [ ] Firefox Mobile
- [ ] Samsung Internet

### Screen Sizes
- [ ] Small phones (320px)
- [ ] Medium phones (375px)
- [ ] Large phones (414px)
- [ ] Tablets (768px)

### Touch Interactions
- [ ] GPS buttons makkelijk te tikken
- [ ] Form inputs werken goed met touch keyboard
- [ ] Swipe gestures (indien geïmplementeerd)
- [ ] Pull to refresh (indien geïmplementeerd)

### Orientation
- [ ] Portrait mode (staand)
- [ ] Landscape mode (liggend)

---

## 🚀 Implementatie Volgorde

1. ✅ **Tijdregistratie mobiel** - DONE
2. **Verlof mobiel** - Card layout implementeren
3. **Ziekmelding mobiel** - Card layout implementeren
4. **Medewerkers mobiel** - Card layout implementeren
5. **Quick Clock In/Out** - Dashboard widget + functionaliteit
6. **Verlof saldo** - Dashboard widget
7. **Filters tijdregistratie** - Datum range + status filter
8. **Foto upload** - Camera integration
9. **Bulk goedkeuringen** - Manager efficiency tool
10. **Export functie** - PDF/Excel download

---

## 📝 Notes

- Alle card layouts volgen hetzelfde design pattern voor consistentie
- Responsive breakpoint: `md:` (768px) - mobiel vs desktop
- Touch target minimum: 44x44px (Apple HIG / Material Design standaard)
- GPS functionaliteit werkt al goed, alleen UI verbeterd
- Database schema ondersteunt al GPS coördinaten, foto's kunnen toegevoegd worden
