# ADSPersoneelapp Documentation

> Complete documentation for ADSPersoneelapp HR Management Platform

## Available Languages

| Language | User Guide | FAQ |
|----------|------------|-----|
| 🇳🇱 **Nederlands** | [Gebruikershandleiding](nl/gebruikershandleiding.md) | [FAQ](nl/faq.md) |
| 🇬🇧 **English** | [User Guide](en/user-guide.md) | [FAQ](en/faq.md) |
| 🇩🇪 **Deutsch** | [Benutzerhandbuch](de/benutzerhandbuch.md) | [FAQ](de/faq.md) |
| 🇵🇱 **Polski** | [Podręcznik użytkownika](pl/podrecznik-uzytkownika.md) | [FAQ](pl/faq.md) |

## Documentation Structure

```
docs/
├── README.md                    # This file
├── nl/                          # Dutch documentation
│   ├── gebruikershandleiding.md # Complete user guide
│   └── faq.md                   # Frequently asked questions
├── en/                          # English documentation
│   ├── user-guide.md            # Complete user guide
│   └── faq.md                   # Frequently asked questions
├── de/                          # German documentation
│   ├── benutzerhandbuch.md      # Complete user guide
│   └── faq.md                   # Frequently asked questions
└── pl/                          # Polish documentation
    ├── podrecznik-uzytkownika.md # Complete user guide
    └── faq.md                    # Frequently asked questions
```

## Topics Covered

### Core Features
- **Dashboard** - KPIs, widgets, quick actions
- **Time Registration** - Clock in/out, GPS verification, manual entry
- **Leave Management** - Request, approve, balance tracking
- **Sick Leave** - UWV compliance, 42-day monitoring
- **Expense Management** - Mileage, receipts, approval workflow
- **Fleet Tracking** - Vehicle trips, automatic matching

### Management Features
- **Employee Management** - Add, edit, deactivate employees
- **Approvals** - Individual and batch approvals
- **Reports & Export** - PDF, Excel, Nmbrs integration

### System Features
- **Multi-language Support** - NL, EN, DE, PL
- **Profile Settings** - Password, preferences, notifications
- **Subscription Plans** - Freemium vs Standard features

## For Developers

### Integration with App

The documentation can be served directly from the app or linked:

```typescript
// Example: Link to documentation based on user locale
const getDocsUrl = (locale: string, page: string) => {
  const baseUrl = '/docs';
  const localeMap = {
    nl: 'nl/gebruikershandleiding.md',
    en: 'en/user-guide.md',
    de: 'de/benutzerhandbuch.md',
    pl: 'pl/podrecznik-uzytkownika.md',
  };
  return `${baseUrl}/${localeMap[locale] || localeMap.nl}`;
};
```

### Updating Documentation

1. Edit the relevant markdown file
2. Maintain consistency across all languages
3. Update version number if significant changes
4. Commit with descriptive message

## Version

- **Documentation Version**: 3.1
- **Last Updated**: January 2026
- **Application Version**: 3.1

---

*© 2026 ADSPersoneelapp - All rights reserved*
