# Swagger Testing Guide - Complete Test Scenarios

This guide provides comprehensive test scenarios to verify all functionality of the Inventory Reservation API.

## Prerequisites

1. Start the server: `npm run dev`
2. Seed the database: `npm run seed`
3. Open Swagger UI: `http://localhost:3000/api-docs`

---

## Test Scenario 1: Items Management (CRUD)

### 1.1 Create New Item

**Endpoint:** `POST /v1/items`

**Request Body:**

```json
{
  "name": "Gaming Laptop - ASUS ROG",
  "initial_quantity": 25
}
```

**Expected Result:**

- Status: `201 Created`
- Response includes: `id`, `name`, `total_quantity: 25`, timestamps
- **Save the `id` for next tests**

### 1.2 Get All Items

**Endpoint:** `GET /v1/items`

**Expected Result:**

- Status: `200 OK`
- Array of items including the one you just created

### 1.3 Get Item Status (Detailed)

**Endpoint:** `GET /v1/items/{id}` (use ID from 1.1)

**Expected Result:**

```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Gaming Laptop - ASUS ROG",
    "total_quantity": 25,
    "available_quantity": 25,
    "reserved_quantity": 0,
    "confirmed_quantity": 0
  }
}
```

### 1.4 Update Item

**Endpoint:** `PUT /v1/items/{id}`

**Request Body:**

```json
{
  "name": "Gaming Laptop - ASUS ROG Strix",
  "total_quantity": 30
}
```

**Expected Result:**

- Status: `200 OK`
- Updated values reflected

### 1.5 Check Item Availability

**Endpoint:** `GET /v1/items/{id}/availability?quantity=10`

**Expected Result:**

```json
{
  "success": true,
  "data": {
    "available": true
  }
}
```

---

## Test Scenario 2: Reservation Creation & Availability

### 2.1 Create Valid Reservation

**Endpoint:** `POST /v1/reservations`

**⚠️ IMPORTANT:** Replace `{use-item-id-from-1.1}` with the actual UUID from step 1.1!

**Request Body:**

```json
{
  "item_id": "paste-the-actual-uuid-here-from-step-1.1",
  "customer_id": "TEST_CUSTOMER_001",
  "quantity": 5
}
```

**Expected Result:**

- Status: `201 Created`
- Response includes:
  - `id` (reservation ID - **save this**)
  - `status: "PENDING"`
  - `expires_at` (15 minutes from now)
  - All request fields
- **Save the reservation `id`**

**Troubleshooting:**

- If you get "Item not found", make sure you're using the actual item ID from step 1.1
- You can verify the item exists by calling `GET /v1/items/{id}` first

### 2.2 Verify Quantities Updated

**Endpoint:** `GET /v1/items/{item_id}`

**Expected Result:**

```json
{
  "total_quantity": 30,
  "available_quantity": 25, // 30 - 5
  "reserved_quantity": 5,
  "confirmed_quantity": 0
}
```

### 2.3 Create Reservation with Insufficient Quantity

**Endpoint:** `POST /v1/reservations`

**Request Body:**

```json
{
  "item_id": "{same-item-id}",
  "customer_id": "TEST_CUSTOMER_002",
  "quantity": 100
}
```

**Expected Result:**

- Status: `409 Conflict`
- Error message: "Insufficient available quantity"

### 2.4 Create Multiple Reservations for Same Item

**Endpoint:** `POST /v1/reservations` (repeat 2 times)

**Request Body 1:**

```json
{
  "item_id": "{same-item-id}",
  "customer_id": "TEST_CUSTOMER_003",
  "quantity": 10
}
```

**Request Body 2:**

```json
{
  "item_id": "{same-item-id}",
  "customer_id": "TEST_CUSTOMER_004",
  "quantity": 8
}
```

**Expected Result:**

- Both succeed
- Check item status: `reserved_quantity` should be 23 (5+10+8)
- **Save both reservation IDs**

