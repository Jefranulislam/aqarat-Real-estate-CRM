# Aqarat CRM Backend

A complete Node.js/Express backend for the Aqarat Real Estate CRM system with PostgreSQL/NeonDB integration.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Complete CRUD Operations** for all entities:
  - Profiles (User Management)
  - Leads Management
  - Contacts Management
  - Properties Management
  - Deals/Transactions Management
  - Tasks Management
  - Activities/Communication Log
  - Documents Management with File Upload
- **PostgreSQL Integration**: Optimized for NeonDB cloud PostgreSQL
- **RESTful API**: Clean, well-structured REST endpoints
- **File Upload**: Document management with file storage
- **Data Validation**: Comprehensive input validation using express-validator
- **Security**: Helmet.js, CORS, and secure authentication
- **Error Handling**: Centralized error handling middleware

## Quick Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update with your NeonDB connection string:

```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5000

# Replace with your NeonDB connection string
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require

# Generate a secure JWT secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
CLIENT_URL=http://localhost:3000
```

### 3. Database Setup

Run migrations to create all tables:

```bash
npm run migrate
```

This will:
- Create all necessary tables from the SQL scripts
- Modify the schema to work with PostgreSQL (removing Supabase dependencies)
- Create a default admin user: `admin@aqarat.com` / `admin123`

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Profiles
- `GET /api/profiles/me` - Get current user profile
- `PUT /api/profiles/me` - Update current user profile
- `GET /api/profiles` - Get all profiles (for assignment)

### Leads
- `GET /api/leads` - Get leads with filters
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Contacts
- `GET /api/contacts` - Get contacts with filters
- `GET /api/contacts/:id` - Get single contact
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Properties
- `GET /api/properties` - Get properties with filters
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Deals
- `GET /api/deals` - Get deals with filters
- `GET /api/deals/:id` - Get single deal
- `POST /api/deals` - Create new deal
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal
- `GET /api/deals/analytics/pipeline` - Get pipeline analytics

### Tasks
- `GET /api/tasks` - Get tasks with filters
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/related/:type/:id` - Get tasks by related entity

### Activities
- `GET /api/activities` - Get activities with filters
- `GET /api/activities/:id` - Get single activity
- `POST /api/activities` - Create new activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `GET /api/activities/related/:type/:id` - Get activities by related entity
- `GET /api/activities/timeline/recent` - Get recent activity timeline

### Documents
- `GET /api/documents` - Get documents with filters
- `GET /api/documents/:id` - Get single document
- `POST /api/documents` - Upload new document
- `PUT /api/documents/:id` - Update document metadata
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/related/:type/:id` - Get documents by related entity
- `GET /api/documents/:id/download` - Download document

## Authentication

All endpoints (except auth endpoints) require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database Schema

The backend uses the following main tables:
- `profiles` - User accounts and profiles
- `leads` - Lead management
- `contacts` - Contact management  
- `properties` - Property listings
- `deals` - Sales/transaction management
- `tasks` - Task management
- `activities` - Communication/activity log
- `documents` - Document management

## File Upload

Documents are uploaded to the `/uploads` directory by default. In production, you should:
1. Use cloud storage (AWS S3, Google Cloud Storage, etc.)
2. Update the upload logic in `routes/documents.js`
3. Configure appropriate file permissions

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: All inputs validated using express-validator
- **CORS**: Configured for frontend domain
- **Helmet.js**: Security headers
- **File Upload Security**: File type and size restrictions
- **SQL Injection Protection**: Parameterized queries

## Development

### Project Structure
```
server/
├── src/
│   ├── config/
│   │   └── database.js       # Database configuration
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── errorHandler.js   # Error handling middleware
│   ├── routes/               # API route handlers
│   └── server.js            # Main application file
├── scripts/
│   ├── migrate.js           # Database migration runner
│   └── 001_modify_for_postgresql.sql
└── uploads/                 # File upload directory
```

### Adding New Features

1. **New Routes**: Add route files in `src/routes/`
2. **Database Changes**: Create new migration files in `scripts/`
3. **Middleware**: Add custom middleware in `src/middleware/`

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": "Additional details (in development)"
}
```

## Health Check

Check if the server is running:
```
GET /health
```

Returns:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Default Admin User

After migration, you can login with:
- **Email**: admin@aqarat.com
- **Password**: admin123

**Important**: Change the default admin password after first login!