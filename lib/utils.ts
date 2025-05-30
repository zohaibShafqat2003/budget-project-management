import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date into a readable string
 * @param date The date to format
 * @returns A formatted date string (e.g., "Jan 15, 2023")
 */
export function formatDate(date: Date): string {
  if (!date) return "";
  
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date instanceof Date ? date : new Date(date));
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}
