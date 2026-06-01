import { AdminUser } from "./roles";

/**
 * FOUNDATION MOCK: This is a temporary abstraction for authentication.
 * It will be replaced by actual Firebase Auth in future modules.
 */

// Mocked currently logged in user
const MOCK_ADMIN_USER: AdminUser = {
  uid: "mock-admin-id",
  email: "admin@revere.com.br",
  role: "owner",
  displayName: "Admin Revere",
};

export async function getCurrentUser(): Promise<AdminUser | null> {
  // In M0, we always return the mock user to allow dashboard navigation
  return MOCK_ADMIN_USER;
}

export async function isAuthenticated(): Promise<boolean> {
  return true;
}

export async function logout(): Promise<void> {
  console.log("Mock logout executed");
}
