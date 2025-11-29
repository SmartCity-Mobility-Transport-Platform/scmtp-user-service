## scmtp-user-service

**Responsibilities**

- **Auth**: `POST /auth/register`, `POST /auth/login` (JWT issuance).
- **Profile**: `GET /users/me`, `PUT /users/me` (authenticated via Bearer token).

**Tech stack**

- **Language**: Node.js + TypeScript.
- **Framework**: Express.
- **Database**: PostgreSQL (tables: `users`, `profiles`).
- **Auth**: JWT (HMAC secret).

**Run locally**

1. **Install deps**

```bash
cd scmtp-user-service
npm install
```

2. **Configure env**

Copy `env.example` to `.env` and adjust values (Postgres connection, JWT secret).

3. **Start Postgres**

Ensure a PostgreSQL instance is running with a database matching `PG_DATABASE` and user/password from `.env`. Apply `sql/schema.sql` or let the service run inline migrations on startup.

4. **Run service**

```bash
npm run dev
```

Service exposes:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `PUT /users/me`

**Docker**

Build and run:

```bash
docker build -t scmtp-user-service .
docker run --env-file .env -p 3000:3000 scmtp-user-service
```


