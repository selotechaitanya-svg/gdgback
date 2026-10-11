# 🚀 GDG RBU EventHub

> **Production-Grade Event Management & Registration Platform with Custom Authentication, Event CRUD & Neo-Brutalism UI**  
> Built for the **Google Developer Groups on Campus · Shri Ramdeobaba University (GDG RBU)** Recruitment Drive (Web Dev - Backend).

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![UI Style](https://img.shields.io/badge/UI%2FUX-Neo--Brutalism-FBBC04?logo=google&logoColor=black)](https://www.gdgrbu.app)

---

## 📑 Table of Contents
- [Project Overview](#-project-overview)
- [Requirements Checklist (Recruitment Drive Alignment)](#-requirements-checklist)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Key Features](#-key-features)
  - [1. Authentication & Security](#1-authentication--security)
  - [2. Event CRUD & Business Rules](#2-event-crud--business-rules)
  - [3. Private Admin Management Portal](#3-private-admin-management-portal)
  - [4. Attendee Experience & QR Tickets](#4-attendee-experience--qr-tickets)
  - [5. Bonus Features](#5-bonus-features)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Getting Started Locally](#-getting-started-locally)
- [Running Automated Tests](#-running-automated-tests)
- [Docker Deployment](#-docker-deployment)
- [Production Deployment Guide](#-production-deployment-guide)
- [Recruitment Contacts](#-recruitment-contacts)

---

## 🌟 Project Overview

**GDG RBU EventHub** is a full-stack event discovery, registration, and administration platform designed specifically for developer communities. It adheres to strict software engineering standards:

1. **Robust Backend API:** Built with Express.js and MongoDB, enforcing real-world business constraints (strict seat capacity, duplicate registration prevention, date validation, and atomic updates).
2. **Custom Dual-Mode Auth:** Built with our own self-hosted cryptographic 6-digit email OTP system, combined with classic email/password support, short-lived 15-minute JWTs, 7-day refresh token rotation, and cross-origin `httpOnly` cookies.
3. **Interactive React 19 Frontend:** Designed with a high-contrast **Neo-Brutalism aesthetic** matching the official [gdgrbu.app](https://www.gdgrbu.app) identity (bold borders, hard drop shadows, Google palette, and responsive micro-interactions).
4. **Full Admin Event Management:** Dedicated `/admin` portal allowing authorized organizers to **Create**, **Edit**, and **Delete** events, upload banners, choose presets, and monitor live attendee check-in lists.

---

## 🎯 Requirements Checklist

Every item from the **GDG RBU Backend Web Developer Recruitment Drive** task specification is fully implemented and validated:

| Requirement | Specification | Implementation Status | Code Reference |
| :--- | :--- | :---: | :--- |
| **Authentication** | User registration and login; JWT / session-based authentication | ✅ **Complete (Exceeds)** | `backend/routes/auth.js`<br>`backend/middleware/auth.js` |
| **Event CRUD** | Title, Description, Date/Time, Venue, Capacity, Category | ✅ **Complete** | `backend/routes/events.js`<br>`backend/models/Event.js` |
| **Registration Rules** | Authenticated users can register; prevent duplicates and full-event registration | ✅ **Complete** | `backend/routes/registrations.js` |
| **User Registrations** | Users can view their registered events and unregister | ✅ **Complete** | `frontend/src/pages/MyEvents.jsx` |
| **Admin Operations** | Admins can create, update, and delete events | ✅ **Complete** | `frontend/src/pages/AdminDashboard.jsx`<br>`backend/routes/admin.js` |
| **React Interface** | Browse, search & filter events, view details, register/unregister, view registrations, admin management | ✅ **Complete** | `Events.jsx`, `EventDetails.jsx`, `AdminDashboard.jsx`, `MyEvents.jsx` |
| **Bonus: Reminders** | Schedule event reminders & admin broadcast | 🌟 **Bonus Implemented** | `backend/routes/reminders.js` |
| **Bonus: Rate Limiting** | Protect endpoints from brute-force & abuse | 🌟 **Bonus Implemented** | `backend/server.js` (`express-rate-limit`) |
| **Bonus: Redis Caching** | Cache public event listings with invalidation | 🌟 **Bonus Implemented** | `backend/config/redis.js` |
| **Bonus: Docker** | Multi-container setup with Docker Compose | 🌟 **Bonus Implemented** | `docker-compose.yml`, Dockerfiles |
| **Bonus: Analytics** | Event statistics, popular categories, trends | 🌟 **Bonus Implemented** | `GET /api/events/stats` |
| **Bonus: QR Codes** | Dynamic cryptographic QR pass generation | 🌟 **Bonus Implemented** | `qrcode` library & `QRModal.jsx` |
| **Bonus: Background Jobs**| Simulated batch email dispatching | 🌟 **Bonus Implemented** | `emailService.js` & `reminders.js` |

---

## 🏗️ Architecture & Tech Stack

```
gdg-eventhub/
├── backend/
│   ├── config/          # Database (MongoDB) & Redis cache configs
│   ├── middleware/      # JWT verification, Admin allowlist, Rate limiting
│   ├── models/          # User, Event, Registration, Otp, Session, Reminder
│   ├── routes/          # Auth, Events, Admin, Registrations, Reminders, User
│   ├── services/        # Email service (Resend / SMTP)
│   ├── tests/           # Automated system & security test suite (38 tests)
│   ├── utils/           # Cryptographic security helpers (HMAC, hashing)
│   ├── Dockerfile       # Backend container definition
│   └── server.js        # Express application entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios instance with cookie & Bearer token support
│   │   ├── components/  # Navbar, Footer, EventCard, QRModal, ProtectedRoute
│   │   ├── context/     # AuthContext (OTP, login, session refresh)
│   │   ├── pages/       # Home, Events, EventDetails, AdminDashboard, MyEvents, Login, Register
│   │   └── index.css    # Neo-Brutalism design system & utility classes
│   ├── Dockerfile       # Production Nginx container
│   ├── vercel.json      # Client-side SPA routing rewrites
│   └── vite.config.js   # Vite 8 bundler configuration
│
└── docker-compose.yml   # Multi-service composition (Node + React + Mongo + Redis)
```

---

## ⚡ Key Features

### 1. Authentication & Security
- **Self-Hosted Passwordless Email OTP:** 6-digit random code generated via `crypto.randomInt` and hashed with **HMAC-SHA256**. The plaintext OTP is **never** stored in the database.
- **Single-Use & Brute-Force Defense:** OTP challenges are atomically marked consumed on verification with a maximum 5-attempt limit and 60-second request cooldown.
- **Classic Email/Password Option:** Supports traditional password signup/login with `bcryptjs` (salt rounds: 12).
- **Dual-Token System:** Short-lived 15-minute JWT access token + 7-day cryptographic refresh token stored in `httpOnly` secure cookies with database session tracking.
- **Cross-Domain Header Support:** Issues `Authorization: Bearer <token>` in tandem with cookies for seamless hosting across separate domains (e.g., Vercel frontend + Render backend).

### 2. Event CRUD & Business Rules
- **Schema Validation:** Strict Mongoose schemas validating title, description, category enum (`Workshop`, `Hackathon`, `Tech Talk`, `Meetup`, `Conference`, `Bootcamp`, `Other`), date/time, venue, and seat capacity.
- **Capacity Lock:** Prevents lowering an event's capacity below the number of already registered attendees.
- **Atomic Registration:** Rejects duplicate registrations and blocks registration if the event is full or in the past.
- **Live Seat Counter:** Automatically tracks remaining seats (`capacity - confirmedRegistrations`).

### 3. Private Admin Management Portal (`/admin`)
- **Access Control:** Restricted via server-side allowlist (`ADMIN_EMAILS` environment variable). Ordinary users receive HTTP `403 Forbidden`.
- **Event Creation Modal:** Form with title, category, date/time picker, venue, seats, multiline description, and banner image selector.
- **Banner Image Selector:** Supports uploading a file from your computer (auto-converted to data URI), pasting an external URL, or selecting from curated GDG Tech Presets.
- **Edit & Delete Events:** Organizers can update event details in real-time or delete events (with a Danger Zone confirmation dialog that cleans up attendee records).
- **Attendee Overview:** Paginated view of confirmed attendees for each event with attendee names, emails, registration dates, and statuses.

### 4. Attendee Experience & QR Tickets
- **Event Discovery:** Search by keywords, filter by category tags, and sort by date ascending/descending or title.
- **My Registrations (`/my-events`):** Personal dashboard displaying all booked events.
- **Cryptographic QR Code Passes:** Generates dynamic, downloadable QR codes containing verification metadata for venue check-ins.
- **One-Click Unregister:** Allows attendees to cancel a registration, instantly freeing up a seat for others.

### 5. Bonus Features
- 🔔 **Event Reminders:** Users can subscribe to reminders; admins can trigger batch email broadcasts to all registered attendees.
- ⏱️ **Rate Limiting:** Protects `/api/` (300 req/15m) and authentication endpoints (40 req/15m) using `express-rate-limit`.
- ⚡ **Redis Caching:** Transparently caches `/api/events` queries with 60s TTL and auto-purges on any event creation, update, or deletion. Includes an in-memory fallback if Redis is offline.
- 🐳 **Dockerized:** Full containerization via `docker-compose.yml` for unified one-command startup.
- 📊 **Analytics Dashboard:** `GET /api/events/stats` aggregates total registrations, upcoming vs. past events, category distributions, and top 5 most popular events.

---

## 🔌 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/request-otp` | Public | Request a 6-digit email OTP |
| `POST` | `/api/auth/verify-otp` | Public | Verify OTP, establish session, return user & token |
| `POST` | `/api/auth/login` | Public | Sign in using email and password |
| `POST` | `/api/auth/register` | Public | Register new account with name, email, and password |
| `POST` | `/api/auth/refresh` | Public (Cookie) | Rotate refresh token and issue new access token |
| `POST` | `/api/auth/logout` | Authenticated | Revoke refresh session and clear cookies |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile and admin role |

### Events (`/api/events`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | Browse events (search, category, upcoming, sort, pagination) |
| `GET` | `/api/events/:id` | Public | Get single event details with remaining spots |
| `POST` | `/api/events` | Admin Only | Create a new event |
| `PUT` | `/api/events/:id` | Admin Only | Update an event (validates capacity) |
| `DELETE` | `/api/events/:id` | Admin Only | Delete an event and associated registrations |
| `GET` | `/api/events/stats` | Admin Only | Get analytics (categories, total attendees, popular events) |

### Registrations (`/api/registrations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/registrations/events/:id/register` | Authenticated | Register for an event (enforces capacity & duplicates) |
| `DELETE` | `/api/registrations/events/:id/unregister` | Authenticated | Cancel registration and restore event capacity |
| `GET` | `/api/registrations/my-events` | Authenticated | Get current user's registered events with QR passes |
| `GET` | `/api/registrations/check/:eventId` | Authenticated | Check if current user is registered for an event |

### Admin Operations (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/events` | Admin Only | Get all events with live confirmed registration counts |
| `GET` | `/api/admin/events/:eventId/registrations` | Admin Only | Get attendee list for a specific event (paginated) |
| `POST` | `/api/admin/events` | Admin Only | Create event alias |
| `PUT` | `/api/admin/events/:eventId` | Admin Only | Update event alias |
| `DELETE` | `/api/admin/events/:eventId` | Admin Only | Delete event alias |

### Reminders (`/api/reminders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reminders/:eventId` | Authenticated | Schedule an automated event reminder |
| `GET` | `/api/reminders/my-reminders` | Authenticated | Get user's active reminders |
| `DELETE` | `/api/reminders/:eventId` | Authenticated | Cancel an event reminder |
| `POST` | `/api/reminders/broadcast/:eventId` | Admin Only | Broadcast reminder notification to all registered attendees |

---

## ⚙️ Environment Variables

Create a `.env` file inside `backend/` based on `backend/.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Connection (MongoDB Atlas in production, local in dev)
MONGODB_URI=mongodb://localhost:27017/gdg-eventhub

# Security & Secrets (Use 32+ character random strings in production)
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key
OTP_HASH_SECRET=your_super_secret_otp_hash_key
JWT_SECRET=your_super_secret_fallback_key
JWT_ACCESS_EXPIRE=15m

# Admin Authorization Allowlist (Comma-separated emails)
ADMIN_EMAILS=admin@gdgrbu.app,your_email@example.com

# Email Delivery: Resend API (Recommended)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM="GDG RBU EventHub" <onboarding@resend.dev>

# Optional SMTP Fallback (Gmail App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password

# Optional Redis Connection
REDIS_URL=redis://localhost:6379
```

---

## 💻 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/gdg-eventhub.git
cd gdg-eventhub

# Install root, backend, and frontend dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Run Database Seeding (Optional)
```bash
cd backend
npm run seed
cd ..
```
> **Zero-Config In-Memory Mode:** If you do not have a local MongoDB service running, the backend will automatically spin up an embedded **in-memory MongoDB instance** and auto-seed sample GDG events and accounts automatically!

### 3. Start Development Servers
From the root directory:
```bash
npm run dev
```
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Healthcheck:** http://localhost:5000/api/health
- **Admin Dashboard:** http://localhost:5173/admin

---

## 🧪 Running Automated Tests

The repository includes a comprehensive, standalone end-to-end security and business logic test suite:

```bash
cd backend
npm test
```

### What is tested (38 Assertions, 0 Failures):
- ✅ Cryptographic OTP generation and HMAC-SHA256 hashing
- ✅ Zero plaintext exposure in API payloads
- ✅ Attempt counters and automatic invalidation after 5 failures
- ✅ 60-second cooldown rate limiting
- ✅ Single-use consumption (replay attack prevention)
- ✅ Short-lived JWT access tokens & refresh token rotation
- ✅ Server-side admin allowlist (`ADMIN_EMAILS`) enforcement
- ✅ 401 Unauthorized & 403 Forbidden boundary conditions
- ✅ Real database attendee counting and empty state handling
- ✅ Duplicate registration and event capacity rejection

---

## 🐳 Docker Deployment

To launch the full stack (Frontend, Backend, MongoDB, Redis) via Docker Compose:

```bash
docker-compose up --build
```
- Application: http://localhost:3000
- API Server: http://localhost:5000
- Stop containers: `docker-compose down`

---

## 🚀 Production Deployment Guide

### 🏆 Option A: Deploy Entire Fullstack Website on Vercel (Fastest & Recommended!)

You can deploy the **entire application (React Frontend + Express API)** on **Vercel** with **one single project and one URL**:
- ⚡ **Instant Global CDN** — 0 cold starts, loads in under a second.
- 🔗 **Single Domain** (e.g. `https://gdg-eventhub.vercel.app`) — Zero CORS issues and seamless cookie handling.
- 💸 **100% Free** — Fully covered under Vercel's generous hobby tier.

#### Step 1: Import on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **Import** next to your GitHub repository (`selotechaitanya-svg/gdgback`).
3. Keep default settings (Vercel automatically detects [`vercel.json`](vercel.json)).

#### Step 2: Add Environment Variables
Under **Environment Variables**, add:
- `MONGODB_URI`: `mongodb+srv://savitaselote2_db_user:6mfCvZEn9Q6VwO54@gdg.hkjz12r.mongodb.net/gdg-eventhub?retryWrites=true&w=majority&appName=GDG`
- `NODE_ENV`: `production`
- `JWT_ACCESS_SECRET`: `c83f9821a0f9b33a593e92e0df401825b8ad28f09d845e28a5`
- `JWT_REFRESH_SECRET`: `d901a1829e01bc448e89f81239857201948ba985ef0192384a`
- `OTP_HASH_SECRET`: `72384f8b9192485e9823059178234857291039485720193847`
- `ADMIN_EMAILS`: `selotechaitanya09@gmail.com,admin@gdgrbu.app,chaitanya@gdgrbu.app`

#### Step 3: Deploy
Click **Deploy**! In about 60 seconds, your site is live with full Neo-Brutalism UI, active MongoDB Atlas database, and registration capabilities.

---

### Option B: Alternative Single-Agency Deployment (Render)

If you prefer Render:
1. Go to [Render Dashboard](https://dashboard.render.com/) → **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Set **Build Command**: `npm run build:render` and **Start Command**: `npm start`.
4. Add the same environment variables as above and click **Deploy**.

---

## 👥 Recruitment Contact

- **Chaitanya Selote** — Developer & Project Lead: `+91 9699910273`

---

Built with ❤️ for **Google Developer Groups on Campus · Shri Ramdeobaba University**.
