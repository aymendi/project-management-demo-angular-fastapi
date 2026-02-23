# Demo Angular + FastAPI + GraphQL (Training)

Full-stack demo project:
- Backend: FastAPI + Strawberry GraphQL + PostgreSQL
- Frontend: Angular + Apollo GraphQL + ngx-translate
- Testing: Jest (ng test)

## Prerequisites
- Node.js (LTS recommended)
- Angular CLI
- Python 3.10+ (or your project version)
- Docker + Docker Compose
- (Optional) Git

## Project structure
- backend/
- frontend/

---

## 1) Database (Postgres with Docker)
From project root:

```bash
docker compose up -d
docker compose ps