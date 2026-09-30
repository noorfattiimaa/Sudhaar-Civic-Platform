import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';

// --- Interfaces ---

export interface Donation {
  id: number;
  campaign: number;
  campaign_title?: string;
  donor: number;
  donor_email?: string;
  donor_name?: string;
  amount: string;
  is_anonymous: boolean;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
}

export interface CreateDonationData {
  donor: number; // Added to match your fix in CampaignModal
  campaign: number;
  amount: number;
  is_anonymous?: boolean;
  payment_method?: string;
  transaction_id?: string;
}

// New Interface for Campaign Creation
export interface CreateCampaignData {
  title: string;
  description: string;
  goal: number;
  image?: string;
  ngo: number;
  zakat_eligible?: boolean;
}

// --- Service Object ---

export const donationsService = {
  // Get all donations (already exists)
  async getAll(params?: { campaign?: number; is_anonymous?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = queryParams.toString()
      ? `${API_ENDPOINTS.DONATIONS}?${queryParams.toString()}`
      : API_ENDPOINTS.DONATIONS;

    return apiService.get<{ results: Donation[]; count: number }>(url);
  },

  // Create a donation (already exists)
  async create(data: CreateDonationData) {
    return apiService.post<Donation>(API_ENDPOINTS.DONATIONS, data);
  },

  /**
   * STEP 5: New function to create a campaign from the NGO Dashboard
   * This connects to your Django "Campaigns" endpoint
   */
  
    async createCampaign(data: any) {
    // This matches your Django CampaignCreateSerializer
    // It expects: title, description, category, image, goal_amount, budget_items
      return apiService.post<any>(API_ENDPOINTS.CAMPAIGNS, data);
  }
};