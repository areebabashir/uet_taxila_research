const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  headers?: HeadersInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`API request failed:`, error);
    // Return empty object for failed requests to maintain functionality
    return {} as T;
  }
}

// Type definitions for API responses
export interface Publication {
  _id: string;
  title: string;
  publicationType: string;
  publicationDate: string;
  authors: Array<{
    name: string;
    authorOrder: number;
  }>;
  doi?: string;
  keywords?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Thesis {
  _id: string;
  title: string;
  thesisType: string;
  degree: string;
  startDate: string;
  expectedCompletionDate: string;
  student: {
    name: string;
    rollNumber: string;
    email: string;
    batch: string;
    degree: string;
    department: string;
  };
  researchArea: string;
  keywords?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelGrant {
  _id: string;
  title: string;
  purpose: string;
  event: {
    name: string;
    type: string;
    startDate: string;
    endDate: string;
  };
  travelDetails: {
    departureDate: string;
    returnDate: string;
    departureCity: string;
    destinationCity: string;
  };
  funding: {
    totalAmount: number;
    fundingAgency: {
      name: string;
    };
  };
  keywords?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FYPProject {
  _id: string;
  title: string;
  projectType: string;
  startDate: string;
  endDate: string;
  student: {
    name: string;
    rollNumber: string;
    email: string;
    batch: string;
    degree: string;
    department: string;
  };
  keywords?: string[];
  status: string;
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
  keywords?: string[];
  status: string;
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
  fundingAgency: {
    name: string;
  };
  duration: number;
  keywords?: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  university: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byType?: Record<string, number>;
  byDepartment?: Record<string, number>;
}

export interface ComprehensiveStats {
  publications: Stats;
  theses: Stats;
  travelGrants: Stats;
  fypProjects: Stats;
  events: Stats;
  projects: Stats;
  users: Stats;
}

// API service with all GET endpoints
export const api = {
  // Publications
  getPublications: async () => {
    const response = await apiRequest<any>('/publications');
    return response?.data?.publications || [];
  },
  getPublicationById: async (id: string) => {
    const response = await apiRequest<any>(`/publications/${id}`);
    return response?.data?.publication || null;
  },
  getPublicationStats: async () => {
    const response = await apiRequest<any>('/publications/stats');
    return response?.data || null;
  },

  // Theses
  getTheses: async () => {
    const response = await apiRequest<any>('/thesis');
    return response?.data?.thesisSupervisions || [];
  },
  getThesisById: async (id: string) => {
    const response = await apiRequest<any>(`/thesis/${id}`);
    return response?.data?.thesisSupervision || null;
  },
  getThesisStats: async () => {
    const response = await apiRequest<any>('/thesis/stats');
    return response?.data || null;
  },

  // Travel Grants
  getTravelGrants: async () => {
    const response = await apiRequest<any>('/travel');
    // Handle both array and single object responses
    if (Array.isArray(response?.data?.travelGrants)) {
      return response.data.travelGrants;
    } else if (response?.data?.travelGrants && typeof response.data.travelGrants === 'object') {
      return [response.data.travelGrants];
    }
    return [];
  },
  getTravelGrantById: async (id: string) => {
    const response = await apiRequest<any>(`/travel/${id}`);
    return response?.data?.travelGrant || null;
  },
  getTravelStats: async () => {
    const response = await apiRequest<any>('/travel/stats');
    return response?.data || null;
  },

  // FYP Projects
  getFYPProjects: async () => {
    const response = await apiRequest<any>('/fyp');
    // Ensure we always return an array
    if (Array.isArray(response?.data?.fypProjects)) {
      return response.data.fypProjects;
    }
    return [];
  },
  getFYPProjectById: async (id: string) => {
    const response = await apiRequest<any>(`/fyp/${id}`);
    return response?.data?.fypProject || null;
  },
  getFYPStats: async () => {
    const response = await apiRequest<any>('/fyp/stats');
    return response?.data || null;
  },

  // Events
  getEvents: async () => {
    const response = await apiRequest<any>('/events');
    return response?.data?.events || [];
  },
  getEventById: async (id: string) => {
    const response = await apiRequest<any>(`/events/${id}`);
    return response?.data?.event || null;
  },
  getEventStats: async () => {
    const response = await apiRequest<any>('/events/stats');
    return response?.data || null;
  },

  // Projects
  getProjects: async () => {
    const response = await apiRequest<any>('/projects');
    return response?.data?.projects || [];
  },
  getProjectById: async (id: string) => {
    const response = await apiRequest<any>(`/projects/${id}`);
    return response?.data?.project || null;
  },
  getProjectStats: async () => {
    const response = await apiRequest<any>('/projects/stats');
    return response?.data || null;
  },

  // Users (Admin only)
  getUsers: async () => {
    const response = await apiRequest<any>('/users');
    return response?.data?.users || [];
  },
  getUserById: async (id: string) => {
    const response = await apiRequest<any>(`/users/${id}`);
    console.log('getUserById response:', response);
    if (!response) {
      console.log('getUserById: No response received');
      return null;
    }
    return response?.data?.user || null;
  },
  getUserStats: async () => {
    const response = await apiRequest<any>('/users/stats');
    return response?.data || null;
  },

  // Reports
  getComprehensiveStats: async () => {
    const response = await apiRequest<any>('/reports/stats');
    return response?.data || null;
  },

  // Funding Statistics
  getFundingStats: async () => {
    const response = await apiRequest<any>('/funding/stats');
    return response?.data || null;
  },
  getFundingByDepartment: async (department: string) => {
    const response = await apiRequest<any>(`/funding/department/${encodeURIComponent(department)}`);
    return response?.data || null;
  },
  getFundingByAgency: async (agency: string) => {
    const response = await apiRequest<any>(`/funding/agency/${encodeURIComponent(agency)}`);
    return response?.data || null;
  },
  getFundingOpportunities: async () => {
    const response = await apiRequest<any>('/funding/opportunities');
    return response?.data || null;
  },
  getFundingSources: async () => {
    const response = await apiRequest<any>('/funding/sources');
    return response?.data || null;
  },

  // Contact API
  createContact: async (contactData: any) => {
    const response = await apiRequest<any>('/contacts', 'POST', contactData);
    return response?.data || null;
  },

  // Health check
  getHealth: () => apiRequest<{ success: boolean; message: string; timestamp: string }>('/health').catch(() => null),
};

// Legacy dashboard API for backward compatibility
export const dashboardApi = {
  getPublications: () => api.getPublications(),
  getTheses: () => api.getTheses(),
  getTravelGrants: () => api.getTravelGrants(),
  getFYPProjects: () => api.getFYPProjects(),
  getEvents: () => api.getEvents(),
  getProjects: () => api.getProjects(),

  getAllData: async () => {
    try {
      const [publications, theses, travelGrants, fypProjects, events, projects] = await Promise.all([
        api.getPublications(),
        api.getTheses(),
        api.getTravelGrants(),
        api.getFYPProjects(),
        api.getEvents(),
        api.getProjects(),
      ]);
      return { publications, theses, travelGrants, fypProjects, events, projects };
    } catch (error) {
      console.warn('Failed to fetch dashboard data:', error);
      return null;
    }
  },

  getAllStats: async () => {
    try {
      const [publicationStats, thesisStats, travelStats, fypStats, eventStats, projectStats, userStats] = await Promise.allSettled([
        api.getPublicationStats(),
        api.getThesisStats(),
        api.getTravelStats(),
        api.getFYPStats(),
        api.getEventStats(),
        api.getProjectStats(),
        api.getUserStats().catch(() => ({ total: 0, byStatus: {} })), // Handle 401 gracefully
      ]);
      
      return { 
        publications: publicationStats.status === 'fulfilled' ? publicationStats.value : { total: 0, byStatus: {} }, 
        theses: thesisStats.status === 'fulfilled' ? thesisStats.value : { total: 0, byStatus: {} }, 
        travelGrants: travelStats.status === 'fulfilled' ? travelStats.value : { total: 0, byStatus: {} }, 
        fypProjects: fypStats.status === 'fulfilled' ? fypStats.value : { total: 0, byStatus: {} }, 
        events: eventStats.status === 'fulfilled' ? eventStats.value : { total: 0, byStatus: {} }, 
        projects: projectStats.status === 'fulfilled' ? projectStats.value : { total: 0, byStatus: {} }, 
        users: userStats.status === 'fulfilled' ? userStats.value : { total: 0, byStatus: {} } 
      };
    } catch (error) {
      console.warn('Failed to fetch stats data:', error);
      return {
        publications: { total: 0, byStatus: {} },
        theses: { total: 0, byStatus: {} },
        travelGrants: { total: 0, byStatus: {} },
        fypProjects: { total: 0, byStatus: {} },
        events: { total: 0, byStatus: {} },
        projects: { total: 0, byStatus: {} },
        users: { total: 0, byStatus: {} }
      };
    }
  },
};