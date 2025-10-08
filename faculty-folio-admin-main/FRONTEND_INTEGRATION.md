# Frontend Integration Guide

## Overview
This frontend application is now fully integrated with the backend API system. It provides a comprehensive admin dashboard for managing university research activities.

## Features Implemented

### 🔐 Authentication System
- **Login Page**: Secure authentication with JWT tokens
- **Protected Routes**: All dashboard routes require authentication
- **User Context**: Global user state management
- **Auto-logout**: Token expiration handling

### 📊 Dashboard
- **Real-time Statistics**: Live data from backend APIs
- **KPI Cards**: Publications, Projects, Faculty, FYP counts
- **Charts**: Visual representation of data trends
- **Quick Actions**: Easy access to common tasks

### 📚 Publications Management
- **CRUD Operations**: Create, read, update, delete publications
- **Search & Filter**: Advanced filtering by status, type, date
- **Approval Workflow**: Review and approve publications
- **DOI Integration**: Support for DOI-based imports

### 💼 Projects Management
- **Funded Projects**: Complete project lifecycle management
- **Team Management**: PI, Co-PI, and team member assignments
- **Budget Tracking**: Funding amount and agency management
- **Milestone Tracking**: Project progress monitoring

### 🎓 FYP Management
- **Student Projects**: Final Year Project management
- **Supervision**: Supervisor and co-supervisor assignments
- **Grading System**: Comprehensive evaluation framework
- **Batch Management**: Organize by academic batches

### 👥 Faculty Management
- **User Management**: Create and manage faculty accounts
- **Role-based Access**: Staff and Admin role management
- **Profile Management**: Department and position tracking
- **Status Management**: Active/Inactive user states

## API Integration

### Service Layer (`src/lib/api.ts`)
- **Centralized API Client**: Single point for all backend communication
- **Type Safety**: Full TypeScript support for all data models
- **Error Handling**: Comprehensive error management
- **Authentication**: Automatic token management

### Key API Endpoints Used:
```
Authentication:
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me
- POST /api/auth/logout

Publications:
- GET /api/publications
- POST /api/publications
- PUT /api/publications/:id
- DELETE /api/publications/:id
- GET /api/publications/stats

Projects:
- GET /api/projects
- POST /api/projects
- PUT /api/projects/:id
- DELETE /api/projects/:id
- GET /api/projects/stats

FYP Projects:
- GET /api/fyp
- POST /api/fyp
- PUT /api/fyp/:id
- DELETE /api/fyp/:id
- GET /api/fyp/stats

Users:
- GET /api/users
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id
- GET /api/users/stats
```

## State Management

### React Query Integration
- **Caching**: Automatic data caching and synchronization
- **Background Updates**: Real-time data refresh
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Automatic retry mechanisms

### Authentication Context
- **Global State**: User information across the app
- **Token Management**: Automatic token refresh
- **Route Protection**: Secure navigation
- **Session Persistence**: Login state maintenance

## UI Components

### Design System
- **Shadcn/ui**: Modern, accessible component library
- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching support

### Key Components
- **Data Tables**: Sortable, filterable data display
- **Forms**: Comprehensive form validation
- **Modals**: Dialog-based interactions
- **Charts**: Data visualization with Recharts
- **Navigation**: Collapsible sidebar navigation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running on port 8000

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Demo Credentials
```
Admin User:
Email: admin@university.edu
Password: admin123

Staff User:
Email: staff@university.edu
Password: staff123
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── AdminSidebar.tsx
│   ├── DashboardLayout.tsx
│   └── TopNavbar.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── api.ts          # API client
│   └── utils.ts        # Helper functions
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Publications.tsx
│   ├── Projects.tsx
│   ├── FYP.tsx
│   ├── Faculty.tsx
│   └── Login.tsx
└── App.tsx             # Main application
```

## Features by Role

### Admin Users
- ✅ Full system access
- ✅ User management
- ✅ Publication approval
- ✅ Project oversight
- ✅ System statistics
- ✅ Data export

### Staff Users (Faculty)
- ✅ View own data
- ✅ Create publications
- ✅ Manage projects
- ✅ FYP supervision
- ✅ Limited admin features

## Security Features

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Secure logout functionality
- Route-level protection

### Authorization
- Role-based access control
- API endpoint protection
- UI element visibility control
- Data filtering by user role

### Data Protection
- Input validation
- XSS prevention
- CSRF protection
- Secure API communication

## Performance Optimizations

### Frontend
- React Query caching
- Component lazy loading
- Image optimization
- Bundle splitting

### API
- Request deduplication
- Background refetching
- Optimistic updates
- Error boundary handling

## Future Enhancements

### Planned Features
- [ ] Thesis Supervision Management
- [ ] Events & Workshops Management
- [ ] Travel Grants Management
- [ ] Advanced Reporting
- [ ] File Upload System
- [ ] Email Notifications
- [ ] Mobile App
- [ ] API Documentation

### Technical Improvements
- [ ] Unit Testing
- [ ] E2E Testing
- [ ] Performance Monitoring
- [ ] Error Tracking
- [ ] Analytics Integration
- [ ] PWA Support

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend server is running
   - Verify API_BASE_URL in environment
   - Check network connectivity

2. **Authentication Issues**
   - Clear browser storage
   - Check token expiration
   - Verify user credentials

3. **Data Not Loading**
   - Check browser console for errors
   - Verify API endpoints
   - Check user permissions

### Support
For technical support or feature requests, please contact the development team.

## License
This project is proprietary software developed for university research management.
