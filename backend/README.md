# Backend Authentication System

A complete MVC-based authentication system with role-based access control for staff and admin users.

## Project Structure

```
backend/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── userController.js     # User management logic
├── middleware/
│   ├── auth.js              # Authentication & authorization middleware
│   └── validation.js        # Input validation rules
├── models/
│   └── User.js              # User data model
├── routes/
│   ├── auth.js              # Authentication routes
│   └── users.js             # User management routes
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md               # Documentation
```

## Features

- **MVC Architecture**: Clean separation of concerns with Models, Views (Controllers), and Routes
- **User Registration & Login**: Secure authentication with JWT tokens
- **Role-Based Access Control**: Two roles - Staff and Admin
- **Password Security**: Bcrypt hashing with salt rounds
- **Input Validation**: Express-validator for request validation
- **Cookie Support**: HTTP-only cookies for token storage
- **User Management**: Admin can manage all users
- **Profile Management**: Users can update their own profiles
- **Password Management**: Change password functionality
- **Pagination**: Built-in pagination for user listings
- **Search & Filtering**: Advanced user search capabilities
- **Statistics**: User statistics for admin dashboard

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Server Configuration
PORT=8000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d
```

### 3. Start the Server

```bash
npm start
```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user | Public |
| POST | `/logout` | Logout user | Private |
| GET | `/me` | Get current user | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/change-password` | Change password | Private |

### User Management Routes (`/api/users`) - Admin Only

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all users (with pagination) | Admin |
| GET | `/stats` | Get user statistics | Admin |
| GET | `/:id` | Get user by ID | Admin |
| POST | `/` | Create new user | Admin |
| PUT | `/:id` | Update user | Admin |
| DELETE | `/:id` | Delete user | Admin |
| PUT | `/:id/reset-password` | Reset user password | Admin |

### Other Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/health` | Health check | Public |

## Request/Response Examples

### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "staff",
  "department": "Computer Science",
  "position": "Professor"
}
```

### Login User

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Get All Users (Admin)

```bash
GET /api/users?page=1&limit=10&role=staff&search=john
Authorization: Bearer <token>
```

## User Model

```javascript
{
  firstName: String (required, 2-50 chars),
  lastName: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  role: String (enum: ['staff', 'admin'], default: 'staff'),
  department: String (optional, max 100 chars),
  position: String (optional, max 100 chars),
  isActive: Boolean (default: true),
  lastLogin: Date,
  profileImage: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Input Validation**: Comprehensive request validation
- **Role-Based Authorization**: Admin-only routes protection
- **Account Status**: Active/inactive user management

## Error Handling

All endpoints return consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if any)
}
```

## Success Responses

All successful operations return:

```javascript
{
  "success": true,
  "message": "Operation description",
  "data": {} // Response data
}
```

## Notes

- All timestamps are in ISO format
- Passwords are never returned in API responses
- JWT tokens expire after 7 days by default
- Admin users cannot delete their own accounts
- Email addresses are normalized (lowercase) before storage
