# EV Hub – Production Deployment Guide

This guide provides step-by-step instructions for deploying **EV HUB** to production infrastructure:
- **Database**: MongoDB Atlas
- **Backend API & WebSockets**: Render Web Service
- **Frontend SPA**: Vercel
- **Asset Storage**: Cloudinary
- **Payments**: Razorpay Live Mode

---

## Table of Contents
1. [Prerequisites & Architecture](#1-prerequisites--architecture)
2. [Database: MongoDB Atlas](#2-database-mongodb-atlas)
3. [Asset Storage: Cloudinary](#3-asset-storage-cloudinary)
4. [Backend API Deployment: Render](#4-backend-api-deployment-render)
5. [Frontend Deployment: Vercel](#5-frontend-deployment-vercel)
6. [Razorpay Live Payment & Webhook Configuration](#6-razorpay-live-payment--webhook-configuration)
7. [Post-Deployment Smoke Tests & Verification](#7-post-deployment-smoke-tests--verification)
8. [Maintenance & Monitoring](#8-maintenance--monitoring)

---

## 1. Prerequisites & Architecture

Before beginning deployment, ensure you have:
- A GitHub repository containing the complete `ev-hub` codebase.
- Accounts on:
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  - [Render](https://render.com)
  - [Vercel](https://vercel.com)
  - [Razorpay](https://dashboard.razorpay.com)
  - [Cloudinary](https://cloudinary.com)

---

## 2. Database: MongoDB Atlas

### Step 2.1: Provision Production Cluster
1. Sign in to MongoDB Atlas and click **New Project** (e.g., `EVHub-Prod`).
2. Click **Create Deployment** > select **M0 Free Tier** (or **M10+ dedicated** for production workloads).
3. Region: Select region closest to your primary target market (e.g., AWS `ap-south-1` Mumbai).
4. Click **Create Deployment**.

### Step 2.2: Configure Database Security
1. Navigate to **Security** > **Database Access** > click **Add New Database User**.
   - Username: `evhub_prod_admin`
   - Authentication: Password (generate strong 24-character password).
   - Roles: `Read and write to any database`.
2. Navigate to **Security** > **Network Access** > click **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) because cloud PaaS like Render use dynamic egress IP pools.
   - Click **Confirm**.

### Step 2.3: Retrieve Connection String
1. Go to **Databases** > **Clusters** > click **Connect**.
2. Select **Drivers** (Node.js).
3. Copy the URI string:
   ```text
   mongodb+srv://evhub_prod_admin:<PASSWORD>@cluster0.abcde.mongodb.net/evhub_prod?retryWrites=true&w=majority
   ```
4. Replace `<PASSWORD>` with your database user password and keep this URI for Render setup.

---

## 3. Asset Storage: Cloudinary

1. Sign in to [Cloudinary Dashboard](https://cloudinary.com).
2. Under **Product Environment Credentials**, copy:
   - **Cloud Name**: e.g., `evhub-media`
   - **API Key**: e.g., `491823749182741`
   - **API Secret**: e.g., `_abcdefghijklmnopqrstuvwxyz`
3. In Cloudinary **Settings** > **Upload**, ensure the default upload preset or unsigned upload is configured if direct client uploads are used, or leave as default for authenticated backend uploads.

---

## 4. Backend API Deployment: Render

Render provides native Node.js hosting with persistent WebSockets (Socket.IO support) and automatic SSL.

### Step 4.1: Create Render Web Service
1. Log in to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** > select **Web Service**.
3. Connect your GitHub repository (`ev-hub`).
4. Configure service parameters:
   - **Name**: `ev-hub-api`
   - **Region**: Singapore or Frankfurt (closest to your DB cluster)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter ($7/mo recommended for continuous Socket.IO uptime)

### Step 4.2: Configure Environment Variables in Render
Under the **Environment** tab of your Render service, add the following key-value pairs:

| Variable Key | Example Production Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `FRONTEND_URL` | `https://ev-hub.vercel.app` *(update once Vercel is created)* |
| `MONGODB_URI` | `mongodb+srv://evhub_prod_admin:...@cluster0.abcde.mongodb.net/evhub_prod?retryWrites=true&w=majority` |
| `JWT_SECRET` | `generate_a_random_64_character_hex_string_for_production_jwt` |
| `JWT_EXPIRES_IN` | `1d` |
| `JWT_REFRESH_SECRET` | `generate_another_random_64_char_hex_string_for_refresh` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `RAZORPAY_KEY_ID` | `rzp_live_xxxxxxxxxxxxxxxx` *(or test key)* |
| `RAZORPAY_KEY_SECRET` | `yyyyyyyyyyyyyyyyyyyyyyyy` |
| `RAZORPAY_WEBHOOK_SECRET` | `random_secure_webhook_passphrase` |
| `CLOUDINARY_CLOUD_NAME` | `evhub-media` |
| `CLOUDINARY_API_KEY` | `491823749182741` |
| `CLOUDINARY_API_SECRET` | `_abcdefghijklmnopqrstuvwxyz` |
| `SMTP_HOST` | `smtp.sendgrid.net` (or Gmail) |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `apikey` |
| `SMTP_PASS` | `SG.xxxxxxxxxxxxxxxxxxxxxxxx` |
| `FROM_EMAIL` | `EV Hub <no-reply@evhub.com>` |
| `ADMIN_NAME` | `EV Hub Root Admin` |
| `ADMIN_EMAIL` | `admin@evhub.com` |
| `ADMIN_PASSWORD` | `SecureProductionPassword@2026` |

5. Click **Create Web Service**.
6. Render will build and deploy the backend. Note down your Render service URL:
   ```text
   https://ev-hub-api.onrender.com
   ```

### Step 4.3: Seed Production Database (Optional / Initial)
To seed initial plans, admin account, and demo charging points:
1. In Render dashboard, click **Shell**.
2. Run:
   ```bash
   npm run seed
   ```
3. Verify output: `Seeding complete. Admin and default plans created.`

---

## 5. Frontend Deployment: Vercel

Vercel provides edge CDN delivery, global SSL, and automated GitHub CI/CD for Vite React applications.

### Step 5.1: Create Vercel Project
1. Log in to [vercel.com](https://vercel.com) and click **Add New** > **Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit, select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 5.2: Configure Environment Variables in Vercel
Expand the **Environment Variables** section and add:

| Variable Key | Production Value |
| :--- | :--- |
| `VITE_API_URL` | `https://ev-hub-api.onrender.com/api/v1` |
| `VITE_SOCKET_URL` | `https://ev-hub-api.onrender.com` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_xxxxxxxxxxxxxxxx` *(or test key)* |
| `VITE_MAPTILER_KEY` | *(Optional, OpenFreeMap dark tiles used automatically)* |

### Step 5.3: Verify Single Page Application Routing
Ensure `frontend/vercel.json` exists in your repository with the following rewrite rule so client-side routes (e.g., `/explore`, `/owner/overview`) do not throw 404 upon browser reload:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 5.4: Deploy & Link
1. Click **Deploy**.
2. Once deployed, note down your production domain (e.g., `https://ev-hub.vercel.app`).
3. Return to your Render dashboard, update `FRONTEND_URL` in environment variables to match `https://ev-hub.vercel.app`, and click **Save Changes**.

---

## 6. Razorpay Live Payment & Webhook Configuration

### Step 6.1: Activate Live Mode
1. In your Razorpay Dashboard, switch the toggle from **Test Mode** to **Live Mode**.
2. Complete KYC and bank settlement registration.
3. Generate Live API Keys (`rzp_live_...`).
4. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Render and `VITE_RAZORPAY_KEY_ID` in Vercel.

### Step 6.2: Add Live Webhook URL
1. Go to **Settings** > **Webhooks** > **+ Add New Webhook**.
2. **Webhook URL**: `https://ev-hub-api.onrender.com/api/v1/payments/webhook`
3. **Secret**: Enter the exact string configured in Render's `RAZORPAY_WEBHOOK_SECRET`.
4. **Events to Subscribe**:
   - `order.paid`
   - `payment.captured`
   - `payment.failed`
   - `subscription.charged`
   - `subscription.cancelled`
5. Click **Create Webhook**.

---

## 7. Post-Deployment Smoke Tests & Verification

Perform this 5-minute health check immediately following deployment:

1. **Backend Health Check**:
   Visit `https://ev-hub-api.onrender.com/api/v1/stations` in your browser. Verify you receive a JSON payload with `{ success: true, count: ... }`.
2. **Frontend Loading**:
   Visit `https://ev-hub.vercel.app`. Verify dark SaaS theme, fonts, and icons render cleanly.
3. **Map Verification**:
   Navigate to `/explore`. Verify the dark vector map renders, controls zoom properly, and station pins load.
4. **Auth Smoke Test**:
   Log in using the administrator credentials configured in Render. Verify access to the Admin Dashboard.
5. **Real-Time WebSockets**:
   Open browser developer tools (Network > WS). Verify a WebSocket connection to `https://ev-hub-api.onrender.com/socket.io/` transitions to `101 Switching Protocols`.

---

## 8. Maintenance & Monitoring

- **Uptime Monitoring**: Add your Render API health endpoint to a free monitor like [UptimeRobot](https://uptimerobot.com) to ping every 5 minutes and prevent free instances from sleeping.
- **Log Management**: Review real-time logs in Render under the **Logs** tab to observe cron hold releases and incoming webhook events.
- **Database Backups**: Enable MongoDB Atlas daily automated snapshots in the cluster backup settings.

