import { apiService } from './api';
import { API_ENDPOINTS } from '../config/api';
import { Issue } from '../features/issues/types';

export interface CreateIssueData {
  title: string;
  description: string;
  location: string;
  category: string;
  priority?: string;
  image?: File;
  image_url?: string;
  latitude?: number;
  longitude?: number;
}

export interface Comment {
  id: number | string;
  user_name: string;
  user_avatar: string;
  text: string;
  created_at: string;
  updated_at: string;
  is_own_comment?: boolean;
}

export const issuesService = {
  async getAll(params?: {
    category?: string;
    status?: string;
    priority?: string;
    resolved_only?: boolean;
    exclude_resolved?: boolean;
    my_reports?: boolean;
    search?: string;
    ordering?: string;
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
      ? `${API_ENDPOINTS.ISSUES}?${queryParams.toString()}`
      : API_ENDPOINTS.ISSUES;

    return apiService.get<{ results: Issue[]; count: number }>(url);
  },

  async getById(id: string | number) {
    return apiService.get<Issue>(`${API_ENDPOINTS.ISSUES}${id}/`);
  },

  async create(data: CreateIssueData) {
    if (data.image) {
      const { image, ...additionalData } = data;
      return apiService.uploadFile<Issue>(API_ENDPOINTS.ISSUES, image, additionalData);
    }
    return apiService.post<Issue>(API_ENDPOINTS.ISSUES, data);
  },

  async upvote(id: string | number) {
    return apiService.post<{ message: string; upvotes: number }>(
      `${API_ENDPOINTS.ISSUES}${id}/upvote/`,
      {}
    );
  },

  async removeUpvote(id: string | number) {
    return apiService.post<{ message: string; upvotes: number }>(
      `${API_ENDPOINTS.ISSUES}${id}/remove_upvote/`,
      {}
    );
  },

  async updateStatus(id: string | number, status: string, description?: string) {
    return apiService.post<Issue>(
      `${API_ENDPOINTS.ISSUES}${id}/update_status/`,
      { status, description }
    );
  },

  async getStats() {
    return apiService.get(API_ENDPOINTS.ISSUE_STATS);
  },

  async getComments(issueId: string | number) {
    return apiService.get<Comment[]>(`${API_ENDPOINTS.ISSUES}${issueId}/comments/`);
  },

  async createComment(issueId: string | number, text: string) {
    return apiService.post<Comment>(`${API_ENDPOINTS.ISSUES}${issueId}/comments/`, { text });
  },

  async deleteComment(issueId: string | number, commentId: string | number) {
    return apiService.post<{ message: string }>(`${API_ENDPOINTS.ISSUES}${issueId}/delete_comment/`, { comment_id: commentId });
  },
};

