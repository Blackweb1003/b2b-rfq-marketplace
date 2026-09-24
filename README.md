# MERZADO — B2B RFQ Marketplace

MERZADO is a full-stack B2B Request for Quotation (RFQ) marketplace that connects buyers with suppliers.

Buyers can create and manage sourcing requests, while suppliers can discover open RFQs and submit quotations. The application includes JWT authentication, role-based access control, RFQ lifecycle management, quotation workflows, PostgreSQL persistence, and a React-based frontend.

> **Project Status:** This project is configured for local development and evaluation. It has not been deployed to a production environment.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database](#database)
- [Environment Configuration](#environment-configuration)
- [Authentication](#authentication)
- [User Roles](#user-roles)
- [Workflows](#workflows)
- [RFQ Lifecycle](#rfq-lifecycle)
- [API Endpoints](#api-endpoints)
- [Quotation Submission](#quotation-submission)
- [Authorization and Ownership](#authorization-and-ownership)
- [Error Handling](#error-handling)
- [Local Setup](#local-setup)
- [Running the Complete Application](#running-the-complete-application)
- [Testing and Validation](#testing-and-validation)
- [Security Considerations](#security-considerations)
- [Development Dependencies](#development-dependencies)
- [Future Improvements](#future-improvements)
- [Repository](#repository)
- [Author](#author)

---

## Features

### Authentication

- Buyer and Supplier registration
- JWT-based login authentication
- Argon2 password hashing
- Role-based access control
- Protected frontend routes
- Bearer-token authenticated API requests

### Buyer Features

- Create RFQs
- View own RFQs
- View RFQ details
- Edit open RFQs
- Delete open RFQs
- Close open RFQs
- View quotations received for buyer RFQs
- Manage RFQ lifecycle

### Supplier Features

- Browse available open RFQs
- Search RFQs
- Filter RFQs by delivery location
- View RFQ details
- Submit quotations
- View submitted quotation history
- Duplicate quotation prevention

### Frontend

- Responsive React UI
- Role-based navigation
- Protected routes
- Loading states
- Empty states
- API error handling
- Retry actions
- Form validation
- Confirmation dialogs
- Success and error feedback

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Fetch API
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic
- JWT (`python-jose`)
- Argon2 (`argon2-cffi`)
- Uvicorn

### Database

- PostgreSQL
- Psycopg 3

### Tools

- Git
- GitHub
- VS Code
- Postman

---

## Architecture

```text
                    MERZADO

              React + TypeScript
                     │
                     │ REST API + JWT
                     ▼
              FastAPI Backend
                     │
                     │ SQLAlchemy
                     ▼
                PostgreSQL
```

### Application Responsibilities

| Layer | Responsibilities |
|-------|------------------|
| **Frontend** | User interface, authentication state, role-based navigation, form handling and validation, API communication, loading / error / empty / success states |
| **Backend** | Authentication, authorization, request validation, ownership checks, business rules, RFQ operations, quotation operations, database operations |
| **Database** | User persistence, RFQ persistence, quotation persistence, relational data management through SQLAlchemy |

---

## Project Structure

```text
b2b-rfq-marketplace/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── alembic/
│   ├── alembic.ini
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## Database

MERZADO uses PostgreSQL with SQLAlchemy.

The application expects a local PostgreSQL database with the following configuration:

| Setting  | Value      |
|----------|------------|
| Database | `merzado`  |
| Host     | `localhost`|
| Port     | `5432`     |

Database credentials are supplied through environment variables and should not be committed to the repository.

### Create the Database

Open PostgreSQL and run:

```sql
CREATE DATABASE merzado;
```

---

## Environment Configuration

The backend uses environment variables for local configuration.

Create `backend/.env` based on `backend/.env.example`.

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/merzado
SECRET_KEY=your-local-development-secret
```

> **Important:** Replace the placeholder values with your local PostgreSQL credentials. Do not commit the `.env` file to GitHub.

---

## Authentication

The application uses JWT-based authentication.

### Login Flow

```text
User
  │
  ▼
Frontend Login
  │
  ▼
POST /auth/login
  │
  ▼
FastAPI
  │
  ▼
JWT Access Token
  │
  ▼
Frontend
  │
  ▼
Authorization: Bearer <token>
```

Passwords are hashed using Argon2 before being stored.

The authenticated user's identity is derived from the JWT on protected backend operations.

---

## User Roles

The application has two main roles:

- `BUYER`
- `SUPPLIER`

Each role has separate protected frontend routes and backend authorization rules.

| Role | Capabilities |
|------|--------------|
| **Buyer** | Create and manage RFQs, view quotations received for their RFQs |
| **Supplier** | Browse open RFQs, submit quotations |

---

## Workflows

### Buyer Workflow

```text
Register
   │
   ▼
Login
   │
   ▼
Buyer Dashboard
   │
   ▼
Create RFQ
   │
   ▼
RFQ Status: OPEN
   │
   ├───────────────┐
   │               │
   ▼               ▼
Edit/Delete    Supplier
   │            discovers RFQ
   │                │
   │                ▼
   │          Submit Quote
   │                │
   └────────────────┘
            │
            ▼
    Buyer Views Quotes
            │
            ▼
       Close RFQ
            │
            ▼
      RFQ: CLOSED
```

### Supplier Workflow

```text
Register
   │
   ▼
Login
   │
   ▼
Supplier Dashboard
   │
   ▼
RFQ Marketplace
   │
   ├── Search RFQs
   │
   └── Filter by Delivery Location
   │
   ▼
View RFQ Details
   │
   ▼
Submit Quotation
   │
   ▼
My Quotations
```

---

## RFQ Lifecycle

RFQs have two main states: `OPEN` and `CLOSED`.

### OPEN

An open RFQ can be:

- Viewed
- Edited by its buyer
- Deleted by its buyer
- Closed by its buyer
- Quoted on by eligible suppliers

### CLOSED

A closed RFQ remains visible but cannot be:

- Edited
- Deleted
- Quoted on

---

## API Endpoints

### Authentication

| Method | Endpoint       | Description        |
|--------|----------------|--------------------|
| POST   | `/users/`      | Register a user    |
| POST   | `/auth/login`  | Login and receive JWT |

### Buyer RFQs

| Method | Endpoint                          | Description   |
|--------|-----------------------------------|---------------|
| POST   | `/api/buyer/rfqs`                 | Create RFQ    |
| GET    | `/api/buyer/rfqs`                 | List buyer RFQs |
| GET    | `/api/buyer/rfqs/{rfq_id}`        | Get RFQ details |
| PUT    | `/api/buyer/rfqs/{rfq_id}`        | Update RFQ    |
| DELETE | `/api/buyer/rfqs/{rfq_id}`        | Delete RFQ    |
| PATCH  | `/api/buyer/rfqs/{rfq_id}/close`  | Close RFQ     |

### Buyer Quotations

| Method | Endpoint               | Description                              |
|--------|------------------------|------------------------------------------|
| GET    | `/api/buyer/quotations`| View quotations received for buyer RFQs  |

### Supplier RFQs

| Method | Endpoint                     | Description       |
|--------|------------------------------|-------------------|
| GET    | `/api/supplier/rfqs`         | Browse open RFQs  |
| GET    | `/api/supplier/rfqs/{rfq_id}`| View RFQ details  |

The supplier marketplace supports the following query parameters:

- `search`
- `delivery_location`

### Supplier Quotations

| Method | Endpoint                    | Description                 |
|--------|-----------------------------|-----------------------------|
| POST   | `/api/supplier/quotations`  | Submit quotation            |
| GET    | `/api/supplier/quotations`  | View submitted quotations   |

---

## Quotation Submission

A supplier submits quotation information such as:

```json
{
  "rfq_id": 1,
  "price": 50000,
  "estimated_delivery_time": "15 days",
  "message": "Quotation valid for 30 days"
}
```

The supplier ID is **not** taken from the frontend request. The backend determines the authenticated supplier from the JWT, which prevents clients from submitting quotations on behalf of another supplier.

---

## Authorization and Ownership

Ownership is enforced by the backend.

- **Buyer RFQs:** the authenticated buyer is used to determine which RFQs the buyer can access or modify.
- **Supplier quotations:** the authenticated supplier is used to determine ownership.

Authenticated operations do not rely on client-provided ownership parameters such as `buyer_id` or `supplier_id`. Instead, the backend derives the authenticated user's identity from the JWT.

---

## Error Handling

The frontend handles common API responses including:

| Status | Meaning |
|--------|---------|
| `400`  | Bad Request |
| `401`  | Unauthorized |
| `404`  | Not Found |
| `409`  | Conflict |

The UI provides:

- Loading states
- Empty states
- Error messages
- Retry actions
- Validation feedback
- Success messages
- Confirmation dialogs

A `401 Unauthorized` response clears the authentication state and redirects the user to the login page.

---

## Local Setup

### Prerequisites

Install the following:

- Python
- Node.js
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Blackweb1003/b2b-rfq-marketplace.git
cd b2b-rfq-marketplace
```

### 2. PostgreSQL Setup

Make sure PostgreSQL is running, then create the database:

```sql
CREATE DATABASE merzado;
```

Configure the database connection in `backend/.env` using the structure provided in `backend/.env.example`:

```env
DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/merzado
SECRET_KEY=your-local-development-secret
```

### 3. Backend Setup

From the project root:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it (Windows PowerShell):

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 4. Run Database Migrations

From the `backend` directory:

```bash
alembic upgrade head
```

### 5. Start the Backend

```bash
uvicorn app.main:app --reload
```

- Backend: <http://127.0.0.1:8000>
- Swagger docs: <http://127.0.0.1:8000/docs>

### 6. Start the Frontend

Open a second terminal. From the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally be available at <http://127.0.0.1:5173>.

---

## Running the Complete Application

Two terminals are required.

**Terminal 1 — Backend**

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

Then open <http://127.0.0.1:5173>.

---

## Testing and Validation

The project was validated through static checks and manual end-to-end testing.

### Static Checks

**Frontend build** (from `frontend`):

```bash
npm run build
```

**Backend compilation** (from `backend`):

```bash
python -m compileall -q app
```

**Backend application import:** the FastAPI application can be imported successfully and its OpenAPI schema can be generated successfully.

**Route validation:** the implemented backend routes were verified against the frontend API calls.

### Manual Testing

**Buyer**

- Registration
- Login
- RFQ creation
- RFQ listing
- RFQ detail
- RFQ editing
- RFQ deletion
- RFQ closing
- Buyer quotation viewing
- Buyer ownership isolation

**Supplier**

- Registration
- Login
- RFQ marketplace
- RFQ search
- Delivery-location filtering
- RFQ detail
- Quotation submission
- Quotation history

**Authorization**

- Buyer-only pages
- Supplier-only pages
- JWT authentication
- Ownership restrictions
- Protected API requests

---

## Security Considerations

The current configuration is intended for local development and evaluation.

For a production deployment, the following should be implemented:

- Store database credentials in secure environment variables
- Use a strong production JWT secret
- Use a production PostgreSQL user with appropriate permissions
- Configure HTTPS
- Configure production CORS settings
- Never commit `.env` files containing secrets
- Use production-specific configuration
- Add appropriate logging and monitoring

The repository includes `backend/.env.example` as a reference for environment configuration.

---

## Development Dependencies

Backend dependencies are defined in `backend/requirements.txt`, including:

- SQLAlchemy
- Alembic
- Psycopg
- Pydantic
- email-validator
- argon2-cffi
- FastAPI
- Uvicorn
- python-jose

Frontend dependencies are defined in `frontend/package.json`.

---

## Future Improvements

- [ ] Automated backend tests
- [ ] Automated frontend tests
- [ ] CI/CD pipeline
- [ ] Docker deployment
- [ ] Production logging
- [ ] Email notifications
- [ ] Supplier quotation comparison
- [ ] Buyer quotation management actions
- [ ] Advanced supplier filtering
- [ ] Pagination for large RFQ and quotation datasets
- [ ] Production deployment

---

## Project Status

This repository represents the completed local development version of the MERZADO B2B RFQ Marketplace assignment.

The application is intended to be run locally using React + Vite, FastAPI, SQLAlchemy, and PostgreSQL.

No production deployment is included in this submission.

---

## Repository

GitHub: <https://github.com/Blackweb1003/b2b-rfq-marketplace>

---

## Author

**Kishan Malkam**
B.E. Artificial Intelligence & Data Science
