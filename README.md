This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

This project uses [pnpm](https://pnpm.io). Install dependencies:

```bash
pnpm install
```

Set up the database (Postgres). Copy the env template and provision the local DB:

```bash
cp .env.example .env.local
sudo -u postgres psql -f scripts/db-setup.sql   # creates the role + database
pnpm exec prisma migrate deploy                  # applies the committed migration
```

> First-time setup uses `prisma migrate deploy` to apply the existing committed
> migration as-is. Use `pnpm db:migrate` (`prisma migrate dev`) only when you're
> changing the schema and want to generate a new migration.

Then run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Next steps

The persistence layer (Prisma 7 + Postgres) is set up but **not yet wired into the
app** — the UI still reads/writes `localStorage`. Outstanding work, roughly in order:

### 1. Local database
- [ ] Create the DB and apply the migration (see [Getting Started](#getting-started)):
      `sudo -u postgres psql -f scripts/db-setup.sql` then `pnpm exec prisma migrate deploy`.
- [ ] Sanity-check with `pnpm db:studio` (Prisma Studio).

### 2. Wire the app to Prisma (replace `localStorage`)
- [ ] Build a data-access layer / server actions to read and write `DailyLog`,
      `SleepLog`, `FoodLog`, `HeadacheLog`, and `ArrhythmiaLog`.
- [ ] Replace the `localStorage` logic in `src/context/HealthContext.tsx` with calls
      to that layer.
- [ ] Convert at the boundary: the schema stores `time` as a SQL `TIME` (`@db.Time`),
      while the UI uses display strings like `"08:15 AM"` — map between them in the
      data layer.

### 3. Authentication & multi-user
- [ ] Add auth (Better Auth) and a `User` model.
- [ ] Make data user-scoped: add `userId` relations and change `DailyLog`'s
      `@@unique([date])` to `@@unique([userId, date])` (the schema is single-user today).

### 4. Production / deployment (Vercel)
- [ ] Set `DATABASE_URL` in the Vercel project (build **and** runtime).
- [ ] Run `prisma migrate deploy` against the production database.
- [ ] Use a **pooled** connection string (PgBouncer / Prisma Accelerate / Supabase
      pooler) for serverless to avoid exhausting Postgres connections.

### 5. Cleanups (non-blocking)
- [ ] Move the Outfit font from the render-blocking `@import` in `src/app/globals.css`
      to `next/font/google` (as Geist already is) to remove the residual font swap.
- [ ] Add input validation (Zod) for ranges not enforced at the DB level — e.g.
      sleep `quality` 1–5, headache `severity` 1–10, `mood` 1–5.
- [ ] Add tests once the data layer exists (none in the repo yet).

> **Note for contributors:** this project uses **pnpm**. The build-script approvals in
> `pnpm-workspace.yaml` (`allowBuilds`) are required for `prisma`, `sharp`, and
> `unrs-resolver` to set up correctly on install.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
