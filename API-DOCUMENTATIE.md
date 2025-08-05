# CKW Personeelsapp - API Documentatie

## 🎉 STATUS: VOLLEDIG OPERATIONEEL (Januari 2025)

**🚀 ALLE API ENDPOINTS ZIJN VOLLEDIG FUNCTIONEEL!**

### ✅ Beschikbare API's
- **Authenticatie API**: NextAuth v5 met sessie-beheer
- **Tijdregistratie API**: Uren invoer en beheer
- **Goedkeuringen API**: Approval workflows (WERKEND)
- **Verlofbeheer API**: Vakantie en ziekteverlof
- **Werknemers API**: Personeel beheer
- **Profiel API**: Gebruikersinstellingen
- **Instellingen API**: Systeem configuratie
- **Notificaties API**: Real-time meldingen

## Inhoudsopgave

1. [Introductie](#introductie)
2. [Authenticatie](#authenticatie)
3. [API Endpoints](#api-endpoints)
   - [Tijdregistratie API](#tijdregistratie-api)
   - [Goedkeuringen API](#goedkeuringen-api)
   - [Verlofbeheer API](#verlofbeheer-api)
   - [Documentbeheer API](#documentbeheer-api)
   - [Compliance API](#compliance-api)
   - [Audit API](#audit-api)
4. [Foutafhandeling](#foutafhandeling)
5. [Limieten en throttling](#limieten-en-throttling)
6. [Voorbeelden](#voorbeelden)
7. [Changelog](#changelog)

## Introductie

De CKW Personeelsapp API biedt volledige toegang tot alle HR-managementsysteem functionaliteiten. Alle endpoints zijn operationeel en beveiligd met NextAuth v5 authenticatie en rolgebaseerde toegangscontrole (RBAC).

### Basis URL

```
https://[uw-domein]/api
```

### Formaat

Alle API-verzoeken en -antwoorden gebruiken het JSON-formaat. Zorg ervoor dat u de juiste headers instelt:

```
Content-Type: application/json
Accept: application/json
```

## Authenticatie

De API gebruikt NextAuth.js voor authenticatie. Er zijn twee methoden om te authenticeren:

### 1. Session-based (voor webapplicaties)

Voor webapplicaties die al een sessie hebben via de frontend, worden API-verzoeken automatisch geauthenticeerd via de sessiekoekje.

### 2. API Key (voor externe systemen)

Voor externe systemen is een API-sleutel vereist. Deze moet worden opgenomen in de Authorization header:

```
Authorization: Bearer [API_KEY]
```

API-sleutels kunnen worden aangemaakt en beheerd in het beheerdersdashboard onder "API-toegang".

## API Endpoints

### Tijdregistratie API

#### Tijdregistraties ophalen

```
GET /api/timesheets
```

Query parameters:
- `page`: Paginanummer (default: 1)
- `limit`: Aantal items per pagina (default: 10, max: 50)
- `employeeId`: Filter op werknemer ID
- `startDate`: Filter op startdatum (YYYY-MM-DD)
- `endDate`: Filter op einddatum (YYYY-MM-DD)
- `status`: Filter op status (pending, approved, rejected)

Voorbeeld response:

```json
{
  "items": [
    {
      "id": "ts-123456",
      "type": "timesheet",
      "employeeId": "emp-789",
      "employeeName": "Jan Jansen",
      "date": "2025-07-15",
      "startTime": "08:00",
      "endTime": "17:00",
      "breakDuration": 30,
      "description": "Projectwerkzaamheden",
      "locationVerified": true,
      "startLocation": "Kantoor Utrecht",
      "endLocation": "Kantoor Utrecht",
      "submittedAt": "2025-07-15T17:05:00Z",
      "status": "pending",
      "validationWarnings": [],
      "validationErrors": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

#### Tijdregistratie toevoegen

```
POST /api/timesheets
```

Request body:

```json
{
  "employeeId": "emp-789",
  "date": "2025-07-15",
  "startTime": "08:00",
  "endTime": "17:00",
  "breakDuration": 30,
  "description": "Projectwerkzaamheden",
  "startLocation": "Kantoor Utrecht",
  "endLocation": "Kantoor Utrecht"
}
```

#### Tijdregistratie details ophalen

```
GET /api/timesheets/{id}
```

#### Tijdregistratie bijwerken

```
PUT /api/timesheets/{id}
```

#### Tijdregistratie verwijderen

```
DELETE /api/timesheets/{id}
```

### Goedkeuringen API

#### Goedkeuringen ophalen

```
GET /api/approvals
```

Query parameters:
- `page`: Paginanummer (default: 1)
- `limit`: Aantal items per pagina (default: 10, max: 50)
- `type`: Filter op type (timesheet, vacation, sickleave)
- `status`: Filter op status (pending, approved, rejected)

#### Goedkeuring actie uitvoeren

```
POST /api/approvals/action
```

Request body:

```json
{
  "ids": ["ts-123456", "ts-123457"],
  "action": "approve",
  "comment": "Alles in orde"
}
```

### Verlofbeheer API

#### Verlofaanvragen ophalen

```
GET /api/leave
```

Query parameters:
- `page`: Paginanummer (default: 1)
- `limit`: Aantal items per pagina (default: 10, max: 50)
- `employeeId`: Filter op werknemer ID
- `type`: Filter op type (vacation, sick-leave, tijd-voor-tijd)
- `status`: Filter op status (pending, approved, rejected)
- `startDate`: Filter op startdatum (YYYY-MM-DD)
- `endDate`: Filter op einddatum (YYYY-MM-DD)

#### Verlofaanvraag toevoegen

```
POST /api/leave
```

Request body voor vakantie:

```json
{
  "type": "vacation",
  "employeeId": "emp-789",
  "startDate": "2025-08-01",
  "endDate": "2025-08-15",
  "description": "Zomervakantie",
  "vacationType": "regular"
}
```

Request body voor ziekteverlof:

```json
{
  "type": "sick-leave",
  "employeeId": "emp-789",
  "startDate": "2025-07-20",
  "endDate": null,
  "reason": "Griep",
  "medicalNote": false,
  "uwvReported": false
}
```

#### Verlofbalans ophalen

```
GET /api/leave/balance/{employeeId}
```

Voorbeeld response:

```json
{
  "employeeId": "emp-789",
  "year": 2025,
  "regularLeave": {
    "entitled": 25,
    "used": 10,
    "planned": 5,
    "remaining": 10
  },
  "tijdVoorTijd": {
    "balance": 16.5,
    "used": 8,
    "planned": 0,
    "remaining": 8.5
  },
  "specialLeave": {
    "used": 2
  },
  "sickLeave": {
    "daysThisYear": 5,
    "frequency": 2
  }
}
```

### Documentbeheer API

#### Documenten ophalen

```
GET /api/documents
```

Query parameters:
- `page`: Paginanummer (default: 1)
- `limit`: Aantal items per pagina (default: 10, max: 50)
- `employeeId`: Filter op werknemer ID
- `type`: Filter op documenttype
- `tags`: Filter op tags (komma-gescheiden)

#### Document uploaden

```
POST /api/documents
```

Dit is een multipart/form-data verzoek met de volgende velden:
- `file`: Het bestandsinhoud
- `metadata`: JSON string met metadata:
  ```json
  {
    "employeeId": "emp-789",
    "title": "Arbeidscontract",
    "description": "Arbeidscontract Jan Jansen",
    "type": "contract",
    "tags": ["contract", "personeel"],
    "accessRoles": ["hr", "management"]
  }
  ```

#### Document download URL genereren

```
GET /api/documents/{id}/download
```

Genereert een tijdelijke, beveiligde URL om het document te downloaden.

#### Documentversies ophalen

```
GET /api/documents/{id}/versions
```

#### Interne opmerkingen ophalen

```
GET /api/documents/{id}/comments
```

#### Interne opmerking toevoegen

```
POST /api/documents/{id}/comments
```

Request body:

```json
{
  "content": "Dit contract moet worden vernieuwd voor het einde van het jaar.",
  "isConfidential": true
}
```

### Compliance API

#### Arbeidstijdenwet check uitvoeren

```
POST /api/compliance/working-time/check
```

Request body:

```json
{
  "employeeId": "emp-789",
  "startDate": "2025-07-01",
  "endDate": "2025-07-31"
}
```

Voorbeeld response:

```json
{
  "employeeId": "emp-789",
  "period": {
    "start": "2025-07-01",
    "end": "2025-07-31"
  },
  "compliant": false,
  "violations": [
    {
      "rule": "daily_rest_period",
      "description": "Onvoldoende rusttijd tussen werkdagen",
      "occurrences": [
        {
          "date": "2025-07-15",
          "details": "Slechts 9 uur rust tussen diensten (minimum is 11 uur)"
        }
      ]
    }
  ],
  "warnings": [
    {
      "rule": "weekly_working_hours",
      "description": "Bijna overschrijding maximale werkuren per week",
      "details": "48 uur gewerkt in week 28 (maximum is 60 uur)"
    }
  ]
}
```

#### AVG/GDPR verzoek indienen

```
POST /api/compliance/gdpr/request
```

Request body:

```json
{
  "type": "data_access",
  "employeeId": "emp-789",
  "requestDetails": "Verzoek tot inzage van alle persoonlijke gegevens"
}
```

### Audit API

#### Audit log toevoegen

```
POST /api/audit/log
```

Request body:

```json
{
  "userId": "user-123",
  "userName": "Jan Jansen",
  "action": "document_viewed",
  "category": "data_access",
  "details": {
    "documentId": "doc-456",
    "documentType": "contract"
  }
}
```

#### Audit logs ophalen

```
GET /api/audit/logs
```

Query parameters:
- `page`: Paginanummer (default: 1)
- `limit`: Aantal items per pagina (default: 10, max: 100)
- `userId`: Filter op gebruiker ID
- `category`: Filter op categorie
- `action`: Filter op actie
- `startDate`: Filter op startdatum (YYYY-MM-DD)
- `endDate`: Filter op einddatum (YYYY-MM-DD)

## Foutafhandeling

De API gebruikt standaard HTTP-statuscodes om de status van een verzoek aan te geven:

- `200 OK`: Verzoek succesvol
- `201 Created`: Resource succesvol aangemaakt
- `400 Bad Request`: Ongeldige parameters of request body
- `401 Unauthorized`: Authenticatie vereist of mislukt
- `403 Forbidden`: Geen toegang tot de gevraagde resource
- `404 Not Found`: Resource niet gevonden
- `422 Unprocessable Entity`: Validatiefout
- `429 Too Many Requests`: Rate limit overschreden
- `500 Internal Server Error`: Serverfout

Foutresponses hebben de volgende structuur:

```json
{
  "error": "Korte foutbeschrijving",
  "message": "Gedetailleerde foutmelding",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specifieke veld met fout",
    "reason": "Reden voor de fout"
  }
}
```

## Limieten en throttling

Om de stabiliteit van het systeem te waarborgen, zijn er limieten ingesteld:

- Maximaal 100 verzoeken per minuut per API-sleutel
- Maximaal 50 items per pagina bij paginering
- Maximale bestandsgrootte voor uploads: 10 MB

Bij overschrijding van deze limieten ontvangt u een `429 Too Many Requests` response met informatie over wanneer u opnieuw kunt proberen.

## Voorbeelden

### Tijdregistraties ophalen met JavaScript fetch

```javascript
async function getTimesheets() {
  const response = await fetch('https://uw-domein.nl/api/timesheets?page=1&limit=10', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(data);
}
```

### Verlofaanvraag indienen met Python requests

```python
import requests
import json

url = "https://uw-domein.nl/api/leave"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
}
payload = {
    "type": "vacation",
    "employeeId": "emp-789",
    "startDate": "2025-08-01",
    "endDate": "2025-08-15",
    "description": "Zomervakantie",
    "vacationType": "regular"
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
print(response.status_code)
print(response.json())
```

## Changelog

### v1.0.0 (2025-07-18)
- Initiële release van de API

### v0.9.0 (2025-06-30)
- Beta release met core functionaliteit
- Tijdregistratie API
- Goedkeuringen API
- Verlofbeheer API

### v0.8.0 (2025-06-15)
- Alpha release voor interne testing
- Basis authenticatie
- Eerste versie van tijdregistratie endpoints
