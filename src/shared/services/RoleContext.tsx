import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

// Types
export type UserRole = 'customer' | 'business';

export interface RoleContextType {
  currentRole: UserRole;
  isLoading: boolean;
  switchToCustomer: () => Promise<void>;
  switchToBusiness: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  clearRole: () => Promise<void>;
}

// Constants
const ROLE_STORAGE_KEY = '@wenearby:user_role';
const DEFAULT_ROLE: UserRole = 'customer';

// Context
const RoleContext = createContext<RoleContextType | null>(null);

// Provider Props
interface RoleProviderProps {
  children: ReactNode;
  defaultRole?: UserRole;
}

// Provider Component
export const RoleProvider: React.FC<RoleProviderProps> = ({
  children,
  defaultRole = DEFAULT_ROLE
}) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(defaultRole);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted role on app start
  const loadPersistedRole = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedRole = await AsyncStorage.getItem(ROLE_STORAGE_KEY);

      if (savedRole && (savedRole === 'customer' || savedRole === 'business')) {
        setCurrentRole(savedRole as UserRole);
        console.log('🔄 Role loaded from storage:', savedRole);
      } else {
        // No saved role, use default
        setCurrentRole(defaultRole);
        await AsyncStorage.setItem(ROLE_STORAGE_KEY, defaultRole);
        console.log('🆕 Default role set:', defaultRole);
      }
    } catch (error) {
      console.error('❌ Error loading role from storage:', error);
      setCurrentRole(defaultRole);
    } finally {
      setIsLoading(false);
    }
  }, [defaultRole]);

  useEffect(() => {
    loadPersistedRole();
  }, [loadPersistedRole]);

  const persistRole = async (role: UserRole) => {
    try {
      await AsyncStorage.setItem(ROLE_STORAGE_KEY, role);
      console.log('💾 Role persisted to storage:', role);
    } catch (error) {
      console.error('❌ Error persisting role to storage:', error);
    }
  };

  const switchRole = useCallback(
    async (newRole: UserRole) => {
      if (newRole === currentRole) {
        console.log('ℹ️ Role is already set to:', newRole);
        return;
      }

      const previousRole = currentRole;
      try {
        console.log('🔄 Switching role from', currentRole, 'to', newRole);
        setCurrentRole(newRole);
        await persistRole(newRole);
        console.log('✅ Role switched successfully to:', newRole);
      } catch (error) {
        console.error('❌ Error switching role:', error);
        // Revert role change on error
        setCurrentRole(previousRole);
      }
    },
    [currentRole]
  );

  const switchToCustomer = useCallback(async () => {
    await switchRole('customer');
  }, [switchRole]);

  const switchToBusiness = useCallback(async () => {
    await switchRole('business');
  }, [switchRole]);

  const clearRole = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ROLE_STORAGE_KEY);
      setCurrentRole(defaultRole);
      console.log('🗑️ Role cleared, reset to default:', defaultRole);
    } catch (error) {
      console.error('❌ Error clearing role:', error);
    }
  }, [defaultRole]);

  const contextValue: RoleContextType = useMemo(
    () => ({
      currentRole,
      isLoading,
      switchToCustomer,
      switchToBusiness,
      switchRole,
      clearRole
    }),
    [currentRole, isLoading, switchToCustomer, switchToBusiness, switchRole, clearRole]
  );

  return <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>;
};

// Hook for easy access
export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }

  return context;
};

// Utility functions
export const roleUtils = {
  isCustomer: (role: UserRole): boolean => role === 'customer',
  isBusiness: (role: UserRole): boolean => role === 'business',
  getRoleDisplayName: (role: UserRole): string => {
    switch (role) {
      case 'customer':
        return 'Cliente';
      case 'business':
        return 'Comercio';
      default:
        return 'Desconocido';
    }
  },
  getOppositeRole: (role: UserRole): UserRole => {
    return role === 'customer' ? 'business' : 'customer';
  }
};
