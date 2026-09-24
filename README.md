\# MERZADO — B2B RFQ Marketplace



MERZADO is a full-stack B2B Request for Quotation (RFQ) marketplace that connects buyers with suppliers.



Buyers can create and manage sourcing requests, while suppliers can discover open RFQs and submit quotations. The application includes JWT authentication, role-based access control, RFQ lifecycle management, quotation workflows, PostgreSQL persistence, and a React-based frontend.



\---



\## Features



\### Authentication



\- Buyer and Supplier registration

\- JWT-based login authentication

\- Argon2 password hashing

\- Role-based access control

\- Protected frontend routes

\- Bearer-token authenticated API requests



\### Buyer Features



\- Create RFQs

\- View own RFQs

\- View RFQ details

\- Edit open RFQs

\- Delete open RFQs

\- Close open RFQs

\- View quotations received for buyer RFQs

\- Manage RFQ lifecycle



\### Supplier Features



\- Browse available open RFQs

\- Search RFQs

\- Filter RFQs by delivery location

\- View RFQ details

\- Submit quotations

\- View submitted quotation history

\- Duplicate quotation prevention



\### Frontend



\- Responsive React UI

\- Role-based navigation

\- Protected routes

\- Loading states

\- Empty states

\- API error handling

\- Retry actions

\- Form validation

\- Confirmation dialogs

\- Success/error feedback



\---



\## Tech Stack



\### Frontend



\- React

\- TypeScript

\- Vite

\- React Router

\- Fetch API

\- CSS



\### Backend



\- Python

\- FastAPI

\- SQLAlchemy

\- Pydantic

\- Alembic

\- JWT (`python-jose`)

\- Argon2 (`argon2-cffi`)

\- Uvicorn



\### Database



\- PostgreSQL

\- Psycopg 3



\### Tools



\- Git

\- GitHub

\- VS Code

\- Postman



\---



\## Project Architecture



```text

MERZADO

│

├── frontend/

│   └── React + TypeScript + Vite

│

├── backend/

│   └── FastAPI + SQLAlchemy

│

└── PostgreSQL

```



Application flow:



```text

React Frontend

&#x20;     │

&#x20;     │ REST API + JWT

&#x20;     ▼

FastAPI Backend

&#x20;     │

&#x20;     │ SQLAlchemy

&#x20;     ▼

PostgreSQL Database

```



The frontend handles the user interface and API communication.



The backend is responsible for authentication, authorization, validation, ownership checks, business rules, and database operations.



\---



\## Project Structure



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

└── README.md

```



\---



\# Database



MERZADO uses PostgreSQL with SQLAlchemy.



The current development database configuration is:



```text

postgresql+psycopg://postgres:postgres@localhost:5432/merzado

```



This means the local PostgreSQL database should be:



```text

Database: merzado

Host: localhost

Port: 5432

Username: postgres

Password: postgres

```



> For production, these credentials should be moved to secure environment variables or a secrets manager. The current project configuration uses the development connection directly in the backend.



\---



\# Authentication



The application uses JWT authentication.



Login flow:



```text

User

&#x20;│

&#x20;▼

Frontend Login

&#x20;│

&#x20;▼

POST /auth/login

&#x20;│

&#x20;▼

FastAPI

&#x20;│

&#x20;▼

JWT Access Token

&#x20;│

&#x20;▼

Frontend

&#x20;│

&#x20;▼

Authorization: Bearer <token>

```



Passwords are hashed using Argon2 before being stored.



The backend currently uses:



```text

SECRET\_KEY = "change-this-secret-key-in-production"

```



This is a development configuration and must be replaced with a secure secret before production deployment.



\---



\# User Roles



The application has two main roles:



```text

BUYER

SUPPLIER

```



Each role has its own protected frontend routes and backend authorization rules.



\### Buyer



Buyers manage sourcing requests and view supplier quotations.



\### Supplier



Suppliers browse buyer RFQs and submit quotations.



\---



\# Buyer Workflow



```text

Register

&#x20;  │

&#x20;  ▼

Login

&#x20;  │

&#x20;  ▼

Buyer Dashboard

&#x20;  │

&#x20;  ▼

Create RFQ

&#x20;  │

&#x20;  ▼

RFQ Status: OPEN

&#x20;  │

&#x20;  ├───────────────┐

&#x20;  │               │

&#x20;  ▼               ▼

Edit/Delete      Supplier

&#x20;  │              discovers RFQ

