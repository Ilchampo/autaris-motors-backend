# Autaris Motors Backend

REST API for **Autaris Motors**, a used-vehicle dealership platform with:

- A **public website** (catalog, inquiries, appraisal requests, client auth)
- An **employee portal** (inventory, sales, dashboard, admin tools)

Functional requirements live under [`.docs/markdowns/`](.docs/markdowns/).

---

## Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Runtime    | Node.js 22+, TypeScript (CommonJS) |
| HTTP       | Express 5                          |
| Validation | Zod                                |
| Database   | MongoDB via Mongoose 9             |
| Auth       | JWT (`Bearer`), bcrypt passwords   |
| Email      | Resend                             |
| Images     | Cloudinary + Multer                |
| Deploy     | Docker → Northflank                |

---

## Architecture

Request flow:

```text
Route → auth (optional/required) → authorize → validate (Zod) → controller → service → model
```

| Layer           | Responsibility                                       |
| --------------- | ---------------------------------------------------- |
| **Routes**      | HTTP path, middleware order, access notes            |
| **Controllers** | Thin wrappers; map `req` → service params            |
| **Services**    | Business rules, side effects (logs, email, uploads)  |
| **Models**      | Mongoose schemas and indexes                         |
| **Schemas**     | Zod request validation (`body` / `query` / `params`) |
| **Middlewares** | Auth, CORS, rate limits, uploads, errors             |

Path aliases (`@services/*`, `@models/*`, …) are defined in `tsconfig.json` and mirrored for runtime via `module-alias` in `package.json`.

Successful responses:

```json
{ "success": true, "data": {} }
```

Errors:

```json
{ "success": false, "message": "…" }
```

---

## Project structure

```text
src/
  app.ts                 # Express app, route mounting, Mongo connect
  index.ts               # Process entry
  controllers/           # HTTP adapters
  routes/                # Express routers
  services/              # Domain logic
  models/                # Mongoose models
  middlewares/           # Auth, CORS, rate limit, validation, upload, errors
  lib/
    config.ts            # Env → typed config
    constants/
    instances/           # mongoose, cloudinary, resend
    interfaces/
    schemas/             # Zod
    utils/
.docs/markdowns/         # FRS (roles, BR, FR, events, constraints)
Dockerfile
.env.example
```

---

## Prerequisites

- Node.js **22+**
- npm
- MongoDB (local or Atlas)
- Accounts/keys for **Cloudinary** and **Resend** (needed for image upload and email flows)

---

## Local setup

```bash
git clone <repo-url>
cd autaris-motors-backend
npm install
cp .env.example .env
# Edit .env with real values
npm run dev
```

Health check: `GET http://localhost:3000/health`

Production-like local run:

```bash
npm run build
npm start
```

---

## Environment variables

See [`.env.example`](.env.example). Summary:

| Variable                        | Purpose                                                         |
| ------------------------------- | --------------------------------------------------------------- |
| `PORT`                          | HTTP port (default `3000`)                                      |
| `NODE_ENV`                      | `development` / `production`                                    |
| `FRONTEND_URL`                  | Frontend origin (password-reset links + CORS)                   |
| `CORS_WHITELIST`                | Extra allowed origins (comma-separated)                         |
| `TRUST_PROXY`                   | `false`, `true`, or hop count (use `1` behind Northflank/nginx) |
| `RATE_LIMIT_WINDOW_MS`          | Rate-limit window (default 15m)                                 |
| `RATE_LIMIT_API_MAX`            | Max requests / IP / window on `/api/*`                          |
| `RATE_LIMIT_AUTH_MAX`           | Max requests / IP on `/api/auth/*`                              |
| `RATE_LIMIT_PUBLIC_WRITE_MAX`   | Max public POST submissions (inquiries, appraisals)             |
| `MONGO_URI` / `MONGO_DB_NAME`   | MongoDB connection                                              |
| `CLOUDINARY_*`                  | Image storage                                                   |
| `RESEND_*`                      | Transactional email                                             |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Auth tokens                                                     |

Secrets must be injected at runtime (local `.env` or Northflank env vars). Never bake them into the image.

---

## Scripts

| Script                            | Description                          |
| --------------------------------- | ------------------------------------ |
| `npm run dev`                     | Watch mode via `tsx`                 |
| `npm run build`                   | Compile TypeScript → `dist/`         |
| `npm start`                       | Run compiled app with `module-alias` |
| `npm run lint` / `lint:fix`       | ESLint                               |
| `npm run format` / `format:check` | Prettier                             |

---

## Roles & auth

Roles (hierarchical intent): `client` → `employee` → `admin`.

