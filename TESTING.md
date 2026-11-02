# EV Hub – Testing Strategy & Quality Assurance Guide

This guide details the test architecture, automated integration test suite, concurrency simulation procedures, and manual QA acceptance matrix for **EV HUB**.

---

## 1. Test Architecture Overview

EV Hub utilizes a multi-layered testing strategy combining:
- **Automated Integration Tests**: Validating REST APIs, authentication security, role-based authorization, geospatial indexing, and business logic.
- **Concurrency & Race Condition Tests**: Simulating simultaneous driver requests attempting to lock identical charger slots.
- **End-to-End Manual Acceptance Tests**: Verifying browser interactions across Driver, Host, and Administrator dashboards.

```text
       ┌──────────────────────────────┐
       │   Manual Acceptance Tests    │  Role journeys, Map interactions,
       │   (3 Portals: Admin/Host/User│  QR scanner, Razorpay modal
       └──────────────┬───────────────┘
                      │
       ┌──────────────┴───────────────┐
       │  Concurrency & Stress Tests  │  Atomic 5-min holds, Promise.all,
       │  (Double-booking prevention) │  Overlapping time slots
       └──────────────┬───────────────┘
                      │
       ┌──────────────┴───────────────┐
       │  Automated Integration Tests │  10 Core API suites, Supertest,
       │  (Node.js native test runner)│  In-memory Mongo, JWT auth
       └──────────────────────────────┘
```

---

## 2. Automated Test Suite Execution

The automated test suite runs via the native Node.js test runner (`node:test`) paired with `supertest` and an in-memory MongoDB instance. No external database or network connection is required.

### Command Execution
```bash
# Run tests from project root:
npm test

# Or directly from backend:
cd backend
npm test
```

### Automated Test Coverage Breakdown (`backend/tests/api.test.js`)

| Test # | Suite / Scenario | Expected Result | Verified In Code |
| :---: | :--- | :--- | :---: |
| **1** | `POST /auth/register/user` – EV Driver Registration | `201 Created`, JWT token generated, vehicle specs stored | ✅ Passed |
| **2** | `POST /auth/register/owner` – Host Registration | `201 Created`, host profile initialized with `PENDING` KYC status | ✅ Passed |
| **3** | `POST /auth/login` – Common Auth & Role Issuance | `200 OK`, verified correct role (`ADMIN`, `OWNER`, `USER`) returned | ✅ Passed |
| **4** | RBAC Guard Enforcement | `403 Forbidden` when driver attempts to access `/api/v1/admin/*` | ✅ Passed |
| **5** | Geospatial Search (`GET /stations?lat=...&lng=...&radius=10`) | `200 OK`, station results sorted by physical distance using 2dsphere | ✅ Passed |
| **6** | Host Subscription Rule Enforcement | Unsubscribed or pending host stations return `isVisibleOnMap: false` | ✅ Passed |
| **7** | Atomic 5-Minute Slot Hold (`POST /bookings/hold`) | `201 Created`, hold expires in `now + 5 minutes`, order ID returned | ✅ Passed |
| **8** | Concurrency Guard: Double-Booking Overlap | `409 Conflict`, second simultaneous hold rejected for overlapping time | ✅ Passed |
| **9** | Self-Booking Guard | `400 Bad Request`, host blocked from booking their own station | ✅ Passed |
| **10** | QR Code Check-in Verification | `200 OK`, valid cryptographic signature advances status to in-progress | ✅ Passed |

---

## 3. Concurrency & Race-Condition Testing

To verify that two drivers cannot book the same charger at the same time, the test suite executes an atomic race condition test:

```javascript
test('Concurrency Guard: Prevent double-booking overlapping slot', async () => {
  // Driver A holds slot 14:00 - 15:00
  const holdA = await request(app)
    .post('/api/v1/bookings/hold')
    .set('Authorization', `Bearer ${driverToken}`)
    .send({
      stationId: testStationId,
      startTime: '2026-11-03T14:00:00.000Z',
      endTime: '2026-11-03T15:00:00.000Z'
    });
  assert.strictEqual(holdA.status, 201);

  // Driver B attempts to hold overlapping slot 14:30 - 15:30 on same single-port charger
  const holdB = await request(app)
    .post('/api/v1/bookings/hold')
    .set('Authorization', `Bearer ${anotherDriverToken}`)
    .send({
      stationId: testStationId,
      startTime: '2026-11-03T14:30:00.000Z',
      endTime: '2026-11-03T15:30:00.000Z'
    });

  // Must reject Driver B with 409 Conflict
  assert.strictEqual(holdB.status, 409);
  assert.strictEqual(holdB.body.success, false);
});
```

