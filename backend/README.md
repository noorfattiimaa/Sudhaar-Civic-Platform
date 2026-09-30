# Sudhaar Backend API

Django REST Framework backend for the Sudhaar civic issue reporting platform.

## Features

- **User Authentication**: JWT-based authentication with role-based access (Citizen, NGO, Government Official)
- **Issue Management**: Report, track, and manage civic issues with upvoting
- **Campaign Management**: Create and manage donation campaigns with budget tracking
- **Donation System**: Process and track donations
- **Transparency Reports**: Financial transparency and reporting
- **RESTful API**: Complete REST API with filtering, searching, and pagination

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create a superuser (optional, for admin access):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh access token

### Users

- `GET /api/users/` - List users (admin only)
- `GET /api/users/me/` - Get current user profile
- `PUT /api/users/update_profile/` - Update current user profile

### Issues

- `GET /api/issues/` - List all issues
- `POST /api/issues/` - Create a new issue
- `GET /api/issues/{id}/` - Get issue details
- `PUT /api/issues/{id}/` - Update issue (author or admin)
- `DELETE /api/issues/{id}/` - Delete issue (author or admin)
- `POST /api/issues/{id}/upvote/` - Upvote an issue
- `POST /api/issues/{id}/remove_upvote/` - Remove upvote
- `POST /api/issues/{id}/update_status/` - Update issue status (officials)
- `GET /api/issues/stats/` - Get issue statistics

**Query Parameters:**
- `category` - Filter by category
- `status` - Filter by status
- `priority` - Filter by priority
- `resolved_only` - Show only resolved issues
- `my_reports` - Show only current user's issues
- `search` - Search in title, description, location
- `ordering` - Order by field (e.g., `-created_at`, `upvotes`)

### Campaigns

- `GET /api/campaigns/` - List all campaigns
- `POST /api/campaigns/` - Create a campaign (NGO only)
- `GET /api/campaigns/{id}/` - Get campaign details
- `PUT /api/campaigns/{id}/` - Update campaign (NGO owner or admin)
- `GET /api/campaigns/{id}/donations/` - Get campaign donations

**Query Parameters:**
- `category` - Filter by category
- `is_verified` - Filter verified campaigns
- `is_active` - Filter active campaigns
- `search` - Search in title, description, NGO name

### Donations

- `GET /api/donations/` - List donations (user's own or all if admin)
- `POST /api/donations/` - Create a donation
- `GET /api/donations/{id}/` - Get donation details

### Transparency

- `GET /api/transparency/` - List transparency reports
- `POST /api/transparency/` - Create transparency report (admin)
- `GET /api/transparency/summary/` - Get financial summary

### Dashboard

- `GET /api/dashboard/stats/` - Get dashboard statistics

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Example Registration Request

```json
POST /api/auth/register/
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123",
  "password2": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "0300-1234567",
  "cnic": "35202-1234567-1",
  "role": "citizen"
}
```

### Example Login Request

```json
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "refresh": "...",
  "access": "..."
}
```

## Models

### User
- Custom user model with roles (citizen, ngo, official)
- Additional fields: phone, CNIC, organization_name, is_verified

### Issue
- Title, description, location, category, status, priority
- Author, image, upvotes, coordinates
- Timeline tracking for status changes

### Campaign
- Title, description, NGO, category
- Goal amount, raised amount, donor count
- Budget items breakdown

### Donation
- Campaign, donor, amount
- Payment method, transaction ID
- Anonymous option

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` after creating a superuser.

## CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)

To add more origins, update `CORS_ALLOWED_ORIGINS` in `sudhaar_backend/settings.py`.

## Development

### Running Tests

```bash
python manage.py test
```

### Creating Migrations

After modifying models:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Collecting Static Files

```bash
python manage.py collectstatic
```

## Production Deployment

Before deploying to production:

1. Change `SECRET_KEY` in `settings.py`
2. Set `DEBUG = False`
3. Update `ALLOWED_HOSTS`
4. Configure a production database (PostgreSQL recommended)
5. Set up proper media file storage (AWS S3, etc.)
6. Configure HTTPS
7. Set up proper CORS origins

## License

This project is part of the Sudhaar platform.

