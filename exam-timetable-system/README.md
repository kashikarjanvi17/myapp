# B1 — Basic Exam Timetable Management System

A full-stack exam timetable system where an **admin** schedules exams for a
specific academic year + section, and **students** can only ever see exams
that match their own year and section.

Stack: **React** (frontend) · **Node.js / Express** (backend) · **MySQL**
(database) · **JWT** (auth).

```
exam-timetable-system/
├── backend/
│   ├── config/db.js                 # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js        # admin/student login + student register
│   │   ├── examController.js        # exam CRUD (admin)
│   │   └── studentController.js     # profile + timetable (student)
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification + role guard
│   │   ├── validate.js              # exam payload validation
│   │   └── errorHandler.js          # centralized error/404 handling
│   ├── models/schema.sql            # DDL for admins / students / exams
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── examRoutes.js
│   │   └── studentRoutes.js
│   ├── services/timetableService.js # the year+section filtering query
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seed.js                  # inserts test admin/students/exams
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── api/api.js                # axios instance + all API calls
    │   ├── context/AuthContext.js    # stores logged-in user + token
    │   ├── components/
    │   │   ├── PrivateRoute.js       # role-based route guard
    │   │   ├── ExamForm.js           # create/edit exam form
    │   │   └── ExamList.js           # exam table (shared by both roles)
    │   ├── pages/
    │   │   ├── AdminLogin.js
    │   │   ├── AdminDashboard.js     # exam CRUD UI
    │   │   ├── StudentLogin.js
    │   │   └── StudentTimetable.js   # filtered read-only view
    │   ├── App.js                    # routes
    │   ├── index.js
    │   └── styles.css
    ├── package.json
    └── .env.example
```

---

## 1. Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+ (or a hosted MySQL instance — PlanetScale, Railway, etc.)

### Backend

```bash
cd backend
cp .env.example .env       # then fill in your real DB credentials + a JWT secret
npm install

# Create the database schema:
mysql -u root -p < models/schema.sql

# Seed a test admin, three test students, and sample exams:
npm run seed

# Start the API:
npm run dev                # nodemon, or `npm start` for plain node
```

The API runs on `http://localhost:5000` by default (`PORT` in `.env`).

### Frontend

```bash
cd frontend
cp .env.example .env       # points to the backend's /api base URL
npm install
npm start
```

The app runs on `http://localhost:3000`. Admin login is at `/admin/login`,
student login at `/student/login`.

### Test Credentials (created by `npm run seed`)

| Role    | Username / Email              | Password      | Year / Section |
|---------|--------------------------------|---------------|-----------------|
| Admin   | `admin`                        | `Password123` | —               |
| Student | `aditi.2a@example.com`         | `Password123` | 2nd Year - A    |
| Student | `rohan.2b@example.com`         | `Password123` | 2nd Year - B    |
| Student | `sara.3a@example.com`          | `Password123` | 3rd Year - A    |

Use these three student accounts to verify the filtering rule: Aditi should
see only "2nd Year - A" exams, Rohan only "2nd Year - B", Sara only
"3rd Year - A" — never each other's.

---

## 2. Environment Variables

**backend/.env**

