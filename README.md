# Garow SaaS Starter

Garow es una aplicación de gestión de proyectos y tareas con un frontend Next.js y una API Django REST Framework.

## Estructura

- `backend/`: Django, DRF, JWT y SQLite para desarrollo.
- `frontend/`: Next.js, React y Tailwind CSS.

## Backend

Desde `backend/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py runserver
```

Configura `DJANGO_SECRET_KEY` con un secreto largo antes de usar el proyecto fuera de desarrollo. `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS` se leen desde el entorno.

## Frontend

Desde `frontend/`:

```powershell
npm install
npm run dev
```

Opcionalmente, crea `.env.local` para cambiar la API:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Abre `http://localhost:3000`.

## Funcionalidades

- Registro y login con access/refresh JWT.
- Refresh automático del access token y logout con blacklist en backend.
- Dashboard protegido con proyectos propios.
- CRUD de proyectos.
- CRUD de tareas con estados `TODO`, `IN_PROGRESS` y `DONE`.
- Protección de recursos por usuario propietario.
- Manejo diferenciado de errores HTTP en el cliente.

## API principal

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET|POST|PATCH|DELETE /api/projects/`
- `GET|POST|PATCH|DELETE /api/tasks/`

## Tests y comprobaciones

Desde `backend/`:

```powershell
python manage.py check
python manage.py test
```

Desde `frontend/`:

```powershell
npm run lint
npm run build
```
