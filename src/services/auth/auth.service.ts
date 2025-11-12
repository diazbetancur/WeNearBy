import type { User } from '../../types/models';

/**
 * AuthService interface
 * Manages authentication operations (sign up, sign in, sign out, user state)
 */
export interface AuthService {
  /**
   * Sign up a new user with email and password
   * @returns Promise with the created User
   */
  signUpEmail(email: string, password: string): Promise<User>;

  /**
   * Sign in an existing user with email and password
   * @returns Promise with the authenticated User
   */
  signInEmail(email: string, password: string): Promise<User>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Subscribe to authentication state changes
   * @param callback Function called with current user or null on auth state change
   * @returns Unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;

  /**
   * Get the currently authenticated user
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): Promise<User | null>;
}
