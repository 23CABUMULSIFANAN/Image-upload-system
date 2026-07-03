# API Documentation

All routes are under `/api`. Session-based auth via NextAuth; most routes require a logged-in session and check `role` for authorization.

## Auth

### `POST /api/auth/callback/credentials`
Handled internally by NextAuth. Frontend uses `signIn("credentials", { email, password })`.

## Organisations (Product Owner only)

### `POST /api/organisation`
Creates an organisation + auto-generated Admin user.
\`\`\`json
{ "organisationName": "Acme", "adminName": "John", "adminEmail": "john@acme.com", "password": "min6chars" }
\`\`\`

### `GET /api/organisation`
Lists all organisations with admin info and user/image counts.

### `PUT /api/organisation`
Updates an organisation. Body: `{ id, name, address, phone, logoUrl }`.

### `DELETE /api/organisation?id=<id>`
Deletes an organisation and all related users, images, payments, notifications.

## Users (Admin only for write ops)

### `POST /api/user`
Creates a user in the admin's organisation.
\`\`\`json
{ "name": "Jane", "email": "jane@acme.com", "password": "min6chars", "role": "USER" }
\`\`\`

### `GET /api/user`
Lists users in the caller's organisation.

### `PUT /api/user`
Updates a user. Body: `{ id, name, email, role }`.

### `DELETE /api/user?id=<id>`
Deletes a user (must belong to the admin's organisation).

## Images

### `POST /api/upload/presigned-url`
Returns a pre-signed S3 URL for direct client upload.
\`\`\`json
{ "fileName": "photo.jpg", "fileType": "image/jpeg" }
\`\`\`
Response includes `uploadUrl` (for the S3 PUT) and `publicUrl` (final image URL).

### `POST /api/image`
Saves image metadata after S3 upload, enforces quota, creates notifications.
\`\`\`json
{ "imageUrl": "https://...", "fileName": "photo.jpg", "description": "...", "tags": ["userId1"] }
\`\`\`
Returns `403` with `quotaExceeded: true` if the user's free/paid quota is exhausted.

### `GET /api/image`
Returns the caller's quota usage: `{ used, total, remaining }`.

## Payments

### `POST /api/payment/create-order`
Creates a Razorpay order for slot purchase.
\`\`\`json
{ "sets": 1 }
\`\`\`
`sets` = number of 5-slot packs (₹100 each).

### `POST /api/payment/verify`
Verifies Razorpay payment signature and increments quota on success.
\`\`\`json
{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }
\`\`\`

## Notifications

### `GET /api/notification`
Returns notifications where the caller is a receiver (tagged or broadcast).

## Response Format

All routes return:
\`\`\`json
{ "success": true | false, "message": "...", "...": "additional data" }
\`\`\`