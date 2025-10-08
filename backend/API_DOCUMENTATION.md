# Complete API Documentation

## Overview
This is a comprehensive backend system for university faculty management with role-based access control. The system supports two main roles: `staff` (faculty) and `admin`.

## Base URL
```
http://localhost:8000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## User Roles
- **staff**: Faculty members with basic permissions
- **admin**: Administrators with full system access

---

## Authentication Routes (`/api/auth`)

### Register User
```http
POST /api/auth/register
```
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "password": "password123",
  "role": "staff",
  "department": "Computer Science",
  "position": "Assistant Professor"
}
```

### Login User
```http
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john.doe@university.edu",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
```
**Headers:** `Authorization: Bearer <token>`

### Update Profile
```http
PUT /api/auth/profile
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "department": "Computer Science",
  "position": "Associate Professor"
}
```

### Change Password
```http
PUT /api/auth/change-password
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Logout
```http
POST /api/auth/logout
```
**Headers:** `Authorization: Bearer <token>`

---

## User Management Routes (`/api/users`) - Admin Only

### Get All Users
```http
GET /api/users?page=1&limit=10&role=staff&search=john
```
**Headers:** `Authorization: Bearer <admin_token>`

### Get User by ID
```http
GET /api/users/:id
```
**Headers:** `Authorization: Bearer <admin_token>`

### Create User
```http
POST /api/users
```
**Headers:** `Authorization: Bearer <admin_token>`
**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@university.edu",
  "password": "password123",
  "role": "staff",
  "department": "Mathematics",
  "position": "Professor"
}
```

### Update User
```http
PUT /api/users/:id
```
**Headers:** `Authorization: Bearer <admin_token>`

### Delete User
```http
DELETE /api/users/:id
```
**Headers:** `Authorization: Bearer <admin_token>`

### Reset User Password
```http
PUT /api/users/:id/reset-password
```
**Headers:** `Authorization: Bearer <admin_token>`
**Body:**
```json
{
  "newPassword": "newpassword123"
}
```

### Get User Statistics
```http
GET /api/users/stats
```
**Headers:** `Authorization: Bearer <admin_token>`

---

## Publication Management Routes (`/api/publications`)

### Get All Publications
```http
GET /api/publications?page=1&limit=10&status=Published&type=Journal Article&search=AI
```
**Headers:** `Authorization: Bearer <token>`

### Get Publication by ID
```http
GET /api/publications/:id
```
**Headers:** `Authorization: Bearer <token>`

### Create Publication
```http
POST /api/publications
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "Machine Learning in Healthcare",
  "publicationType": "Journal Article",
  "publicationDate": "2024-01-15",
  "journalName": "Nature Medicine",
  "doi": "10.1038/s41591-024-00001-1",
  "authors": [
    {
      "faculty": "user_id",
      "name": "John Doe",
      "email": "john.doe@university.edu",
      "authorOrder": 1,
      "isCorrespondingAuthor": true
    }
  ],
  "keywords": ["machine learning", "healthcare", "AI"],
  "abstract": "This paper explores..."
}
```

### Update Publication
```http
PUT /api/publications/:id
```
**Headers:** `Authorization: Bearer <token>`

### Delete Publication
```http
DELETE /api/publications/:id
```
**Headers:** `Authorization: Bearer <token>`

### Review Publication (Admin Only)
```http
PUT /api/publications/:id/review
```
**Headers:** `Authorization: Bearer <admin_token>`
**Body:**
```json
{
  "status": "Approved",
  "reviewComments": "Excellent work, approved for publication."
}
```

### Get Publication Statistics
```http
GET /api/publications/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## Funded Projects Routes (`/api/projects`)

### Get All Projects
```http
GET /api/projects?page=1&limit=10&status=Active&type=Research&facultyId=user_id
```
**Headers:** `Authorization: Bearer <token>`

### Get Project by ID
```http
GET /api/projects/:id
```
**Headers:** `Authorization: Bearer <token>`

### Create Project
```http
POST /api/projects
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "AI for Climate Change Research",
  "projectType": "Research",
  "startDate": "2024-01-01",
  "endDate": "2026-12-31",
  "duration": 36,
  "totalBudget": 500000,
  "fundingAgency": {
    "name": "National Science Foundation",
    "type": "Government"
  },
  "description": "Research project on AI applications in climate science",
  "keywords": ["AI", "climate change", "research"]
}
```

### Update Project
```http
PUT /api/projects/:id
```
**Headers:** `Authorization: Bearer <token>`

### Delete Project
```http
DELETE /api/projects/:id
```
**Headers:** `Authorization: Bearer <token>`

### Review Project (Admin Only)
```http
PUT /api/projects/:id/review
```
**Headers:** `Authorization: Bearer <admin_token>`

### Get Project Statistics
```http
GET /api/projects/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## Final Year Projects Routes (`/api/fyp`)

