# Cadott Football Attendance

Mobile-first attendance tracker for Cadott Football Program teams.

## Features
- Team PIN access (one login per team)
- Roster management with grade + jersey number
- Practice creation and tap-to-check attendance cards
- Season-long attendance history
- CSV export and Google Sheets CSV import
- Google Sheets direct sync (via published CSV link)

## Tech Stack
- Next.js App Router + TypeScript
- Prisma + Postgres
- Tailwind CSS

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables in `.env`:
   - `DATABASE_URL` (Postgres connection string)
   - `PIN_SECRET` (any random string)
   - `ADMIN_PIN` (admin-only PIN for `/admin`)
3. Generate Prisma client and run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
4. (Optional) Seed default teams:
   ```bash
   npx prisma db seed
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Importing Athletes
Export your Google Sheet as CSV. The import expects headers like:
`Full Name`, `Grade`, `Jersey Number` (case-insensitive). Variants accepted:
`name`, `fullName`, `athlete`, `grade`, `jersey`, `jerseyNumber`, `number`.
To use direct sync, paste a Google Sheet link and ensure the sheet is shared
with anyone who has the link or published to the web.

## Exporting Attendance
Download a CSV export from the team dashboard. It includes practice date,
type, athlete info, and attendance status.
