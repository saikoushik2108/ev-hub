# EV Hub – REST API Documentation

Base URL: `http://localhost:5000/api/v1` (Development) | `https://your-api-domain.com/api/v1` (Production)

---

## Table of Contents
1. [Authentication & Request Headers](#1-authentication--request-headers)
2. [Standard Response & Error Format](#2-standard-response--error-format)
3. [Authentication Endpoints (`/auth`)](#3-authentication-endpoints-auth)
4. [Charging Stations Endpoints (`/stations`)](#4-charging-stations-endpoints-stations)
5. [Bookings & Concurrency Endpoints (`/bookings`)](#5-bookings--concurrency-endpoints-bookings)
6. [Payments & Webhooks (`/payments`)](#6-payments--webhooks-payments)
7. [Host / Owner Operations (`/owner`)](#7-host--owner-operations-owner)
8. [Driver / User Operations (`/user`)](#8-driver--user-operations-user)
9. [Subscriptions (`/subscriptions`)](#9-subscriptions-subscriptions)
10. [Reviews & Ratings (`/reviews`)](#10-reviews--ratings-reviews)
11. [Notifications (`/notifications`)](#11-notifications-notifications)
12. [Administration Endpoints (`/admin`)](#12-administration-endpoints-admin)

---

## 1. Authentication & Request Headers

Protected endpoints require a JSON Web Token (JWT) passed in the `Authorization` header:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Roles supported:
- `ADMIN`: Platform overseer with full governance, settlement, and moderation privileges.
- `OWNER`: Host with registered charging stations, calendar, and payouts.
- `USER`: EV driver booking slots, managing favorites, and posting reviews.

---

## 2. Standard Response & Error Format

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Validation Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### Authentication / Authorization Errors (`401 Unauthorized`, `403 Forbidden`)
```json
{
  "success": false,
  "message": "Invalid token or session expired"
}
```

---

## 3. Authentication Endpoints (`/auth`)

### 3.1 Register EV Driver (`USER`)
- **Method & Route**: `POST /auth/register/user`
- **Auth**: Public
- **Request Body**:
```json
{
  "name": "Jane Driver",
  "email": "jane@example.com",
  "phone": "+919876543210",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "vehicleMake": "Tata",
  "vehicleModel": "Nexon EV Max",
  "vehicleRegistrationNumber": "TS09EA1234",
  "connectorType": "CCS_TYPE_2"
}
```
- **Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "6724fa1b...",
      "name": "Jane Driver",
      "email": "jane@example.com",
      "role": "USER"
    },
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### 3.2 Register Charging Point Host (`OWNER`)
- **Method & Route**: `POST /auth/register/owner`
- **Auth**: Public
- **Request Body**:
```json
{
  "name": "Vikram Host",
  "email": "vikram@example.com",
  "phone": "+919123456789",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "address": {
    "street": "Villa 14, Rainbow Meadows",
    "area": "Gachibowli",
    "city": "Hyderabad",
    "state": "Telangana",
    "pincode": "500032"
  },
  "idProofType": "AADHAAR",
  "idProofNumber": "1234-5678-9012"
}
```
- **Response (`201 Created`)**: Returns user object with `role: "OWNER"` and pending verification state.

### 3.3 User / Host / Admin Login
- **Method & Route**: `POST /auth/login`
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "admin@evhub.com",
  "password": "AdminPassword@123"
}
```
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6724a1...",
      "name": "Super Administrator",
      "email": "admin@evhub.com",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### 3.4 Refresh Token
- **Method & Route**: `POST /auth/refresh`
- **Request Body**: `{ "refreshToken": "eyJhbGciOi..." }`
- **Response (`200 OK`)**: `{ "token": "eyJhbGciOi..." }`

### 3.5 Forgot Password & Reset Password
- `POST /auth/forgot-password`
  - Body: `{ "email": "driver@example.com" }`
- `POST /auth/reset-password`
  - Body: `{ "token": "plain_reset_token", "newPassword": "NewPassword@123" }`

### 3.6 Profile & Password Updates
- `GET /auth/me` (Auth: Required)
- `PUT /auth/profile` (Auth: Required, updates name, phone, vehicle info)
- `PUT /auth/change-password` (Auth: Required, body: `{ currentPassword, newPassword }`)
- `POST /auth/logout` (Auth: Required)

---

## 4. Charging Stations Endpoints (`/stations`)

### 4.1 Search Stations (Geospatial & Filtered)
- **Method & Route**: `GET /stations`
- **Auth**: Public
- **Query Parameters**:
  - `lat`: (float) Latitude of search center
  - `lng`: (float) Longitude of search center
  - `radius`: (float, km, default: 25)
  - `connectorType`: (string, e.g. `CCS_TYPE_2`, `TYPE_2_AC`)
  - `chargingType`: (`AC` or `DC`)
  - `minKw`: (number, e.g. 7.4)
  - `maxPrice`: (number)
  - `search`: (string search term)
  - `page`: (int, default: 1)
  - `limit`: (int, default: 20)
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "count": 8,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "_id": "6724fc9...",
      "name": "Cyber Towers HyperCharge Station",
      "location": {
        "type": "Point",
        "coordinates": [78.3812, 17.4504]
      },
      "address": {
        "area": "Hitec City",
        "city": "Hyderabad",
        "masked": true
      },
      "chargerSpecs": {
        "chargingType": "DC",
        "capacityKw": 60,
        "connectorType": "CCS_TYPE_2",
        "maxSimultaneousVehicles": 2
      },
      "pricing": {
        "ratePerKwh": 18.5,
        "ratePerHour": 0
      },
      "rating": {
        "average": 4.8,
        "count": 24
      },
      "availabilityStatus": "AVAILABLE",
      "photos": ["/uploads/stations/station-1.jpg"]
    }
  ]
}
```

### 4.2 Get Station Details
- **Method & Route**: `GET /stations/:id`
- **Auth**: Optional. If authenticated and user holds an active confirmed booking, exact street address is decrypted/unmasked.
- **Response (`200 OK`)**: Returns complete station specifications, amenities, schedule, photos, and host summary.

### 4.3 Get Station Real-Time Slot Availability
- **Method & Route**: `GET /stations/:id/availability?date=2026-11-03&durationMinutes=60`
- **Auth**: Public
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "date": "2026-11-03",
    "operatingHours": { "open": "06:00", "close": "23:00" },
    "slotDurationMinutes": 60,
    "bufferTimeMinutes": 15,
    "slots": [
      {
        "slotStart": "2026-11-03T09:00:00.000Z",
        "slotEnd": "2026-11-03T10:00:00.000Z",
        "status": "AVAILABLE",
        "availableConnectors": 2
      },
      {
        "slotStart": "2026-11-03T10:15:00.000Z",
        "slotEnd": "2026-11-03T11:15:00.000Z",
        "status": "HELD",
        "availableConnectors": 0
      }
    ]
  }
}
```

---

## 5. Bookings & Concurrency Endpoints (`/bookings`)

### 5.1 Create Concurrency Hold (5-Minute Hold)
- **Method & Route**: `POST /bookings/hold`
- **Auth**: Required (`USER` role)
- **Request Body**:
```json
{
  "stationId": "6724fc9...",
  "startTime": "2026-11-03T14:00:00.000Z",
  "endTime": "2026-11-03T15:00:00.000Z",
  "estimatedKwh": 30,
  "couponCode": "EVHUB10"
}
```
- **Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Slot held for 5 minutes. Proceed to checkout.",
  "data": {
    "bookingId": "672501a...",
    "status": "HOLD",
    "holdExpiresAt": "2026-11-03T13:05:00.000Z",
    "amount": {
      "subtotal": 555.0,
      "discount": 55.5,
      "platformFee": 25.0,
      "tax": 9.99,
      "totalAmount": 534.49
    },
    "razorpayOrderId": "order_mock_982348"
  }
}
```

### 5.2 Confirm Payment & Finalize Booking
- **Method & Route**: `POST /bookings/confirm`
- **Auth**: Required (`USER` role)
- **Request Body**:
```json
{
  "bookingId": "672501a...",
  "razorpayPaymentId": "pay_mock_112233",
  "razorpayOrderId": "order_mock_982348",
  "razorpaySignature": "simulated_signature_mock"
}
```
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Booking confirmed",
  "data": {
    "bookingId": "672501a...",
    "status": "CONFIRMED",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "checkInCode": "EVH-84920",
    "hostAddress": {
      "street": "Plot 42, Silicon Heights, Near Durgam Cheruvu",
      "area": "Hitec City",
      "city": "Hyderabad",
      "hostPhone": "+919876543210"
    }
  }
}
```

### 5.3 My Bookings & Booking Details
- `GET /bookings/my`: Returns logged-in driver's active, completed, and cancelled bookings.
- `GET /bookings/:id`: Returns booking details including directions and unlocked host details.
- `PATCH /bookings/:id/cancel`: Cancels booking and applies cancellation fee rules.

### 5.4 Check-In via QR Code Verification
- **Method & Route**: `POST /bookings/:id/verify-qr`
- **Auth**: Required (`OWNER` or `ADMIN`)
- **Request Body**:
```json
{
  "scannedPayload": "{\"bookingId\":\"672501a...\",\"securityHash\":\"a1b2c3d4\"}"
}
```
- **Response (`200 OK`)**: Booking status transitions to `CHARGING_IN_PROGRESS`.

---

## 6. Payments & Webhooks (`/payments`)

### 6.1 Razorpay Webhook
- **Method & Route**: `POST /payments/webhook`
- **Auth**: Signature verified via `X-Razorpay-Signature` header and raw body buffer.
- **Handled Events**:
  - `order.paid`
  - `payment.captured`
  - `payment.failed`
  - `subscription.charged`
  - `subscription.cancelled`

### 6.2 Payment History
- **Method & Route**: `GET /payments/history`
- **Auth**: Required
- **Response**: List of all user payments, transaction IDs, invoice links, and statuses.

---

## 7. Host / Owner Operations (`/owner`)

### 7.1 Host Dashboard Metrics
- **Method & Route**: `GET /owner/dashboard`
- **Auth**: Required (`OWNER` role)
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "totalStations": 3,
    "activeStations": 3,
    "upcomingBookings": 5,
    "completedBookings": 48,
    "totalEarnings": 34850.0,
    "pendingPayout": 8400.0,
    "subscription": {
      "status": "ACTIVE",
      "plan": "PRO",
      "validUntil": "2026-12-01T00:00:00.000Z"
    }
  }
}
```

### 7.2 Register Charging Station
- **Method & Route**: `POST /owner/stations`
- **Auth**: Required (`OWNER` role)
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `name`: Station Name
  - `description`: Notes, entry gate instructions
  - `street`, `area`, `city`, `state`, `pincode`: Address
  - `latitude`, `longitude`: GPS coordinates
  - `chargerBrand`, `chargerModel`: Hardware specifications
  - `connectorType`: `CCS_TYPE_2`, `TYPE_2_AC`, etc.
  - `chargingType`: `AC` or `DC`
  - `capacityKw`: Max output in kW
  - `ratePerKwh`, `ratePerHour`: Pricing
  - `photos`: Up to 5 image files

### 7.3 Station Management & Availability
- `GET /owner/stations`: List stations owned by the authenticated host.
- `PATCH /owner/stations/:id`: Update pricing, operational hours, or specs.
- `DELETE /owner/stations/:id`: Deactivate station.
- `GET /owner/bookings`: Bookings placed across host's charging points.
- `GET /owner/earnings`: Earnings history, platform deductions, and net payouts.

### 7.4 Subscription Checkout & Verification
- `POST /owner/subscription/checkout`: Creates a Razorpay subscription order for host plans (`BASIC`, `PRO`, `FLEET`).
- `POST /owner/subscription/verify`: Verifies payment signature and unlocks host station visibility.

---

## 8. Driver / User Operations (`/user`)

- `GET /user/overview`: Driver profile summary, charging statistics, and upcoming reservations.
- `GET /user/favorites`: List bookmarked stations.
- `POST /user/favorites/:stationId`: Add station to favorites.
- `DELETE /user/favorites/:stationId`: Remove station from favorites.
- `POST /user/complaints`: File a support ticket or complaint regarding a charging session.
- `GET /user/complaints`: Track filed complaints.

---

## 9. Subscriptions (`/subscriptions`)

- `GET /subscriptions/plans`: Public endpoint returning available plans:
  - **Basic Host**: ₹499/mo (Up to 1 charging point)
  - **Pro Host**: ₹1,299/mo (Up to 3 charging points, priority map ranking)
  - **Fleet Enterprise**: ₹2,999/mo (Unlimited charging points, API integration)
- `GET /subscriptions/status`: Returns current host subscription status and days remaining.

---

## 10. Reviews & Ratings (`/reviews`)

- `POST /reviews`: Submit a review and 1–5 star rating for a completed booking.
  - Body: `{ "bookingId": "...", "stationId": "...", "rating": 5, "comment": "Great charger, owner was very helpful!" }`
- `GET /reviews/station/:stationId`: List reviews for a station.
- `POST /owner/reviews/:id/reply`: Host reply to driver review.

---

## 11. Notifications (`/notifications`)

- `GET /notifications`: Retrieve unread and historical notifications.
- `PATCH /notifications/:id/read`: Mark single notification as read.
- `PATCH /notifications/read-all`: Mark all notifications as read.

---

## 12. Administration Endpoints (`/admin`)

All admin routes require `Authorization: Bearer <token>` where user has `role: "ADMIN"`.

### 12.1 Platform Overview
- `GET /admin/overview`: Global GMV, active users, total stations, active subscriptions, and system alerts.

### 12.2 User & Host Verification
- `GET /admin/users`: Paginated user list with role, email, and status filters.
- `PATCH /admin/users/:id/status`: Update status (`ACTIVE`, `SUSPENDED`).
- `GET /admin/owners`: Review host applications and KYC identification proofs.
- `PATCH /admin/owners/:id/approve`: Approve host application.
- `PATCH /admin/owners/:id/reject`: Reject host application with reason.

### 12.3 Station Moderation
- `GET /admin/stations`: View all registered stations.
- `PATCH /admin/stations/:id/approve`: Approve station for public discovery.
- `PATCH /admin/stations/:id/reject`: Reject station.

### 12.4 Financials & Settlements
- `GET /admin/transactions`: Platform financial ledger.
- `PATCH /admin/transactions/:id/settle`: Disburse host payout.

### 12.5 CSV Reports Export
- `GET /admin/reports/csv-bookings`: Streams downloadable CSV of all bookings with date filters.
- `GET /admin/reports/csv-transactions`: Streams downloadable CSV of all financial transactions.

### 12.6 Audit Logs & Settings
- `GET /admin/audit-logs`: Immutable log of administrative actions.
- `GET /admin/settings`: Retrieve platform commission %, booking hold duration, and cancellation policies.
- `PUT /admin/settings`: Update platform settings.

