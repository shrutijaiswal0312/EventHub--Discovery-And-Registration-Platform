# EventHub – REST API Specification & Endpoint Documentation

This document describes all RESTful API endpoints exposed by the EventHub backend service. The API uses JSON format for requests and responses, implements standard HTTP status codes, supports JWT bearer authentication and HttpOnly cookies, and includes rate-limiting and input validation.

---

## Base URL & General Configuration

- **Development Base URL:** `http://localhost:5000/api`
- **Proxy Client URL:** `http://localhost:5173/api`
- **Standard Header:** `Content-Type: application/json`
- **Authentication Header:** `Authorization: Bearer <jwt_token>` (or HttpOnly `token` cookie)

---

## Standard Response Structure

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Primary error explanation",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific validation constraint message"
    }
  ]
}
```

---

## 1. System Health Endpoint

### `GET /api/health`
Checks the backend runtime status and MongoDB connectivity.

- **Access:** Public
- **Response `200 OK`:**
```json
{
  "status": "healthy",
  "environment": "development",
  "uptimeSeconds": 360,
  "database": "connected",
  "timestamp": "2026-10-13T01:00:00.000Z"
}
```

---

## 2. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new account with either `participant` or `organizer` role.

- **Access:** Public (Rate-limited: max 30 attempts per 15 min)
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!",
  "role": "participant"
}
```
- **Validation Rules:**
  - `name`: String, 2-100 characters.
  - `email`: Valid RFC 5322 email string.
  - `password`: Minimum 6 characters.
  - `role`: Optional enum `['participant', 'organizer']` (defaults to `participant`).
- **Response `201 Created`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "670b134a6e87f7a1928341b1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "participant"
  }
}
```
- **Error `400 Bad Request`:** Duplicate email or malformed input.

---

### `POST /api/auth/login`
Authenticates a user and issues a JWT token.

- **Access:** Public (Rate-limited: max 30 attempts per 15 min)
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "670b134a6e87f7a1928341b1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "participant"
  }
}
```
- **Error `401 Unauthorized`:** Invalid email or password.

---

### `POST /api/auth/logout`
Clears the session cookie.

- **Access:** Public / Authenticated
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Successfully logged out."
}
```

---

### `GET /api/auth/me`
Retrieves currently authenticated session profile.

- **Access:** Private (Participant or Organizer)
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "success": true,
  "user": {
    "id": "670b134a6e87f7a1928341b1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "participant",
    "createdAt": "2026-10-13T00:59:00.000Z"
  }
}
```
- **Error `401 Unauthorized`:** Token missing, expired, or invalid.

---

## 3. Event Discovery & Management Endpoints (`/api/events`)

### `GET /api/events`
Lists events with full-text search, multi-facet filtering, sorting, and pagination.

