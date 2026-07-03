# Image Upload & Payment System

A Progressive Web App (PWA) built with Next.js that lets organisations manage users who upload images under a quota system. Additional upload slots are purchased via Razorpay, and images are stored in AWS S3.

## Tech Stack

- **Frontend**: Next.js 14, ShadCN UI, Tailwind CSS
- **Auth**: NextAuth.js (JWT sessions, credentials provider, role-based guards)
- **Backend**: Next.js API routes
- **ORM**: Prisma
- **Database**: PostgreSQL
- **File Storage**: AWS S3 (pre-signed URL uploads)
- **Payments**: Razorpay
- **Testing**: Jest

## Roles

| Role | Capabilities |
|---|---|
| Product Owner | Create/edit/delete organisations. Auto-generates a default Admin per org. |
| Admin | Add/edit/delete users within their organisation. |
| User | Upload up to 5 images free, purchase more in sets of 5 (₹100/set), tag users, view org gallery. |

## Getting Started

### 1. Clone & Install

\`\`\`bash
git clone <repo-url>
cd image-upload-system
npm install
\`\`\`

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in the values (see [Environment Variables](#environment-variables) below).

### 3. Database Setup

\`\`\`bash
npx prisma generate
npx prisma migrate dev
\`\`\`

### 4. Run the Dev Server

\`\`\`bash
npm run dev
\`\`\`

App runs at `http://localhost:3000`.

### 5. Run Tests

\`\`\`bash
npm test
\`\`\`

## Creating the First Product Owner

There's no UI to create a Product Owner (by design — it's the top-level role). Use a seed script:

\`\`\`bash
node seed-owner.js
\`\`\`

Edit the script first to set the desired email/password.

## Project Structure

\`\`\`
app/
  (auth)/login/        - Login page
  admin/                - Admin dashboard, user management
  product-owner/        - Organisation management
  user/                 - User dashboard, image upload
  gallery/              - Org-wide image gallery
  notification/         - Notifications page
  profile/              - User profile
  api/                  - Backend API routes
lib/
  auth.ts               - NextAuth configuration
  prisma.ts             - Prisma client instance
prisma/
  schema.prisma          - Database schema
\`\`\`

## Deployment

- **Frontend**: Vercel
- **Backend**: Azure VM (Node.js API server)
- **Database**: Azure Database for PostgreSQL

See [API Documentation](./API_DOCS.md) for endpoint details.