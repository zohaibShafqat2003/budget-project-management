import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely ensures a string is not null or undefined
 * @param value String value that might be null or undefined
 * @returns The original string or an empty string if null/undefined
 */
export function ensureString(value: string | null | undefined): string {
  return value ?? ''
}

/**
 * Type guard to ensure a value is not null or undefined
 * @param value Any value that might be null or undefined
 * @returns Boolean indicating if value is not null/undefined
 */
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

/**
 * Format a date to a human-readable string
 * @param date Date or string to format
 * @param format Format to use (defaults to 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: string = 'MMM d, yyyy'): string {
  if (!date) return ''
  
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Calculate percentage value
 * @param value Current value
 * @param total Total value
 * @returns Percentage (0-100)
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}
