# Pentacore Technologies

Company website for a five-founder software house.

- **frontend/**: Next.js 15, React 19, Tailwind CSS 4, Three.js (react-three-fiber), Framer Motion, Lenis smooth scroll
- **backend/**: NestJS 11, TypeORM, PostgreSQL, validation and rate limiting

## 1. Database

The site uses PostgreSQL 18 on port 5433 with the database `pentagon`.
It is already configured in `backend/.env`.

Tables (`orders`, `team_members`) are created automatically on first start because `DB_SYNC=true`.
Set `DB_SYNC=false` in production after the first run.

## 2. Run

```bash
# terminal 1
cd backend
npm install
npm run dev          # http://localhost:4000/api

# terminal 2
cd frontend
npm install
npm run dev          # http://localhost:3000
```

- Website: http://localhost:3000
- Orders dashboard: http://localhost:3000/admin (sign in with an admin email and password)
- Health check: http://localhost:4000/api/health

## API

| Method | Path                      | Access                | Purpose                       |
| ------ | ------------------------- | --------------------- | ----------------------------- |
| POST   | /api/orders               | Public, 5/min per IP  | Client places a project order |
| POST   | /api/auth/login           | Public, 5/min per IP  | Admin sign-in, sets session cookie |
| POST   | /api/auth/logout          | Admin session         | Sign out                      |
| GET    | /api/auth/me              | Admin session         | Current admin                 |
| POST   | /api/auth/change-password | Admin session         | Change own password           |
| GET    | /api/orders?status=new    | Admin session         | List orders                   |
| GET    | /api/orders/stats         | Admin session         | Count by status               |
| PATCH  | /api/orders/:id/status    | Admin session         | Change order status           |
| GET    | /api/team                 | Public                | Team members                  |
| GET    | /api/health               | Public                | API and database status       |

## Admin accounts

Admins sign in at `/admin` with their email and password. There is no shared key.

- The accounts are listed in `backend/src/auth/admins.seed.ts` and created on first start.
- New accounts get `ADMIN_DEFAULT_PASSWORD` from `backend/.env`. The dashboard asks each admin to change it.
- Passwords are stored as scrypt hashes. Sessions last 7 days in an httpOnly cookie.
- To add an admin, add them to the seed list and restart the backend. Existing passwords are never overwritten.
- In production, set `COOKIE_SECURE=true` and do not expose the backend port publicly. Visitors should reach the API only through the website's `/api` proxy.

## Things to customise

- **Team photos**: drop files into `frontend/public/team/` (see the README there for exact names).
- **Contact details**: edit `frontend/src/data/site.ts`. The email is still empty and stays hidden until you add one.
- **Team text**: `frontend/src/data/team.ts` and `backend/src/team/team.seed.ts`.
- **Service and budget options**: keep `frontend/src/data/site.ts` and `backend/src/orders/dto/create-order.dto.ts` identical.

## Logo

A vector logo is included: `frontend/public/logo.svg` (full) and `frontend/src/app/icon.svg` (favicon).
It shows five connected nodes around one core, one node per founder.

To generate alternative versions with Google Gemini, use this prompt:

```text
Design a premium minimalist logo for "Pentacore Technologies", a software house founded by
five senior software engineers. Symbol: a geometric pentagon formed by five glowing connected
nodes around a single central core, representing five founders united as one engineering core.
Style: modern tech, flat vector, clean lines, high contrast, works at 32px favicon size.
Colors: gradient from electric violet #8B5CF6 to cyan #22D3EE with a hint of pink #F472B6,
on a deep navy-black background #05060F. Wordmark "Pentacore" in a geometric sans-serif like Sora,
"Penta" in white and "core" in the gradient. No 3D bevels, no stock clip-art, no extra text.
Deliver a square icon version and a horizontal logo version.
```

## Deploy to a VPS (pentacore.world)

Files are in `deploy/`. The server runs Nginx (HTTPS) in front of the Next.js site on port 3000.
Next.js forwards `/api` to the NestJS API on `127.0.0.1:4000`, which is not reachable from outside.
PM2 keeps both apps running.

1. Point the domain's DNS `A` records for `@` and `www` to the VPS IP.
2. On a fresh Ubuntu VPS, as root:

   ```bash
   git clone https://github.com/Rizwan88090/Portfolio.git /var/www/pentacore
   ADMIN_INITIAL_PASSWORD='choose-one' CERTBOT_EMAIL='you@example.com' bash /var/www/pentacore/deploy/setup-server.sh
   ```

3. To ship new code later: `bash /var/www/pentacore/deploy/update.sh`

## Production

```bash
cd backend && npm run build && npm start
cd frontend && npm run build && npm start
```

Set `NEXT_PUBLIC_API_URL` in the frontend and `FRONTEND_URL` in the backend to your real domains.
