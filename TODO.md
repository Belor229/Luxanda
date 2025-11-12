# TODO: Fix Database Configuration and Admin Route Issues

## Current Issues
- `admin.ts` uses deprecated `getDB()` which throws an error, causing TypeScript compilation failure on Vercel
- Database queries in `admin.ts` use raw SQL execute method incompatible with Prisma
- Missing Prisma client generation in build process for Vercel deployment

## Tasks
- [ ] Update `admin.ts` to use Prisma client instead of `getDB()`
- [ ] Replace raw SQL `db.execute()` calls with Prisma `$queryRaw()` or ORM methods
- [ ] Add `postinstall` script to `backend/package.json` for Prisma client generation
- [ ] Verify TypeScript compilation succeeds
- [ ] Test build process locally

## Files to Edit
- `backend/src/routes/admin.ts`
- `backend/package.json`

## Followup Steps
- Run `npm run build` in backend directory to verify fixes
- Deploy to Vercel and check for successful build
