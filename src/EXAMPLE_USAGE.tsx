// Example usage of the new modular aliases

// ✅ Import shared components
import { Button, Input } from '@shared/components';

// ✅ Import shared services
import { authService } from '@shared/services';

// ✅ Import shared types

// ✅ Import shared utils

// ✅ Import customer screens

// ✅ Import customer components

// ✅ Import business screens

// ✅ Import business components

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
      <Input placeholder="Email" keyboardType="email-address" />
      <Input placeholder="Password" secureTextEntry />
      <Button title="Login" onPress={() => handleLogin('test@test.com', 'password')} />
    </>
  );
};
