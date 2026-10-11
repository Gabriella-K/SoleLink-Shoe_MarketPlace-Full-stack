# SoleLink – Shoe Marketplace

SoleLink is a web marketplace where footwear vendors in Kigali list their shoes and buyers can browse, add items to a bag and place orders.

## Features
- Browse and filter shoes by category, brand, size, condition and price
- Buyer accounts: shopping bag, checkout and order tracking
- Vendor accounts: add and edit shoes, manage stock, accept or reject orders
- Role-based access: buyers and vendors can only do what their role allows
- Passwords are hashed (BCrypt) and sign-in uses a token

## Tech Stack
| Part | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Spring Boot (Java 17), REST API |
| Database | PostgreSQL |

## Project Structure
```
frontend/   React app     (http://localhost:3000)
backend/    Spring Boot API   (http://localhost:8080)
```

## Run Locally

**Requirements:** JDK 17+, Node.js 20+, PostgreSQL

1. Create the database:
```sql
   CREATE DATABASE shoe_marketplace_db;
```

2. Start the backend:
```bash
   cd backend
   DB_PASSWORD='your-postgres-password' ./mvnw spring-boot:run
```
   On Windows PowerShell:
```powershell
   $env:DB_PASSWORD='your-postgres-password'; .\mvnw.cmd spring-boot:run
```

3. Start the frontend:
```bash
   cd frontend
   npm install
   npm run dev
```

4. Open http://localhost:3000

## Environment Variables (backend)
| Variable | Description | Default |
|---|---|---|
| `DB_URL` | JDBC database URL | `jdbc:postgresql://localhost:5432/shoe_marketplace_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | *(required)* |
| `PORT` | Server port | `8080` |

## API Overview
`/api/auth` · `/api/shoes` · `/api/vendors` · `/api/categories` · `/api/cart` · `/api/orders`

Protected endpoints need the header `Authorization: Bearer <token>`, which login returns.

## Author
Gabriella K. – Web Technology, AUCA
