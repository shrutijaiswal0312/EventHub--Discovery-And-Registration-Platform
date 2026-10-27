# EventHub – Automated Quality Assurance & Testing Report

This report provides the testing methodology, test suites, actual execution output, and verification results for the EventHub platform. Testing encompasses both backend integration testing using **Jest & Supertest** and frontend component testing using **Vitest & React Testing Library (RTL)**.

---

## 1. Executive Summary

| Category | Test Framework | Test Suites | Total Tests | Passed | Failed | Execution Time |
|---|---|---|---|---|---|---|
| **Backend API & Concurrency** | Jest 29 + Supertest 7 | 4 Suites | 21 Tests | 21 | 0 | 47.27 s |
| **Frontend UI Components** | Vitest 1.6 + RTL 15 | 3 Suites | 6 Tests | 6 | 0 | 14.52 s |
| **Total Combined** | — | **7 Suites** | **27 Tests** | **27** | **0** | **61.79 s** |

All tests were executed against an active database environment and completed with **100% pass rate**.

---

## 2. Backend Automated Test Results Matrix

The table below outlines the 20 mandatory academic test cases plus the high-concurrency race condition test case.

| # | Test Case Identifier | Objective | Test Input / Scenario | Expected Outcome | Actual Result | Status |
|---|---|---|---|---|---|---|
| 1 | `TC-AUTH-01` | Successful participant registration | POST `/api/auth/register` with role `participant` | HTTP 201 Created, JWT token issued, password omitted | HTTP 201, token generated, password excluded | **PASS** |
| 2 | `TC-AUTH-02` | Successful organizer registration | POST `/api/auth/register` with role `organizer` | HTTP 201 Created, role assigned as `organizer` | HTTP 201, user.role is `organizer` | **PASS** |
| 3 | `TC-AUTH-03` | Duplicate email rejection | POST `/api/auth/register` with pre-existing email | HTTP 400 Bad Request with "already exists" | HTTP 400 with duplicate message | **PASS** |
| 4 | `TC-AUTH-04` | Invalid login rejection | POST `/api/auth/login` with incorrect password or email | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| 5 | `TC-AUTH-05` | Unauthenticated access rejection | GET `/api/auth/me` without Authorization header | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| 6 | `TC-AUTH-06` | Unauthorized role access rejection | Participant tries accessing GET `/api/organizer/events` | HTTP 403 Forbidden | HTTP 403 Forbidden with "Access denied" | **PASS** |
| 7 | `TC-EVENT-01` | Event creation by organizer | POST `/api/events` with valid event metadata | HTTP 201 Created, status `published`, registeredCount 0 | HTTP 201, event persisted with correct fields | **PASS** |
| 8 | `TC-EVENT-02` | Organizer ownership enforcement | Organizer B modifies Organizer A's event | HTTP 403 Forbidden | HTTP 403 Forbidden on PUT & PATCH | **PASS** |
| 9 | `TC-EVENT-03` | Event editing | PUT `/api/events/:id` by owner | HTTP 200 OK with updated attributes | HTTP 200, title & location updated | **PASS** |
| 10 | `TC-EVENT-04` | Event cancellation | PATCH `/api/events/:id/cancel` by owner | HTTP 200 OK, event status set to `cancelled` | HTTP 200, status changed to `cancelled` | **PASS** |
| 11 | `TC-REG-01` | Successful event registration | POST `/api/events/:id/register` by participant | HTTP 201 Created, registeredCount incremented | HTTP 201, registeredCount is 1, remaining 9 | **PASS** |
| 12 | `TC-REG-02` | Duplicate registration prevention | Participant registers twice for the same event | HTTP 400 Bad Request with "already actively registered" | HTTP 400, second request rejected | **PASS** |
| 13 | `TC-REG-03` | Full-capacity registration rejection | Participant registers for event where registeredCount = capacity | HTTP 400 Bad Request with "full capacity" | HTTP 400, seat count not exceeded | **PASS** |
| 14 | `TC-REG-04` | Seat release after cancellation | DELETE `/api/events/:id/register` by participant | HTTP 200 OK, registeredCount decremented | HTTP 200, registeredCount is 0, remaining 10 | **PASS** |
| 15 | `TC-REG-05` | Re-registration after cancellation | Cancelled attendee re-registers for event | HTTP 201, reactivates existing document, no duplicates | HTTP 201, exactly 1 document in DB | **PASS** |
| 16 | `TC-REG-06` | Registration rejection for cancelled event | Participant registers for event with status `cancelled` | HTTP 400 Bad Request with "cancelled and is not accepting" | HTTP 400, registration rejected | **PASS** |
| 17 | `TC-REG-07` | Registration rejection for completed/past event | Participant registers for historical event | HTTP 400 Bad Request | HTTP 400, registration rejected | **PASS** |
| 18 | `TC-EVENT-05` | Capacity reduction below active registrations rejected | Organizer attempts reducing capacity from 10 to 4 when active registrations = 5 | HTTP 400 Bad Request with "Cannot reduce capacity" | HTTP 400, capacity reduction rejected | **PASS** |
| 19 | `TC-REG-08` | Participant isolation | Participant 2 attempts viewing Participant 1's registrations | HTTP 200 returning only Participant 2's records (length 0) | HTTP 200, registrations scoped to token | **PASS** |
| 20 | `TC-VAL-01` | Malformed input and invalid ID handling | Invalid MongoDB ID string; end time before start time | HTTP 400 Bad Request with descriptive message | HTTP 400 returned for both scenarios | **PASS** |
| 21 | `TC-CONC-01` | High-concurrency race condition safety | 10 participants send simultaneous requests to an event with capacity = 3 | Exactly 3 succeed (201), exactly 7 fail (400), final DB count = 3 | 3 succeeded (201), 7 rejected (400), final DB count = 3 | **PASS** |