| Concern         | Behavior                                                               |
| --------------- | ---------------------------------------------------------------------- |
| Public register | Creates `client`                                                       |
| Internal users  | Created by `admin`; temp password emailed; `mustChangePassword = true` |
| Auth header     | `Authorization: Bearer <jwt>`                                          |
| Inactive users  | Cannot sign in or recover password                                     |
| Admin guards    | Cannot deactivate/delete self; last active admin protected             |

---

## API surface

Base URL: `/api`. Health: `GET /health` (not rate-limited).

| Mount                             | Access (high level)                               |
| --------------------------------- | ------------------------------------------------- |
| `/api/auth`                       | Public — register, login, password recovery/reset |
| `/api/vehicles`                   | Public catalog / featured / details               |
| `/api/vehicles/manage`            | Employee + admin inventory CRUD lifecycle         |
| `/api/sales`                      | Employee create; admin update/cancel              |
| `/api/vehicle-inquiries`          | Public POST; employee+admin list/get              |
| `/api/vehicle-appraisal-requests` | Public POST only (email + customer log)           |
| `/api/entities`                   | Public active list; admin manage                  |
| `/api/system-config`              | Public GET; admin PATCH                           |
| `/api/users`                      | Admin management; password update for self        |
| `/api/logs`                       | Admin read/search                                 |
| `/api/dashboard`                  | Employee + admin KPIs/charts                      |

Vehicle public fields use denormalized entity strings (brand, model, city, …). Sales cancel republishes the vehicle and excludes the sale from analytics.

---

## Hardening

- **CORS** — always on; allows `FRONTEND_URL` + `CORS_WHITELIST`; credentials enabled
- **Rate limiting** — global API + stricter auth + public write limiters
- **Trust proxy** — configure when behind a reverse proxy so rate limits see real client IPs
- **Logs** — immutable at the model layer (no update/delete)

---

## Docker & Northflank

Multi-stage image: compile in builder, run as non-root on `node:22-bookworm-slim`.

```bash
docker build -t autaris-motors-backend:local .
docker run --env-file .env -p 3000:3000 autaris-motors-backend:local
```

**Northflank checklist**

1. Build type: **Dockerfile** (context `/`, file `Dockerfile`)
2. Expose port **3000** (or your `PORT`)
3. Configure all env vars from `.env.example` as secrets
4. Set `TRUST_PROXY=1` (or appropriate hop count)
5. HTTP health check: `/health`
6. Point `FRONTEND_URL` / `CORS_WHITELIST` at the deployed frontend origin(s)

---

## Domain notes for implementers

- **Vehicles:** `draft` → `published` → `sold` (or `deleted`). Featured ordering uses `featuredAt`. Mongoose document field `model` clashes with `Document.model` — use `vehicle.get('model')` / `vehicle.set('model', …)` in services.
- **Sales:** at most one **active** sale per vehicle; cancel → vehicle republished, new `publishedAt`.
- **Inquiries:** append-only; respect `systemConfig.whatsApp.onlyRegistered`.
- **Appraisal requests:** persist + Resend to dealership `contact.email` + customer log; no admin list in MVP.
- **System config:** singleton `_id: "system"`, auto-created with defaults on first read.
- **Dashboard:** date range KPIs with previous equal-duration comparison; charts for last 6 months + top brands/models.

---

## Documentation

| Doc                                                                                            | Contents              |
| ---------------------------------------------------------------------------------------------- | --------------------- |
| [`.docs/markdowns/00-introduction.md`](.docs/markdowns/00-introduction.md)                     | Product scope         |
| [`.docs/markdowns/01-user-roles.md`](.docs/markdowns/01-user-roles.md)                         | Roles & lifecycle     |
| [`.docs/markdowns/02-business-rules.md`](.docs/markdowns/02-business-rules.md)                 | Business rules        |
| [`.docs/markdowns/03-public-module.md`](.docs/markdowns/03-public-module.md)                   | Public FR             |
| [`.docs/markdowns/04-employee-portal.md`](.docs/markdowns/04-employee-portal.md)               | Portal FR             |
| [`.docs/markdowns/05-permissions.md`](.docs/markdowns/05-permissions.md)                       | Permissions matrix    |
| [`.docs/markdowns/07-data-models.md`](.docs/markdowns/07-data-models.md)                       | Reference models      |
| [`.docs/markdowns/08-system-events.md`](.docs/markdowns/08-system-events.md)                   | Events / side effects |
| [`.docs/markdowns/09-functional-constraints.md`](.docs/markdowns/09-functional-constraints.md) | MVP boundaries        |

---

## License

ISC — see `package.json`.
