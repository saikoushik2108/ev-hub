# EV Hub – Complete Full-Stack EV Charging Marketplace

> **"Charge Anywhere. Connect Everywhere."**

EV Hub is a production-style, location-based electric vehicle charging marketplace built on the **MERN** stack (MongoDB Atlas, Express.js, React.js, Node.js). The platform bridges the infrastructure gap by connecting EV drivers with homeowners and private commercial hosts who own residential EV charging points.

---

## 1. Executive Summary & Problem Statement

### The Problem
Public EV charging stations in high-density urban corridors frequently suffer from:
- Long physical queues and unpredictable wait times.
- Frequent out-of-order equipment with zero real-time telemetry.
- Range anxiety for drivers away from major highway corridors.
- Millions of private residential EV chargers sitting idle for 16–20 hours per day while their owners are away or sleeping.

### The Solution: EV Hub
EV Hub democratizes charging infrastructure through a decentralized peer-to-peer network:
- **For Hosts:** Residential charger owners list their private wallboxes, configure operating calendars, define per-kWh rates, and earn **90% net revenue** with automated bank payouts.
- **For Drivers:** EV users discover verified neighborhood chargers on an interactive MapLibre map, view transparent pricing, reserve slots with an atomic 5-minute concurrency hold, and unlock directions and QR check-in upon Razorpay payment.
- **Monetization:** EV Hub sustains platform operations through recurring host subscription plans (Basic ₹199/mo, Pro ₹399/mo, Business ₹799/mo) and an illustrative 10% marketplace commission.

---

## 2. Key Architecture & Features

### 🚀 Core Platform Modules
1. **Interactive Geospatial Map (MapLibre GL JS & MongoDB 2dsphere):**
   - High-contrast, vector dark map powered by OpenStreetMap-compatible tiles.
   - Dynamic color-coded markers reflecting live date availability:
     - 🟢 **Green:** Multiple bookable slots available on selected date.
     - 🟡 **Yellow:** Limited capacity remaining (< 3 slots).
     - 🔴 **Red:** Fully booked on selected date.
   - GPS-assisted geolocation and radius filtering (2 km, 5 km, 10 km, 20 km, 50 km).
   - Residential address privacy masking: street address is kept confidential during discovery and unlocked only after confirmed booking payment.

2. **Atomic Concurrency Booking Engine (Double-Booking Prevention):**
   - 5-minute temporary reservation hold (`TEMPORARILY_HELD`).
   - Atomic conditional queries prevent overlapping reservations for identical connector capacity.
   - Automated background scheduler releases expired holds every 60 seconds.
   - Automated booking lifecycle: `AVAILABLE` → `TEMPORARILY_HELD` → `CONFIRMED` → `IN_PROGRESS` → `COMPLETED`.

3. **Mandatory Owner Subscription Visibility Rule:**
   - A charging point only appears in public searches and maps if:
     1. Station is approved (`STATION_APPROVAL.APPROVED`).
     2. Station is active (`isActive: true`).
     3. Host profile is verified (`OWNER_VERIFICATION.VERIFIED`).
     4. Host has an active subscription (`SUBSCRIPTION_STATUS.ACTIVE`).
   - Background reconciliation automatically unlists stations when a host's subscription expires, while preserving confirmed bookings.

4. **Razorpay Dual Payment Flows:**
   - **Flow A (Owner Subscriptions):** Recurring host plans (Basic ₹199, Pro ₹399, Business ₹799) with gateway signature verification.
   - **Flow B (User Bookings):** Razorpay Standard Checkout order creation, HMAC-SHA256 signature verification, and automated 90%/10% ledger accounting.
   - Seamless sandbox simulation mode when testing with placeholder keys.

5. **Real-time Event Engine (Socket.IO):**
   - Instant availability updates (`stationAvailabilityUpdated`).
   - Driver check-in and host booking alerts (`bookingConfirmed`, `bookingCreated`).
   - In-app notification bell with live toasts.

6. **QR Code Session Verification:**
   - Drivers receive high-contrast base64 QR codes and 6-digit OTP codes.
   - Hosts verify arrivals, transition sessions to `IN_PROGRESS`, and mark sessions `COMPLETED`.

---

