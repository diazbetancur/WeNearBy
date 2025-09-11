// Ejemplo de cómo integrar RoleProvider en tu app principal

import { RoleSwitcher } from '@shared/components';
import { RoleProvider, useRole } from '@shared/services';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext'; // Tu AuthContext existente

// Componente principal que usa ambos contexts
const AppContent = () => {
  const { currentRole } = useRole();

  // Renderizar contenido basado en el rol
  switch (currentRole) {
    case 'customer':
      return <CustomerApp />;
    case 'business':
      return <BusinessApp />;
    default:
      return <RoleSwitcher />;
  }
};

// Apps específicas por rol (ejemplos)
const CustomerApp = () => (
  <div>
    <h1>App de Cliente</h1>
    <RoleSwitcher />
    {/* Aquí van las pantallas de cliente */}
  </div>
);

const BusinessApp = () => (
  <div>
    <h1>App de Comercio</h1>
    <RoleSwitcher />
    {/* Aquí van las pantallas de comercio */}
  </div>
);

// App principal con providers anidados
export const App = () => {
  return (
    // RoleProvider es independiente de AuthProvider
    <RoleProvider defaultRole="customer">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RoleProvider>
  );
};

// Ejemplos de uso del hook useRole en cualquier componente
export const ExampleUsage = () => {
  const { currentRole, switchToCustomer, switchToBusiness, isLoading } = useRole();

  return (
    <div>
      <h2>Rol actual: {currentRole}</h2>

      {isLoading && <p>Cargando...</p>}

      <button onClick={switchToCustomer}>Cambiar a Cliente</button>

      <button onClick={switchToBusiness}>Cambiar a Comercio</button>

      {/* Renderizado condicional */}
      {currentRole === 'customer' && <div>Funcionalidades de cliente</div>}

      {currentRole === 'business' && <div>Funcionalidades de comercio</div>}
    </div>
  );
};

// Hook personalizado para lógica específica de roles
export const useRoleSpecificLogic = () => {
  const { currentRole } = useRole();

  const getAppName = () => {
    switch (currentRole) {
      case 'customer':
        return 'WeNearBy Cliente';
      case 'business':
        return 'WeNearBy Comercio';
      default:
        return 'WeNearBy';
    }
  };

  const getMainColor = () => {
    switch (currentRole) {
      case 'customer':
        return '#007AFF'; // Azul para clientes
      case 'business':
        return '#28A745'; // Verde para comercios
      default:
        return '#6C757D'; // Gris por defecto
    }
  };

  const getAvailableFeatures = () => {
    switch (currentRole) {
      case 'customer':
        return ['buscar', 'ordenar', 'favoritos', 'historial'];
      case 'business':
        return ['dashboard', 'productos', 'pedidos', 'analytics'];
      default:
        return [];
    }
  };

  return {
    appName: getAppName(),
    mainColor: getMainColor(),
    features: getAvailableFeatures()
  };
};
