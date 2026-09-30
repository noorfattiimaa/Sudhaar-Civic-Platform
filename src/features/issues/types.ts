// File: src/features/issues/types.ts

export type IssueCategory = "Roads" | "Sanitation" | "Electricity" | "Water" | "Civic" | "Health" | "Environment" | "Education" | string;

export type IssueStatus = "Verified" | "In Progress" | "Pending" | "Resolved" | "Critical" | "Open" | "Rejected";

export interface Issue {
  // Allow ID to be string ("101") OR number (101)
  id: string | number;

  title: string;
  desc?: string;
  description?: string; // API returns 'description'
  location: string;
  category: IssueCategory;
  status: IssueStatus;
  priority?: "Low" | "Medium" | "High" | "Critical";
  timeText?: string;
  time_text?: string; // API returns 'time_text'
  author?: string;
  author_name?: string; // API returns 'author_name'
  author_email?: string; // API returns 'author_email'
  image?: string;
  image_url?: string; // API returns 'image_url'
  image_url_full?: string; // API returns 'image_url_full'
  upvotes: number;
  user_has_upvoted?: boolean;

  budget?: {
    total: number;
    spent: number;
    items: { label: string; cost: number }[];
  };

  timeline?: {
    date: string;
    status: string;
  }[];

  created_at?: string; // API returns this
}