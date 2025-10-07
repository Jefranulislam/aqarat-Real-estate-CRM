// API Client for Backend Communication (Axios-based)
  
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class APIClient {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach token on each request (browser only)
  this.axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers = config.headers || {};
          (config.headers as any)['Authorization'] = `Bearer ${token}`;
          // Helpful debug snippet (safe preview only)
          try {
            console.log('Request details:', {
              url: config.url,
              method: (config.method || 'get').toUpperCase(),
              hasToken: true,
              tokenPreview: token.substring(0, 20) + '...',
            });
          } catch {}
        } else {
          console.log('No token available for request to:', config.url);
        }
      }
      return config;
    });

    // Normalize errors
    this.axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<any>) => {
        const status = error.response?.status;
        const data = error.response?.data as any;

        if (status === 401) {
          return Promise.reject(new Error('Unauthorized - Please login again'));
        }
        if (status === 403) {
          return Promise.reject(new Error('Access denied'));
        }
        if (status === 400) {
          console.error('400 Bad Request Details:', {
            endpoint: error.config?.url,
            method: (error.config?.method || 'get').toUpperCase(),
            errorData: data,
          });
          const msg = data?.error || data?.message || `Bad Request: ${JSON.stringify(data || {})}`;
          return Promise.reject(new Error(msg));
        }
        if (status === 500) {
          console.error('500 Internal Server Error Details:', {
            endpoint: error.config?.url,
            method: (error.config?.method || 'get').toUpperCase(),
            errorData: data,
          });
          const msg = data?.error || data?.message || 'Server encountered an error';
          return Promise.reject(new Error(`Internal server error: ${msg}`));
        }

        if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
          return Promise.reject(new Error('Cannot connect to server. Please ensure the backend is running on port 5000'));
        }

        const fallback = (data && (data.error || data.message)) || error.message || 'Request failed';
        return Promise.reject(new Error(fallback));
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('auth_token');
    console.log('Getting token from localStorage:', token ? 'Found token' : 'No token found');
    return token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    // Convert fetch-style options to Axios config
    const method = (options.method || 'GET').toUpperCase();
    const headers = { ...(options.headers as Record<string, string>), 'Content-Type': 'application/json' };

    let data: any = undefined;
    if (options.body) {
      try {
        data = typeof options.body === 'string' ? JSON.parse(options.body as string) : options.body;
      } catch {
        // Fallback to raw body if not JSON
        data = options.body;
      }
    }

    const res = await this.axios.request({
      url: endpoint,
      method: method as any,
      headers,
      data,
    });

    return res.data;
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    console.log('Login response:', data);
    if (data.token) {
      console.log('Storing token in localStorage:', data.token);
      localStorage.setItem('auth_token', data.token);
      // Store user information for role-based access
      if (data.user) {
        console.log('Storing user info:', data.user);
        localStorage.setItem('user_info', JSON.stringify(data.user));
      }
      document.cookie = `auth_token=${data.token}; path=/; max-age=604800`; // 7 days
      console.log('Token stored. Verification:', localStorage.getItem('auth_token') ? 'Success' : 'Failed');
    }
    return data;
  }

  // Get current user information
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Logout
  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    document.cookie = 'auth_token=; path=/; max-age=0';
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    phone?: string;
  }) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    console.log('Register response:', data);
    if (data.token) {
      console.log('Storing token from registration:', data.token);
      localStorage.setItem('auth_token', data.token);
      // Store user information for role-based access
      if (data.user) {
        console.log('Storing user info from registration:', data.user);
        localStorage.setItem('user_info', JSON.stringify(data.user));
      }
      document.cookie = `auth_token=${data.token}; path=/; max-age=604800`;
    }
    return data;
  }

  // Profiles
  async getProfile() {
    return this.request('/profiles/me');
  }

  async updateProfile(data: any) {
    return this.request('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAllProfiles() {
    return this.request('/profiles');
  }

  // Leads
  async getLeads(params?: Record<string, any>) {
    // Clean up params - remove undefined/null values and convert properly
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = String(value);
        }
      });
    }
    const query = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
    return this.request(`/leads${query}`);
  }

  async getLead(id: string) {
    return this.request(`/leads/${id}`);
  }

  async createLead(data: any) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLead(id: string, data: any) {
    return this.request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLead(id: string) {
    return this.request(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  // Contacts
  async getContacts(params?: Record<string, any>) {
    // Clean up params - remove undefined/null values and convert properly
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = String(value);
        }
      });
    }
    const query = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
    return this.request(`/contacts${query}`);
  }

  async getContact(id: string) {
    return this.request(`/contacts/${id}`);
  }

  async createContact(data: any) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContact(id: string, data: any) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContact(id: string) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Properties
  async getProperties(params?: Record<string, any>) {
    // Clean up params - remove undefined/null values and convert properly
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = String(value);
        }
      });
    }
    const query = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
    return this.request(`/properties${query}`);
  }

  async getProperty(id: string) {
    return this.request(`/properties/${id}`);
  }

  async createProperty(data: any) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProperty(id: string, data: any) {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Deals
  async getDeals(params?: Record<string, any>) {
    // Clean up params - remove undefined/null values and convert properly
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = String(value);
        }
      });
    }
    const query = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
    return this.request(`/deals${query}`);
  }

  async getDeal(id: string) {
    return this.request(`/deals/${id}`);
  }

  async createDeal(data: any) {
    return this.request('/deals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDeal(id: string, data: any) {
    return this.request(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDeal(id: string) {
    return this.request(`/deals/${id}`, {
      method: 'DELETE',
    });
  }

  // Tasks
  async getTasks(params?: Record<string, any>) {
    // Clean up params - remove undefined/null values and convert properly
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanParams[key] = String(value);
        }
      });
    }
    const query = Object.keys(cleanParams).length > 0 ? '?' + new URLSearchParams(cleanParams).toString() : '';
    return this.request(`/tasks${query}`);
  }

  async getTask(id: string) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(data: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Activities
  async getActivities(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/activities${query}`);
  }

  async getActivity(id: string) {
    return this.request(`/activities/${id}`);
  }

  async createActivity(data: any) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateActivity(id: string, data: any) {
    return this.request(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteActivity(id: string) {
    return this.request(`/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents
  async getDocuments(params?: Record<string, any>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/documents${query}`);
  }

  async getDocument(id: string) {
    return this.request(`/documents/${id}`);
  }

  async createDocument(data: any) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteDocument(id: string) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new APIClient();
export default apiClient;