- **Access:** Public (Optional auth context)
- **Query Parameters:**
  - `search` (String): Search string matched against title, description, and location.
  - `category` (String): Filter by category (`Technology`, `Workshop`, `Business`, `Webinar`, etc.).
  - `dateFilter` (String): `all`, `today`, `upcoming`, `past`.
  - `eventType` (String): `all`, `online`, `offline`.
  - `sort` (String): `date_asc`, `date_desc`, `created_desc`, `capacity_desc`.
  - `page` (Integer): Page number (defaults to 1).
  - `limit` (Integer): Records per page (defaults to 9).
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 6,
  "total": 6,
  "totalPages": 1,
  "currentPage": 1,
  "events": [
    {
      "_id": "670b134a6e87f7a1928341b2",
      "title": "Global AI & Machine Learning Summit 2026",
      "description": "Explore the newest breakthroughs in generative models...",
      "category": "Technology",
      "date": "2026-10-27T00:00:00.000Z",
      "startTime": "09:00 AM",
      "endTime": "05:30 PM",
      "location": "Metropolitan Convention Center, Hall A, San Francisco, CA",
      "eventType": "offline",
      "coverImage": "https://images.unsplash.com/photo-1540575467063-178a50c2df87...",
      "capacity": 50,
      "registeredCount": 2,
      "remainingSeats": 48,
      "isFull": false,
      "status": "published",
      "organizer": {
        "_id": "670b134a6e87f7a1928341b0",
        "name": "Alex Vance",
        "email": "organizer@eventhub.com"
      }
    }
  ]
}
```

---

### `GET /api/events/:id`
Retrieves single event details. Protects private virtual meeting URLs for unauthorized visitors.

- **Access:** Public (Optional auth context)
- **Parameters:** `id` (MongoDB ObjectId)
- **Response `200 OK`:**
```json
{
  "success": true,
  "event": {
    "_id": "670b134a6e87f7a1928341b2",
    "title": "Full-Stack Web Development Masterclass",
    "description": "An intensive, hands-on workshop covering MERN architecture...",
    "category": "Workshop",
    "date": "2026-10-20T00:00:00.000Z",
    "startTime": "10:00 AM",
    "endTime": "02:00 PM",
    "location": "Online Live Stream",
    "eventType": "online",
    "meetingUrl": "https://meet.google.com/abc-efgh-ijk",
    "capacity": 3,
    "registeredCount": 3,
    "remainingSeats": 0,
    "isFull": true,
    "status": "published",
    "organizer": { ... }
  },
  "isUserRegistered": true,
  "registrationDetails": { ... },
  "isOwner": false
}
```

---

### `POST /api/events`
Creates and publishes a new event.

- **Access:** Private (Organizer role required)
- **Request Body:**
```json
{
  "title": "Quantum Computing Seminar",
  "description": "Foundational introduction to qubits, superpositions, and quantum gate algorithms.",
  "category": "Technology",
  "date": "2026-11-15",
  "startTime": "09:00 AM",
  "endTime": "01:00 PM",
  "location": "Physics Auditorium, Cambridge, MA",
  "eventType": "offline",
  "capacity": 40,
  "coverImage": "https://images.unsplash.com/..."
}
```
- **Response `201 Created`:** Returns newly created populated event document.
- **Error `400 Bad Request`:** Missing required fields, invalid date/time order (`endTime <= startTime`).
- **Error `403 Forbidden`:** Requesting user is not an organizer.

---

### `PUT /api/events/:id`
Updates an existing event owned by the authenticated organizer.

- **Access:** Private (Organizer role required, ownership strictly enforced)
- **Request Body:** Partial or complete event fields.
- **Critical Business Rule:** `capacity` cannot be reduced below current active registrations (`registeredCount`).
- **Response `200 OK`:** Returns updated event document.
- **Error `400 Bad Request`:** Attempted capacity reduction below existing reservations.
- **Error `403 Forbidden`:** Organizer does not own this event.

---

### `PATCH /api/events/:id/cancel`
Cancels an event. Prevents new registrations while preserving registration history.

- **Access:** Private (Organizer role required, ownership strictly enforced)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Event has been cancelled successfully",
  "event": {
    "_id": "670b134a6e87f7a1928341b2",
    "status": "cancelled"
  }
}
```

---

## 4. Registration Endpoints

### `POST /api/events/:id/register`
Registers the logged-in participant for an event using atomic capacity locking.

- **Access:** Private (Participant role required)
- **Concurrency Guarantee:** Uses MongoDB conditional atomic reservation (`findOneAndUpdate` with `$expr: { $lt: ['$registeredCount', '$capacity'] }`).
- **Re-registration Lifecycle:** If the participant previously cancelled, the existing record is reactivated rather than duplicated.
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Registration successful! Your seat has been confirmed.",
  "registration": {
    "_id": "670b134a6e87f7a1928341c5",
    "participant": "670b134a6e87f7a1928341b1",
    "event": "670b134a6e87f7a1928341b2",
    "status": "registered",
    "registeredAt": "2026-10-13T01:10:00.000Z"
  },
  "event": {
    "id": "670b134a6e87f7a1928341b2",
    "title": "Quantum Computing Seminar",
    "capacity": 40,
    "registeredCount": 1,
    "remainingSeats": 39
  }
}
```
- **Error `400 Bad Request`:**
  - Event is at full capacity (`Event is already at full capacity`).
  - Participant already actively registered (`You are already actively registered for this event`).
  - Event is cancelled (`This event has been cancelled and is not accepting registrations`).
  - Event has already occurred (`Cannot register for an event that has already occurred`).
  - Organizer attempts to register for their own event (`Organizers cannot register as participants for their own events`).

---

### `DELETE /api/events/:id/register`
Cancels an active registration and atomically releases the reserved seat.

- **Access:** Private (Participant role required)
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Registration cancelled successfully. Your seat has been released.",
  "registration": {
    "_id": "670b134a6e87f7a1928341c5",
    "status": "cancelled",
    "cancelledAt": "2026-10-13T01:15:00.000Z"
  },
  "event": {
    "id": "670b134a6e87f7a1928341b2",
    "title": "Quantum Computing Seminar",
    "capacity": 40,
    "registeredCount": 0,
    "remainingSeats": 40
  }
}
```

---

### `GET /api/registrations/my`
Retrieves all registrations belonging to the authenticated participant.

