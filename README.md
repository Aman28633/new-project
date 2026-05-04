# Team Task Manager

Full-stack assignment project for creating projects, managing team members, assigning tasks, and tracking progress with role-based access control.

## Assignment Mapping

- Authentication: Signup, login, JWT session, current user endpoint.
- Project and team management: Admins create projects and add members by email.
- Task creation and assignment: Project admins create tasks, set priority, due date, and assignee.
- Status tracking: Tasks move through `To do`, `In progress`, `Review`, and `Done`.
- Dashboard: Total projects, total tasks, tasks assigned to current user, overdue count, and status board.
- REST APIs: FastAPI endpoints under `/api`.
- Database: SQLAlchemy models with PostgreSQL on Railway or SQLite locally.
- Validations and relationships: Pydantic validation, unique users, project memberships, task assignees limited to project members.
- RBAC: Global Admin and project Admin can manage projects/tasks; Members can view project work and update their assigned task status.
- Deployment: Dockerfiles included for Railway deployment.

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, CSS modules.
- Backend: FastAPI, SQLAlchemy, Pydantic, JWT auth.
- Database: PostgreSQL for deployment, SQLite for quick local testing.
- Deployment target: Railway.

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `POST /api/projects`
- `GET /api/projects`
- `POST /api/projects/{project_id}/members`
- `POST /api/projects/{project_id}/tasks`
- `GET /api/tasks`
- `PATCH /api/tasks/{task_id}`
- `GET /api/dashboard`

## Local Run

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Docker Run

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API health: `http://localhost:8000/health`

## Railway Deployment

Create three Railway services:

1. PostgreSQL database service.
2. Backend service from `backend/`.
3. Frontend service from `frontend/`.

Backend variables:

```text
DATABASE_URL=<Railway PostgreSQL URL>
SECRET_KEY=<long random secret>
FRONTEND_ORIGIN=https://<frontend-service>.up.railway.app
FRONTEND_ORIGINS=https://<frontend-service>.up.railway.app,http://localhost:3000
```

Frontend variables:

```text
NEXT_PUBLIC_API_BASE_URL=https://<backend-service>.up.railway.app/api
```

After deployment, submit:

- Live URL: Railway frontend public domain.
- GitHub repo: Repository containing this code.
- README: This file.
- Demo video: 2 to 5 minutes showing signup, project creation, team member add, task assignment, status update, overdue/dashboard metrics.

## Demo Script

1. Signup as Admin.
2. Create a project.
3. Signup or create another account as Member.
4. Add the member to the project by email.
5. Create a task, assign it, and set a due date.
6. Login as Member and update task status.
7. Show dashboard counts and overdue/status columns.
