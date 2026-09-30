import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  ngo: number;
  ngo_name?: string;
  ngo_email?: string;
  category: string;
  image?: string;
  image_url?: string;
  image_url_full?: string;
  goal_amount: string;
  raised_amount: string;
  donor_count: number;
  is_verified: boolean;
  is_active: boolean;
  budget_items?: BudgetItem[];
  progress_percentage: number;
  created_at: string;
}

export interface BudgetItem {
  id: number;
  item_name: string;
  total_cost: string;
  funded_amount: string;
}

export interface CreateCampaignData {
  title: string;
  description: string;
  category: string;
  goal_amount: number;
  image?: File;
  image_url?: string;
  budget_items?: Omit<BudgetItem, 'id'>[];
}

export const campaignsService = {
  async getAll(params?: {
    category?: string;
    is_verified?: boolean;
    is_active?: boolean;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.CAMPAIGNS}?${queryParams.toString()}`
      : API_ENDPOINTS.CAMPAIGNS;

    return apiService.get<{ results: Campaign[]; count: number }>(url);
  },

  async getById(id: number) {
    return apiService.get<Campaign>(`${API_ENDPOINTS.CAMPAIGNS}${id}/`);
  },

  async create(data: CreateCampaignData) {
    if (data.image) {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('goal_amount', String(data.goal_amount));
      if (data.budget_items) {
        formData.append('budget_items', JSON.stringify(data.budget_items));
      }
      formData.append('image', data.image);

      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.CAMPAIGNS, {
        method: 'POST',
        headers,
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      const result = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        return {
          error: result.detail || result.message || 'Failed to create campaign',
          status: response.status,
        };
      }

      return { data: result, status: response.status };
    }

    return apiService.post<Campaign>(API_ENDPOINTS.CAMPAIGNS, data);
  },

  async getDonations(id: number) {
    return apiService.get(`${API_ENDPOINTS.CAMPAIGNS}${id}/donations/`);
  },
};

