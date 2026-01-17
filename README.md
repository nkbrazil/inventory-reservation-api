# Inventory Reservation API - Leadly

A TypeScript + Express.js REST API for managing inventory items and temporary reservations with automatic expiration. Built with Supabase PostgreSQL and deployed on Vercel.

## Overview

This system manages inventory items and time-limited reservations with the following key features:

- **Temporary Reservations**: 15-minute temporary holds on inventory
- **Automatic Expiration**: Background process to expire old reservations
- **Inventory Tracking**: Real-time availability calculations
- **Idempotent Operations**: Safe confirm/cancel operations (retry-safe)
- **Concurrency Control**: Database-level constraints prevent overselling

### Key Assumptions

1. **Reservation Flow**:

   - `PENDING` → reserves quantity temporarily (15 min)
   - `CONFIRMED` → permanently deducts from `total_quantity`
   - `CANCELLED` or `EXPIRED` → releases the hold

2. **Quantity Calculation**:

   - Only `PENDING` reservations count as "reserved"
   - `CONFIRMED` reservations are already deducted from `total_quantity`
   - `available_quantity = total_quantity - sum(PENDING.quantity)`

3. **Idempotency**:

   - Confirming an already-confirmed reservation does not deduct twice
   - Cancelling an already-cancelled reservation does not push thru

4. **Concurrency**:

   - Database constraints and indexes prevent race conditions
   - No application-level locking needed for this use case

5. **Schema**:
   - Uses a custom `inventory` schema in Supabase
   - Row Level Security (RLS) enabled with service role access

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Vercel account (for deployment)

### 1. Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (2-3 minutes)

#### Run the SQL Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of [`src/migrations/inventory-sql-migration.sql`](src/migrations/inventory-sql-migration.sql)
3. Paste into the SQL Editor and click **Run**
4. Verify success: Run `SELECT * FROM inventory.items;` - you should see 8 sample items

#### Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** (e.g., `https://xxxxx.supabase.co`)
3. Copy your **service_role** key (under "Project API keys")
   - **Important**: Use `service_role`, NOT `anon` key

---

### 2. Local Development Setup

#### Clone and Install

```bash
git clone <your-repo-url>
cd inventory-reservation-api
npm install
```

#### Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=3000
```

#### Build and Run

```bash
# Build TypeScript
npm run build

# Start development server
npm run dev

# Or run compiled
npm start
```

The API will be available at: `http://localhost:3000`

**Swagger UI Documentation**: `http://localhost:3000/docs`

---

## Environment Variables

Required environment variables (see [`.env.example`](.env.example)):

| Variable                    | Description                           | Example                     |
| --------------------------- | ------------------------------------- | --------------------------- |
| `SUPABASE_URL`              | Your Supabase project URL             | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (NOT anon key)       | `eyJhbGc...`                |
| `PORT`                      | Server port (optional, default: 3000) | `3000`                      |

---

## Deployment to Vercel

### Prerequisites

- Install Vercel CLI: `npm i -g vercel`
- Have a Vercel account

### Deploy Steps

1. **Login to Vercel**

   ```bash
   vercel login
   ```

2. **Deploy**

   ```bash
   vercel --prod
   ```

3. **Set Environment Variables** (in Vercel Dashboard or CLI)

   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Redeploy** after adding env vars
   ```bash
   vercel --prod
   ```

### Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your Git repository
4. Add environment variables in **Settings** → **Environment Variables**
5. Click **Deploy**

---

## Deployed API

**Production URL**: `https://example-app.vercel.app`

**API Documentation (Swagger UI)**: `https://example-app.vercel.app/docs`

**Health Check**:

```bash
curl https://example-app.vercel.app/
```

---

## Testing Concurrency Scenarios

### Scenario 1: Race Condition - Multiple Reservations for Same Item

**Goal**: Attempt to create 2 reservations simultaneously when only 10 items available

```bash
# Terminal 1 - Reserve 8 items
curl -X POST https://example-app.vercel.app/v1/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "get-from-items-endpoint",
    "customer_id": "CUSTOMER_A",
    "quantity": 8
  }'

# Terminal 2 - Simultaneously reserve 5 items (should fail)
curl -X POST https://your-app.vercel.app/v1/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "same-item-id",
    "customer_id": "CUSTOMER_B",
    "quantity": 5
  }'
```

**Expected Result**: Second request returns `409 Conflict - Insufficient available quantity`

### Scenario 2: Double Confirmation (Idempotency Test)

**Goal**: Confirm the same reservation twice to ensure quantity isn't deducted twice

```bash
# Step 1: Create reservation
RESERVATION=$(curl -X POST http://localhost:3000/v1/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "item_id": "item-id-here",
    "customer_id": "TEST_CUSTOMER",
    "quantity": 5
  }' | jq -r '.data.id')

# Step 2: Get item status (note total_quantity)
curl http://localhost:3000/v1/items/{item-id}

# Step 3: Confirm reservation
curl -X POST http://localhost:3000/v1/reservations/$RESERVATION/confirm

# Step 4: Confirm AGAIN (should be idempotent)
curl -X POST http://localhost:3000/v1/reservations/$RESERVATION/confirm

# Step 5: Verify total_quantity only decreased once
curl http://localhost:3000/v1/items/{item-id}
```

