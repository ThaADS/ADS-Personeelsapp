# ADSPersoneelapp - Complete User Guide

> Version 3.1 | January 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Dashboard](#3-dashboard)
4. [Time Registration](#4-time-registration)
5. [Leave Management](#5-leave-management)
6. [Sick Leave](#6-sick-leave)
7. [Expense Management](#7-expense-management)
8. [Fleet Tracking](#8-fleet-tracking)
9. [Employee Management](#9-employee-management)
10. [Approvals](#10-approvals)
11. [Reports & Export](#11-reports--export)
12. [Settings](#12-settings)
13. [Frequently Asked Questions](#13-frequently-asked-questions)

---

## 1. Introduction

### What is ADSPersoneelapp?

ADSPersoneelapp is a comprehensive HR management platform specifically designed for organizations. The system helps you with:

- **Time Registration** - Track working hours with GPS verification
- **Leave Management** - Request and manage vacation and time off
- **Sick Leave** - Record absences with UWV compliance (Dutch social security)
- **Expense Management** - Submit expenses and mileage reimbursements
- **Fleet Tracking** - Automatically log business trips
- **Nmbrs Export** - Seamless payroll processing integration

### Who is this guide for?

This guide is intended for all ADSPersoneelapp users:

| Role | Description |
|------|-------------|
| **Employee** | Can manage own hours, leave, and expenses |
| **Manager** | Can manage team and grant approvals |
| **Tenant Admin** | Full organization management and settings |
| **Superuser** | Platform-wide management (administrators only) |

---

## 2. Getting Started

### 2.1 Logging In

1. Navigate to the application URL (e.g., `app.adspersoneelapp.nl`)
2. Enter your **email address**
3. Enter your **password**
4. Click **Sign In**

> **Tip**: Forgot your password? Click "Forgot Password" to receive a reset link via email.

### 2.2 First-Time Login

On your first login:

1. You will receive a welcome email with login credentials
2. Log in with the temporary password
3. Change your password to a personal one
4. Verify your profile information

### 2.3 Language Settings

ADSPersoneelapp supports multiple languages:

- NL Dutch (default)
- GB English
- DE Deutsch
- PL Polski

**To change language:**
1. Go to **Profile** (top right)
2. Select your preferred language
3. The interface updates immediately

### 2.4 Navigation

The main navigation is located on the left side:

```
+---------------------+
| Dashboard           |
| Time Registration   |
| Leave               |
| Sick Leave          |
| Expenses            |
| Trips               |
| Employees           |  <-- Manager+ only
| Approvals           |  <-- Manager+ only
| Settings            |
+---------------------+
```

---

## 3. Dashboard

The dashboard provides an immediate overview of your most important information.

### 3.1 Personal KPIs

| KPI | Description |
|-----|-------------|
| **Hours This Month** | Total hours worked in the current month |
| **Overtime** | Hours above your contract hours |
| **Leave Remaining** | Available vacation days |
| **Pending Items** | Requests awaiting processing |

### 3.2 Quick Clock-In Widget

Quickly clock in and out:

1. Click the large **Clock In** button
2. Allow location access (for GPS verification)
3. Your work time starts counting
4. Click **Clock Out** when you are finished

### 3.3 Leave Balance Widget

Shows your current leave balance:

- **Statutory Leave** - Your standard vacation days
- **Extra-Statutory Leave** - Additional days above the minimum
- **Compensation Hours** - Time-for-time accrual

### 3.4 Manager Dashboard (Additional Features)

As a manager, you will also see:

- **Team Overview** - Number of team members and their status
- **Pending Approvals** - Outstanding approval requests
- **Team Absence** - Current sick leave status
- **UWV Alerts** - Critical deadlines for sick employees

---

## 4. Time Registration

### 4.1 Overview

The time registration module allows you to accurately track your working hours.

### 4.2 Clocking In

**Method 1: Quick Clock-In (Dashboard)**
1. Go to the Dashboard
2. Click **Clock In**
3. Your location is automatically recorded

**Method 2: Manual Entry**
1. Go to **Time Registration**
2. Click **+ New Entry**
3. Fill in the details:
   - Date
   - Start time
   - End time
   - Break (in minutes)
   - Description (optional)
4. Click **Save**

### 4.3 Clocking Out

1. Go to the Dashboard or Time Registration
2. Click **Clock Out**
3. Your end time and location are recorded
4. Total working hours are automatically calculated

### 4.4 Viewing Time Entries

1. Go to **Time Registration**
2. Use the filters:
   - **Date range** - Select period
   - **Status** - Pending/Approved/Rejected
3. View your entries in the list

### 4.5 Editing Time Entries

1. Click on an entry in the list
2. Click **Edit**
3. Adjust the details
4. Click **Save**

> **Note**: Approved entries cannot be edited. Contact your manager for corrections.

### 4.6 GPS Verification

When clocking in and out, your location is recorded:

- **Exact Address** - Automatically determined via GPS
- **Coordinates** - Latitude/Longitude for verification
- **Verification** - Manager can check location

### 4.7 Status Workflow

```
+----------+     +----------+     +----------+
| PENDING  | --> | APPROVED |  or | REJECTED |
+----------+     +----------+     +----------+
     |                                  |
     +--- Reviewed by manager ----------+
```

---

## 5. Leave Management

### 5.1 Leave Types

| Type | Description | Default |
|------|-------------|---------|
| **Statutory Leave** | Vacation days per collective agreement | 20 days/year |
| **Extra-Statutory Leave** | Additional days above minimum | 5 days/year |
| **Compensation Hours** | Time-for-time (TOIL) | Variable |
| **Special Leave** | Wedding, bereavement, etc. | Per situation |
| **Unpaid Leave** | Leave without salary | On request |

### 5.2 Viewing Leave Balance

1. Go to **Leave**
2. View your balance at the top of the page:
   - Total available
   - Taken this year
   - Remaining
   - Expiry date

### 5.3 Requesting Leave

1. Go to **Leave**
2. Click **+ New Request**
3. Fill in the details:
   - **Leave Type** - Select the type
   - **Start Date** - First day of leave
   - **End Date** - Last day of leave
   - **Reason** (optional) - Explanation
4. Click **Submit**

### 5.4 Request Status

| Status | Meaning |
|--------|---------|
| **Pending** | Awaiting approval |
| **Approved** | Approved by manager |
| **Rejected** | Declined (see reason) |

### 5.5 Canceling a Request

1. Go to **Leave**
2. Find your request in the list
3. Click **Cancel** (only for pending status)
4. Confirm the cancellation

### 5.6 Leave Overview (Calendar)

1. Go to **Leave**
2. Switch to **Calendar View**
3. View your leave and that of teammates
4. Click on a day for details

### 5.7 Leave Expiration

Pay attention to the expiry dates of your leave:

- **Statutory Leave** - Expires on July 1st of the following year
- **Extra-Statutory Leave** - Expires after 5 years
- **Compensation Hours** - Expires at the end of the calendar year

> **Tip**: You will receive automatic reminders when leave is about to expire.

---

## 6. Sick Leave

### 6.1 Reporting Sick

1. Go to **Sick Leave**
2. Click **+ Report Sick**
3. Fill in the details:
   - **Start Date** - First day of illness
   - **Expected Duration** (optional)
   - **Notes** (optional)
4. Click **Submit**

> **Note**: Report as soon as possible, preferably before your work start time.

### 6.2 Reporting Recovery

1. Go to **Sick Leave**
2. Find your active sick leave entry
3. Click **Report Recovered**
4. Enter the recovery date
5. Click **Confirm**

### 6.3 Partial Return to Work

For partial recovery:

1. Click **Partial Recovery**
2. Enter the recovery percentage (e.g., 50%)
3. Describe any limitations
4. Click **Save**

### 6.4 UWV Poortwachter Compliance

ADSPersoneelapp automatically monitors legal deadlines:

| Day | Action |
|-----|--------|
| **Day 0** | Sick leave registered |
| **Day 35** | Warning: UWV deadline approaching |
| **Day 39** | Urgent: 3 days until deadline |
| **Day 41** | Critical: 1 day until deadline |
| **Day 42** | UWV notification required |

> **About UWV Poortwachter**: Under Dutch law, employers must report employees to the UWV (Employee Insurance Agency) after 42 days of continuous illness. This process is part of the "Wet Verbetering Poortwachter" (Gatekeeper Improvement Act), which aims to reduce long-term disability and promote return to work.

### 6.5 Alerts and Notifications

You will automatically receive notifications about:

- Approaching UWV deadlines
- Required documents
- Appointments with company doctor
- Plan of Action deadlines

---

## 7. Expense Management

### 7.1 Overview

The expense system supports various expense types with a complete workflow.

### 7.2 Expense Types

| Type | Description | Reimbursement |
|------|-------------|---------------|
| **Mileage** | Business trips | EUR 0.23/km |
| **Travel Costs** | Public transport, taxi, parking | Actual cost |
| **Meals** | Business lunch/dinner | Max EUR 50/day |
| **Accommodation** | Hotel, lodging | Max EUR 150/night |
| **Other** | Other business expenses | On approval |

### 7.3 Submitting Mileage Claims

1. Go to **Expenses**
2. Click **+ New Expense**
3. Select **Mileage**
4. Fill in:
   - **Date** - Trip date
   - **From** - Start location
   - **To** - End location
   - **Distance** - Kilometers (or auto-calculated)
   - **Purpose** - Reason for the trip
5. Upload parking receipt if applicable
6. Click **Submit**

> **Tip**: With Fleet Tracking, trips are automatically suggested!

### 7.4 Submitting Expenses

1. Go to **Expenses**
2. Click **+ New Expense**
3. Select the expense type
4. Fill in:
   - **Date** - Purchase date
   - **Amount** - Total amount
   - **Description** - What was purchased
   - **Receipt** - Upload photo/PDF of receipt
5. Click **Submit**

### 7.5 Uploading Receipts

Supported formats:
- **Images**: JPG, PNG (max 5MB)
- **Documents**: PDF (max 5MB)

Tips for good receipts:
- Ensure good lighting
- All text must be legible
- Date and amount must be visible

### 7.6 Expense Status

| Status | Action |
|--------|--------|
| **Pending** | Awaiting review by manager |
| **Approved** | Approved, will be processed in salary |
| **Rejected** | Declined, see reason and resubmit if needed |

### 7.7 Export to Nmbrs

Approved expenses are exported monthly to Nmbrs for processing in payroll administration.

---

## 8. Fleet Tracking

### 8.1 What is Fleet Tracking?

Fleet Tracking automatically links your company vehicle trips to your time registration.

### 8.2 Supported Systems

- RouteVision
- FleetGO
- Samsara
- Webfleet
- TrackJack
- Verizon Connect

### 8.3 Viewing Trips

1. Go to **Trips**
2. Select the date range
3. View your trips with:
   - Start and end location
   - Distance in kilometers
   - Trip duration
   - Linked timesheet

### 8.4 Linking a Trip to Timesheet

1. Go to **Trips**
2. Find the desired trip
3. Click **Link**
4. Select the corresponding timesheet
5. The trip is automatically linked

### 8.5 Automatic Matching

The system automatically attempts to match trips to timesheets based on:
- Date and time
- Location (GPS comparison)
- Employee

### 8.6 Mileage Claims from Trips

1. Select one or more trips
2. Click **Claim**
3. Kilometers are automatically copied
4. Review and submit

---

## 9. Employee Management

> **Note**: This section is only available for Managers and above.

### 9.1 Employee Overview

1. Go to **Employees**
2. View the list with:
   - Name and position
   - Email address
   - Status (active/inactive)
   - Role

### 9.2 Adding an Employee

1. Click **+ New Employee**
2. Fill in the basic details:
   - Name
   - Email address
   - Position
   - Department
   - Role (User/Manager)
   - **Language Preference** (NL/EN/DE/PL)
3. Click **Create**
4. The employee receives a welcome email

### 9.3 Editing an Employee

1. Click on an employee
2. Click **Edit**
3. Adjust the details
4. Click **Save**

### 9.4 Deactivating an Employee

1. Click on an employee
2. Click **Deactivate**
3. Confirm the action
4. The employee can no longer log in

### 9.5 Assigning a Vehicle

For Fleet Tracking:
1. Open the employee profile
2. Go to **Vehicles**
3. Click **Assign Vehicle**
4. Select the vehicle
5. Click **Save**

---

## 10. Approvals

> **Note**: This section is only available for Managers and above.

### 10.1 Overview

The approvals screen shows all pending requests from your team.

### 10.2 Approval Types

| Type | Description |
|------|-------------|
| **Timesheets** | Time registrations |
| **Leave Requests** | Vacation and special leave |
| **Expenses** | Expenses and mileage claims |

### 10.3 Individual Approval

1. Go to **Approvals**
2. Click on an item
3. Review the details
4. Click **Approve** or **Reject**
5. Add a comment if needed
6. Confirm

### 10.4 Batch Approval

1. Go to **Approvals**
2. Check multiple items
3. Click **Approve All** or **Reject All**
4. Confirm the action

### 10.5 Rejection Reason

When rejecting:
1. Enter a clear reason
2. The employee receives a notification
3. The employee can resubmit if necessary

### 10.6 Reminders

You will receive automatic reminders for:
- Pending approvals older than 3 days
- Urgent items (e.g., upcoming leave)

---

## 11. Reports & Export

### 11.1 Available Reports

| Report | Content |
|--------|---------|
| **Hours Report** | Overview of worked hours |
| **Leave Report** | Taken and remaining leave |
| **Absence Report** | Sick leave overview |
| **Expense Report** | Submitted expenses |

### 11.2 Generating Reports

1. Go to the relevant module (e.g., Time Registration)
2. Set the desired filters
3. Click **Export**
4. Choose the format:
   - **PDF** - For printing/archiving
   - **Excel** - For further analysis
   - **CSV** - For import into other systems

### 11.3 Nmbrs Export

For payroll processing:
1. Go to **Settings** > **Nmbrs**
2. Select the period
3. Click **Generate Export**
4. Download the file
5. Import into Nmbrs

### 11.4 Monthly Summaries

Automatically generated reports:
- Monthly hours overview
- Quarterly leave overview
- Absence statistics

---

## 12. Settings

### 12.1 Profile

**Changing personal details:**
1. Click on your name (top right)
2. Click **Profile**
3. Edit your details:
   - Name
   - Email address
   - Phone number
   - Language preference
4. Click **Save**

### 12.2 Changing Password

1. Go to **Profile**
2. Click **Change Password**
3. Enter your current password
4. Enter the new password (twice)
5. Click **Save**

**Password requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

### 12.3 Notification Settings

1. Go to **Settings** > **Notifications**
2. Configure your preferences:
   - Email notifications on/off
   - In-app notifications on/off
   - Reminder frequency
3. Click **Save**

### 12.4 Tenant Settings (Admin)

As Tenant Admin:
1. Go to **Settings** > **Organization**
2. Configure:
   - Company name and logo
   - Standard working hours
   - Leave policy
   - Expense limits
   - Fleet provider connection

### 12.5 Configuring Fleet Provider (Admin)

1. Go to **Settings** > **Fleet Provider**
2. Select your provider
3. Enter the API credentials
4. Click **Test Connection**
5. On success, click **Save**

---

## 13. Frequently Asked Questions

### General

**Q: I forgot my password, what now?**
A: Click "Forgot Password" on the login page and follow the instructions in the email.

**Q: How do I change my language?**
A: Go to Profile and select your desired language under "Language Preference".

**Q: Does the app work on mobile?**
A: Yes, ADSPersoneelapp is fully responsive and works on all devices.

### Time Registration

**Q: Why is my location being requested?**
A: GPS verification ensures accurate and reliable time registration.

**Q: Can I enter hours retroactively?**
A: Yes, through manual entry you can also register previous days.

**Q: What if I forgot to clock out?**
A: You can edit the entry afterwards as long as it has not been approved.

### Leave

**Q: How much leave do I have left?**
A: View your current balance on the Leave page at the top.

**Q: When does my leave expire?**
A: Statutory leave expires on July 1st of the following year. You will receive timely reminders.

**Q: Can I modify a leave request?**
A: Only pending requests can be adjusted. Cancel and resubmit if needed.

### Sick Leave

**Q: How quickly should I report sick?**
A: Report as soon as possible, preferably before your work start time.

**Q: What is the UWV 42-day deadline?**
A: After 42 days of illness, your employer must register you with the UWV. The system monitors this automatically.

### Expenses

**Q: Which receipts should I upload?**
A: Always upload the original proof of purchase with date and amount visible.

**Q: What is the mileage rate?**
A: Standard EUR 0.23 per kilometer (tax-free in 2026).

**Q: When will my expense be paid?**
A: Approved expenses are processed in the next payroll run.

### Technical

**Q: Which browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (last 2 versions).

**Q: Is my data secure?**
A: Yes, all data is encrypted (AES-256) and complies with GDPR requirements.

---

## Need Help?

- **In-app support**: Use the FAQ chatbot at the bottom right
- **Email**: support@adspersoneelapp.nl
- **Phone**: Available for Standard plan customers

---

*Copyright 2026 ADSPersoneelapp - All rights reserved*
