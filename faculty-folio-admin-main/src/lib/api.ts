// API Service Layer for Backend Integration

const API_BASE_URL = 'http://localhost:8000/api';

// Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'staff' | 'admin';
  department?: string;
  position?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  contactType: 'general' | 'research' | 'admission' | 'collaboration' | 'media' | 'complaint' | 'suggestion' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  organization?: string;
  position?: string;
  department?: string;
  status: 'new' | 'in-progress' | 'responded' | 'resolved' | 'closed';
  response?: {
    message: string;
    respondedBy: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    respondedAt: string;
  };
  source: 'website' | 'email' | 'phone' | 'social-media' | 'referral' | 'other';
  tags: string[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  daysSinceCreation: number;
}

export interface Publication {
  _id: string;
  title: string;
  publicationType: string;
  publicationDate: string;
  journalName?: string;
  conferenceName?: string;
  doi?: string;
  authors: Array<{
    faculty?: string;
    name: string;
    email?: string;
    authorOrder: number;
    isCorrespondingAuthor: boolean;
  }>;
  status: string;
  submittedBy: string;
  reviewedBy?: string;
  keywords: string[];
  abstract?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  title: string;
  projectType: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  status: string;
  principalInvestigator: string;
  fundingAgency: {
    name: string;
    type: string;
  };
  description?: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FYPProject {
  _id: string;
  title: string;
  projectType: string;
  startDate: string;
  endDate: string;
  status: string;
  supervisor: string;
  student: {
    name: string;
    rollNumber: string;
    email: string;
    batch: string;
    degree: string;
    department: string;
  };
  description?: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ThesisSupervision {
  _id: string;
  title: string;
  thesisType: string;
  degree: string;
  startDate: string;
  expectedCompletionDate: string;
  status: string;
  supervisor: string;
  student: {
    name: string;
    rollNumber: string;
    email: string;
    batch: string;
    department: string;
    degree: string;
  };
  researchArea: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  eventType: string;
  eventFormat: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: string;
  organizer: string;
  description?: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TravelGrant {
  _id: string;
  title: string;
  purpose: string;
  status: string;
  applicant: string;
  event: {
    name: string;
    type: string;
    startDate: string;
    endDate: string;
  };
  travelDetails?: {
    departureDate: string;
    returnDate: string;
    departureCity?: string;
    destinationCity: string;
    destinationCountry: string;
    transportMode: string;
  };
  funding: {
    totalAmount: number;
    requestedAmount?: number;
    approvedAmount?: number;
    fundingAgency: {
      name: string;
      type: string;
    };
  };
  keywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: any;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Normalize body: convert FormData to plain object; strip DOM nodes
    let normalizedBody = options.body as any;
    if (normalizedBody instanceof FormData) {
      normalizedBody = Object.fromEntries(Array.from(normalizedBody.entries()).map(([k, v]) => [k, v instanceof File ? v : `${v}`]));
    }
    if (normalizedBody && typeof normalizedBody === 'object' && !(normalizedBody instanceof Blob)) {
      // Enhanced sanitization to remove DOM nodes and circular references
      const seen = new WeakSet();
      const sanitize = (obj: any, depth = 0): any => {
        if (obj === null || obj === undefined) return obj;
        if (depth > 10) return undefined; // Prevent infinite recursion
        
        // Check for circular references
        if (seen.has(obj)) {
          return undefined;
        }
        seen.add(obj);
        
        if (Array.isArray(obj)) {
          return obj.map(item => sanitize(item, depth + 1)).filter(item => item !== undefined);
        }
        if (obj instanceof Date) return obj.toISOString();
        if (typeof obj === 'object') {
          // Skip HTML elements, React internals, and DOM nodes
          const ctorName = (obj as any).constructor?.name;
          if (ctorName && (
            ctorName.includes('HTML') || 
            ctorName.includes('Element') || 
            ctorName.includes('Node')
          )) return undefined;
          
          // Check for React fiber properties
          if ('__reactFiber' in obj || '__reactInternalInstance' in obj || 'stateNode' in obj) {
            return undefined;
          }
          
          const out: any = {};
          for (const key of Object.keys(obj)) {
            // Skip React internal properties
            if (typeof key === 'string' && (
              key.startsWith('__react') || 
              key.startsWith('_react') ||
              key.startsWith('$$')
            )) {
              continue;
            }
            
            const val = (obj as any)[key];
            const s = sanitize(val, depth + 1);
            if (s !== undefined) out[key] = s;
          }
          return out;
        }
        return obj;
      };
      normalizedBody = sanitize(normalizedBody);
    }

    let finalBody: any = undefined;
    if (normalizedBody !== undefined && normalizedBody !== null && options.method && options.method !== 'GET') {
      try {
        if (typeof normalizedBody === 'string') {
          finalBody = normalizedBody; // already JSON string
        } else {
          finalBody = JSON.stringify(normalizedBody);
        }
      } catch (e) {
        // Last-resort sanitization if circular refs remain
        const seen = new WeakSet();
        const deepStrip = (obj: any): any => {
          if (obj === null || obj === undefined) return obj;
          if (typeof obj !== 'object') return obj;
          if (seen.has(obj)) return undefined;
          seen.add(obj);
          const ctor = obj.constructor?.name || '';
          if (ctor.includes('HTML') || '__reactFiber' in obj || 'stateNode' in obj || 'nodeType' in obj) {
            return undefined;
          }
          if (Array.isArray(obj)) return obj.map(deepStrip).filter((v) => v !== undefined);
          const out: any = {};
          for (const key of Object.keys(obj)) {
            const val = (obj as any)[key];
            const s = deepStrip(val);
            if (s !== undefined) out[key] = s;
          }
          return out;
        };
        const cleaned = deepStrip(normalizedBody);
        finalBody = typeof cleaned === 'string' ? cleaned : JSON.stringify(cleaned);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      body: finalBody,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      const details = Array.isArray(errorData?.errors)
        ? errorData.errors.map((e: any) => e.msg || e.message).filter(Boolean).join('; ')
        : undefined;
      const msg = [errorData?.message, details].filter(Boolean).join(' - ');
      throw new Error(msg || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: Partial<User> & { password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.request<ApiResponse<null>>('/auth/logout', {
      method: 'POST',
    });
    
    this.setToken(null);
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>('/auth/me');
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number; role?: string; search?: string }): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.role) searchParams.append('role', params.role);
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<User>>(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUserById(id: string): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>(`/users/${id}`);
  }

  async createUser(userData: Partial<User> & { password: string }): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Publications
  async getPublications(params?: { page?: number; limit?: number; status?: string; type?: string; search?: string }): Promise<PaginatedResponse<Publication>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Publication>>(`/publications${queryString ? `?${queryString}` : ''}`);
  }

  async getPublicationById(id: string): Promise<ApiResponse<{ publication: Publication }>> {
    return this.request<ApiResponse<{ publication: Publication }>>(`/publications/${id}`);
  }

  async createPublication(publicationData: Partial<Publication>): Promise<ApiResponse<{ publication: Publication }>> {
    return this.request<ApiResponse<{ publication: Publication }>>('/publications', {
      method: 'POST',
      body: JSON.stringify(publicationData),
    });
  }

  async updatePublication(id: string, publicationData: Partial<Publication>): Promise<ApiResponse<{ publication: Publication }>> {
    return this.request<ApiResponse<{ publication: Publication }>>(`/publications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(publicationData),
    });
  }

  async deletePublication(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/publications/${id}`, {
      method: 'DELETE',
    });
  }

  async reviewPublication(id: string, reviewData: { status: string; reviewComments?: string }): Promise<ApiResponse<{ publication: Publication }>> {
    return this.request<ApiResponse<{ publication: Publication }>>(`/publications/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async approvePublication(id: string, comments?: string): Promise<ApiResponse<{ publication: Publication }>> {
    return this.request<ApiResponse<{ publication: Publication }>>(`/publications/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectPublication(id: string, comments?: string): Promise<ApiResponse<{ publication: Publication }>> {
    return this.request<ApiResponse<{ publication: Publication }>>(`/publications/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  // Projects
  async getProjects(params?: { page?: number; limit?: number; status?: string; type?: string; search?: string }): Promise<PaginatedResponse<Project>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Project>>(`/projects${queryString ? `?${queryString}` : ''}`);
  }

  async getProjectById(id: string): Promise<ApiResponse<{ project: Project }>> {
    return this.request<ApiResponse<{ project: Project }>>(`/projects/${id}`);
  }

  async createProject(projectData: Partial<Project>): Promise<ApiResponse<{ project: Project }>> {
    return this.request<ApiResponse<{ project: Project }>>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<ApiResponse<{ project: Project }>> {
    return this.request<ApiResponse<{ project: Project }>>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async approveProject(id: string, comments?: string): Promise<ApiResponse<{ project: Project }>> {
    return this.request<ApiResponse<{ project: Project }>>(`/projects/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectProject(id: string, comments?: string): Promise<ApiResponse<{ project: Project }>> {
    return this.request<ApiResponse<{ project: Project }>>(`/projects/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  // FYP Projects
  async getFYPProjects(params?: { page?: number; limit?: number; status?: string; type?: string; search?: string; supervisorId?: string; batch?: string }): Promise<PaginatedResponse<FYPProject>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.supervisorId) searchParams.append('supervisorId', params.supervisorId);
    if (params?.batch) searchParams.append('batch', params.batch);
    
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<FYPProject>>(`/fyp${queryString ? `?${queryString}` : ''}`);
  }

  async getFYPProjectById(id: string): Promise<ApiResponse<{ fypProject: FYPProject }>> {
    return this.request<ApiResponse<{ fypProject: FYPProject }>>(`/fyp/${id}`);
  }

  async createFYPProject(fypData: Partial<FYPProject>): Promise<ApiResponse<{ fypProject: FYPProject }>> {
    return this.request<ApiResponse<{ fypProject: FYPProject }>>('/fyp', {
      method: 'POST',
      body: JSON.stringify(fypData),
    });
  }

  async updateFYPProject(id: string, fypData: Partial<FYPProject>): Promise<ApiResponse<{ fypProject: FYPProject }>> {
    return this.request<ApiResponse<{ fypProject: FYPProject }>>(`/fyp/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fypData),
    });
  }

  async deleteFYPProject(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/fyp/${id}`, {
      method: 'DELETE',
    });
  }

  async approveFYPProject(id: string, comments?: string): Promise<ApiResponse<{ fypProject: FYPProject }>> {
    return this.request<ApiResponse<{ fypProject: FYPProject }>>(`/fyp/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectFYPProject(id: string, comments?: string): Promise<ApiResponse<{ fypProject: FYPProject }>> {
    return this.request<ApiResponse<{ fypProject: FYPProject }>>(`/fyp/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  // Thesis Supervisions
  async getThesisSupervisions(params?: { page?: number; limit?: number; status?: string; type?: string; search?: string; supervisorId?: string; batch?: string }): Promise<PaginatedResponse<ThesisSupervision>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.supervisorId) searchParams.append('supervisorId', params.supervisorId);
    if (params?.batch) searchParams.append('batch', params.batch);
    
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<ThesisSupervision>>(`/thesis${queryString ? `?${queryString}` : ''}`);
  }

  async getThesisSupervisionById(id: string): Promise<ApiResponse<{ thesisSupervision: ThesisSupervision }>> {
    return this.request<ApiResponse<{ thesisSupervision: ThesisSupervision }>>(`/thesis/${id}`);
  }

  async createThesisSupervision(thesisData: Partial<ThesisSupervision>): Promise<ApiResponse<{ thesisSupervision: ThesisSupervision }>> {
    return this.request<ApiResponse<{ thesisSupervision: ThesisSupervision }>>('/thesis', {
      method: 'POST',
      body: JSON.stringify(thesisData),
    });
  }

  async updateThesisSupervision(id: string, thesisData: Partial<ThesisSupervision>): Promise<ApiResponse<{ thesisSupervision: ThesisSupervision }>> {
    return this.request<ApiResponse<{ thesisSupervision: ThesisSupervision }>>(`/thesis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(thesisData),
    });
  }

  async deleteThesisSupervision(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/thesis/${id}`, {
      method: 'DELETE',
    });
  }

  async approveThesisSupervision(id: string, comments?: string): Promise<ApiResponse<{ thesisSupervision: ThesisSupervision }>> {
    return this.request<ApiResponse<{ thesisSupervision: ThesisSupervision }>>(`/thesis/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectThesisSupervision(id: string, comments?: string): Promise<ApiResponse<{ thesisSupervision: ThesisSupervision }>> {
    return this.request<ApiResponse<{ thesisSupervision: ThesisSupervision }>>(`/thesis/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  // Events
  async getEvents(params?: { page?: number; limit?: number; status?: string; type?: string; search?: string; organizerId?: string; format?: string }): Promise<PaginatedResponse<Event>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.organizerId) searchParams.append('organizerId', params.organizerId);
    if (params?.format) searchParams.append('format', params.format);
    
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Event>>(`/events${queryString ? `?${queryString}` : ''}`);
  }

  async getEventById(id: string): Promise<ApiResponse<{ event: Event }>> {
    return this.request<ApiResponse<{ event: Event }>>(`/events/${id}`);
  }

  async createEvent(eventData: Partial<Event>): Promise<ApiResponse<{ event: Event }>> {
    return this.request<ApiResponse<{ event: Event }>>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<ApiResponse<{ event: Event }>> {
    return this.request<ApiResponse<{ event: Event }>>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async approveEvent(id: string, comments?: string): Promise<ApiResponse<{ event: Event }>> {
    return this.request<ApiResponse<{ event: Event }>>(`/events/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectEvent(id: string, comments?: string): Promise<ApiResponse<{ event: Event }>> {
    return this.request<ApiResponse<{ event: Event }>>(`/events/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  // Travel Grants
  async getTravelGrants(params?: { page?: number; limit?: number; status?: string; search?: string; applicantId?: string }): Promise<PaginatedResponse<TravelGrant>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.applicantId) searchParams.append('applicantId', params.applicantId);
    
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<TravelGrant>>(`/travel${queryString ? `?${queryString}` : ''}`);
  }

  async getTravelGrantById(id: string): Promise<ApiResponse<{ travelGrant: TravelGrant }>> {
    return this.request<ApiResponse<{ travelGrant: TravelGrant }>>(`/travel/${id}`);
  }

  async createTravelGrant(travelData: Partial<TravelGrant>): Promise<ApiResponse<{ travelGrant: TravelGrant }>> {
    return this.request<ApiResponse<{ travelGrant: TravelGrant }>>('/travel', {
      method: 'POST',
      body: JSON.stringify(travelData),
    });
  }

  async updateTravelGrant(id: string, travelData: Partial<TravelGrant>): Promise<ApiResponse<{ travelGrant: TravelGrant }>> {
    return this.request<ApiResponse<{ travelGrant: TravelGrant }>>(`/travel/${id}`, {
      method: 'PUT',
      body: JSON.stringify(travelData),
    });
  }

  async deleteTravelGrant(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/travel/${id}`, {
      method: 'DELETE',
    });
  }

  async approveTravelGrant(id: string, comments?: string): Promise<ApiResponse<{ travelGrant: TravelGrant }>> {
    return this.request<ApiResponse<{ travelGrant: TravelGrant }>>(`/travel/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectTravelGrant(id: string, comments?: string): Promise<ApiResponse<{ travelGrant: TravelGrant }>> {
    return this.request<ApiResponse<{ travelGrant: TravelGrant }>>(`/travel/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  }

  async reviewTravelGrant(id: string, reviewData: { status: string; reviewComments?: string }): Promise<ApiResponse<{ travelGrant: TravelGrant }>> {
    return this.request<ApiResponse<{ travelGrant: TravelGrant }>>(`/travel/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  // Statistics
  async getPublicationStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/publications/stats');
  }

  async getProjectStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/projects/stats');
  }

  async getFYPStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/fyp/stats');
  }

  async getThesisStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/thesis/stats');
  }

  async getEventStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/events/stats');
  }

  async getTravelStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/travel/stats');
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/users/stats');
  }

  // Contact Management
  async getContacts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    contactType?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<{ contacts: Contact[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<ApiResponse<{ contacts: Contact[]; pagination: any }>>(`/contacts${queryString ? `?${queryString}` : ''}`);
  }

  async getContactById(id: string): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<ApiResponse<{ contact: Contact }>>(`/contacts/${id}`);
  }

  async updateContact(id: string, contactData: Partial<Contact>): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<ApiResponse<{ contact: Contact }>>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async respondToContact(id: string, message: string): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<ApiResponse<{ contact: Contact }>>(`/contacts/${id}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ message }),
    });
  }

  async markContactAsResolved(id: string): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<ApiResponse<{ contact: Contact }>>(`/contacts/${id}/resolve`, {
      method: 'PUT',
    });
  }

  async closeContact(id: string): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<ApiResponse<{ contact: Contact }>>(`/contacts/${id}/close`, {
      method: 'PUT',
    });
  }

  async deleteContact(id: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async getContactStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/contacts/stats');
  }

  async bulkUpdateContacts(contactIds: string[], updateData: Partial<Contact>): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/contacts/bulk/update', {
      method: 'PUT',
      body: JSON.stringify({ contactIds, updateData }),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);
