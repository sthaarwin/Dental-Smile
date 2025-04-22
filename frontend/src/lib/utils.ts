import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns the appropriate dashboard URL based on user role
 * @param role The user's role ('patient', 'dentist', 'admin')
 * @returns The URL path for the user's dashboard
 */
export function getDashboardUrlByRole(role?: string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'dentist':
      return '/dentist-dashboard';
    case 'patient':
    default:
      return '/dashboard';
  }
}
