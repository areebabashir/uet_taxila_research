// Role-Based Access Control (RBAC) System

// Define permissions for each module
export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage_roles',
  
  // Faculty Management
  FACULTY_CREATE: 'faculty:create',
  FACULTY_READ: 'faculty:read',
  FACULTY_UPDATE: 'faculty:update',
  FACULTY_DELETE: 'faculty:delete',
  FACULTY_APPROVE: 'faculty:approve',
  
  // Publication Management
  PUBLICATION_CREATE: 'publication:create',
  PUBLICATION_READ: 'publication:read',
  PUBLICATION_UPDATE: 'publication:update',
  PUBLICATION_DELETE: 'publication:delete',
  PUBLICATION_APPROVE: 'publication:approve',
  PUBLICATION_REVIEW: 'publication:review',
  
  // Project Management
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_APPROVE: 'project:approve',
  PROJECT_REVIEW: 'project:review',
  
  // FYP Management
  FYP_CREATE: 'fyp:create',
  FYP_READ: 'fyp:read',
  FYP_UPDATE: 'fyp:update',
  FYP_DELETE: 'fyp:delete',
  FYP_APPROVE: 'fyp:approve',
  FYP_REVIEW: 'fyp:review',
  
  // Thesis Management
  THESIS_CREATE: 'thesis:create',
  THESIS_READ: 'thesis:read',
  THESIS_UPDATE: 'thesis:update',
  THESIS_DELETE: 'thesis:delete',
  THESIS_APPROVE: 'thesis:approve',
  THESIS_REVIEW: 'thesis:review',
  
  // Event Management
  EVENT_CREATE: 'event:create',
  EVENT_READ: 'event:read',
  EVENT_UPDATE: 'event:update',
  EVENT_DELETE: 'event:delete',
  EVENT_APPROVE: 'event:approve',
  EVENT_REVIEW: 'event:review',
  
  // Travel Grant Management
  TRAVEL_CREATE: 'travel:create',
  TRAVEL_READ: 'travel:read',
  TRAVEL_UPDATE: 'travel:update',
  TRAVEL_DELETE: 'travel:delete',
  TRAVEL_APPROVE: 'travel:approve',
  TRAVEL_REVIEW: 'travel:review',
  
  // Reports and Analytics
  REPORTS_VIEW: 'reports:view',
  ANALYTICS_VIEW: 'analytics:view',
  DASHBOARD_VIEW: 'dashboard:view',
  
  // System Administration
  SYSTEM_ADMIN: 'system:admin',
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_BACKUP: 'system:backup'
};

