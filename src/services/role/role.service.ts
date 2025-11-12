import type { VendorProfile } from '../../types/models';

/**
 * RoleService interface
 * Manages vendor role requests and vendor profile operations
 */
export interface RoleService {
  /**
   * Request vendor role for the current user
   * Creates a VendorProfile with approved=false pending admin approval
   * @returns Promise with the created VendorProfile
   */
  requestVendorRole(): Promise<VendorProfile>;

  /**
   * Subscribe to vendor profile changes for a specific user
   * @param uid User ID to watch
   * @param callback Function called when vendor profile changes
   * @returns Unsubscribe function
   */
  watchVendorProfile(uid: string, callback: (profile: VendorProfile | null) => void): () => void;
}