**Expected Result**: Both confirmations succeed with `200 OK`, but `total_quantity` only decreases by 5 (not 10)

### Scenario 3: Expired Reservation Cannot Be Confirmed

**Goal**: Ensure expired reservations cannot be confirmed

```bash
# Create a reservation
RESERVATION_ID="your-reservation-id"

# Wait 15+ minutes OR manually set expires_at to past in database:
# UPDATE inventory.reservations SET expires_at = NOW() - INTERVAL '1 minute' WHERE id = 'reservation-id';

# Try to confirm expired reservation
curl -X POST http://localhost:3000/v1/reservations/$RESERVATION_ID/confirm
```

**Expected Result**: `400 Bad Request - Cannot confirm expired reservation`

### Scenario 4: Bulk Concurrency Test

Use this script to simulate multiple concurrent requests:

```bash
#!/bin/bash
# concurrent-test.sh

ITEM_ID="your-item-id"
BASE_URL="http://localhost:3000"

# Launch 5 concurrent reservations
for i in {1..5}; do
  curl -X POST $BASE_URL/v1/reservations \
    -H "Content-Type: application/json" \
    -d "{\"item_id\":\"$ITEM_ID\",\"customer_id\":\"CUSTOMER_$i\",\"quantity\":10}" &
done

wait
echo "All requests completed"
```

**Expected Result**: Only reservations that fit within available quantity succeed; others return `409 Conflict`

---

## Demo Video

**Video Link**: -----

The demo video showcases:

- API endpoints in Swagger UI
- Creating reservations and checking availability
- Concurrency testing (simultaneous reservations)
- Idempotent confirmation operations
- Automatic expiration process

---

## API Endpoints

### Items

- `GET /v1/items` - List all items
- `POST /v1/items` - Create new item
- `GET /v1/items/:id` - Get item with quantity breakdown
- `PUT /v1/items/:id` - Update item
- `DELETE /v1/items/:id` - Delete item
- `GET /v1/items/:id/availability?quantity=X` - Check availability

### Reservations

- `POST /v1/reservations` - Create temporary reservation (15 min expiry)
- `GET /v1/reservations` - List all reservations
- `GET /v1/reservations/:id` - Get reservation details
- `POST /v1/reservations/:id/confirm` - Confirm reservation (permanent)
- `POST /v1/reservations/:id/cancel` - Cancel reservation

### Maintenance

- `POST /v1/maintenance/expire-reservations` - Expire old pending reservations

---

## Known Limitations & Trade-offs

### 1. No Database Transactions

**Trade-off**: Used Supabase's atomic operations instead of explicit transactions  
**Reason**: Supabase client doesn't expose transaction API in the same way  
**Risk**: Potential race condition in confirm operation (check → update item → update reservation)  
**Mitigation**: Database constraints prevent negative quantities; idempotency handles retries

### 2. No Pessimistic Locking

**Trade-off**: Relied on database constraints instead of `SELECT FOR UPDATE`  
**Reason**: Simpler implementation, sufficient for this use case  
**Risk**: Possible "thundering herd" on popular items  
**Mitigation**: Composite index on `(item_id, status)` speeds up availability checks

### 3. Manual Expiration Trigger

**Trade-off**: Requires calling `/maintenance/expire-reservations` endpoint  
**Ideal**: PostgreSQL cron job or background worker  
**Reason**: 4-hour time constraint  
**Mitigation**: Could be called via Vercel Cron Jobs or external scheduler

### 4. No Rate Limiting

**Trade-off**: No API rate limiting implemented  
**Reason**: Time constraint, typically handled at infrastructure level  
**Production Need**: Add rate limiting middleware or use Vercel's built-in protection

### 5. Swagger UI on Vercel

**Trade-off**: May have issues serving Swagger UI static assets on Vercel serverless  
**Reason**: swagger-ui-express expects traditional server, not serverless functions  
**Mitigation**: Using `/api` folder pattern; alternatively could use Scalar or hosted Swagger UI

---

## Architecture Decisions

### Why ENUM for Status?

- Type safety at database level
- Prevents invalid status values
- Better than CHECK constraint for extensibility

### Why Composite Indexes?

- `(item_id, status)`: Optimizes availability checks (most frequent query)
- `(status, expires_at)`: Optimizes expiration process
- Trade-off: Slightly slower writes for much faster reads

---

## Additional Resources

- [API Documentation (Swagger)](http://localhost:3000/docs) - Interactive API testing
- [Testing Guide](src/docs/Test-Scenario.MD) - Comprehensive test scenarios
- [Database Schema](src/migrations/inventory-sql-migration.sql) - Complete SQL migration

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (with auto-reload)
npm run dev

# Build TypeScript
npm run build

# Seed database with sample data
npm run seed

# Test database connection
npm run test:db

# Run linter (if configured)
npm run lint
```
