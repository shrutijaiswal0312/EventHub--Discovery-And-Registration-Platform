# EventHub – Event Discovery & Registration Platform

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application engineered for college and university event orchestration. EventHub provides dual-role access control for **Event Participants** and **Event Organizers**, featuring real-time event discovery, atomic concurrency-safe seat reservation, dynamic occupancy charts, and private virtual meeting credential management.

---

## Key Highlights

- **Dual-Role Ecosystem:** Dedicated portal experiences for Participants (discovery, seat reservation, personal history) and Organizers (event CRUD, attendance roster, analytical dashboards).
- **Concurrency & Overbooking Prevention:** Uses MongoDB atomic conditional modification (`findOneAndUpdate` with `$expr`) to prevent ticket overbooking under simultaneous requests.
- **Dynamic Data Visualization:** Real-time occupancy gauges, bar charts, and category distribution pie charts built with Recharts.
- **Seat Lifecycle Integrity:** Cancelling a reservation automatically increments available seats back to the venue quota. Re-registering reactivates the previous record without creating duplicate documents.
- **Security & Privacy:** Passwords hashed with bcryptjs (10 rounds); JWT-based authentication via HttpOnly cookies and Bearer tokens; protected virtual meeting URLs revealed exclusively to confirmed attendees; Helmet security headers; rate limiting on authentication routes.
- **100% Automated Test Coverage:** 21 backend integration & concurrency tests (Jest + Supertest) and 6 frontend component tests (Vitest + RTL) executing with 100% pass rates.
- **Comprehensive Academic Report:** Ready for submission in both Markdown (`docs/College_Project_Report.md`) and formatted Microsoft Word (`docs/College_Project_Report.docx`).

---

## Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS with modern SaaS color palette (Navy & Violet)
- **Icons:** Lucide React
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios (centralized interceptors with token & cookie credentials)
- **Charts:** Recharts
- **Notifications:** React Hot Toast
- **Testing:** Vitest, React Testing Library, JSDOM

### Backend
- **Runtime:** Node.js (v18+ / v24+)
- **Framework:** Express.js 4
- **Database:** MongoDB Community Server (via Mongoose ODM 8)
- **Authentication:** JSON Web Tokens (jsonwebtoken) & bcryptjs
- **Validation:** Express-Validator
- **Security:** Helmet, CORS, Express-Rate-Limit, Cookie-Parser
- **Testing:** Jest 29, Supertest 7

---

## Prerequisites

Before starting, ensure you have the following installed on your system:

1. **Node.js:** v18.0.0 or higher (`node -v`)
2. **npm:** v9.0.0 or higher (`npm -v`)
3. **MongoDB:** MongoDB Community Server running locally on port 27017 (`mongodb://127.0.0.1:27017`)
4. **Python (Optional):** Python 3.8+ with `python-docx` for regenerating DOCX reports

---

## Project Structure

```
Event Discovery & Registration Platform/
├── client/                     # Frontend React + Vite Application
│   ├── src/
│   │   ├── components/         # Common components, Navbar, Footer, Badges, Cards
│   │   ├── context/            # AuthContext (JWT & user state management)
│   │   ├── pages/              # Public, Auth, Participant, and Organizer pages
│   │   ├── services/           # Axios API services (auth, events, registrations)
│   │   ├── test/               # Vitest component test suites
│   │   ├── App.jsx             # Router layout & route definitions
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind CSS directives
│   ├── vite.config.js          # Vite configuration & proxy
│   └── package.json
│
├── server/                     # Backend Node.js & Express REST API
│   ├── src/
│   │   ├── config/             # MongoDB connection handler
│   │   ├── controllers/        # Auth, Event, Registration, and Dashboard controllers
│   │   ├── middleware/         # JWT verification, Role authorization, Error handler
│   │   ├── models/             # User, Event, and Registration Mongoose models
│   │   ├── routes/             # REST API endpoint route definitions
│   │   ├── seed/               # Realistic development demo database seed script
│   │   ├── validators/         # Express-validator schema pipelines
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server entry point
│   ├── tests/                  # Jest & Supertest integration test suites
│   └── package.json
│
├── docs/                       # Project Documentation & Academic Report
│   ├── College_Project_Report.md   # Full 38-section academic project report
│   ├── College_Project_Report.docx # Formatted Word Document for submission
│   ├── API_Documentation.md        # Complete REST API specification
│   ├── Database_Design.md          # ER diagrams, schemas, and atomic lock details
│   ├── Testing_Report.md           # QA test execution matrix & pass results
│   └── generate_docx.py            # DOCX generation utility script
│
├── package.json                # Root orchestration scripts
├── .env.example                # Global environment configuration template
└── README.md                   # This project guide
```

---

## Step-by-Step Installation & Setup

### 1. Clone or Extract the Project
Open PowerShell or your terminal in the project directory:
```bash
cd "Event Discovery & Registration Platform"
```

### 2. Configure Environment Files
Environment files are already created for local development, but you can review them:

**Server (`server/.env`):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/eventhub_db
MONGODB_TEST_URI=mongodb://127.0.0.1:27017/eventhub_test_db
JWT_SECRET=eventhub_super_secret_jwt_key_academic_2026_dev
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
COOKIE_SECURE=false
```

**Client (`client/.env`):**
```env
VITE_API_URL=/api
```

### 3. Install Dependencies
Install dependencies for root, backend, and frontend:
```bash
# In root:
npm install

# In server:
cd server && npm install && cd ..

# In client:
cd client && npm install && cd ..
```

---

## Seeding the Database

EventHub comes with a comprehensive seed script that clears and populates MongoDB with realistic events (upcoming, full, past, and cancelled), multiple organizers, and registered attendees:

```bash
# Run from root:
npm run seed

