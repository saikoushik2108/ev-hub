# EV Hub – Comprehensive Implementation Guide

This document details the architectural decisions, module workflows, concurrency controls, security safeguards, and implementation mechanics of **EV Hub**.

---

## 1. System Architecture & High-Level Workflow

```
+------------------------------------------------------------------------+
|                          CLIENT APPLICATION                            |
|  React 18 + Vite SPA | MapLibre GL JS | Razorpay SDK | Socket.IO Client |
+-----------------------------------+------------------------------------+
                                    |
                    HTTPS REST APIs | WSS Socket Events
                                    v
+------------------------------------------------------------------------+
|                            BACKEND SERVER                              |
|           Node.js + Express.js | Helmet | CORS | Rate Limiter          |
+-----------------------------------+------------------------------------+
  |                     |                         |                   |
  v                     v                         v                   v
[Auth & JWT]   [Booking Concurrency]   [Geospatial Engine]   [Razorpay Gateway]
  |                     |                         |                   |
  +---------------------+-------------------------+-------------------+
                        |
                        v
+------------------------------------------------------------------------+
|                           DATABASE LAYER                               |
|        MongoDB Atlas / Mongoose ODM with 2dsphere Spatial Indexes      |
+------------------------------------------------------------------------+
```

---

## 2. Core Functional Modules

### Module 1: Authentication & Role-Based Authorization
- **Endpoint Structure:** Handled in `/api/auth/` (`authController.js`).
- **Security Rule (Role Tampering Prevention):** The public registration endpoints `/api/auth/register` and `/api/auth/register-owner` do not trust any `role` value sent in the HTTP payload. The backend strictly hardcodes `role = 'USER'` for drivers and `role = 'OWNER'` for hosts. Admin accounts cannot be created publicly; they must be created via seed scripts or administrative invitation.
- **Tokens:** Access tokens are signed with JWT using a 1-day expiration. Secure 7-day refresh tokens are stored in the database and exchanged via `/api/auth/refresh`. Passwords are encrypted using `bcryptjs` with salt rounds = 10.
- **Middleware Guards:** `authenticate` verifies token signatures, fetches the user, and ensures the account is not in `SUSPENDED` status. `authorize(...allowedRoles)` enforces RBAC across routes.

---

### Module 2: The Concurrency Booking Engine
**Objective:** Two drivers must never be able to successfully reserve overlapping charging slots for the same hardware connector.

#### The 5-Minute Atomic Hold Lifecycle
```
[User Selects Slot]
        |
        v
[Backend Overlap Check: counts active CONFIRMED bookings + unexpired TEMPORARILY_HELD]
        |
  Overlaps >= Capacity ?
  /                    \
YES                     NO
 |                       |
 v                       v
[409 Conflict Error]   [Atomic Creation of TEMPORARILY_HELD Booking]
                       [holdExpiresAt = Date.now() + 5 Minutes]
                                 |
                       [Generate Razorpay Order]
                                 |
                       [Frontend Opens Razorpay Checkout]
                                 |
                     Payment Verified by Signature?
                     /                           \
                   YES                            NO / Hold Timer Expiry
                    |                                       |
                    v                                       v
         [Update to CONFIRMED]                     [HOLD_EXPIRED / RELEASED]
         [Generate Base64 QR Code]                 [Capacity Restored to Pool]
         [Emit Socket.IO Availability]             [Emit Socket.IO Update]
```

#### Code Implementation
In `backend/src/services/bookingService.js`:
```javascript
export const countOverlappingBookings = async (stationId, startTime, endTime, excludeId = null) => {
  const now = new Date();
  const query = {
    stationId,
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
    $or: [
      { bookingStatus: { $in: ['CONFIRMED', 'IN_PROGRESS'] } },
      {
        bookingStatus: { $in: ['TEMPORARILY_HELD', 'PAYMENT_PENDING'] },
        holdExpiresAt: { $gt: now },
      },
    ],
  };
  if (excludeId) query._id = { $ne: excludeId };
  return await Booking.countDocuments(query);
};
```
If `countOverlappingBookings >= station.maximumCapacity`, the server immediately throws a `409 Conflict` error.

#### Automated Hold Release Job
In `backend/src/utils/cronJobs.js`, a reconciliation task executes every 60 seconds:
- Queries all bookings where `bookingStatus === 'TEMPORARILY_HELD'` and `holdExpiresAt <= new Date()`.
- Updates their status to `HOLD_EXPIRED`.
- Emits `stationAvailabilityUpdated` via Socket.IO so other drivers' maps immediately show the slot as available.

---

### Module 3: Owner Subscription Visibility Enforcement
**Mandatory Business Rule:** A charging station may only appear in driver searches and on the map if:
1. `station.approvalStatus === 'APPROVED'`
2. `station.isActive === true`
3. `ownerProfile.verificationStatus === 'VERIFIED'`
4. `ownerProfile.subscriptionStatus === 'ACTIVE'`

#### Enforcement Mechanics
- **At Database Query Level:** Public discovery queries in `stationController.js` enforce `{ isPubliclyListed: true, approvalStatus: 'APPROVED', isActive: true }`.
- **Scheduled Expiry Reconciler:** In `subscriptionService.js`, the background job identifies subscriptions whose `endDate <= now`, updates them to `EXPIRED`, and unlists all stations owned by that host (`isPubliclyListed: false`).
- **Existing Bookings Preservation:** Previously confirmed bookings are preserved; only future new reservations are blocked until renewal.