### Get All FYP Projects
```http
GET /api/fyp?page=1&limit=10&status=In Progress&supervisorId=user_id&batch=2024
```
**Headers:** `Authorization: Bearer <token>`

### Get FYP Project by ID
```http
GET /api/fyp/:id
```
**Headers:** `Authorization: Bearer <token>`

### Create FYP Project
```http
POST /api/fyp
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "Smart Campus Management System",
  "projectType": "FYP",
  "startDate": "2024-01-15",
  "endDate": "2024-05-15",
  "student": {
    "name": "Alice Johnson",
    "rollNumber": "CS-2024-001",
    "email": "alice.johnson@student.edu",
    "batch": "2024",
    "degree": "BS",
    "department": "Computer Science",
    "cgpa": 3.8
  },
  "description": "A comprehensive system for campus management",
  "keywords": ["web development", "campus management", "database"]
}
```

### Update FYP Project
```http
PUT /api/fyp/:id
```
**Headers:** `Authorization: Bearer <token>`

### Delete FYP Project
```http
DELETE /api/fyp/:id
```
**Headers:** `Authorization: Bearer <token>`

### Grade FYP Project
```http
PUT /api/fyp/:id/grade
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "supervisorMarks": 85,
  "externalMarks": 80,
  "defenseMarks": 90,
  "grade": "A",
  "evaluators": [
    {
      "name": "Dr. Smith",
      "designation": "Professor",
      "affiliation": "External University"
    }
  ]
}
```

### Get FYP Statistics
```http
GET /api/fyp/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## Thesis Supervision Routes (`/api/thesis`)

### Get All Thesis Supervisions
```http
GET /api/thesis?page=1&limit=10&status=In Progress&supervisorId=user_id&type=PhD
```
**Headers:** `Authorization: Bearer <token>`

### Get Thesis Supervision by ID
```http
GET /api/thesis/:id
```
**Headers:** `Authorization: Bearer <token>`

### Create Thesis Supervision
```http
POST /api/thesis
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "Deep Learning for Medical Image Analysis",
  "thesisType": "PhD",
  "degree": "PhD",
  "startDate": "2023-09-01",
  "expectedCompletionDate": "2027-08-31",
  "student": {
    "name": "Bob Wilson",
    "rollNumber": "CS-PhD-2023-001",
    "email": "bob.wilson@student.edu",
    "batch": "2023",
    "department": "Computer Science",
    "cgpa": 3.9
  },
  "researchArea": "Computer Vision",
  "objectives": ["Develop novel deep learning algorithms", "Apply to medical imaging"],
  "keywords": ["deep learning", "medical imaging", "computer vision"]
}
```

### Update Thesis Supervision
```http
PUT /api/thesis/:id
```
**Headers:** `Authorization: Bearer <token>`

### Delete Thesis Supervision
```http
DELETE /api/thesis/:id
```
**Headers:** `Authorization: Bearer <token>`

### Update Thesis Defense
```http
PUT /api/thesis/:id/defense
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "date": "2027-06-15",
  "time": "10:00 AM",
  "venue": "Conference Room A",
  "examiners": [
    {
      "name": "Dr. Expert",
      "designation": "Professor",
      "affiliation": "External University",
      "role": "External Examiner"
    }
  ],
  "result": "Pass",
  "comments": "Excellent thesis work",
  "recommendations": ["Minor revisions required"]
}
```

### Get Thesis Statistics
```http
GET /api/thesis/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## Events Routes (`/api/events`)

### Get All Events
```http
GET /api/events?page=1&limit=10&type=Conference&format=Online&organizerId=user_id
```
**Headers:** `Authorization: Bearer <token>`

