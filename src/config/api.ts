// src/config/api.ts

export const API_BASE_URL = 'http://localhost:8000'; // Keep this as just the domain

export const API_ENDPOINTS = {
  // Auth
 LOGIN: '/api/auth/login/',     // Was '/api/token/'
  REGISTER: '/api/auth/register/',
  REFRESH: '/api/auth/refresh/',
  
  // Users
  USERS: '/api/users/',
  USER_ME: '/api/users/me/',
  
  // Issues
  ISSUES: '/api/issues/',
  ISSUE_STATS: '/api/issues/stats/',
  
 
  
  // Donations
  DONATIONS: '/api/donations/',
  CAMPAIGNS: '/api/campaigns/',
  // Transparency
  TRANSPARENCY: '/api/transparency/', // Matches your ViewSet name
  TRANSPARENCY_SUMMARY: '/api/transparency-reports/summary/',
  
  // Dashboard
 DASHBOARD_STATS: '/api/dashboard/stats/',

};