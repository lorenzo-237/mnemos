# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mnemos is a Next.js 16 application for IT infrastructure management (inventory-focused) built with React 19, TypeScript, and PostgreSQL. The project uses:
- **Next.js App Router** with React Server Components and Server Actions
- **shadcn/ui** components (radix-lyra style) built on Base UI and Radix UI primitives
- **Tailwind CSS 4** for styling
- **Prisma ORM** with PostgreSQL adapter for database management
- **Hugeicons** for iconography
- **AES-256-GCM encryption** for sensitive data (TeamViewer passwords)

## Development Commands

```bash
# Navigate to the project directory
cd mnemos-next

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Database Management

The project uses Prisma with a PostgreSQL database:

```bash
# Navigate to project directory
cd mnemos-next

# Generate Prisma client (after schema changes)
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

**Database Configuration:**
- Connection string is in `.env` as `DATABASE_URL`
- Prisma client is generated to `generated/prisma/` (not the default `node_modules`)
- Custom Prisma config is in `prisma.config.ts`
- Schema location: `prisma/schema.prisma`

## Architecture

### Directory Structure

```
mnemos-next/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout with font configuration
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles and Tailwind imports
├── components/
│   ├── ui/           # shadcn/ui components (auto-generated)
│   ├── example.tsx   # Example wrapper components
│   └── component-example.tsx  # Demo/example page components
├── lib/
│   ├── utils.ts      # cn() utility for class merging
│   └── prisma.ts     # Prisma client singleton
├── prisma/
│   ├── schema.prisma # Database schema
│   └── migrations/   # Database migrations
├── generated/
│   └── prisma/       # Generated Prisma client (custom output)
└── public/           # Static assets
```

### Key Architectural Patterns

**Prisma Client Setup:**
The project uses a custom Prisma adapter configuration with `@prisma/adapter-pg`. The client is initialized in `lib/prisma.ts` with:
- Environment variables loaded via `dotenv/config`
- PostgreSQL connection via PrismaPg adapter
- Client generated to custom path: `generated/prisma/client`

**Component Organization:**
- UI components follow shadcn/ui conventions
- Uses `@/` path alias for imports (mapped to project root)
- Server components by default; client components marked with `"use client"`
- Component composition uses Base UI and Radix UI primitives

**Styling:**
- Tailwind CSS 4 with PostCSS
- Custom utility `cn()` for conditional class merging (clsx + tailwind-merge)
- CSS variables for theming (configured in `globals.css`)
- shadcn/ui radix-lyra style preset
- Hugeicons for icons with customizable stroke width

**Fonts:**
- JetBrains Mono as the primary sans font
- Geist Sans and Geist Mono as secondary fonts
- Configured in `app/layout.tsx`

## Working with shadcn/ui Components

The project uses shadcn/ui components with the following configuration:
- Style: radix-lyra
- Icon library: Hugeicons
- Base color: gray
- CSS variables enabled for theming

To add new shadcn/ui components, they will be installed to `components/ui/` and should follow the existing pattern of using the `@/` alias for imports.

## Important Conventions

1. **Import Aliases:** Use `@/` for all internal imports (e.g., `@/components/ui/button`)
2. **Database Client:** Always import Prisma client from `@/lib/prisma`, never instantiate directly
3. **Styling:** Use the `cn()` utility from `@/lib/utils` for conditional classes
4. **Icons:** Use HugeiconsIcon component from `@hugeicons/react` with core-free-icons
5. **Client Components:** Explicitly mark with `"use client"` directive when needed

## Environment Variables

Required environment variables in `.env`:
- `DATABASE_URL`: PostgreSQL connection string (format: `postgresql://user:password@host:port/database?schema=public`)
- `ENCRYPTION_KEY`: 64-character hex string for AES-256-GCM encryption (generate with `openssl rand -hex 32`)

## Business Rules

1. **No Physical Deletion**: Installations are marked as removed (removedAt timestamp), never deleted
2. **Version Uniqueness**: Only one active version of a software per machine at a time
3. **Update Flow**: Updating a software version closes the old installation and creates a new one (atomic transaction)
4. **Manual Updates**: All data changes are manual via the interface (no auto-discovery)
5. **TeamViewer Security**: Passwords are encrypted with AES-256-GCM before storage

## Server Actions Pattern

All CRUD operations use Server Actions in `lib/actions/`:
- `sites.ts`: Site management
- `machines.ts`: Machine management with TeamViewer encryption
- `softwares.ts`: Software catalog
- `installations.ts`: Installation lifecycle with transactions

Pattern:
```typescript
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// Validate with Zod, perform operation, revalidate cache, redirect if needed
```

## Important Technical Details

### Async Params (Next.js 15+)
All dynamic routes must await params:
```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ...
}
```

### Client Component Prisma Import
Never import Prisma types/enums in `'use client'` components. Use `lib/types.ts` instead:
```typescript
// ❌ Bad - causes bundling errors
import { MachineType } from '@/generated/prisma/client';

// ✅ Good - use shared types
import { MachineType } from '@/lib/types';
```

### Encryption Usage
Always use `encryptTeamViewerPassword()` before saving and `decryptTeamViewerPassword()` when displaying:
```typescript
import { encryptTeamViewerPassword, decryptTeamViewerPassword } from '@/lib/crypto';
```