---

### Module 4: Interactive Map Engine (MapLibre GL JS)
- **Map Tile Source:** OpenFreeMap vector dark style (`https://tiles.openfreemap.org/styles/dark`) based on OpenStreetMap data, ensuring 100% free uptime with zero API key dependencies.
- **Geospatial Queries:** MongoDB `2dsphere` index on `location: { type: 'Point', coordinates: [lng, lat] }`.
- **API Endpoint:** `/api/stations/nearby` uses `$geoNear` to return stations sorted by spherical distance.
- **Dynamic Color Indicators:**
  - `GREEN`: Station has bookable capacity (>2 slots) on user's selected date.
  - `YELLOW`: Station has limited slots (1–2 slots remaining).
  - `RED`: Station is fully booked on that date.
- **Address Masking:** Exact residential house numbers are stripped from API outputs during public discovery (`address.masked: "Madhapur, Hyderabad - exact address visible after booking"`). Exact addresses are unlocked only upon payment confirmation.

---

### Module 5: Payment Processing (Razorpay Standard & Webhooks)
- **Dual Payment Flows:**
  1. **Owner Subscriptions:** Monthly plans (Basic ₹199, Pro ₹399, Business ₹799).
  2. **Driver Bookings:** Dynamic calculation:
     $$\text{Total} = \text{Base Amount} + \text{GST (5\%)} - \text{Coupon Discount}$$
     $$\text{Platform Commission} = \text{Base Amount} \times 10\%$$
     $$\text{Host Earning} = \text{Base Amount} - \text{Platform Commission}$$
- **Signature Verification:** Validated via HMAC-SHA256 (`crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id)`).
- **Webhooks:** `/api/payments/webhook` parses raw request bodies (`req.rawBody`) to verify cryptographic webhook signatures and handle asynchronous confirmations idempotently.
- **Sandbox Fallback:** When placeholder test keys (`rzp_test_placeholder_key`) are detected, the system operates in simulated sandbox mode so developers can test the full checkout flow without external gateway dependencies.

---

### Module 6: Real-time Socket.IO Communication
- **Server:** Integrated with the Express HTTP server in `socket.js`.
- **Socket Authentication:** Authenticates incoming connections using JWT and auto-joins authenticated rooms (`user:<userId>`, `owner:<ownerId>`, `admin:room`).
- **Broadcast Events:**
  - `stationAvailabilityUpdated`: Triggered when slots are held, confirmed, expired, or cancelled.
  - `bookingCreated`: Alerts the host of a new confirmed booking.
  - `notificationCreated`: Delivers real-time notifications to the client navbar bell.

---

## 3. Database Models & Schema Summary

| Collection | Key Fields | Indexes |
|---|---|---|
| `users` | `name`, `email`, `phone`, `passwordHash`, `role`, `status`, `vehicleDetails` | `email` (unique), `role`, `status` |
| `ownerprofiles` | `userId`, `verificationStatus`, `subscriptionStatus`, `address`, `payoutDetails` | `userId` (unique), `verificationStatus` |
| `chargingstations` | `ownerId`, `name`, `location`, `price`, `chargingCapacity`, `isPubliclyListed` | `location: '2dsphere'`, compound discovery |
| `bookings` | `userId`, `ownerId`, `stationId`, `startTime`, `endTime`, `bookingStatus`, `holdExpiresAt` | `stationId + bookingStatus + startTime + endTime` |
| `payments` | `bookingId`, `userId`, `amount`, `gatewayOrderId`, `signatureVerificationStatus` | `gatewayOrderId`, `bookingId` |
| `subscriptions` | `ownerId`, `planId`, `status`, `startDate`, `endDate`, `amount` | `ownerId`, `status`, `endDate` |
| `subscriptionplans`| `name`, `code`, `price`, `stationLimit`, `features` | `code` (unique) |
| `transactions` | `bookingId`, `ownerId`, `grossAmount`, `platformCommission`, `settlementStatus` | `ownerId`, `settlementStatus` |
| `reviews` | `userId`, `stationId`, `bookingId`, `rating`, `comment`, `ownerReply` | `bookingId` (unique), `stationId` |
| `notifications` | `userId`, `title`, `message`, `type`, `isRead` | `userId`, `isRead` |
| `complaints` | `userId`, `bookingId`, `subject`, `description`, `status` | `userId`, `status` |
| `auditlogs` | `adminId`, `action`, `targetType`, `targetId`, `details`, `timestamp` | `adminId`, `action`, `createdAt` |

---

## 4. Security Checklist & Best Practices
- [x] **NoSQL Injection Defense:** Strict Mongoose schemas and type casting.
- [x] **XSS & Header Hardening:** `helmet` security headers configured with cross-origin resource policy.
- [x] **Rate Limiting:** `express-rate-limit` active on auth (30/15m) and general API (300/15m).
- [x] **Address Privacy:** Pre-save address masking protects private residential hosts.
- [x] **Raw Webhook Parsing:** Raw binary buffer preserved for Razorpay webhook crypto signature calculation.
- [x] **No Client Secrets:** Gateway secrets and JWT secrets are strictly isolated on the backend.

