import { API_BASE_URL } from '../config/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      return {
        error: 'Failed to parse response',
        status: response.status,
      };
    }

    if (!response.ok) {
      // Handle different error formats
      let errorMessage = 'An error occurred';
      if (typeof data === 'string') {
        errorMessage = data;
      } else if (data && typeof data === 'object') {
        if (data.detail) errorMessage = data.detail;
        else if (data.message) errorMessage = data.message;
        else if (data.error) errorMessage = data.error;
        else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors)
            ? data.non_field_errors.join(', ')
            : data.non_field_errors;
        } else {
          // If it's a field-specific error object, join keys and values
          errorMessage = Object.entries(data)
            .map(([field, msgs]) => {
              const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
              const messageList = Array.isArray(msgs) ? msgs.join(', ') : msgs;
              return `${fieldName}: ${messageList}`;
            })
            .join(' | ');
        }
      }

      return {
        error: errorMessage,
        status: response.status,
      };
    }

    return { data, status: response.status };
  }

  async get<T>(url: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    // console.log("1. Request started for:", url); 
    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      // console.log("2. Full URL constructed:", fullUrl);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
      });

      // console.log("3. Fetch returned status:", response.status);
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API GET Error:', error);
      return { error: 'Network error. Please check your connection.' };
    }
  }

  async post<T>(url: string, body: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      const isFormData = body instanceof FormData;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: isFormData ?
          { 'Authorization': `Bearer ${this.getAuthToken()}` } :
          this.getHeaders(includeAuth),
        body: isFormData ? body : JSON.stringify(body),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async put<T>(url: string, body: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async patch<T>(url: string, body: any, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      const response = await fetch(fullUrl, {
        method: 'PATCH',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async delete<T>(url: string, includeAuth: boolean = true): Promise<ApiResponse<T>> {
    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: this.getHeaders(includeAuth),
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // File upload helper
  async uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          if (additionalData[key] !== undefined && additionalData[key] !== null) {
            formData.append(key, String(additionalData[key]));
          }
        });
      }

      const token = this.getAuthToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const fullUrl = `${API_BASE_URL}${url}`;
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: formData,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

export const apiService = new ApiService();