---

## Test Scenario 3: Reservation Confirmation (Critical!)

### 3.1 Get Reservation Before Confirmation

**Endpoint:** `GET /v1/reservations/{id}` (use ID from 2.1)

**Expected Result:**

- Status: `PENDING`
- Note the `expires_at` time

### 3.2 Confirm Valid Reservation (First Time)

**Endpoint:** `POST /v1/reservations/{id}/confirm`

**Expected Result:**

- Status: `200 OK`
- Response: `status: "CONFIRMED"`
- Check item status:
  - `total_quantity` decreased by 5 (now 25)
  - `reserved_quantity` decreased by 5 (now 18)
  - `confirmed_quantity` stays 0 (confirmed reservations don't count as reserved)
  - `available_quantity` = 25 - 18 = 7

### 3.3 Confirm Same Reservation Again (Idempotency Test)

**Endpoint:** `POST /v1/reservations/{id}/confirm` (same ID)

**Expected Result:**

- Status: `200 OK`
- Still shows `status: "CONFIRMED"`
- **Item quantity NOT deducted again** (verify total_quantity is still 25)
- ✅ **Passes idempotency requirement**

### 3.4 Try to Cancel Confirmed Reservation

**Endpoint:** `POST /v1/reservations/{id}/cancel`

**Expected Result:**

- Status: `400 Bad Request`
- Error: "Cannot cancel confirmed reservation"

---

## Test Scenario 4: Reservation Cancellation

### 4.1 Cancel Pending Reservation (First Time)

**Endpoint:** `POST /v1/reservations/{id}/cancel` (use ID from 2.4 - first one)

**Expected Result:**

- Status: `200 OK`
- Response: `status: "CANCELLED"`
- Check item status:
  - `reserved_quantity` decreased by 10 (now 8)
  - `available_quantity` increased by 10 (now 17)

### 4.2 Cancel Same Reservation Again (Idempotency Test)

**Endpoint:** `POST /v1/reservations/{id}/cancel` (same ID)

**Expected Result:**

- Status: `200 OK`
- Still shows `status: "CANCELLED"`
- **Quantity NOT released again** (verify available_quantity is still 17)
- ✅ **Passes idempotency requirement**

---

## Test Scenario 5: Expiration Handling

### 5.1 Create Reservation (Will Expire Soon)

**Note:** This tests the expiration logic, but you'll need to wait or manually update the DB.

**Option A - Manual DB Update (Faster):**

1. Create a reservation using `POST /v1/reservations`
2. In Supabase, manually set `expires_at` to a past date
3. Continue with 5.2

**Option B - Wait (If testing automatically):**

1. Modify the service to use 1-minute expiry for testing
2. Create reservation and wait 1 minute

### 5.2 Try to Confirm Expired Reservation

**Endpoint:** `POST /v1/reservations/{expired-id}/confirm`

**Expected Result:**

- Status: `400 Bad Request`
- Error: "Cannot confirm expired reservation"
- **Quantity NOT deducted** ✅

### 5.3 Run Expiration Maintenance

**Endpoint:** `POST /v1/maintenance/expire-reservations`

**Expected Result:**

```json
{
  "success": true,
  "data": {
    "expired_count": 1 // or more
  }
}
```

### 5.4 Check Expired Reservation Status

**Endpoint:** `GET /v1/reservations/{expired-id}`

**Expected Result:**

- `status: "EXPIRED"`
- Check item status: `reserved_quantity` decreased (expired reservations released)

---

## Test Scenario 6: Edge Cases & Error Handling

### 6.1 Invalid Item ID (Reservation)

**Endpoint:** `POST /v1/reservations`

**Request Body:**

```json
{
  "item_id": "00000000-0000-0000-0000-000000000000",
  "customer_id": "TEST",
  "quantity": 1
}
```

**Expected Result:**

- Status: `500` or `404`
- Error: "Item not found"

### 6.2 Invalid UUID Format

**Endpoint:** `GET /v1/items/invalid-uuid`

**Expected Result:**

- Status: `400 Bad Request`
- Validation error about UUID format

### 6.3 Zero or Negative Quantity

**Endpoint:** `POST /v1/reservations`

**Request Body:**

```json
{
  "item_id": "{valid-id}",
  "customer_id": "TEST",
  "quantity": 0
}
```

**Expected Result:**

- Status: `400 Bad Request`
- Validation error: "Quantity must be greater than 0"

### 6.4 Missing Required Fields

**Endpoint:** `POST /v1/items`

**Request Body:**

```json
{
  "name": "Test Item"
  // missing initial_quantity
}
```

**Expected Result:**

- Status: `400 Bad Request`
- Validation error

### 6.5 Update Item with No Fields

**Endpoint:** `PUT /v1/items/{id}`

**Request Body:**

```json
{}
```

**Expected Result:**

- Status: `400 Bad Request`
- Error: "At least one field must be provided to update"

---

## Test Scenario 7: Complete Workflow (End-to-End)

This scenario simulates a real-world purchase flow.

### Step 1: Customer Browses Items

```
GET /v1/items
```

### Step 2: Customer Checks Specific Item

```
GET /v1/items/{id}
```

- Note: `available_quantity: 25`

### Step 3: Customer Creates Reservation

```
POST /v1/reservations
{
  "item_id": "{id}",
  "customer_id": "CUSTOMER_WORKFLOW",
  "quantity": 3
}
```

- **Available quantity now: 22**

### Step 4: Customer Completes Checkout

```
POST /v1/reservations/{reservation_id}/confirm
```

- **Total quantity permanently reduced to 22**
- **Available quantity: 22** (since confirmed reservation no longer counts as reserved)

### Step 5: Verify Final State

```
GET /v1/items/{id}
```

Expected:

```json
{
  "total_quantity": 22,
  "available_quantity": 22,
  "reserved_quantity": 0,
  "confirmed_quantity": 0
}
```

---

## Test Scenario 8: Concurrent Reservations (Manual Test)

1. Create item with `total_quantity: 10`
2. Quickly create two reservations for `quantity: 8` each
3. **Expected:** Second one should fail with 409 Conflict
4. **Verify:** Only first reservation succeeds

---

## Summary Checklist

After completing all scenarios, verify:

- ✅ Items can be created, read, updated, deleted
- ✅ Item status shows correct quantity breakdowns
- ✅ Reservations check availability before creation
- ✅ 409 error when insufficient quantity
- ✅ Reservations expire after 15 minutes
- ✅ Confirmation deducts from total_quantity
- ✅ Confirmation is idempotent (safe to retry)
- ✅ Cancellation releases quantity
- ✅ Cancellation is idempotent (safe to retry)
- ✅ Cannot confirm expired reservations
- ✅ Cannot cancel confirmed reservations
- ✅ Maintenance endpoint expires old reservations
- ✅ All validation errors return 400
- ✅ Resource not found returns 404
- ✅ Insufficient quantity returns 409

---

## Quick Verification Script

Run these in order to quickly verify everything works:

1. `POST /v1/items` - Create item (qty: 50)
2. `GET /v1/items/{id}` - Verify: available = 50
3. `POST /v1/reservations` - Reserve 10
4. `GET /v1/items/{id}` - Verify: available = 40, reserved = 10
5. `POST /v1/reservations/{id}/confirm` - Confirm
6. `GET /v1/items/{id}` - Verify: total = 40, available = 40
7. `POST /v1/reservations/{id}/confirm` - Retry confirm
8. `GET /v1/items/{id}` - Verify: total still = 40 (idempotent!)
9. `POST /v1/reservations` - Reserve 15
10. `POST /v1/reservations/{id}/cancel` - Cancel
11. `GET /v1/items/{id}` - Verify: available back to 40

All tests pass? ✅ Your API is working correctly!