---

## 3. Concurrency Stress Test Detailed Analysis

### Test Case: `TC-CONC-01`
- **Objective:** Verify that under high concurrency, parallel incoming requests cannot cause overbooking (capacity violation).
- **Setup:**
  - An event was created with physical capacity $C = 3$.
  - 10 distinct participant accounts were created and issued individual JWT authentication tokens.
  - 10 HTTP `POST /api/events/:id/register` requests were fired simultaneously using `Promise.all()`.
- **Observed Behavior:**
  - Fast atomic evaluation via MongoDB `$expr: { $lt: ['$registeredCount', '$capacity'] }`.
  - Exactly 3 requests received HTTP status `201 Created`.
  - Exactly 7 requests received HTTP status `400 Bad Request` with message: `"Registration failed. Event is already at full capacity."`
  - Subsequent database query confirmed `Event.registeredCount === 3` and `Registration.countDocuments({ status: 'registered' }) === 3`.
- **Conclusion:** Concurrency safety was conclusively proven with zero seat corruption or duplicate bookings.

---

## 4. Frontend Component Test Results

Frontend tests were executed using Vitest with JSDOM and React Testing Library:

| Test File | Component Tested | Assertions | Status |
|---|---|---|---|
| `src/test/Badge.test.jsx` | `Badge.jsx` | Renders children text; applies proper Tailwind color variants | **PASS** |
| `src/test/EventCard.test.jsx` | `EventCard.jsx` | Displays event title, category pill, correct registered/remaining seats, and sold-out indicator | **PASS** |
| `src/test/LoginPage.test.jsx` | `LoginPage.jsx` | Renders email and password fields; populates demo participant and organizer credentials upon one-click demo buttons | **PASS** |

---

## 5. Actual Test Execution Log Output

### Backend Jest Run
```text
PASS tests/registration.test.js (38.128 s)
PASS tests/events.test.js
PASS tests/auth.test.js
PASS tests/concurrency.test.js

Test Suites: 4 passed, 4 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        47.268 s
Ran all test suites.
```

### Frontend Vitest Run
```text
✓ src/test/Badge.test.jsx  (2 tests) 42ms
✓ src/test/EventCard.test.jsx  (2 tests) 423ms
✓ src/test/LoginPage.test.jsx  (2 tests) 117ms

Test Files  3 passed (3)
Tests       6 passed (6)
Duration    14.52s
```

### Frontend Production Build
```text
vite v5.4.21 building for production...
✓ 2386 modules transformed.
rendering chunks...
dist/index.html                   1.39 kB
dist/assets/index-DuA_F8oG.css   35.75 kB
dist/assets/index-C7brtoqF.js   749.82 kB
✓ built in 17.14s
```