&#x20;  │                  │

&#x20;  │                  ▼

&#x20;  │             Submit Quote

&#x20;  │                  │

&#x20;  │                  ▼

&#x20;  └──────────── Buyer Views Quote

&#x20;                     │

&#x20;                     ▼

&#x20;                 Close RFQ

&#x20;                     │

&#x20;                     ▼

&#x20;                RFQ: CLOSED

```



\---



\# Supplier Workflow



```text

Register

&#x20;  │

&#x20;  ▼

Login

&#x20;  │

&#x20;  ▼

Supplier Dashboard

&#x20;  │

&#x20;  ▼

RFQ Marketplace

&#x20;  │

&#x20;  ├── Search RFQs

&#x20;  └── Filter by Delivery Location

&#x20;  │

&#x20;  ▼

View RFQ Details

&#x20;  │

&#x20;  ▼

Submit Quotation

&#x20;  │

&#x20;  ▼

My Quotations

```



\---



\# RFQ Lifecycle



RFQs have two main states:



```text

OPEN

CLOSED

```



\### OPEN



An open RFQ can be:



\- Viewed

\- Edited by its buyer

\- Deleted by its buyer

\- Closed by its buyer

\- Quoted on by eligible suppliers



\### CLOSED



A closed RFQ remains visible but cannot be edited, deleted, or quoted on.



\---



\# API Endpoints



\## Authentication



| Method | Endpoint | Description |

|---|---|---|

| POST | `/users/` | Register a user |

| POST | `/auth/login` | Login and receive JWT |



\---



\## Buyer RFQs



| Method | Endpoint | Description |

|---|---|---|

| POST | `/api/buyer/rfqs` | Create RFQ |

| GET | `/api/buyer/rfqs` | List buyer RFQs |

| GET | `/api/buyer/rfqs/{rfq\_id}` | Get RFQ details |

| PUT | `/api/buyer/rfqs/{rfq\_id}` | Update RFQ |

| DELETE | `/api/buyer/rfqs/{rfq\_id}` | Delete RFQ |

| PATCH | `/api/buyer/rfqs/{rfq\_id}/close` | Close RFQ |



\---



\## Buyer Quotations



| Method | Endpoint | Description |

|---|---|---|

| GET | `/api/buyer/quotations` | View quotations received for buyer RFQs |



\---



\## Supplier RFQs



| Method | Endpoint | Description |

|---|---|---|

| GET | `/api/supplier/rfqs` | Browse open RFQs |

| GET | `/api/supplier/rfqs/{rfq\_id}` | View RFQ details |



The supplier marketplace supports:



```text

search

delivery\_location

```



\---



\## Supplier Quotations



| Method | Endpoint | Description |

|---|---|---|

| POST | `/api/supplier/quotations` | Submit quotation |

| GET | `/api/supplier/quotations` | View submitted quotations |



\---



\# Quotation Submission



A supplier submits:



```json

{

&#x20; "rfq\_id": 1,

&#x20; "price": 50000,

&#x20; "estimated\_delivery\_time": "15 days",

&#x20; "message": "Quotation valid for 30 days"

}

```



The supplier ID is not taken from the frontend request.



The backend determines the authenticated supplier from the JWT.



This prevents clients from submitting quotations on behalf of another supplier.



\---



\# Authorization and Ownership



Ownership is enforced by the backend.



For buyer RFQs, the authenticated buyer is used to determine which RFQs they can access or modify.



For supplier quotations, the authenticated supplier is used to determine ownership.



The frontend does not send:



```text

buyer\_id

supplier\_id

```



as ownership parameters for authenticated operations.



Instead, the backend derives identity from the authenticated JWT.



\---



\# Error Handling



The frontend handles common API responses including:



```text

400 Bad Request

401 Unauthorized

404 Not Found

409 Conflict

```



The UI provides:



\- Loading states

\- Empty states

\- Error messages

\- Retry actions

\- Validation feedback

\- Success messages

\- Confirmation dialogs



A `401 Unauthorized` response clears the authentication state and redirects the user to the login page.



\---



\# Local Setup



\## Prerequisites



Install the following:



\- Python

\- Node.js

\- npm

\- PostgreSQL

\- Git



\---



\## 1. Clone the Repository



```bash

git clone https://github.com/Blackweb1003/b2b-rfq-marketplace.git

cd b2b-rfq-marketplace

