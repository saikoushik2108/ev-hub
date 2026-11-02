# EV Hub – External Services & API Setup Guide

This guide provides end-to-end configuration instructions for external services, API credentials, webhooks, and local fallbacks for **EV HUB**.

---

## Table of Contents
1. [Overview & Zero-Config Fallbacks](#1-overview--zero-config-fallbacks)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)
3. [Razorpay Payment Gateway & Webhooks](#3-razorpay-payment-gateway--webhooks)
4. [Cloudinary Image Storage](#4-cloudinary-image-storage)
5. [Maps & Vector Tiles Setup](#5-maps--vector-tiles-setup)
6. [Email Notification Service (SMTP)](#6-email-notification-service-smtp)
7. [Admin Provisioning & Initial Seeding](#7-admin-provisioning--initial-seeding)
8. [Complete Environment Variable Reference](#8-complete-environment-variable-reference)

---

## 1. Overview & Zero-Config Fallbacks

EV Hub is engineered with **Zero-Config Developer Fallbacks**. This allows developers and evaluators to clone, run `npm run dev`, and test the complete end-to-end booking, payment, and map workflow **without paying for external services or waiting for API approvals**.

| External Service | Production Role | Zero-Config Fallback Mechanism |
| :--- | :--- | :--- |
| **MongoDB Atlas** | Managed Cloud DB with 2dsphere indexes | Embedded `mongodb-memory-server` spins up automatically if `MONGODB_URI` is omitted |
| **Razorpay** | Online payments & recurring host subscriptions | Built-in test sandbox simulation; completes booking and captures payment state |
| **Cloudinary** | Cloud CDN image & document hosting | Automatic local disk storage in `backend/uploads/` served via Express static route |
| **MapLibre GL JS** | Interactive dark-mode vector map | OpenFreeMap global dark vector tiles (`https://tiles.openfreemap.org/styles/dark`) – 100% free, no key needed |
| **SMTP / Mail** | Password reset & booking confirmation emails | Console fallback: logs complete emails and password reset links directly to terminal |

---

## 2. MongoDB Atlas Setup

Follow these steps to connect EV Hub to a production-grade MongoDB Atlas database with geospatial indexing support.

### Step 2.1: Create MongoDB Atlas Cluster
1. Navigate to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and register or sign in.
2. In your Organization, click **Create a New Project** (e.g., `EV-Hub-Production`).
3. Click **Create a Database** and select the **M0 Free Tier** (or M10+ for production).
4. Choose your preferred cloud provider (AWS / Google Cloud) and the region closest to your users (e.g., `ap-south-1` Mumbai).

### Step 2.2: Configure Database User Access
1. Under the **Security** section in the left sidebar, click **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set Username: `evhub_admin`.
5. Click **Autogenerate Secure Password** and copy it safely.
6. Under **Database User Privileges**, select **Read and write to any database** (or assign custom role to `evhub` database).
7. Click **Add User**.

### Step 2.3: Configure Network Access (IP Whitelist)
1. Under **Security**, click **Network Access**.
2. Click **Add IP Address**.
3. For development or dynamic cloud hosts (Render/Vercel/Heroku):
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - For enterprise production with fixed VPCs, add your specific egress IP addresses.
4. Click **Confirm**. Wait 1–2 minutes until the status becomes active.

### Step 2.4: Copy Connection URI
1. Go to **Databases** > **Clusters** and click **Connect**.
2. Choose **Drivers** (Node.js, Version 5.5 or later).
3. Copy the connection string format:
   ```text
   mongodb+srv://evhub_admin:<password>@cluster0.abcde.mongodb.net/evhub?retryWrites=true&w=majority&appName=EVHub
   ```
4. Replace `<password>` with your database user password.
5. In `backend/.env`, set:
   ```env
   MONGODB_URI=mongodb+srv://evhub_admin:YourSecretPassword123@cluster0.abcde.mongodb.net/evhub?retryWrites=true&w=majority
   ```

---

## 3. Razorpay Payment Gateway & Webhooks

EV Hub utilizes Razorpay for standard checkout orders, host subscriptions, and automated webhook reconciliation.

### Step 3.1: Create Razorpay Account & Get Test Keys
1. Visit [dashboard.razorpay.com](https://dashboard.razorpay.com/) and register or log in.
2. Toggle the dashboard switch in the top bar to **Test Mode**.
3. In the left navigation, go to **Settings** > **API Keys**.
4. Click **Generate Test Key**.
5. Save the generated credentials:
   - **Key ID**: `rzp_test_...`
   - **Key Secret**: `...`
6. Add these to `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=yyyyyyyyyyyyyyyyyyyyyyyy
   ```
7. Add the public Key ID to `frontend/.env`:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
   ```

### Step 3.2: Configure Webhook Endpoint
Webhooks allow Razorpay to notify EV Hub asynchronously when payments or subscription renewals complete.

1. In Razorpay Dashboard, go to **Settings** > **Webhooks**.
2. Click **+ Add New Webhook**.
3. **Webhook URL**:
   - For local development with ngrok: `https://<your-ngrok-id>.ngrok-free.app/api/v1/payments/webhook`
   - For production on Render: `https://ev-hub-api.onrender.com/api/v1/payments/webhook`
4. **Secret**: Enter a secure random string (e.g., `evhub_webhook_secret_9988`).
5. In **Active Events**, select:
   - `order.paid`
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `subscription.authenticated`
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.completed`
   - `subscription.cancelled`
6. Click **Create Webhook**.
7. In `backend/.env`, update:
   ```env
   RAZORPAY_WEBHOOK_SECRET=evhub_webhook_secret_9988
   ```

### Step 3.3: Razorpay Sandbox Simulation Fallback
If you leave `RAZORPAY_KEY_ID=rzp_test_placeholder_key_id`, EV Hub's backend recognizes the test key and executes an **in-memory simulated checkout**:
- Orders return mock order IDs (`order_mock_xxxxxxxx`).
- Frontend bypasses external Razorpay popup and triggers instant cryptographic signature confirmation.
- Booking status transitions to `CONFIRMED` and QR code is immediately generated.

---

## 4. Cloudinary Image Storage

Cloudinary is used for uploading charging station photos, host ID proofs, and user profile pictures.

### Step 4.1: Retrieve Cloudinary Credentials
1. Register at [cloudinary.com](https://cloudinary.com/).
2. On your **Cloudinary Dashboard**, locate your **Product Environment Credentials**:
   - **Cloud Name**: e.g., `ev-hub-cloud`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `abcdefghijklmnopqrstuvwxyz`
3. Add them to `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=ev-hub-cloud
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
   ```

### Step 4.2: Local Disk Storage Fallback
If `CLOUDINARY_CLOUD_NAME` is left empty or omitted:
- Multer automatically writes uploaded files to `backend/uploads/stations/` and `backend/uploads/avatars/`.
- Express serves them directly at `http://localhost:5000/uploads/...`.
- No images fail to load in development or local presentation.

---

## 5. Maps & Vector Tiles Setup

EV Hub uses **MapLibre GL JS** to render fast, GPU-accelerated vector maps styled to match the dark SaaS aesthetic.

### Default Zero-Key Provider: OpenFreeMap
By default, EV Hub uses OpenFreeMap dark style vector tiles:
```text
https://tiles.openfreemap.org/styles/dark
```
- Completely free
- No registration or API key required
- High-contrast dark palette matching EV Hub's `#090B0A` background
- Pre-configured in `frontend/src/components/map/StationMap.jsx` and `LocationPicker.jsx`

### Optional Provider: MapTiler
If you prefer MapTiler for custom 3D terrain or enterprise SLA:
1. Register at [maptiler.com](https://www.maptiler.com/).
2. Copy your **API Key** from the account dashboard.
3. In `frontend/.env`, set:
   ```env
   VITE_MAPTILER_KEY=your_maptiler_key_here
   ```
4. Style URL becomes:
   ```text
   https://api.maptiler.com/maps/streets-v2-dark/style.json?key=your_maptiler_key_here
   ```

---

## 6. Email Notification Service (SMTP)

EV Hub uses Nodemailer for transactional emails (welcome emails, booking confirmations with QR code links, and password reset tokens).

### Option A: Gmail SMTP
1. In your Google Account, enable **2-Step Verification**.
2. Go to **Security** > **App Passwords**.
3. Generate a password for "EV Hub Mailer".
4. Configure in `backend/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=abcd efgh ijkl mnop
   FROM_EMAIL=EV Hub <no-reply@evhub.com>
   ```

### Option B: Mailtrap (Development Sandbox)
1. Register at [mailtrap.io](https://mailtrap.io/).
2. Create an Email Testing inbox.
3. Copy SMTP credentials into `backend/.env`.

### Fallback: Console Logging
If `SMTP_USER` or `SMTP_PASS` is empty:
- Nodemailer logs the entire email payload (recipient, subject, HTML body, reset token link) to the terminal with green borders.
- Developers can click the reset link directly in terminal logs without setting up email accounts.

---

## 7. Admin Provisioning & Initial Seeding

### Step 7.1: Environment-Based Admin Provisioning
Specify your desired root administrator credentials in `backend/.env`:
```env
ADMIN_NAME="Super Administrator"
ADMIN_EMAIL=admin@evhub.com
ADMIN_PASSWORD=AdminPassword@123
```
On startup or seed run, the system verifies if this admin exists. If not, it creates the administrator with `role: "ADMIN"` and full privileges.

### Step 7.2: Database Seeding
To populate EV Hub with realistic demo data (hosts, charging stations, bookings, reviews, and driver accounts):
```bash
# From workspace root:
npm run seed

# Or from backend folder:
cd backend
npm run seed
```

This creates:
- 1 Root Administrator (`admin@evhub.com`)
- 3 Verified Charging Point Hosts (`host1@evhub.com`, `host2@evhub.com`, `host3@evhub.com`)
- 8 Verified Charging Stations in Hyderabad tech corridor (Hitec City, Gachibowli, Madhapur, Financial District)
- 10 Active EV Driver Accounts (`driver1@evhub.com`, etc.)
- Active host subscription plans (`BASIC`, `PRO`, `FLEET`)
- Realistic completed and upcoming bookings with payments and ratings

---

## 8. Complete Environment Variable Reference

### Backend `.env` (`e:\ev-hub\backend\.env`)
```ini
# Application
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database (Leave empty for in-memory MongoDB fallback)
MONGODB_URI=

# JWT Secrets
JWT_SECRET=evhub_super_secret_jwt_access_key_2026_production
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=evhub_super_secret_jwt_refresh_key_2026_production
JWT_REFRESH_EXPIRES_IN=7d

# Razorpay Payment Gateway (Leave as placeholder for mock sandbox)
RAZORPAY_KEY_ID=rzp_test_placeholder_key_id
RAZORPAY_KEY_SECRET=rzp_test_placeholder_secret
RAZORPAY_WEBHOOK_SECRET=evhub_test_webhook_secret

# Cloudinary (Leave empty for local /uploads/ fallback)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# SMTP Email (Leave empty for terminal console logging)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
FROM_EMAIL="EV Hub Support <support@evhub.com>"

# Default Admin Credentials
ADMIN_NAME="EV Hub Administrator"
ADMIN_EMAIL=admin@evhub.com
ADMIN_PASSWORD=AdminPassword@123
```

### Frontend `.env` (`e:\ev-hub\frontend\.env`)
```ini
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api/v1

# Socket.IO Gateway URL
VITE_SOCKET_URL=http://localhost:5000

# Razorpay Public Key ID
VITE_RAZORPAY_KEY_ID=rzp_test_placeholder_key_id

# Optional MapTiler API Key (OpenFreeMap tiles used by default)
VITE_MAPTILER_KEY=
```

