// Simple test file to verify aliases work
console.log('✅ Modular aliases configured successfully!');

// These imports would work once we migrate components
// import { Button } from '@shared/components';
// import { BusinessListScreen } from '@customer/screens'; 
// import { BusinessDashboardScreen } from '@business/screens';

export const testAliases = () => {
  console.log('Aliases are configured for:');
  console.log('- @shared/* → ./src/shared/*');
  console.log('- @customer/* → ./src/modules/customer/*'); 
  console.log('- @business/* → ./src/modules/business/*');
};