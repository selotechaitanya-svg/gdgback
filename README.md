# 🚀 GDG RBU EventHub

> **Production-Grade Developer Event Discovery, Ticket Management & Administration Platform with Custom Dual Authentication, Real-Time Seat Locking & High-Contrast Neo-Brutalism UI**  
> Built with ❤️ by **Chaitanya Selote** for **Google Developer Groups on Campus · Shri Ramdeobaba University (GDG RBU)**.

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Caching-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![UI Style](https://img.shields.io/badge/UI%2FUX-Neo--Brutalism-FBBC04?style=for-the-badge&logo=google&logoColor=black)](https://www.gdgrbu.app)
[![Tests](https://img.shields.io/badge/Tests-38%2F38%20Passing-34A853?style=for-the-badge&logo=checkmarx&logoColor=white)](backend/tests/system.test.js)

---

## 📑 Table of Contents

- [🌟 Project Overview](#-project-overview)
- [⚡ Complete Feature Breakdown](#-complete-feature-breakdown)
  - [1. Public & Attendee Experience](#1-public--attendee-experience)
  - [2. Comprehensive Admin Management Portal (`/admin`)](#2-comprehensive-admin-management-portal-admin)
  - [3. Dual Authentication & Security Engine](#3-dual-authentication--security-engine)
  - [4. Neo-Brutalist Visual Design System](#4-neo-brutalist-visual-design-system)
  - [5. Performance, Caching & Resilience](#5-performance-caching--resilience)
- [🏗️ System Architecture & Directory Structure](#️-system-architecture--directory-structure)
- [🗄️ Database Schemas & Data Models](#️-database-schemas--data-models)
- [🔌 Complete REST API Reference](#-complete-rest-api-reference)
  - [Authentication Endpoints (`/api/auth`)](#authentication-endpoints-apiauth)
  - [Public & Protected Events (`/api/events`)](#public--protected-events-apievents)
  - [Registrations & Passes (`/api/registrations`)](#registrations--passes-apiregistrations)
  - [Dedicated Admin Operations (`/api/admin`)](#dedicated-admin-operations-apiadmin)
  - [Reminders & Broadcasts (`/api/reminders`)](#reminders--broadcasts-apireminders)
  - [User Profile Management (`/api/user`)](#user-profile-management-apiuser)
  - [Health & Diagnostics (`/api/health`)](#health--diagnostics-apihealth)
- [⚙️ Environment Variables](#️-environment-variables)
- [💻 Getting Started Locally](#-getting-started-locally)
  - [Quick Start (Zero-Config In-Memory Mode)](#quick-start-zero-config-in-memory-mode)
  - [Manual Step-by-Step Installation](#manual-step-by-step-installation)
- [🧪 Running Automated System Tests](#-running-automated-system-tests)
- [🐳 Docker Deployment](#-docker-deployment)
- [🚀 Production Deployment Guide](#-production-deployment-guide)
  - [Option A: Fullstack Vercel Deployment (Recommended)](#option-a-fullstack-vercel-deployment-recommended)
  - [Option B: Render Deployment](#option-b-render-deployment)
- [👥 Author & Contact](#-author--contact)

---

## 🌟 Project Overview

**GDG RBU EventHub** is a production-grade developer event management, discovery, and digital pass ticketing platform engineered for **Google Developer Groups on Campus · Shri Ramdeobaba University (GDG RBU)**.

It pairs a high-performance Express.js backend with an interactive React 19 frontend stylized with an authentic **Neo-Brutalism aesthetic** matching the official [gdgrbu.app](https://www.gdgrbu.app) visual identity.

### Why GDG RBU EventHub Stands Out:
1. **Zero Compromise Security:** Plaintext OTPs and passwords are never persisted. Dual-mode authentication incorporates self-hosted cryptographic **HMAC-SHA256 Email OTPs**, `bcryptjs` salted password hashing, 15-minute JWT access tokens, 7-day refresh token rotation with token reuse detection, and cross-origin `httpOnly` secure cookies.
2. **Guaranteed Data Integrity:** Atomic capacity verification, concurrency safety, seat depletion protection, duplicate registration locking, and cascade cleanup upon event deletion.
3. **Private Admin Suite:** Authorized organizers can create, modify, inspect, and delete events with real-time seat lock rules, banner presets/file uploads, paginated attendee check-in rosters, and broadcast announcements.
4. **Instant Scannable Passes:** Generates dynamic cryptographic QR entry tickets with instant download (PNG) and native browser print formatting for physical lanyard badges.
5. **Zero-Config Developer Experience:** Automatically spins up an embedded in-memory MongoDB server if no local MongoDB instance is present, pre-seeding GDG events and accounts out-of-the-box.

---

## ⚡ Complete Feature Breakdown

### 1. Public & Attendee Experience

#### 🏠 Homepage (`/`)
- **Neo-Brutalist 12-Column Hero:** Matches [gdgrbu.app](https://www.gdgrbu.app) styling with retro pixel typography, Google color badges, and high-contrast call-to-actions.
- **Interactive Terminal Simulator:** Live `gdg_rbu_terminal.sh` card executing simulated CLI commands with retro green syntax highlighting and an authentic blinking cursor `█`.
- **Key Community Metrics:** Highlights annual metrics including 12+ Annual Events, 1,000+ Developers, and 100% Free Access.
- **Next Flagship Spotlight:** Direct spotlight card showcasing upcoming flagship summits (e.g. DevFest Nagpur 2026).
- **Featured Upcoming Events Carousel:** Displays top upcoming events with live seat counters and quick registration buttons.
- **Core Technology Tracks:** 4 distinct interactive cards for GDG domains:
  1. *Cloud & DevOps* (Google Cloud, Docker, Kubernetes, Microservices)
  2. *AI & Vertex AI* (Gemini models, prompt design, multimodal agents)
  3. *Android & Flutter* (Kotlin, Jetpack Compose, Flutter, Firebase)
  4. *Modern Web* (Node.js, Express, React 19, TypeScript, Neo-Brutalism)
- **Interactive FAQ Accordion:** Explains registration eligibility, QR entry passes, seat capacity policies, and email reminders.

#### 📅 Event Discovery Directory (`/events`)
- **Real-Time Text Search:** Instant client-debounced search across event title, description, and venue location.
- **Category Filter Pills:** Instant filtering by `All`, `Workshop`, `Hackathon`, `Tech Talk`, `Meetup`, `Conference`, `Bootcamp`, and `Other`.
- **Time Status Filter:** Toggle seamlessly between `Upcoming`, `Past`, or `All` events.
- **Flexible Sorting:** Sort by Date Ascending, Date Descending, Title Alphabetical (A-Z), or Seat Capacity.
- **Live Seat Indicator:** Color-coded badges displaying remaining spots and total confirmed bookings.
- **Server-Side Pagination:** Smooth navigation with Redis-backed caching for sub-millisecond query responses.

#### 🔍 Event Details Page (`/events/:id`)
- **High-Resolution Banner:** Full-width header display with fallback handling.
- **Logistics Breakdown:** Date, time, venue, organizer name, and remaining spots left.
- **Capacity Progress Bar:** Visual indicator showing percentage of booked seats.
- **Confetti Celebration:** Fires a multi-colored Google palette particle burst (`canvas-confetti`) when registration succeeds.
- **One-Click Registration & Cancellation:** Instantly register or cancel, with immediate capacity recalculation.
- **Automated Reminder Button:** Schedule an automated email reminder 24 hours prior to the event start time.
- **One-Click Share:** Copy the direct event link to the system clipboard.
- **Dynamic State Badges:** Displays `PAST EVENT`, `SOLD OUT / FULL`, or `YOU ARE REGISTERED` based on user and event state.

#### 🎟️ Digital Ticket Passes & Dashboard (`/my-events`)
- **Personal Booking Center:** Displays all confirmed registrations for the authenticated user.
- **Dynamic Scannable QR Code:** Contains a cryptographically unique verification payload (`userId`, `eventId`, `title`, `name`, `email`, `date`).
- **Authentic Vintage Ticket Modal:**
  - Classic admission pass styling with tear notches and a perforated divider line.
  - High-contrast, scannable QR code display.
  - **Download Pass:** Downloads ticket as a high-res PNG image (`GDG-Pass-[Title].png`).
  - **Print Pass:** Opens native browser print dialog formatted specifically for badge lanyards and physical check-in desks.
- **One-Click Unregister:** Allows users to cancel registration from their ticket card, instantly returning the seat to the community pool.

---

### 2. Comprehensive Admin Management Portal (`/admin`)

The private administrator portal provides community organizers with total control over events and attendee management.

#### 🛡️ Multi-Layer Admin Authorization & Route Guarding
- **Server-Side Allowlist Enforcement:** Access is strictly bounded by the `ADMIN_EMAILS` environment variable.
- **Dedicated Admin Login Screen:** If an unauthenticated user navigates to `/admin`, a dedicated administrator OTP challenge form is rendered.
- **Custom Access Denied Screen:** If an authenticated non-admin user attempts access, a custom `UNAUTHORIZED ACCESS (ACCESS_DENIED)` screen is rendered, explaining that their account is not in `ADMIN_EMAILS` and offering quick buttons to switch accounts or return home.
- **API Guarding:** All administrative endpoints enforce `protect` and `requireAdmin` middleware, immediately rejecting unauthorized requests with HTTP `403 Forbidden`.

#### 📊 Master-Detail Admin Interface
- **Left Column (Master Event List):**
  - Displays all events in chronological order.
  - Search bar to filter admin events by title, venue, or category.
  - Live attendee count badge for each event (`👥 registrationCount / capacity`).
  - Quick action buttons on each card to **Edit** or **Delete**.
  - One-click selection to load event details and attendee roster in the right pane.
- **Right Column (Event Detail & Attendee Roster):**
  - Full details of the currently selected event with high-res banner preview, venue, date, and description.
  - Live seat calculation badge: `SEATS: X / Y (Remaining: Z)`.
  - Top action bar featuring **+ Add Event**, **Refresh Data**, and **Sign Out**.

#### ➕ Event Creation (Admin Modal)
- **Title & Category:** Text input with category dropdown (`Workshop`, `Hackathon`, `Tech Talk`, `Meetup`, `Conference`, `Bootcamp`, `Other`).
- **Date & Time Picker:** Local datetime picker with ISO 8601 formatting.
- **Venue & Capacity:** Auditorium/Hall name and seat limit (minimum 1).
- **Multiline Description:** Detailed agenda, speaker highlights, and prerequisites.
- **Triple Banner Selection System:**
  1. **Upload from Computer:** Choose any local file (PNG, JPG, WebP up to 5MB); automatically converted to Base64 data URI.
  2. **External Image URL:** Paste any direct web link (e.g. Unsplash or Cloud Storage).
  3. **Quick Tech Presets:** 4 instant pre-styled banners (AI & Cloud, Hackathon & Dev, Mobile & Web, Community Meetup).
  4. Live preview thumbnail with a "Clear Image" button.
- **Automatic Cache Invalidation:** Instantly purges Redis cache pattern `events:*` upon creation.

#### ✏️ Event Modification (Admin Modal)
- Seamless modal allowing editing of title, category, date, venue, capacity, description, and banner image.
- **Strict Capacity Reduction Protection:** Prevents admins from reducing an event's seat capacity below the number of already registered attendees:
  $$\text{New Capacity} \ge \text{Current Confirmed Registrations}$$
  If attempted, the backend rejects with HTTP `400 Bad Request` to protect existing attendee bookings.
- Real-time updates reflected across the entire public platform and admin panel.

#### 🗑️ Event Deletion & Cascade Clean-Up (Danger Zone)
- Dedicated **Danger Zone Modal** requiring explicit confirmation.
- Displays event title and attendee count warning.
- **Cascade Deletion:** Automatically deletes all associated confirmed registration records (`Registration.deleteMany({ event: eventId })`) to prevent orphan records.
- Automatically purges cached listings from Redis.

#### 👥 Live Attendee Inspection & Check-In Roster
- Full registered attendees table with:
  - `#` (Sequential Index & Pagination offset)
  - Attendee Full Name
  - Attendee Registered Email
  - Registration Timestamp (Date & Time formatted)
  - Confirmation Status (`CONFIRMED` badge)
- **Zero-Attendee Empty State:** Friendly dashed box when an event has 0 attendees registered yet.
- **Server-Side Pagination:** Handles large events effortlessly (50 attendees per page with Previous / Next navigation).

#### 📢 Batch Broadcast & Announcements
- Administrators can trigger batch notifications for any event via `POST /api/reminders/broadcast/:eventId` with a custom note, notifying all registered attendees.

#### 📈 Platform Analytics (`GET /api/events/stats`)
- Aggregated insights including:
  - Total events created
  - Total confirmed registrations across the entire platform
  - Upcoming events vs. Past events count
  - Distribution breakdown by category (event count, total capacity, total registered)
  - Top 5 most popular events ranked by attendee count

---

### 3. Dual Authentication & Security Engine

```
       ┌─────────────────────────────────────────────────────────────┐
       │                 User Authentication Choice                  │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
 ┌──────────────────────┐                            ┌──────────────────────┐
 │  Passwordless Email  │                            │   Classic Email &    │
 │       OTP Mode       │                            │    Password Mode     │
 └──────────┬───────────┘                            └──────────┬───────────┘
            │                                                   │
   crypto.randomInt()                                    bcryptjs (salt: 12)
   HMAC-SHA256 Hashing                                   Email verification
   60s Cooldown & 5-Attempt Limit                        Rate limited (40/15m)
            │                                                   │
            └─────────────────────────┬─────────────────────────┘
                                      │
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │       Cryptographic Session Establishment       │
             ├─────────────────────────────────────────────────┤
             │ • Short-Lived Access Token (15-min JWT)         │
             │ • Rotating Refresh Token (7-day cryptographic)  │
             │ • httpOnly, SameSite, Secure Cookies            │
             │ • Session DB Tracking (IP, User-Agent, Revoke)  │
             │ • Automatic Admin Allowlist Sync                │
             └─────────────────────────────────────────────────┘
```

1. **Self-Hosted Passwordless Email OTP:**
   - 6-digit random code generated via `crypto.randomInt(100000, 1000000)`.
   - Salted **HMAC-SHA256** hash storage — plaintext OTPs are **never** stored in the database.
   - Atomically marked consumed (`isUsed: true`) upon verification (immune to replay attacks).
   - Maximum 5 attempts per challenge before automatic invalidation.
   - 60-second cooldown timer between OTP generation requests.
   - Dispatched via Resend API or SMTP (with mock console output fallback during local testing).
2. **Classic Password Authentication:**
   - Secure account registration with `bcryptjs` password hashing (salt rounds: 12).
   - Pre-login email check (`/api/auth/check-email`) that seamlessly redirects unregistered users to signup with email prefilled.
3. **Dual-Token System & Token Rotation:**
   - 15-minute JWT access token + 7-day refresh token stored in MongoDB `Session` collection.
   - Token rotation on every refresh request (`/api/auth/refresh`).
   - Replay attack detection: If an invalidated refresh token is reused, all active sessions for that user are immediately revoked.
   - Cross-domain support: Dual cookie (`gdg_access_token`, `gdg_refresh_token`) and `Authorization: Bearer <token>` support for separate frontend/backend deployments.
4. **Rate Limiting Protection:**
   - Global API limiter: 300 requests per 15-minute window (`/api/*`).
   - Authentication limiter: 40 requests per 15-minute window (`/api/auth/*`).

---

### 4. Neo-Brutalist Visual Design System

The application strictly implements the design system of [gdgrbu.app](https://www.gdgrbu.app):
- **High-Contrast Google Palette:**
  - 🔵 Google Blue: `#4285F4` (Soft: `#E8F0FE`)
  - 🔴 Google Red: `#EA4335` (Soft: `#FCE8E6`)
  - 🟡 Google Yellow: `#FBBC04` (Soft: `#FEF7E0`)
  - 🟢 Google Green: `#34A853` (Soft: `#E6F4EA`)
  - 🟣 GDG Purple: `#7C3AED`
- **Brutalist Border & Shadows:** Bold solid black borders (`2px - 3px solid #000000`) paired with sharp offset drop shadows (`4px 4px 0px #000000`, `8px 8px 0px #000000`).
- **Typography:**
  - Headers: Retro pixel styling (`'Press Start 2P'`, cursive/pixel display).
  - Code & Logistics: Technical monospace (`Space Mono`, monospace).
  - Body Text: Clean readability (`Inter`, `Outfit`, sans-serif).
- **Micro-Animations & Delighters:**
  - Tactile button press displacement (`transform: translate(2px, 2px)` on active).
  - Celebratory confetti burst on event booking (`canvas-confetti`).
  - Ticket tear notch cutouts and dashed perforation dividers.
  - Custom retro Preloader with spinning brand icon.
  - Branded retro 404 page with return routing.

---

### 5. Performance, Caching & Resilience

- **Redis Caching Layer:** Public event queries (`/api/events`) are cached in Redis with a 60-second TTL.
- **Intelligent Cache Invalidation:** The cache pattern `events:*` is automatically purged whenever an event is created, updated, or deleted, or when registrations change.
- **In-Memory Redis Fallback:** If Redis is offline or not installed, the application automatically falls back to an in-memory cache without errors or performance drops.
- **Embedded In-Memory MongoDB:** If no local MongoDB service is running, the backend boots an embedded in-memory MongoDB server via `mongodb-memory-server` and automatically seeds sample events and accounts.

---

## 🏗️ System Architecture & Directory Structure

```
gdg-eventhub/
├── 404.html                     # Standalone fallback 404 page
├── api/
│   └── index.js                 # Vercel Serverless Function entrypoint
├── backend/
│   ├── config/
│   │   ├── db.js                # MongoDB connection (with in-memory fallback)
│   │   └── redis.js             # Redis client & transparent cache layer
│   ├── middleware/
│   │   └── auth.js              # JWT verification, Admin allowlist guard
│   ├── models/
│   │   ├── Event.js             # Event schema with category enums & capacity
│   │   ├── Otp.js               # HMAC-SHA256 hashed OTP challenges
│   │   ├── Registration.js      # Event attendee records with QR passes
│   │   ├── Reminder.js          # Scheduled attendee reminder records
│   │   ├── Session.js           # Refresh token sessions with revocation
│   │   └── User.js              # User profiles with bcrypt password hashing
│   ├── routes/
│   │   ├── admin.js             # Dedicated administrative operations
│   │   ├── auth.js              # OTP, password login, refresh rotation, logout
│   │   ├── events.js            # Public event browsing, details, admin CRUD
│   │   ├── registrations.js     # Event booking, unregister, QR pass generation
│   │   ├── reminders.js         # Event reminder scheduling & broadcasts
│   │   └── user.js              # User profile retrieval and updating
│   ├── services/
│   │   └── emailService.js      # Resend API & SMTP email dispatching
│   ├── tests/
│   │   └── system.test.js       # Comprehensive test suite (38 assertions)
│   ├── utils/
│   │   └── security.js          # HMAC-SHA256, token generation, admin checks
│   ├── Dockerfile               # Production backend container definition
│   ├── seed.js                  # Database seeder script
│   └── server.js                # Express app entrypoint, rate limiters, CORS
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js         # Axios instance with credentials & Bearer headers
│   │   ├── components/
│   │   │   ├── EventCard.jsx    # Brutalist event card with seat progress
│   │   │   ├── Footer.jsx       # Google Developer Groups branded footer
│   │   │   ├── Navbar.jsx       # Navigation with auth status & role badges
│   │   │   ├── Preloader.jsx    # Retro branded loading animation
│   │   │   ├── ProtectedRoute.jsx # Route authentication guard
│   │   │   └── QRModal.jsx      # Vintage scannable ticket modal (Print/Download)
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state, OTP, sessions, refresh
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx # Master-detail admin event & attendee portal
│   │   │   ├── EventDetails.jsx # Detailed event logistics & registration
│   │   │   ├── Events.jsx       # Searchable, filterable event directory
│   │   │   ├── Home.jsx         # Neo-brutalist landing page with terminal simulator
│   │   │   ├── Login.jsx        # Dual-mode login (Email OTP or Password)
│   │   │   ├── MyEvents.jsx     # User dashboard with QR passes
│   │   │   ├── NotFound.jsx     # 404 error page
│   │   │   └── Register.jsx     # Account creation with OTP verification
│   │   ├── App.jsx              # Client router and toast notifications
│   │   ├── index.css            # Neo-Brutalism design system & utility classes
│   │   └── main.jsx             # React 19 root bootstrap
│   ├── Dockerfile               # Production frontend container
│   ├── vercel.json              # Client routing rewrites
│   └── vite.config.js           # Vite 8 bundler configuration
├── docker-compose.yml           # Multi-service composition (Node, React, Mongo, Redis)
├── package.json                 # Monorepo scripts & dependencies
├── render.yaml                  # Render deployment configuration
└── vercel.json                  # Unified fullstack Vercel routing rules
```

---

## 🗄️ Database Schemas & Data Models

### 1. `User` Schema
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trimmed | Full display name of the user |
| `email` | String | Required, Unique, Lowercase | User email address |
| `password` | String | Optional, Selected: false | Bcrypt hashed password (salt: 12) |
| `role` | String | Enum: `['user', 'admin']` | User permissions role |
| `avatar` | String | Optional | Avatar image URL |
| `authProvider` | String | Enum: `['otp', 'local', 'google']` | Initial signup authentication method |
| `emailVerified` | Boolean | Default: `true` | Verified email status |
| `emailVerifiedAt`| Date | Optional | Timestamp of email verification |

### 2. `Event` Schema
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Required, Trimmed | Title of the event |
| `description` | String | Required | Full multiline event agenda and prerequisites |
| `date` | Date | Required | Scheduled event date and time |
| `venue` | String | Required | Location or auditorium on campus |
| `capacity` | Number | Required, Min: 1 | Maximum allowable attendees |
| `category` | String | Enum: `['Workshop', 'Hackathon', 'Tech Talk', 'Meetup', 'Conference', 'Bootcamp', 'Other']` | Classification |
| `registrationCount`| Number | Default: 0 | Live count of confirmed attendees |
| `image` | String | Optional | Banner image data URI or external URL |
| `createdBy` | ObjectId | Ref: `User` | Admin user who published the event |

### 3. `Registration` Schema
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `user` | ObjectId | Ref: `User`, Required | Registered user reference |
| `event` | ObjectId | Ref: `Event`, Required | Target event reference |
| `qrCode` | String | Required | Base64 PNG data URI of dynamic scannable QR pass |
| `status` | String | Enum: `['confirmed', 'cancelled']` | Registration status |
| *Indexes* | Compound | `{ user: 1, event: 1 }` | Prevents duplicate active registrations |

### 4. `Otp` Schema
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Required, Lowercase | Recipient email address |
| `otpHash` | String | Required | Salted HMAC-SHA256 hash of the 6-digit code |
| `attempts` | Number | Default: 0, Max: 5 | Failed verification attempt counter |
| `isUsed` | Boolean | Default: false | Consumption flag (replay attack prevention) |
| `expiresAt` | Date | Required (10 min TTL) | Expiration timestamp |

### 5. `Session` Schema
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `user` | ObjectId | Ref: `User`, Required | User reference |
| `refreshTokenHash` | String | Required | Cryptographic hash of the refresh token |
| `isRevoked` | Boolean | Default: false | Invalidation flag |
| `expiresAt` | Date | Required (7 days) | Session expiry |
| `userAgent` | String | Optional | Client browser User-Agent |
| `ipAddress` | String | Optional | Request client IP |

---

## 🔌 Complete REST API Reference

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/check-email` | Public | Check if email is already registered before login |
| `POST` | `/api/auth/request-otp` | Public | Request a cryptographically secure 6-digit email OTP |
| `POST` | `/api/auth/send-otp` | Public | Alias for `request-otp` for backwards compatibility |
| `POST` | `/api/auth/verify-otp` | Public | Verify 6-digit OTP, establish session, issue tokens |
| `POST` | `/api/auth/login` | Public | Traditional password sign-in with bcrypt verification |
| `POST` | `/api/auth/register` | Public | Traditional account registration with password |
| `POST` | `/api/auth/refresh` | Cookie | Rotate refresh token and issue new 15-minute access token |
| `POST` | `/api/auth/logout` | Authenticated | Revoke refresh session and clear `httpOnly` cookies |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile and admin status |

### Public & Protected Events (`/api/events`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | List events with search, category filter, sort & pagination |
| `GET` | `/api/events/:id` | Public | Retrieve single event details with live spots remaining |
| `POST` | `/api/events` | Admin Only | Create a new event and invalidate Redis cache |
| `PUT` | `/api/events/:id` | Admin Only | Update an event (validates capacity $\ge$ current attendees) |
| `DELETE`| `/api/events/:id` | Admin Only | Permanently delete event and cascade remove registrations |
| `GET` | `/api/events/stats` | Admin Only | Platform statistics, popular events, and category metrics |

### Registrations & Passes (`/api/registrations`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/registrations/events/:id/register` | Authenticated | Register for an event, verify capacity, generate QR pass |
| `DELETE`| `/api/registrations/events/:id/unregister` | Authenticated | Cancel registration and restore capacity spot |
| `GET` | `/api/registrations/my-events` | Authenticated | Retrieve all events registered by the current user with QR passes |
| `GET` | `/api/registrations/check/:eventId` | Authenticated | Check if current user is confirmed for a specific event |

### Dedicated Admin Operations (`/api/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/events` | Admin Only | Get all events with live confirmed attendee counts |
| `GET` | `/api/admin/events/:eventId/registrations` | Admin Only | Get paginated attendee list for an event (`page`, `limit`) |
| `POST` | `/api/admin/events` | Admin Only | Create event alias |
| `PUT` | `/api/admin/events/:eventId` | Admin Only | Update event alias |
| `DELETE`| `/api/admin/events/:eventId` | Admin Only | Delete event alias |

### Reminders & Broadcasts (`/api/reminders`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reminders/:eventId` | Authenticated | Schedule an automated reminder 24 hours prior to event |
| `GET` | `/api/reminders/my-reminders` | Authenticated | Retrieve current user's active reminders |
| `DELETE`| `/api/reminders/:eventId` | Authenticated | Cancel a scheduled event reminder |
| `POST` | `/api/reminders/broadcast/:eventId` | Admin Only | Broadcast batch reminder notification to all registered attendees |

### User Profile Management (`/api/user`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/profile` | Authenticated | Get current user's account details and admin status |
| `PATCH`| `/api/user/profile` | Authenticated | Update allowed profile fields (name, avatar) |

### Health & Diagnostics (`/api/health`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Real-time healthcheck for MongoDB, Redis, rate-limiter, uptime |

---

## ⚙️ Environment Variables

Create a `.env` file inside `backend/` based on `backend/.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Connection (MongoDB Atlas in production, local in dev)
# Leave blank to automatically use embedded in-memory MongoDB!
MONGODB_URI=mongodb://localhost:27017/gdg-eventhub

# Security & Cryptographic Keys (Use 32+ character strings in production)
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_min_32_chars
OTP_HASH_SECRET=your_super_secret_otp_hash_key_min_32_chars
JWT_SECRET=fallback_jwt_secret_key
JWT_ACCESS_EXPIRE=15m

# Admin Authorization Allowlist (Comma-separated emails)
ADMIN_EMAILS=selotechaitanya09@gmail.com,admin@gdgrbu.app,your_email@gmail.com

# Email Delivery: Resend API (Recommended)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM="GDG RBU EventHub" <onboarding@resend.dev>

# Optional SMTP Fallback (Gmail App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password

# Optional Redis Connection (Falls back to in-memory cache if omitted)
REDIS_URL=redis://localhost:6379
```

---

## 💻 Getting Started Locally

### Quick Start (Zero-Config In-Memory Mode)

The project includes an automatic **In-Memory MongoDB fallback**. If you do not have MongoDB or Redis installed locally, the backend automatically boots an in-memory database and auto-seeds sample GDG events and accounts!

```bash
# 1. Clone the repository
git clone https://github.com/selotechaitanya-svg/gdgback.git
cd gdgback

# 2. Install all dependencies across root, backend, and frontend
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# 3. Start fullstack development servers concurrently
npm run dev
```

- **Frontend App:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **System Healthcheck:** http://localhost:5000/api/health
- **Admin Management Portal:** http://localhost:5173/admin

---

### Manual Step-by-Step Installation

#### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env   # Configure your environment variables
npm run seed          # Seeds sample events and accounts into MongoDB
npm run dev           # Runs backend with Node --watch
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev           # Starts Vite dev server on port 5173
```

---

## 🧪 Running Automated System Tests

The repository includes a standalone security and business logic test suite validating all 38 system criteria:

```bash
cd backend
npm test
```

### Test Coverage (38 Tests, 0 Failed):
- ✅ **Cryptographic OTP Integrity:** 6-digit generation and HMAC-SHA256 salted hashing
- ✅ **Zero Plaintext Leakage:** Plaintext OTP is never returned in API payloads or persisted in DB
- ✅ **Brute-Force Invalidation:** Automatic invalidation after 5 incorrect verification attempts
- ✅ **Request Cooldown:** 60-second rate-limit between consecutive OTP requests
- ✅ **Replay Attack Prevention:** Single-use token consumption marks challenges consumed
- ✅ **Token Lifecycle:** 15-minute JWT access tokens and 7-day refresh token rotation
- ✅ **Admin Allowlist Guarding:** Server-side verification against `ADMIN_EMAILS`
- ✅ **Boundary Conditions:** HTTP 401 Unauthorized and 403 Forbidden enforcement
- ✅ **Capacity Lock Rules:** Rejection of capacity reductions below confirmed registrations
- ✅ **Duplicate Registrations:** Prevention of multiple active bookings by the same user

---

## 🐳 Docker Deployment

Run the complete multi-service architecture (Frontend, Backend, MongoDB, Redis) with a single command:

```bash
docker-compose up --build
```

- **Frontend Application:** http://localhost:3000
- **Backend REST API:** http://localhost:5000
- **MongoDB Database:** `localhost:27017`
- **Redis Cache:** `localhost:6379`
- **Stop Containers:** `docker-compose down`

---

## 🚀 Production Deployment Guide

### Option A: Fullstack Vercel Deployment (Recommended)

You can host both the **React Frontend** and **Express API** on **Vercel** under **one single URL** with zero CORS complexity:

1. Import the repository (`selotechaitanya-svg/gdgback`) in [Vercel Dashboard](https://vercel.com/new).
2. Add the following **Environment Variables** in Vercel project settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `NODE_ENV`: `production`
   - `JWT_ACCESS_SECRET`: 32+ character random secret
   - `JWT_REFRESH_SECRET`: 32+ character random secret
   - `OTP_HASH_SECRET`: 32+ character random secret
   - `ADMIN_EMAILS`: `selotechaitanya09@gmail.com,admin@gdgrbu.app`
3. Click **Deploy**! Vercel automatically maps `/api/*` to the Express backend and all other routes to the React 19 SPA via [`vercel.json`](vercel.json).

---

### Option B: Render Deployment

1. Create a **New Web Service** on [Render](https://dashboard.render.com/).
2. Connect your GitHub repository.
3. Configure the service:
   - **Build Command:** `npm run build:render`
   - **Start Command:** `npm start`
4. Add the environment variables from `.env` and click **Deploy**.

---

## 👥 Author & Contact

- **Chaitanya Selote** — Full Stack Developer & UI/UX Designer
  - **Phone:** `+91 9699910273`
  - **Email:** `selotechaitanya09@gmail.com`
  - **Portfolio:** [chaitanyaportfoliov2.vercel.app](https://chaitanyaportfoliov2.vercel.app/)

---

<div align="center">
  <strong>Built with ❤️ by Chaitanya Selote</strong>
</div>
