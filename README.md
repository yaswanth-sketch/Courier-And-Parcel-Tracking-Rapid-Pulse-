# Rapid Pulse - Premium Courier & Parcel Tracking System

A full-stack MERN application for courier booking, shipment tracking, in-app account support messages, and admin delivery management.

## Project Structure

```text
courier-app/
  backend/                    # Node.js + Express API
    config/db.js
    controllers/
      authController.js
      parcelController.js
      adminController.js
      userController.js
    middleware/auth.js
    models/
      User.js
      Parcel.js
      Feedback.js
      AdminAudit.js
    routes/
      auth.js
      parcels.js
      admin.js
      user.js
    utils/email.js
    seed.js
    server.js
    .env.example
    package.json

  frontend/                   # React + Tailwind
    public/
      index.html
      login-bg.jpg
    src/
      components/
      context/
      layouts/
      pages/
      services/api.js
      App.jsx
      index.js
      index.css
    .env.example
    tailwind.config.js
    package.json
```

## Prerequisites

- Node.js v18+
- MongoDB local server or MongoDB Atlas
- npm or yarn

## Setup

### Backend

```bash
cd backend
npm install
```

Create `.env` from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/courierdb
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

Seed demo data:

```bash
node seed.js
```

Start the backend:

```bash
npm run dev
# or
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

For local development, `frontend/.env.example` uses:

```env
REACT_APP_API_URL=/api
```

The local app runs at `http://localhost:3000`. The backend API runs at `http://localhost:5000`.

## Demo Credentials

| Role  | Email                    | Password |
|-------|--------------------------|----------|
| Admin | admin.parcelyt@gmail.com | admin123 |
| User  | ravi.parcelyt@gmail.com  | demo123  |
| User  | priya.parcelyt@gmail.com | demo123  |

All login/register/admin-created accounts are restricted to valid `@gmail.com` addresses.

## Features

### User

- Gmail-only signup and login
- Public parcel tracking at `/track-parcel`
- User dashboard
- Book parcel
- Track parcel by tracking ID
- Shipment history
- Profile update and password change
- Notifications
- Private account-to-admin support messages
- View admin replies inside the user account

### Admin

- Admin dashboard
- Parcel management
- Shipment status updates
- Analytics charts
- Create admin accounts
- View all user support messages
- Reply to users inside the app and notify their accounts
- View all users

## API Endpoints

### Auth

| Method | Endpoint           | Description      |
|--------|--------------------|------------------|
| POST   | `/api/auth/register` | Register user  |
| POST   | `/api/auth/login`    | Login          |
| GET    | `/api/auth/me`       | Get current user |

### User

| Method | Endpoint                         | Description             |
|--------|----------------------------------|-------------------------|
| GET    | `/api/user/profile`              | Get profile             |
| PUT    | `/api/user/profile`              | Update profile/password |
| GET    | `/api/user/notifications`        | Get notifications       |
| PUT    | `/api/user/notifications/read`   | Mark all read           |
| POST   | `/api/user/feedback`             | Create private account message |
| GET    | `/api/user/feedback`             | User message history    |

### Parcels

| Method | Endpoint                    | Description     |
|--------|-----------------------------|-----------------|
| POST   | `/api/parcels`              | Book new parcel |
| GET    | `/api/parcels/:trackingId`  | Track by ID     |
| GET    | `/api/parcels/my`           | User parcels    |
| GET    | `/api/parcels/dashboard`    | Dashboard stats |

### Admin

| Method | Endpoint                        | Description           |
|--------|---------------------------------|-----------------------|
| GET    | `/api/admin/stats`              | Platform statistics   |
| POST   | `/api/admin/create-admin`       | Create admin account  |
| GET    | `/api/admin/admins`             | Admin list and audit  |
| GET    | `/api/admin/feedback`           | All user messages     |
| PUT    | `/api/admin/feedback/:id`       | Reply/update message  |
| GET    | `/api/admin/parcels`            | All parcels           |
| PUT    | `/api/admin/update-status/:id`  | Update parcel status  |
| GET    | `/api/admin/users`              | All users             |

## Security

- Passwords are hashed with bcrypt.
- JWT authentication protects private routes.
- Admin endpoints require role-based authorization.
- Gmail-only account validation is enforced on frontend and backend.
- CORS is configurable with `CORS_ORIGIN`.
- Tokens are currently stored in localStorage. For stronger production privacy, move auth to secure HTTP-only cookies later.

## Deployment

### Backend

Deploy the backend to Render, Railway, EC2, or a similar Node host.

Set environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_production_secret
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-site.vercel.app
```

Start command:

```bash
npm start
```

### Frontend

Deploy the frontend to Vercel, Netlify, or another static React host.

Build command:

```bash
npm run build
```

Set:

```env
REACT_APP_API_URL=https://your-backend-api.onrender.com/api
```

## Recommended Next Improvements

- Add rate limiting for login and register routes.
- Add password reset and email verification.
- Add receipt/label printing after parcel booking.
- Add parcel cancellation and refund/request workflow.
- Add audit logs for parcel status changes.
- Add stricter input validation with a library such as Joi or Zod.
- Move production auth from localStorage to secure HTTP-only cookies.
- Add MongoDB Atlas, HTTPS, and a strong production `JWT_SECRET` before deployment.

## Notes

If this project is inside OneDrive, OneDrive may lock generated files in `frontend/build`. If normal production builds fail with permission errors, move the project outside OneDrive or exclude `frontend/build` from OneDrive sync.