---

## 4. Manual QA Acceptance Checklist

Execute this checklist across each role in the application (`http://localhost:5173`):

### 4.1 EV Driver Role QA
- [ ] **Landing Page Navigation**:
  - Visit `http://localhost:5173/`. Verify dark theme, hero statistics, charging illustrations, testimonials, and FAQs render cleanly.
- [ ] **Interactive Station Discovery**:
  - Click **Explore Stations**.
  - Verify MapLibre dark vector map loads smoothly.
  - Test radius slider (5 km – 50 km).
  - Filter by connector type (`CCS Type 2`, `Type 2 AC`).
  - Click a station map pin; verify sidebar pops up with live availability badge, charging speed, and pricing.
- [ ] **Slot Reservation & Concurrency Hold**:
  - Click **Book Slot**.
  - Select date and time slot.
  - Apply coupon code `EVHUB10` (verify 10% discount updates in cost breakdown).
  - Click **Confirm & Pay**.
  - Verify 5-minute countdown timer begins ticking (`04:59`, `04:58`...).
- [ ] **Payment Simulation & Address Unlock**:
  - Click **Complete Payment (Test Sandbox)**.
  - Verify modal transitions to success state.
  - Verify QR Code is rendered with download button.
  - Verify full street address and host phone number are revealed.
- [ ] **My Bookings & Review**:
  - Go to **My Bookings**. Verify new booking appears under **Active/Upcoming**.
  - Click **Complete Session (Demo)** and submit a 5-star rating with review comment.

### 4.2 Charging Point Host Role QA
- [ ] **Host Registration & Login**:
  - Login as `host1@evhub.com` / `HostPassword@123`.
  - Verify redirection to `/owner/overview`.
- [ ] **Station Registration with GPS Map Pin**:
  - Go to **Register Station**.
  - Click on the interactive map picker to drag and drop the location pin. Verify latitude and longitude update dynamically.
  - Fill specifications: Brand ("ABB"), Model ("Terra 54"), Connector ("CCS Type 2"), Capacity ("50 kW"), Price (₹18/kWh).
  - Upload sample station photo.
  - Click **Submit for Approval**.
- [ ] **Availability Calendar**:
  - Go to **Availability Calendar**.
  - Block specific time slots or holidays.
  - Adjust buffer time between bookings (15 minutes).
- [ ] **Check-In Verification**:
  - In **Bookings**, click **Verify Driver Check-In**.
  - Input check-in code or scan QR code.
  - Verify session state transitions to `CHARGING_IN_PROGRESS`.
- [ ] **Earnings & Subscription**:
  - Go to **Earnings**. Verify gross earnings, platform commission deductions, and pending settlement balances.
  - Go to **Subscription Plans**. Upgrade plan to **Pro Host** via test payment.

### 4.3 Administrator Role QA
- [ ] **Admin Login & Overview**:
  - Login as `admin@evhub.com` / `AdminPassword@123`.
  - Verify global GMV card, user count, active stations, and revenue charts render.
- [ ] **User & Host Moderation**:
  - Go to **Owners Queue**. View pending KYC applications. Click **Approve**.
  - Go to **Stations Queue**. Review submitted station coordinates and photos. Click **Approve**.
  - Verify newly approved station now appears on the public driver map.
- [ ] **Financials & Settlements**:
  - Go to **Financials**.
  - View host earnings and pending payouts.
  - Click **Trigger Settlement** for a host with pending balance. Verify status transitions to `COMPLETED`.
- [ ] **CSV Reports Export**:
  - Go to **Reports**.
  - Click **Export Bookings CSV**. Verify `.csv` file downloads with headers (`Booking ID, Station, User, Amount, Status, Created At`).
  - Click **Export Transactions CSV**. Verify transaction ledger downloads.
- [ ] **Audit Trail**:
  - Go to **Audit Logs**.
  - Verify every host approval, station approval, and settlement trigger is logged with timestamp, administrator ID, and IP address.
- [ ] **Platform Settings**:
  - Go to **Settings**.
  - Update platform commission rate from `10%` to `12%`.
  - Click **Save Changes**. Verify toast notification and persistent configuration.

---

## 5. Automated Build & Compilation Verification

Before deploying to production, run frontend and backend build validations:

```bash
# 1. Verify Frontend Production Build
npm run build --prefix frontend

# Output must succeed with 0 errors:
# ✓ built in ~7.9s
# dist/index.html
# dist/assets/index-xxxx.js
# dist/assets/index-xxxx.css

# 2. Verify Backend Syntax & ES Modules
node --check backend/src/server.js
```

