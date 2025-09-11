// Example usage of the new modular aliases

// ✅ Import shared components
import { Button } from '@shared/components';
import { Input } from '@shared/components';
import { Modal } from '@shared/components';

// ✅ Import shared services
import { authService } from '@shared/services';
import { firestoreService } from '@shared/services';

// ✅ Import shared types
import { User, Business, Product } from '@shared/types';

// ✅ Import shared utils
import { dateUtils, validationUtils } from '@shared/utils';

// ✅ Import customer screens
import { BusinessListScreen } from '@customer/screens';
import { CartScreen } from '@customer/screens';

// ✅ Import customer components
import { BusinessCard } from '@customer/components';
import { ProductCard } from '@customer/components';

// ✅ Import business screens
import { BusinessDashboardScreen } from '@business/screens';
import { ProductManagementScreen } from '@business/screens';

// ✅ Import business components
import { DashboardCard } from '@business/components';
import { ProductForm } from '@business/components';

// Example component using the new imports
export const ExampleComponent = () => {
  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await authService.signIn(email, password);
      console.log('User logged in:', user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      <Input 
        placeholder="Email"
        keyboardType="email-address"
      />
      <Input 
        placeholder="Password"
        secureTextEntry
      />
      <Button 
        title="Login"
        onPress={() => handleLogin('test@test.com', 'password')}
      />
    </>
  );
};