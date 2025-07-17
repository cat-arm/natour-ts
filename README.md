# Natour-TS

A Node.js + TypeScript RESTful API project for studying and practicing modern backend development. This project is designed as a learning resource for Node.js, Express, TypeScript, MongoDB, and related technologies, with a focus on best practices, security, validation, and API documentation.

---

## Project Purpose

- **Educational**: Built for learning and summarizing how to use Node.js, TypeScript, Express, MongoDB, and a variety of backend libraries.
- **Reference**: Demonstrates real-world patterns for authentication, validation, file upload, payment, and more.
- **API Playground**: Try out endpoints and see live documentation via Swagger UI.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Libraries & Packages Used](#libraries--packages-used)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Swagger API Docs](#swagger-api-docs)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [License](#license)

---

## Features

- **User Authentication & Authorization** (JWT, roles, password reset, update password)
- **Tour Management** (CRUD, filtering, sorting, pagination, geospatial queries)
- **Booking & Stripe Payment Integration**
- **Review System** (users can review tours)
- **Validation** (DTOs with class-validator)
- **Security** (Helmet, rate limiting, sanitization, XSS protection)
- **File Uploads** (user photo, tour images)
- **API Documentation** with Swagger (OpenAPI 3)
- **MVC Structure** with TypeScript types everywhere

---

## Tech Stack

- **Node.js** + **Express**
- **TypeScript**
- **MongoDB** + **Mongoose**
- **Swagger** (swagger-jsdoc, swagger-ui-express)
- **Stripe** (for payment/checkout)
- **Pug** (for some views)
- **class-validator** (for DTO validation)
- **Multer** (file uploads)

---

## Libraries & Packages Used

### Main Dependencies

- bcryptjs
- class-transformer
- class-validator
- compression
- cookie-parser
- cors
- dotenv
- express
- express-mongo-sanitize
- express-rate-limit
- helmet
- hpp
- html-to-text
- jsonwebtoken
- mongodb
- mongoose
- morgan
- multer
- nodemailer
- pug
- reflect-metadata
- sharp
- slugify
- stripe
- swagger-jsdoc
- swagger-ui-express
- validator
- xss-clean

### Dev Dependencies

- @types/compression
- @types/cookie-parser
- @types/cors
- @types/dotenv
- @types/express
- @types/express-mongo-sanitize
- @types/express-rate-limit
- @types/hpp
- @types/html-to-text
- @types/jsonwebtoken
- @types/morgan
- @types/multer
- @types/node
- @types/nodemailer
- @types/pug
- @types/swagger-jsdoc
- @types/swagger-ui-express
- @types/validator
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- eslint
- eslint-config-airbnb
- eslint-config-prettier
- eslint-plugin-import
- eslint-plugin-jsx-a11y
- eslint-plugin-node
- eslint-plugin-prettier
- eslint-plugin-react
- nodemon
- prettier
- ts-node
- typescript

---

## Project Structure

```
natour-ts/
  ├── src/
  │   ├── controller/      # Controllers (business logic)
  │   ├── routes/          # Express route definitions
  │   ├── models/          # Mongoose models
  │   ├── dto/             # Data Transfer Objects (validation)
  │   ├── middleware/      # Custom middleware
  │   ├── utils/           # Utility functions
  │   ├── public/          # Static assets (images, css, js)
  │   ├── views/           # Pug templates
  │   ├── app.ts           # Express app setup
  │   ├── server.ts        # App entrypoint
  │   └── swagger.ts       # Swagger setup
  ├── package.json
  ├── tsconfig.json
  └── README.md
```

---

## API Overview

### Auth/User

- `POST /api/v1/users/signup` — Register a new user
- `POST /api/v1/users/login` — Login and get JWT
- `GET /api/v1/users/logout` — Logout
- `POST /api/v1/users/forgotPassword` — Request password reset
- `PATCH /api/v1/users/resetPassword/:token` — Reset password
- `PATCH /api/v1/users/updateMyPassword` — Update password (login required)
- `GET /api/v1/users/me` — Get current user profile (login required)

### Tour

- `GET /api/v1/tours` — List all tours
- `GET /api/v1/tours/:id` — Get tour by ID
- `GET /api/v1/tours/top-5-cheap` — Top 5 cheap tours
- `GET /api/v1/tours/tour-stats` — Tour statistics
- `GET /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit` — Tours within distance
- `GET /api/v1/tours/distances/:latlng/unit/:unit` — Distances to all tours

### Review

- `GET /api/v1/reviews` — List all reviews (login required)
- `POST /api/v1/reviews` — Create review (login required)
- `PATCH /api/v1/reviews/:id` — Update review (login required)
- `DELETE /api/v1/reviews/:id` — Delete review (login required)

### Booking

- `GET /api/v1/bookings/checkout-session/:tourId` — Create Stripe checkout session (login required)
- `POST /api/v1/bookings/webhook-checkout` — Stripe webhook (for payment)
- `GET /api/v1/bookings/:id` — Get booking by ID (login required)

> **Note:** Some endpoints (create/update/delete tour, get all bookings, etc.) require admin/lead-guide privileges.

---

## Swagger API Docs

- **Interactive API docs available at:**  
  [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Covers:**
  - User/Auth endpoints
  - Tour endpoints (GET, geospatial, stats)
  - Review endpoints
  - Booking endpoints (checkout, webhook, get booking)
- **Try out endpoints directly from the browser!**

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/cat-arm/natour-ts.git
cd natour-ts
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root with at least:

```
NODE_ENV=development
PORT=3000
DATABASE=<your-mongodb-connection-string>
DATABASE_PASSWORD=<your-db-password>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
EMAIL_USERNAME=<your-email-username>
EMAIL_PASSWORD=<your-email-password>
EMAIL_HOST=<your-email-host>
EMAIL_PORT=<your-email-port>
STRIPE_SECRET_KEY=<your-stripe-secret>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
```

### 4. Run the app

```bash
npm start
```

- The server will start on [http://localhost:3000](http://localhost:3000)
- Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs) for Swagger UI

---

## 🧪 Testing

This project uses **Jest** and **Supertest** for automated testing, with mock data for all main resources (users, tours, reviews, bookings). All tests are fully isolated and safe to share.

### Running Tests

```
npm test
```

- All tests are located in `src/__tests__/`.
- Each test file uses `beforeEach` to clear the database and insert fresh mock data, ensuring test isolation.
- Mock data is defined in `src/__tests__/mockData.ts` and contains only fake/sample data (no real user or secret info).
- Tests cover authentication, CRUD operations, and error handling for all main modules.

### Test Structure

- **auth.test.ts**: Authentication and user profile endpoints
- **tour.test.ts**: Tour CRUD endpoints (admin and public)
- **review.test.ts**: Review CRUD endpoints (user)
- **booking.test.ts**: Booking and checkout endpoints

### Best Practices

- All test users/tours are created fresh for each test run.
- All tokens used in tests are generated by logging in with the mock user.
- No real credentials, API keys, or secrets are included in any test or mock data.
- You can safely share or publish the test code and mock data in this repository.

### Adding New Tests

- Add new test files in `src/__tests__/`.
- Use `beforeEach` to set up and tear down test data.
- Use only mock/fake data for all test cases.

### Example: Running a Single Test File

```
npm test -- src/__tests__/tour.test.ts
```

---

## Scripts

- `npm start` — Start the server with nodemon (dev)
- `npm run build` — Compile TypeScript (if configured)
- `npm run lint` — Run ESLint (if configured)

---

## License

[ISC](LICENSE)

---

## Author

[cat-arm](https://github.com/cat-arm)

---

## More

- This project is for learning and demonstration purposes.
- For questions or contributions, open an issue or PR on GitHub.