# Or run directly from server:
cd server && npm run seed
```

---

## Demo Accounts & Test Credentials

The database seed script sets up pre-configured accounts with password `Password123!`:

| Role | Name | Email | Password | Purpose / Notes |
|---|---|---|---|---|
| **Organizer** | Alex Vance | `organizer@eventhub.com` | `Password123!` | Primary host with multiple events, occupancy charts, and attendee rosters |
| **Organizer** | Sarah Connor | `sarah.organizer@eventhub.com` | `Password123!` | Secondary organizer to demonstrate ownership isolation |
| **Participant** | John Doe | `john@example.com` | `Password123!` | Active attendee with multiple upcoming registrations |
| **Participant** | Emma Watson | `emma@example.com` | `Password123!` | Attendee with active registrations and 1 cancelled seat (test reactivation) |
| **Participant** | Michael Chang | `michael@example.com` | `Password123!` | Attendee registered for full workshop |
| **Participant** | Sophia Rodriguez | `sophia@example.com` | `Password123!` | Attendee registered for summit |

> **Evaluator Tip:** The Sign In page (`/login`) includes convenient **"Demo Participant"** and **"Demo Organizer"** quick-fill buttons for immediate one-click testing without typing.

---

## Running the Application

### Option A: Simultaneous Dev Server (Recommended)
From the root workspace directory, launch both backend and frontend concurrently:
```bash
npm run dev
```

### Option B: Separate Terminals

**Terminal 1 — Backend API Server:**
```bash
cd server
npm start
# Server listens at http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

**Terminal 2 — Frontend Client:**
```bash
cd client
npm run dev
# Vite dev server runs at http://localhost:5173
```

Now open your web browser and navigate to:
👉 **`http://localhost:5173`**

---

## Running Automated Tests

EventHub includes automated test suites covering authentication, event CRUD, ownership permissions, capacity boundaries, participant isolation, and high-concurrency race conditions.

### Run Backend Integration & Concurrency Tests:
```bash
cd server
npm test
```
*Executes all 21 test cases in `tests/auth.test.js`, `tests/events.test.js`, `tests/registration.test.js`, and `tests/concurrency.test.js`.*

### Run Frontend Component Tests:
```bash
cd client
npm test
```
*Executes all 6 tests in `src/test/Badge.test.jsx`, `src/test/EventCard.test.jsx`, and `src/test/LoginPage.test.jsx` using Vitest.*

### Run Production Build:
```bash
cd client
npm run build
```
*Verifies TypeScript/JSX syntax, compiles CSS, and creates optimized assets in `client/dist`.*

---

## REST API Endpoint Summary

| HTTP Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System uptime & database connection check |
| `POST` | `/api/auth/register` | Public | Register new user as participant or organizer |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `POST` | `/api/auth/logout` | Public | Invalidate cookie session |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session profile |
| `GET` | `/api/events` | Public | Discover events with search, category & date filters |
| `GET` | `/api/events/:id` | Public | Event details (meeting URL protected) |
| `POST` | `/api/events` | Organizer | Create & publish new event |
| `PUT` | `/api/events/:id` | Organizer (Owner) | Update event (capacity floor enforced) |
| `PATCH` | `/api/events/:id/cancel` | Organizer (Owner) | Cancel event |
| `POST` | `/api/events/:id/register` | Participant | Atomic concurrency-safe seat registration |
| `DELETE` | `/api/events/:id/register` | Participant | Cancel registration & release seat |
| `GET` | `/api/registrations/my` | Participant | View attendee's registered & past events |
| `GET` | `/api/organizer/events` | Organizer | List events created by logged-in organizer |
| `GET` | `/api/organizer/events/:id/participants`| Organizer (Owner) | View attendee roster with status & timestamps |
| `GET` | `/api/organizer/dashboard/stats` | Organizer | Computed event statistics & Recharts data |
| `GET` | `/api/participant/dashboard/stats` | Participant | Personalized attendance summary |

---

## Troubleshooting Guide

1. **MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`):**
   - Ensure the MongoDB service is active. On Windows, check Services or run:
     ```powershell
     Get-Service -Name "*mongo*"
     Start-Service -Name "MongoDB"
     ```
2. **Port 5000 or 5173 in use:**
   - Modify the `PORT` variable in `server/.env` or Vite port in `client/vite.config.js`.
3. **CORS or Cookie Issues in Browser:**
   - Both `Authorization: Bearer <token>` and HttpOnly cookies are supported. If using a third-party client (e.g. Postman), pass the token in the `Authorization` header.
4. **Vite Build / Import Issues:**
   - Run `npm run build` in `client/` to verify bundling.

---

## College Academic Project Documentation

The project includes formal, submission-ready academic documentation in the `docs/` folder:

- **Academic Report (Markdown):** [`docs/College_Project_Report.md`](docs/College_Project_Report.md)
  *Includes all 38 academic sections, cover page, certificates, DFDs, ERDs, use-case diagrams, module descriptions, and test results.*
- **Academic Report (Word DOCX):** [`docs/College_Project_Report.docx`](docs/College_Project_Report.docx)
  *Formatted document ready for printing, submission, and student detail completion.*
- **API Specification:** [`docs/API_Documentation.md`](docs/API_Documentation.md)
- **Database Architecture:** [`docs/Database_Design.md`](docs/Database_Design.md)
- **QA Test Report:** [`docs/Testing_Report.md`](docs/Testing_Report.md)

---

## License

This project was developed for academic coursework and capstone project submission. Free to use for educational and learning purposes.