## 3. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 18 + Vite | Single Page Application with client-side routing |
| **Styling** | CSS3 & Custom Design System | Dark Mode (#090B0A, #111613, #171E1A, #39F28A) |
| **Mapping** | MapLibre GL JS | OpenStreetMap tiles, custom SVG markers, GPS |
| **Backend** | Node.js + Express.js | Modular REST API with ES Modules |
| **Database** | MongoDB Atlas / In-Memory | Mongoose ODM, GeoJSON 2dsphere indexes |
| **Real-time** | Socket.IO | Bi-directional WebSocket rooms |
| **Payments** | Razorpay Standard & Webhooks | Crypto HMAC signature verification |
| **Storage** | Cloudinary / Local Disk | Local `/uploads` fallback with zero setup |
| **Testing** | Jest + Supertest | Integration test suite with concurrency validation |

---

## 4. Quick Start & Installation

### Prerequisites
- Node.js v18+ (tested on Node v24.19.0)
- npm v9+
- MongoDB (Local daemon or MongoDB Atlas URI; an automatic zero-config In-Memory database launches if local Mongo is unreachable in development)

### Step 1: Clone and Install
```bash
# Clone the repository
git clone https://github.com/your-username/ev-hub.git
cd ev-hub

# Install all monorepo dependencies (root, backend, and frontend)
npm run install:all
```

### Step 2: Configure Environment Variables
Copy the provided `.env.example` templates:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Step 3: Seed Sample Demo Data
```bash
npm run seed
```
This populates:
- **1 Admin Account**
- **3 Sample Verified Hosts** (Gachibowli, Madhapur, Jubilee Hills)
- **8 Charging Stations** across Hyderabad IT corridor with real GPS coordinates
- **10 EV Drivers** with realistic vehicles (Tata Nexon EV, MG ZS EV, Ather, Ola, Hyundai Ioniq 5)
- **Active Subscription Plans & Sample Bookings**

### Step 4: Run Development Environment
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 5. Ready-To-Use Demo Test Accounts

The platform includes **1-Click Quick Fill buttons** on the login page:

| Role | Email | Password | Permissions / Capabilities |
|---|---|---|---|
| **Administrator** | `admin@evhub.com` | `Admin@12345` | Global overview, approve hosts, approve stations, settle payouts, audit logs, CSV exports |
| **Host / Owner** | `rajesh.host@evhub.com` | `Password@123` | Manage stations, interactive location picker, verify driver QR check-ins, track earnings, subscriptions |
| **EV Driver** | `aditya.user@evhub.com` | `Password@123` | Explore map, 5-min slot reservation, Razorpay test checkout, check-in QR code, reviews |

---

## 6. Directory Structure

```
ev-hub/
├── package.json                 # Monorepo management scripts
├── backend/
│   ├── .env.example             # Backend environment template
│   ├── src/
│   │   ├── config/              # DB, Razorpay, Cloudinary, Socket.IO, Constants
│   │   ├── models/              # 12 Mongoose Schemas (User, Station, Booking, etc.)
│   │   ├── middleware/          # JWT Auth, Roles, Rate Limiter, Error Handler
│   │   ├── controllers/         # Modular business logic controllers
│   │   ├── routes/              # Express API route endpoints
│   │   ├── services/            # Booking concurrency, Subscriptions, QR Code
│   │   ├── utils/               # GeoUtils, SeedData, Cron Jobs
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # HTTP & Socket.IO server bootstrap
│   └── tests/
│       └── api.test.js          # Jest + Supertest integration suite
├── frontend/
│   ├── .env.example             # Frontend public environment template
│   ├── vite.config.js           # Vite development and proxy configuration
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Navbar, Sidebar, Modal, Badges, MetricCard
│   │   │   ├── map/             # StationMap (MapLibre), LocationPicker
│   │   │   ├── booking/         # BookingModal, QR Verification Modal
│   │   │   └── widgets/         # CostEstimator, CarbonCalculator
│   │   ├── context/             # AuthContext, SocketContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── public/          # Landing, Explore, Station Details, Pricing, About
│   │   │   ├── auth/            # Login, User Register, Host Register, Reset Password
│   │   │   ├── user/            # Driver Overview, Bookings, Favorites, Profile, Support
│   │   │   ├── owner/           # Host Overview, Stations, Register Station, Calendar, Earnings
│   │   │   └── admin/           # Admin Overview, Users, Owners, Stations, Payouts, Reports
│   │   ├── styles/              # Theme variables, typography, dark mode CSS
│   │   ├── App.jsx              # Client routing & protected route guards
│   │   └── main.jsx             # React entrypoint
└── docs/                        # Complete technical architecture documentation
```

---

## 7. Testing & Verification

Run the comprehensive integration test suite:
```bash
npm test
```
**Test Coverage Includes:**
- Universal authentication and password hashing.
- Forced role security (prevents public role escalation).
- Geospatial `$geoNear` radius search.
- Mandatory host subscription visibility enforcement.
- Slot slicing algorithm and operating hours compliance.
- 5-minute atomic concurrency hold.
- Mutual exclusion preventing simultaneous double-booking.
- Host self-booking prevention.

---

## 8. License

Distributed under the MIT License. See `LICENSE` for more information.
