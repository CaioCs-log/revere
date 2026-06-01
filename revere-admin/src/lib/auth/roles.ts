export type UserRole = "owner" | "editor" | "viewer" | "customer";

export interface AdminUser {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

/**
 * Helper to check if a role has administrative privileges.
 */
export function isAdministrativeRole(role: UserRole): boolean {
  return role === "owner" || role === "editor" || role === "viewer";
}

/**
 * Helper to check if a role can perform write operations.
 */
export function canWrite(role: UserRole): boolean {
  return role === "owner" || role === "editor";
}
