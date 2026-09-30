<div align="center">

# Sudhaar

**A civic issue reporting and community transparency platform**

Connecting citizens, NGOs, and government officials through one centralized digital system.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-A30000)
![License](https://img.shields.io/badge/license-educational-lightgrey)

</div>

---

## Overview

Sudhaar enables people to report civic issues, follow their progress, support verified NGO campaigns, and access transparency information, all in one place. The frontend is built with **React, TypeScript, and Vite**, and the backend with **Django REST Framework**.

## Key Features

| Feature | Description |
| --- | --- |
| **Issue Reporting** | Report civic issues with images, location, and categories. |
| **Dashboard** | Track reported issues, view statistics, and monitor progress. |
| **Donations** | Support campaigns organized by verified NGOs. |
| **Transparency** | Access financial reports and archives of resolved issues. |
| **Role-Based Access** | Dedicated functionality for Citizens, NGOs, and Government Officials. |
| **JWT Authentication** | Secure authentication with JSON Web Tokens. |
| **Location Support** | Report and manage issues using location-based information. |
| **Issue Upvoting** | Let users support and prioritize reported issues. |

## Tech Stack

**Frontend**

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Leaflet

**Backend**

- Python
- Django 5.0
- Django REST Framework
- JWT Authentication
- SQLite
- Pillow

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- [Python 3.x](https://www.python.org/)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/noorfattiimaa/Sudhaar-Civic-Platform.git
cd Sudhaar-Civic-Platform
```

### 2. Frontend setup

From the project root:

```bash
npm install
npm run dev
```

The frontend runs at **http://localhost:5173**.

### 3. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py makemigrations
python manage.py migrate

# (Optional) Create an admin user
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

The API is available at **http://localhost:8000/api/**.

For more backend details, see [`backend/README.md`](backend/README.md).

## Connecting Frontend and Backend

The React app talks to the Django REST API through a base URL. Configure it in `src/config/api.ts`:

```ts
export const API_BASE_URL = 'http://localhost:8000/api';
```

Frontend requests should target the Django endpoints rather than mock data.

## Authentication

Sudhaar uses JWT authentication.

1. Obtain an access token through the register or login endpoint.
2. Store the tokens securely.
3. Send the access token with authenticated requests:

```http
Authorization: Bearer <access_token>
```

## API Reference

Base URL: `http://localhost:8000/api`

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register/` | Register a new user |
| `POST` | `/auth/login/` | Log in and obtain JWT tokens |
| `POST` | `/auth/refresh/` | Refresh an access token |

### Issues

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/issues/` | List all issues |
| `POST` | `/issues/` | Create a new issue |
| `GET` | `/issues/{id}/` | Get issue details |
| `POST` | `/issues/{id}/upvote/` | Upvote an issue |
| `POST` | `/issues/{id}/update_status/` | Update issue status |

### Campaigns

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/campaigns/` | List campaigns |
| `POST` | `/campaigns/` | Create a campaign |
| `GET` | `/campaigns/{id}/` | Get campaign details |

### Donations

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/donations/` | List donations |
| `POST` | `/donations/` | Create a donation |

Complete API documentation is available in [`backend/README.md`](backend/README.md).

## User Roles

**Citizens**
- Register and authenticate
- Report civic issues with locations and images
- Browse and upvote reported issues
- Track issue progress
- Support donation campaigns

**NGOs**
- Create and manage fundraising campaigns
- Track donations
- Maintain campaign information

**Government Officials**
- Monitor reported civic issues
- Update issue statuses and track progress
- Support public accountability and transparency

## Development Commands

| Scope | Command | Purpose |
| --- | --- | --- |
| Frontend | `npm run dev` | Start the development server |
| Frontend | `npm run build` | Build for production |
| Frontend | `npm run lint` | Run ESLint |
| Frontend | `npm run preview` | Preview the production build |
| Backend | `python manage.py runserver` | Start the development server |
| Backend | `python manage.py makemigrations` | Create migrations |
| Backend | `python manage.py migrate` | Apply migrations |
| Backend | `python manage.py createsuperuser` | Create an admin user |

## Project Goals

Sudhaar aims to make civic problem-solving more transparent by giving communities a single place to report issues, follow their resolution, and see how campaigns and donations are being used.

## License

This project is part of the Sudhaar platform and is intended for educational and demonstration purposes unless otherwise specified by the project owners.