### Get Event by ID
```http
GET /api/events/:id
```
**Headers:** `Authorization: Bearer <token>`

### Create Event
```http
POST /api/events
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "AI in Education Workshop",
  "eventType": "Workshop",
  "eventFormat": "Hybrid",
  "startDate": "2024-03-15",
  "endDate": "2024-03-15",
  "startTime": "09:00",
  "endTime": "17:00",
  "venue": {
    "name": "Main Auditorium",
    "address": "University Campus"
  },
  "description": "Workshop on AI applications in education",
  "registration": {
    "isRequired": true,
    "registrationDeadline": "2024-03-10",
    "maxParticipants": 100,
    "registrationFee": 0
  },
  "keywords": ["AI", "education", "workshop"]
}
```

### Update Event
```http
PUT /api/events/:id
```
**Headers:** `Authorization: Bearer <token>`

### Delete Event
```http
DELETE /api/events/:id
```
**Headers:** `Authorization: Bearer <token>`

### Register for Event
```http
POST /api/events/:id/register
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "affiliation": "Computer Science Department"
}
```

### Update Attendance
```http
PUT /api/events/:id/attendance
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "participantId": "participant_id",
  "attendanceStatus": "Attended"
}
```

### Get Event Statistics
```http
GET /api/events/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## Travel Grants Routes (`/api/travel`)

### Get All Travel Grants
```http
GET /api/travel?page=1&limit=10&status=Approved&applicantId=user_id
```
**Headers:** `Authorization: Bearer <token>`

### Get Travel Grant by ID
```http
GET /api/travel/:id
```
**Headers:** `Authorization: Bearer <token>`

### Create Travel Grant
```http
POST /api/travel
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "Conference Travel to ICML 2024",
  "purpose": "Present research paper on machine learning",
  "event": {
    "name": "International Conference on Machine Learning",
    "type": "Conference",
    "startDate": "2024-07-21",
    "endDate": "2024-07-27",
    "venue": {
      "name": "Vienna Convention Center",
      "city": "Vienna",
      "country": "Austria"
    }
  },
  "travelDetails": {
    "departureDate": "2024-07-20",
    "returnDate": "2024-07-28",
    "departureCity": "Karachi",
    "destinationCity": "Vienna",
    "travelMode": "Air"
  },
  "funding": {
    "totalAmount": 5000,
    "fundingAgency": {
      "name": "University Research Fund",
      "type": "University"
    }
  },
  "keywords": ["machine learning", "conference", "research"]
}
```

### Update Travel Grant
```http
PUT /api/travel/:id
```
**Headers:** `Authorization: Bearer <token>`

### Delete Travel Grant
```http
DELETE /api/travel/:id
```
**Headers:** `Authorization: Bearer <token>`

### Review Travel Grant (Admin Only)
```http
PUT /api/travel/:id/review
```
**Headers:** `Authorization: Bearer <admin_token>`
**Body:**
```json
{
  "status": "Approved",
  "reviewComments": "Travel grant approved for conference attendance."
}
```

### Submit Post-Travel Report
```http
PUT /api/travel/:id/post-travel
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "outcomes": ["Paper presented successfully", "New collaborations established"],
  "publications": ["publication_id_1"],
  "collaborations": [
    {
      "name": "Dr. Expert",
      "affiliation": "MIT",
      "email": "expert@mit.edu",
      "country": "USA"
    }
  ],
  "feedback": {
    "rating": 5,
    "comments": "Excellent conference experience"
  }
}
```

### Get Travel Grant Statistics
```http
GET /api/travel/stats
```
**Headers:** `Authorization: Bearer <token>`

---

## Health Check
```http
GET /api/health
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (if any)
}
```

## Success Responses

All successful operations return:

```json
{
  "success": true,
  "message": "Operation description",
  "data": {} // Response data
}
```

## Pagination

List endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

## Search and Filtering

Most list endpoints support:
- `search`: Text search across relevant fields
- `status`: Filter by status
- `type`: Filter by type/category
- Role-specific filters (e.g., `facultyId`, `supervisorId`)

## Notes

- All timestamps are in ISO 8601 format
- Passwords are never returned in API responses
- JWT tokens expire after 7 days by default
- Admin users have full access to all resources
- Staff users can only access their own resources (with some exceptions for collaborative work)
- All file uploads should be handled separately (not included in this API)