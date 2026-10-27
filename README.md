# Spendwise

Spendwise is a personal finance and expense-tracking application. It is built with React Router, FastAPI, and PostgreSQL.

## Tech Stack

- **Frontend:** React Router 8 (Framework Mode)
- **Frontend Package Management:** `npm`
- **Backend:** Python, FastAPI
- **Backend testing** Pytest
- **Python Package Management:** `uv`
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Database Migrations:** Alembic
- **Database Containerisation:** Docker Compose
- **Authentication Provider**: Auth0

## Prerequisites

Install the following before setting up the project:

- [Git](https://git-scm.com/)
- [Node.js and npm](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [uv](https://docs.astral.sh/uv/)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Spendwise
```

### 2. Configure environment variables

Create a `.env` file inside the `config/` directory.

```bash
mkdir -p config
touch config/.env
```

Add your database connection string:

```dotenv
DATABASE_URL=postgresql+psycopg://<username>:<password>@localhost:5432/spendwise
```

Replace `<username>` and `<password>` with the credentials configured in `compose.yaml`.

**Note:** The `.env` file contains local configuration and credentials. Do not commit it to Git. Use `.env.example` file for reference and to document any changes to the variables.

Example `.env.example`:

### 3. Initialise the database

From the project root, start PostgreSQL:

```bash
docker compose up -d
```

Check that the database container is running:

```bash
docker compose ps
```

### 4. Set up the API

Navigate to the API directory:

```bash
cd api
```

Install the Python dependencies:

```bash
uv sync
```

Apply the database migrations:

```bash
uv run alembic upgrade head
```

Return to the project root when finished:

```bash
cd ..
```

### 5. Set up the frontend

From the project root, install the frontend dependencies:

```bash
npm install
```

This assumes the frontend's `package.json` is in the repository root. If it lives in a separate directory, run the command from that directory instead.

## Running the Project

Start each part of the application in a separate terminal.

### Database

From the project root:

```bash
docker compose up -d
```

### API

From the `api/` directory:

```bash
uv run fastapi dev main.py
```

The API will typically be available at:

- API: http://127.0.0.1:8000 or http://localhost:8000
- Interactive API documentation: http://127.0.0.1:8000/docs or http://localhost:8000/docs

To run back end unit tests, type this into the terminal

```bash
uv run pytest -v
```

### Frontend

From the directory containing the frontend's `package.json`:

```bash
npm run dev
```

Open the local URL printed by the development server, which should be:
http://localhost:5173/

## Database Migrations

Spendwise uses Alembic to manage database schema changes.

Create a migration after updating SQLAlchemy models:

```bash
cd api
uv run alembic revision --autogenerate -m "describe your change"
```

Review the generated migration before applying it.

Apply migrations:

```bash
uv run alembic upgrade head
```

## Development Notes

- Keep secrets and local environment files out of version control.
- Use Alembic migrations to manage database schema changes rather than editing the schema manually.
- Keep request and response schemas separate from SQLAlchemy models.
- Never return password hashes in API responses.