- **Access:** Private (Participant role required)
- **Query Parameters:**
  - `status`: `all`, `registered`, `cancelled`
  - `timeline`: `all`, `upcoming`, `past`
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 2,
  "registrations": [
    {
      "_id": "670b134a6e87f7a1928341c5",
      "status": "registered",
      "registeredAt": "2026-10-13T01:10:00.000Z",
      "event": {
        "_id": "670b134a6e87f7a1928341b2",
        "title": "Global AI Summit 2026",
        "category": "Technology",
        "date": "2026-10-27T00:00:00.000Z",
        "startTime": "09:00 AM",
        "endTime": "05:30 PM",
        "location": "Metropolitan Convention Center",
        "eventType": "offline",
        "capacity": 50,
        "registeredCount": 2,
        "remainingSeats": 48
      }
    }
  ]
}
```

---

## 5. Organizer Management Endpoints (`/api/organizer`)

### `GET /api/organizer/events`
Retrieves all events created by the logged-in organizer with pagination and search.

- **Access:** Private (Organizer role required)
- **Query Parameters:** `search`, `status`, `page`, `limit`
- **Response `200 OK`:** Paginated listing of owned events.

---

### `GET /api/organizer/events/:id/participants`
Retrieves full attendee roster for an event owned by the organizer.

- **Access:** Private (Organizer role required, ownership strictly enforced)
- **Query Parameters:**
  - `search` (String): Filter by attendee name or email.
  - `status` (String): `all`, `registered`, `cancelled`.
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 3,
  "event": {
    "id": "670b134a6e87f7a1928341b2",
    "title": "Full-Stack Web Development Masterclass",
    "capacity": 3,
    "registeredCount": 3,
    "remainingSeats": 0,
    "status": "published"
  },
  "participants": [
    {
      "_id": "670b134a6e87f7a1928341c1",
      "status": "registered",
      "registeredAt": "2026-10-10T14:00:00.000Z",
      "participant": {
        "_id": "670b134a6e87f7a192834199",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```
- **Error `403 Forbidden`:** Requesting organizer does not own the event.

---

### `GET /api/organizer/dashboard/stats`
Retrieves real aggregated analytics computed directly from the MongoDB database.

- **Access:** Private (Organizer role required)
- **Response `200 OK`:**
```json
{
  "success": true,
  "stats": {
    "totalEvents": 4,
    "publishedCount": 3,
    "cancelledCount": 1,
    "completedCount": 0,
    "upcomingCount": 3,
    "totalCapacity": 118,
    "totalActiveRegistrations": 6,
    "overallOccupancyRate": 5
  },
  "chartData": [
    {
      "id": "670b134a6e87f7a1928341b2",
      "name": "Full-Stack Web Dev...",
      "registered": 3,
      "capacity": 3,
      "occupancyRate": 100
    }
  ],
  "categoryDistribution": [
    { "name": "Technology", "count": 2 },
    { "name": "Workshop", "count": 1 },
    { "name": "Business", "count": 1 }
  ],
  "recentRegistrations": [ ... ]
}
```

---

## 6. Participant Analytics Endpoint (`/api/participant`)

### `GET /api/participant/dashboard/stats`
Computes personalized enrollment metrics for the logged-in attendee.

- **Access:** Private (Participant role required)
- **Response `200 OK`:**
```json
{
  "success": true,
  "stats": {
    "totalRegistrations": 3,
    "upcomingCount": 2,
    "pastCount": 1,
    "cancelledCount": 0
  },
  "nextUpcomingEvent": {
    "_id": "670b134a6e87f7a1928341b2",
    "title": "Full-Stack Web Development Masterclass",
    "date": "2026-10-20T00:00:00.000Z",
    "startTime": "10:00 AM",
    "endTime": "02:00 PM",
    "eventType": "online"
  },
  "recentRegistrations": [ ... ]
}
```

---

## 7. HTTP Status Code Summary

| Code | Meaning | Context in EventHub |
|---|---|---|
| `200 OK` | Request succeeded | Listing events, details, dashboard metrics, updates |
| `201 Created` | Resource created | User registration, event creation, seat booking |
| `400 Bad Request` | Client validation failed | Duplicate email, full capacity, past dates, bad format |
| `401 Unauthorized` | Authentication required | Missing or invalid JWT token |
| `403 Forbidden` | Authorization denied | Role mismatch (participant accessing organizer route), modifying another organizer's event |
| `404 Not Found` | Resource not found | Invalid event ID, unlisted registration record |
| `429 Too Many Requests` | Rate limit triggered | Brute-force protection on `/api/auth` |
| `500 Internal Error` | Unexpected server error | Uncaught system failure (stack hidden in production) |
