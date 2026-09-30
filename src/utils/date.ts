/**
 * Formats a date string into a relative time string (e.g. "5 minutes ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export function formatTimeAgo(dateString: string | undefined): string {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  const now = new Date();

  // Check if date is valid
  if (isNaN(date.getTime())) return "Recently";

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Future dates (shouldn't happen usually but handle gracefully)
  if (seconds < 0) return "Just now";

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

/**
 * Formats a date string into a readable date (e.g. "Dec 31, 2023")
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDisplayDate(dateString: string | undefined): string {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