| Variable         | Description                                   |
|------------------|------------------------------------------------|
| `PORT`           | Port the Express server listens on            |
| `DB_HOST`        | MySQL host                                     |
| `DB_PORT`        | MySQL port (default 3306)                      |
| `DB_USER`        | MySQL username                                 |
| `DB_PASSWORD`    | MySQL password                                 |
| `DB_NAME`        | Database name (`exam_timetable_db`)            |
| `JWT_SECRET`     | Long random string used to sign JWTs           |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d`                      |

**frontend/.env**

| Variable                | Description                              |
|--------------------------|-------------------------------------------|
| `REACT_APP_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:5000/api` |

---

## 3. Database Schema

**`admins`** — `id`, `username` (unique), `password_hash`, `created_at`

**`students`** — `id`, `name`, `email` (unique), `password_hash`,
`academic_year`, `section`, `created_at`

**`exams`** — `id`, `subject`, `academic_year`, `section`, `exam_date`,
`start_time`, `end_time`, `status` (`SCHEDULED` / `CANCELLED`),
`created_by` (FK → `admins.id`), `created_at`, `updated_at`

A DB-level `CHECK (end_time > start_time)` constraint and an index on
`(academic_year, section)` back the two rules that matter most: valid time
ranges, and fast filtered lookups for the student view.

---

## 4. API Endpoints

### Auth — `/api/auth`
| Method | Endpoint                | Body                                                    | Notes            |
|--------|--------------------------|----------------------------------------------------------|-------------------|
| POST   | `/admin/login`           | `{ username, password }`                                  | Returns JWT       |
| POST   | `/student/login`         | `{ email, password }`                                      | Returns JWT       |
| POST   | `/student/register`      | `{ name, email, password, academic_year, section }`        | Creates a student |

### Exams (admin only) — `/api/exams` — requires `Authorization: Bearer <admin token>`
| Method | Endpoint             | Body / Query                                | Notes                          |
|--------|------------------------|-----------------------------------------------|---------------------------------|
| POST   | `/`                   | `{ subject, academic_year, section, exam_date, start_time, end_time }` | Create exam |
| GET    | `/`                   | optional `?academic_year=&section=`            | List all exams (admin filters) |
| GET    | `/:id`                | —                                              | Single exam                    |
| PUT    | `/:id`                | same body as POST                              | Update exam                    |
| PATCH  | `/:id/cancel`         | —                                              | Soft-cancel (status → CANCELLED) |
| DELETE | `/:id`                | —                                              | Hard delete                    |

### Student (student only) — `/api/students` — requires `Authorization: Bearer <student token>`
| Method | Endpoint             | Notes                                                                 |
|--------|------------------------|--------------------------------------------------------------------------|
| GET    | `/me`                 | Own profile                                                            |
| GET    | `/me/timetable`       | Exams filtered strictly by the student's own year + section (see below)|

---

## 5. Architectural Choices & Critical Edge Cases

**Why a dedicated "Filtered Timetable Query Service"** (`services/timetableService.js`):
the spec's core rule — `student.year === exam.year && student.section === exam.section`
— is implemented in exactly one place, so it can't drift out of sync between
routes or get re-implemented (and possibly re-broken) elsewhere.

**Why year/section come from the JWT, not the request** — this is the answer
to *"student attempting to manipulate API parameters to view another
section's exams"*: `getMyTimetable` in `studentController.js` reads
`req.user.academicYear` / `req.user.section`, which were written into the
token by the server at login time from the students table. The student-facing
route has **no query parameters for year/section at all** — there's nothing
for a manipulated request to override.

**State transitions** — an exam has two states: `SCHEDULED → CANCELLED`.
Cancellation is a soft delete (`PATCH /:id/cancel`) so history and audit
trail are preserved; a separate hard `DELETE` is offered for genuinely
erroneous entries. Cancelled exams are excluded from the student's
timetable view but still visible to the admin.

**Validation is layered**: the React form validates client-side for instant
feedback, but `middleware/validate.js` re-validates every field server-side
(mandatory fields, well-formed date, `end_time > start_time`) since the
client can never be trusted. A DB-level `CHECK` constraint is the final
backstop.

**Other edge cases**:
- *Missing required fields* → 400 with a list of specific errors from `validate.js`.
- *End time ≤ start time* → rejected both client-side and server-side.
- *Student profile missing year/section* → rejected at login (`authController.js`) and re-checked defensively in `getMyTimetable`, rather than silently returning an unfiltered or empty result.
- *No exams for a section* → `getExamsForStudent` returns `[]`; the frontend renders "No exams found." rather than erroring.
- *Auth failures* → `middleware/auth.js` returns 401 for missing/invalid tokens and `requireRole` returns 403 for a valid token of the wrong role (e.g. a student token hitting an admin-only route).

## 6. Deployment Notes

- **Backend**: deploy to Render/Railway; set the `backend/.env` variables in the platform's dashboard, point `DB_HOST` etc. at a managed MySQL instance, run `schema.sql` once against it, then `npm run seed`.
- **Frontend**: deploy to Vercel/Netlify; set `REACT_APP_API_BASE_URL` to the deployed backend's URL.
- Fill in your live URLs and repo link here once deployed:
  - GitHub repo: `<add link>`
  - Live demo (frontend): `<add link>`
  - Live API: `<add link>`
