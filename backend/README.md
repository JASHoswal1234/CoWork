# SAHAKAR // SERVICES - Backend API

Backend service for the SAHAKAR worker cooperative platform built for hackathon demo.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express + TypeScript
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)

### 3. Setup Database

1. Create a Supabase project at https://supabase.com
2. Run the database schema from `../.kiro/specs/backend-implementation/database-schema.sql` in the Supabase SQL Editor
3. Enable PostGIS extension: `CREATE EXTENSION IF NOT EXISTS postgis;`

### 4. Run Development Server

```bash
npm run dev
```

Server will start on http://localhost:3000

### 5. Test the API

```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "environment": "development"
  }
}
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Project Structure

```
backend/
├── src/
│   ├── server.ts           # Express app entry point
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   └── types/              # TypeScript types
├── dist/                   # Compiled JavaScript
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment template
├── package.json
└── tsconfig.json
```

## API Documentation

Full API documentation available in `../.kiro/specs/backend-implementation/design.md`

### Base URL

- Development: `http://localhost:3000`
- Production: TBD

### Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Implementation Status

See `../.kiro/specs/backend-implementation/tasks.md` for detailed implementation plan.

## License

MIT
