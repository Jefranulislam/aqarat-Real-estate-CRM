const API_BASE_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : null) || 'http://localhost:5000';

class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = `${API_BASE_URL}/api`;
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken() {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
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
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  logout() {
    this.removeToken();
  }

  // Profile
  async getProfile() {
    return this.request('/profiles/me');
  }

  async updateProfile(profileData: any) {
    return this.request('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getProfiles() {
    return this.request('/profiles');
  }

  // Leads
  async getLeads(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/leads${query ? `?${query}` : ''}`);
  }

  async getLead(id: string) {
    return this.request(`/leads/${id}`);
  }

  async createLead(leadData: any) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(id: string, leadData: any) {
    return this.request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  }

  async deleteLead(id: string) {
    return this.request(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  // Contacts
  async getContacts(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/contacts${query ? `?${query}` : ''}`);
  }

  async getContact(id: string) {
    return this.request(`/contacts/${id}`);
  }

  async createContact(contactData: any) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateContact(id: string, contactData: any) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteContact(id: string) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Properties
  async getProperties(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/properties${query ? `?${query}` : ''}`);
  }

  async getProperty(id: string) {
    return this.request(`/properties/${id}`);
  }

  async createProperty(propertyData: any) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async updateProperty(id: string, propertyData: any) {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Deals
  async getDeals(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/deals${query ? `?${query}` : ''}`);
  }

  async getDeal(id: string) {
    return this.request(`/deals/${id}`);
  }

  async createDeal(dealData: any) {
    return this.request('/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    });
  }

  async updateDeal(id: string, dealData: any) {
    return this.request(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dealData),
    });
  }

  async deleteDeal(id: string) {
    return this.request(`/deals/${id}`, {
      method: 'DELETE',
    });
  }

  async getDealsPipeline() {
    return this.request('/deals/analytics/pipeline');
  }

  // Tasks
  async getTasks(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/tasks${query ? `?${query}` : ''}`);
  }

  async getTask(id: string) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(taskData: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: string, taskData: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getRelatedTasks(type: string, id: string) {
    return this.request(`/tasks/related/${type}/${id}`);
  }

  // Activities
  async getActivities(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/activities${query ? `?${query}` : ''}`);
  }

  async getActivity(id: string) {
    return this.request(`/activities/${id}`);
  }

  async createActivity(activityData: any) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async updateActivity(id: string, activityData: any) {
    return this.request(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    });
  }

  async deleteActivity(id: string) {
    return this.request(`/activities/${id}`, {
      method: 'DELETE',
    });
  }

  async getRelatedActivities(type: string, id: string) {
    return this.request(`/activities/related/${type}/${id}`);
  }

  async getRecentActivities(limit: number = 10) {
    return this.request(`/activities/timeline/recent?limit=${limit}`);
  }

  // Documents
  async getDocuments(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/documents${query ? `?${query}` : ''}`);
  }

  async getDocument(id: string) {
    return this.request(`/documents/${id}`);
  }

  async uploadDocument(file: File, metadata: any) {
    const formData = new FormData();
    formData.append('document', file);
    
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const token = this.getToken();
    return fetch(`${this.baseURL}/documents`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(response => response.json());
  }

  async updateDocument(id: string, documentData: any) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  }

  async deleteDocument(id: string) {
    return this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async getRelatedDocuments(type: string, id: string) {
    return this.request(`/documents/related/${type}/${id}`);
  }

  getDocumentDownloadUrl(id: string) {
    const token = this.getToken();
    return `${this.baseURL}/documents/${id}/download${token ? `?token=${token}` : ''}`;
  }
}

export const apiClient = new ApiClient();