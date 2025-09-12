import { ApiService } from './ApiService';
import { FirebaseService } from './FirebaseService';
import { NodeJSService } from './NodeJSService';

/**
 * Tipos de servicios disponibles
 */
export type ServiceType = 'firebase' | 'nodejs';

/**
 * Configuración para cada tipo de servicio
 */
interface ServiceConfig {
  firebase: Record<string, never>; // Empty object type
  nodejs: {
    baseUrl: string;
  };
}

/**
 * Factory para crear servicios de API
 *
 * Este factory permite cambiar fácilmente entre diferentes
 * implementaciones de servicios (Firebase, Node.js, etc.)
 * sin cambiar el código de la aplicación.
 */
export class ServiceFactory {
  private static instance: ApiService | null = null;
  private static currentType: ServiceType = 'firebase'; // Default

  /**
   * Obtiene la instancia singleton del servicio actual
   */
  static getInstance(): ApiService {
    if (!this.instance) {
      this.instance = this.createService(this.currentType);
    }
    return this.instance;
  }

  /**
   * Cambia el tipo de servicio y recrea la instancia
   * Útil para migración o testing
   */
  static switchService(type: ServiceType, config?: ServiceConfig[typeof type]): ApiService {
    this.currentType = type;
    this.instance = this.createService(type, config);
    return this.instance;
  }

  /**
   * Crea una nueva instancia del servicio especificado
   */
  private static createService(type: ServiceType, config?: any): ApiService {
    switch (type) {
      case 'firebase':
        console.log('🔥 Usando Firebase como backend');
        return new FirebaseService();

      case 'nodejs':
        const nodeConfig = config as ServiceConfig['nodejs'];
        if (!nodeConfig?.baseUrl) {
          throw new Error('Node.js service requires baseUrl in config');
        }
        console.log('🚀 Usando Node.js backend:', nodeConfig.baseUrl);
        return new NodeJSService(nodeConfig.baseUrl);

      default:
        throw new Error(`Tipo de servicio no soportado: ${type}`);
    }
  }

  /**
   * Obtiene el tipo de servicio actual
   */
  static getCurrentType(): ServiceType {
    return this.currentType;
  }

  /**
   * Verifica si el servicio actual es del tipo especificado
   */
  static isCurrentType(type: ServiceType): boolean {
    return this.currentType === type;
  }

  /**
   * Resetea la instancia (útil para testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Método de conveniencia para obtener el servicio de Firebase
   */
  static getFirebaseService(): FirebaseService {
    if (this.currentType !== 'firebase') {
      this.switchService('firebase');
    }
    return this.getInstance() as FirebaseService;
  }

  /**
   * Método de conveniencia para obtener el servicio de Node.js
   */
  static getNodeJSService(baseUrl: string): NodeJSService {
    if (this.currentType !== 'nodejs') {
      this.switchService('nodejs', { baseUrl });
    }
    return this.getInstance() as NodeJSService;
  }
}

/**
 * Hook de conveniencia para obtener el servicio actual
 * Úsalo en tus componentes React
 */
export const useApiService = (): ApiService => {
  return ServiceFactory.getInstance();
};

/**
 * Instancia global del servicio (singleton)
 * Usa esta instancia en toda tu aplicación
 */
export const apiService = ServiceFactory.getInstance();

// Exportar tipos e interfaces para usar en otros archivos
export * from './ApiService';
export { FirebaseService } from './FirebaseService';
export { NodeJSService } from './NodeJSService';
