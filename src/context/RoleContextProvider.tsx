/**
 * RoleContextProvider
 * Manages vendor role state by listening to both auth and vendor profile changes
 *
 * Provides:
 * - status: 'anonymous' | 'pending' | 'approved' | 'rejected' | undefined
 * - isVendorApproved: boolean
 * - vendorProfile: VendorProfile | null
 * - requestVendorRole: () => Promise<void>
 * - refreshProfile: () => Promise<void>
 *
 * @example
 * ```typescript
 * import { useRole } from '@/context/RoleContextProvider';
 *
 * function MyComponent() {
 *   const { status, isVendorApproved, requestVendorRole } = useRole();
 *
 *   if (status === 'anonymous') {
 *     return <Text>Please sign in</Text>;
 *   }
 *
 *   if (status === 'pending') {
 *     return <Text>Vendor request pending approval</Text>;
 *   }
 *
 *   if (isVendorApproved) {
 *     return <Text>You are an approved vendor!</Text>;
 *   }
 *
 *   return (
 *     <Button onPress={requestVendorRole}>
 *       Request Vendor Role
 *     </Button>
 *   );
 * }
 * ```
 */

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { getAuthService, getRoleService } from '../services/registry';
import type { User, VendorProfile, VendorProfileStatus } from '../types/models';

/**
 * Role context type
 */
export interface RoleContextType {
  /** Current vendor profile status or 'anonymous' if not signed in */
  status: VendorProfileStatus | 'anonymous' | undefined;
  /** Whether user is an approved vendor */
  isVendorApproved: boolean;
  /** Current vendor profile (if exists) */
  vendorProfile: VendorProfile | null;
  /** Current authenticated user */
  user: User | null;
  /** Loading state */
  loading: boolean;
  /** Request vendor role for current user */
  requestVendorRole: () => Promise<void>;
  /** Manually refresh vendor profile */
  refreshProfile: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export interface RoleProviderProps {
  children: ReactNode;
}

/**
 * RoleContextProvider component
 * Listens to auth state and vendor profile changes
 */
export function RoleProvider({ children }: RoleProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const authService = useMemo(() => getAuthService(), []);
  const roleService = useMemo(() => getRoleService(), []);

  // Derive status from user and vendor profile
  const status: VendorProfileStatus | 'anonymous' | undefined = (() => {
    if (!user) return 'anonymous';
    if (!vendorProfile) return undefined; // Signed in but no vendor profile
    return vendorProfile.status;
  })();

  const isVendorApproved = vendorProfile?.status === 'approved';

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);

      // Clear vendor profile if user signs out
      if (!authUser) {
        setVendorProfile(null);
      }
    });

    return () => unsubscribe();
  }, [authService]);

  // Listen to vendor profile changes when user is authenticated
  useEffect(() => {
    if (!user) {
      setVendorProfile(null);
      return;
    }

    const unsubscribe = roleService.watchVendorProfile(user.id, (profile) => {
      setVendorProfile(profile);
    });

    return () => unsubscribe();
  }, [user, roleService]);

  /**
   * Request vendor role for current user
   */
  const requestVendorRole = useCallback(async () => {
    if (!user) {
      throw new Error('Debes iniciar sesión para solicitar el rol de vendedor');
    }

    try {
      const profile = await roleService.requestVendorRole();
      setVendorProfile(profile);
    } catch (error) {
      console.error('[RoleProvider] Error requesting vendor role:', error);
      throw error;
    }
  }, [user, roleService]);

  /**
   * Manually refresh vendor profile
   */
  const refreshProfile = useCallback(async () => {
    if (!user) {
      setVendorProfile(null);
      return;
    }

    // The watchVendorProfile listener will automatically update
    // But we can force a refresh if needed by re-requesting
    try {
      // For now, just rely on the real-time listener
      console.log('[RoleProvider] Profile refresh triggered (handled by listener)');
    } catch (error) {
      console.error('[RoleProvider] Error refreshing profile:', error);
    }
  }, [user]);

  const value: RoleContextType = useMemo(
    () => ({
      status,
      isVendorApproved,
      vendorProfile,
      user,
      loading,
      requestVendorRole,
      refreshProfile
    }),
    [status, isVendorApproved, vendorProfile, user, loading, requestVendorRole, refreshProfile]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

/**
 * Hook to access role context
 */
export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
}

/**
 * Alternative export names for convenience
 */
export const RoleContextProvider = RoleProvider;
export const useRoleContext = useRole;