```



\---



\# 2. PostgreSQL Setup



Make sure PostgreSQL is running.



Create the database:



```sql

CREATE DATABASE merzado;

```



The current development backend expects:



```text

Host: localhost

Port: 5432

Database: merzado

User: postgres

Password: postgres

```



Make sure the PostgreSQL user has permission to access the database.



\---



\# 3. Backend Setup



From the project root:



```powershell

cd backend

```



Create a virtual environment:



```powershell

python -m venv .venv

```



Activate it:



```powershell

.\\.venv\\Scripts\\Activate.ps1

```



Install dependencies:



```powershell

pip install -r requirements.txt

```



\---



\# 4. Run Database Migrations



The project includes Alembic.



From the `backend` directory:



```powershell

alembic upgrade head

```



\---



\# 5. Start the Backend



Run:



```powershell

uvicorn app.main:app --reload

```



The backend will be available at:



```text

http://127.0.0.1:8000

```



FastAPI Swagger documentation:



```text

http://127.0.0.1:8000/docs

```



\---



\# 6. Start the Frontend



Open a second terminal.



From the project root:



```powershell

cd frontend

```



Install dependencies:



```powershell

npm install

```



Start the development server:



```powershell

npm run dev

```



The frontend will normally be available at:



```text

http://127.0.0.1:5173

```



\---



\# Running the Complete Application



You need two terminals.



\### Terminal 1 — Backend



```powershell

cd D:\\Assignment\_MERZADO\\backend

.\\.venv\\Scripts\\Activate.ps1

uvicorn app.main:app --reload

```



\### Terminal 2 — Frontend



```powershell

cd D:\\Assignment\_MERZADO\\frontend

npm run dev

```



Then open:



```text

http://127.0.0.1:5173

```



\---



\# Testing



The project has been validated through both static checks and manual end-to-end testing.



\## Frontend Build



```powershell

npm run build

```



\## Backend Compilation



```powershell

python -m compileall -q app

```



\## Backend Application Import



The FastAPI application can be imported successfully and its OpenAPI schema generated successfully.



\## Route Validation



The implemented backend routes were verified against the frontend API calls.



\## Manual Testing



The following workflows were tested:



\### Buyer



\- Registration

\- Login

\- RFQ creation

\- RFQ listing

\- RFQ detail

\- RFQ editing

\- RFQ deletion

\- RFQ closing

\- Buyer quotation viewing

\- Buyer ownership isolation



\### Supplier



\- Registration

\- Login

\- RFQ marketplace

\- RFQ search

\- Delivery-location filtering

\- RFQ detail

\- Quotation submission

\- Quotation history



\### Authorization



\- Buyer-only pages

\- Supplier-only pages

\- JWT authentication

\- Ownership restrictions

\- Protected API requests



\---



\# Development Dependencies



Backend dependencies are defined in:



```text

backend/requirements.txt

```



Current backend dependencies include:



```text

SQLAlchemy==2.0.36

alembic==1.14.0

psycopg\[binary]==3.3.6

pydantic==2.13.5

email-validator==2.3.0

argon2-cffi

fastapi

uvicorn\[standard]

python-jose\[cryptography]

```



\---



\# Security Notes



The current configuration is intended for local development.



Before deploying to production:



\- Replace the development JWT secret

\- Do not hardcode database credentials

\- Use environment variables for secrets

\- Use a production PostgreSQL user/password

\- Configure HTTPS

\- Configure production CORS settings

\- Do not commit `.env` files containing secrets



The repository includes:



```text

backend/.env.example

```



for environment configuration reference.



\---



\# Future Improvements



Possible future improvements include:



\- Production environment configuration

\- Automated backend tests

\- Automated frontend tests

\- CI/CD pipeline

\- Docker deployment

\- Production logging

\- Email notifications

\- Supplier quotation comparison

\- Buyer quotation management actions

\- Advanced supplier filtering

\- Pagination for large RFQ/quotation datasets

\- Production deployment



\---



\# Git Workflow



Check repository status:



```powershell

git status

```



Stage changes:



```powershell

git add .

```



Commit:



```powershell

git commit -m "Your commit message"

```



Push:



```powershell

git push origin main

```



\---



\# Repository



GitHub:



https://github.com/Blackweb1003/b2b-rfq-marketplace



\---



\# Author



\*\*Kishan Malkam\*\*



B.E. Artificial Intelligence \& Data Science



GitHub: \[Blackweb1003](https://github.com/Blackweb1003)