// Define role permissions mapping
export const ROLE_PERMISSIONS = {
  // Faculty - Basic permissions for their own data
  faculty: [
    PERMISSIONS.FACULTY_READ,
    PERMISSIONS.FACULTY_UPDATE, // Only their own profile
    PERMISSIONS.PUBLICATION_CREATE,
    PERMISSIONS.PUBLICATION_READ,
    PERMISSIONS.PUBLICATION_UPDATE, // Only their own publications
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE, // Only their own projects
    PERMISSIONS.FYP_CREATE,
    PERMISSIONS.FYP_READ,
    PERMISSIONS.FYP_UPDATE, // Only their own FYPs
    PERMISSIONS.THESIS_CREATE,
    PERMISSIONS.THESIS_READ,
    PERMISSIONS.THESIS_UPDATE, // Only their own thesis
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.EVENT_UPDATE, // Only their own events
    PERMISSIONS.TRAVEL_CREATE,
    PERMISSIONS.TRAVEL_READ,
    PERMISSIONS.TRAVEL_UPDATE, // Only their own travel grants
    PERMISSIONS.DASHBOARD_VIEW
  ],
  
  // HoD - Department level permissions
  hod: [
    ...ROLE_PERMISSIONS.faculty, // Inherit faculty permissions
    PERMISSIONS.FACULTY_APPROVE, // Department faculty
    PERMISSIONS.PUBLICATION_APPROVE, // Department publications
    PERMISSIONS.PROJECT_APPROVE, // Department projects
    PERMISSIONS.FYP_APPROVE, // Department FYPs
    PERMISSIONS.THESIS_APPROVE, // Department thesis
    PERMISSIONS.EVENT_APPROVE, // Department events
    PERMISSIONS.TRAVEL_APPROVE, // Department travel grants
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  
  // Dean - School level permissions
  dean: [
    ...ROLE_PERMISSIONS.hod, // Inherit HoD permissions
    PERMISSIONS.USER_CREATE, // Create faculty accounts
    PERMISSIONS.USER_READ, // View all users in school
    PERMISSIONS.USER_UPDATE, // Update faculty accounts
    PERMISSIONS.FACULTY_CREATE,
    PERMISSIONS.FACULTY_DELETE, // Department faculty
    PERMISSIONS.PUBLICATION_DELETE, // School publications
    PERMISSIONS.PROJECT_DELETE, // School projects
    PERMISSIONS.FYP_DELETE, // School FYPs
    PERMISSIONS.THESIS_DELETE, // School thesis
    PERMISSIONS.EVENT_DELETE, // School events
    PERMISSIONS.TRAVEL_DELETE // School travel grants
  ],
  
  // ORIC - Research and innovation center permissions
  oric: [
    ...ROLE_PERMISSIONS.faculty, // Inherit faculty permissions
    PERMISSIONS.USER_READ, // View all users
    PERMISSIONS.FACULTY_READ, // View all faculty
    PERMISSIONS.PUBLICATION_APPROVE, // All publications
    PERMISSIONS.PUBLICATION_REVIEW, // All publications
    PERMISSIONS.PROJECT_APPROVE, // All projects
    PERMISSIONS.PROJECT_REVIEW, // All projects
    PERMISSIONS.FYP_APPROVE, // All FYPs
    PERMISSIONS.FYP_REVIEW, // All FYPs
    PERMISSIONS.THESIS_APPROVE, // All thesis
    PERMISSIONS.THESIS_REVIEW, // All thesis
    PERMISSIONS.EVENT_APPROVE, // All events
    PERMISSIONS.EVENT_REVIEW, // All events
    PERMISSIONS.TRAVEL_APPROVE, // All travel grants
    PERMISSIONS.TRAVEL_REVIEW, // All travel grants
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  
  // Admin - Full system permissions
  admin: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE_ROLES,
    PERMISSIONS.FACULTY_CREATE,
    PERMISSIONS.FACULTY_READ,
    PERMISSIONS.FACULTY_UPDATE,
    PERMISSIONS.FACULTY_DELETE,
    PERMISSIONS.FACULTY_APPROVE,
    PERMISSIONS.PUBLICATION_CREATE,
    PERMISSIONS.PUBLICATION_READ,
    PERMISSIONS.PUBLICATION_UPDATE,
    PERMISSIONS.PUBLICATION_DELETE,
    PERMISSIONS.PUBLICATION_APPROVE,
    PERMISSIONS.PUBLICATION_REVIEW,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.PROJECT_UPDATE,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_APPROVE,
    PERMISSIONS.PROJECT_REVIEW,
    PERMISSIONS.FYP_CREATE,
    PERMISSIONS.FYP_READ,
    PERMISSIONS.FYP_UPDATE,
    PERMISSIONS.FYP_DELETE,
    PERMISSIONS.FYP_APPROVE,
    PERMISSIONS.FYP_REVIEW,
    PERMISSIONS.THESIS_CREATE,
    PERMISSIONS.THESIS_READ,
    PERMISSIONS.THESIS_UPDATE,
    PERMISSIONS.THESIS_DELETE,
    PERMISSIONS.THESIS_APPROVE,
    PERMISSIONS.THESIS_REVIEW,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_READ,
    PERMISSIONS.EVENT_UPDATE,
    PERMISSIONS.EVENT_DELETE,
    PERMISSIONS.EVENT_APPROVE,
    PERMISSIONS.EVENT_REVIEW,
    PERMISSIONS.TRAVEL_CREATE,
    PERMISSIONS.TRAVEL_READ,
    PERMISSIONS.TRAVEL_UPDATE,
    PERMISSIONS.TRAVEL_DELETE,
    PERMISSIONS.TRAVEL_APPROVE,
    PERMISSIONS.TRAVEL_REVIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.SYSTEM_BACKUP
  ],
  
  // External - Limited read-only permissions
  external: [
    PERMISSIONS.FACULTY_READ, // Public faculty profiles
    PERMISSIONS.PUBLICATION_READ, // Public publications
    PERMISSIONS.PROJECT_READ, // Public projects
    PERMISSIONS.FYP_READ, // Public FYPs
    PERMISSIONS.THESIS_READ, // Public thesis
    PERMISSIONS.EVENT_READ, // Public events
    PERMISSIONS.TRAVEL_READ // Public travel grants
  ]
};

// Helper function to check if user has permission
export const hasPermission = (userRole, permission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
};

// Helper function to check if user has any of the permissions
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Helper function to check if user has all permissions
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Middleware to check permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Middleware to check any of the permissions
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!hasAnyPermission(req.user.role, permissions)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Middleware to check all permissions
export const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!hasAllPermissions(req.user.role, permissions)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Middleware to check if user can access resource (own or has permission)
export const requireOwnershipOrPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user has the permission
    if (hasPermission(req.user.role, permission)) {
      return next();
    }
    
    // Check if user is accessing their own resource
    const resourceId = req.params.id || req.params.facultyId;
    if (resourceId && req.user._id.toString() === resourceId.toString()) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  };
};
