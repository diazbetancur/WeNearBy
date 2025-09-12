# 🔄 Guía de Migración: Firebase → Node.js

## 📋 Plan de Migración

Esta guía te muestra cómo migrar gradualmente de Firebase a tu propio backend de Node.js usando la arquitectura de servicios abstractos.

## 🎯 Estrategias de Migración

### 1. **Migración Instantánea (Big Bang)**
```typescript
// Cambiar todo de una vez
ServiceFactory.switchService('nodejs', { 
  baseUrl: 'https://api.wenearby.com' 
});
```

### 2. **Migración Gradual por Funcionalidad**
```typescript
// Migrar módulo por módulo
const migrateAuth = () => {
  if (process.env.USE_NODEJS_AUTH === 'true') {
    return ServiceFactory.getNodeJSService('https://auth.wenearby.com');
  }
  return ServiceFactory.getFirebaseService();
};

const migrateBusiness = () => {
  if (process.env.USE_NODEJS_BUSINESS === 'true') {
    return ServiceFactory.getNodeJSService('https://business.wenearby.com');
  }
  return ServiceFactory.getFirebaseService();
};
```

### 3. **Migración por Usuario/Rol**
```typescript
import { useRole } from '@shared/services';

const getApiService = () => {
  const { currentRole } = useRole();
  
  // Los negocios usan Node.js, los clientes siguen con Firebase
  if (currentRole === 'business') {
    return ServiceFactory.getNodeJSService('https://business-api.wenearby.com');
  }
  
  return ServiceFactory.getFirebaseService();
};
```

## 🏗️ Implementación del Backend Node.js

### Estructura Sugerida
```
nodejs-backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── businessController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Business.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── businesses.js
│   │   ├── products.js
│   │   └── orders.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   └── services/
│       ├── emailService.js
│       └── notificationService.js
├── package.json
├── server.js
└── .env
```

### Endpoints Requeridos

#### 🔐 Autenticación
```javascript
// routes/auth.js
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.getProfile);
router.post('/reset-password', authController.resetPassword);
router.put('/profile', authMiddleware, authController.updateProfile);
```

#### 🏪 Negocios
```javascript
// routes/businesses.js
router.get('/', businessController.getBusinesses);
router.get('/:id', businessController.getBusinessById);
router.post('/', authMiddleware, businessController.createBusiness);
router.put('/:id', authMiddleware, businessController.updateBusiness);
router.delete('/:id', authMiddleware, businessController.deleteBusiness);
```

#### 🛍️ Productos
```javascript
// routes/products.js
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);
```

#### 📦 Pedidos
```javascript
// routes/orders.js
router.get('/', authMiddleware, orderController.getOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.post('/', authMiddleware, orderController.createOrder);
router.put('/:id', authMiddleware, orderController.updateOrder);
router.delete('/:id', authMiddleware, orderController.deleteOrder);
```

## 🔄 Proceso de Migración Paso a Paso

### Fase 1: Preparación del Backend
1. **Crear servidor Node.js**
   ```bash
   npm init -y
   npm install express mongoose bcryptjs jsonwebtoken cors helmet
   npm install --save-dev nodemon
   ```

2. **Configurar base de datos**
   ```javascript
   // MongoDB, PostgreSQL, MySQL, etc.
   const mongoose = require('mongoose');
   mongoose.connect(process.env.DATABASE_URL);
   ```

3. **Implementar endpoints básicos**
   ```javascript
   // Empezar con auth y businesses
   app.use('/api/auth', authRoutes);
   app.use('/api/businesses', businessRoutes);
   ```

### Fase 2: Migración de Datos
```javascript
// Script de migración Firebase → Node.js
const migrateFirebaseData = async () => {
  // 1. Exportar datos de Firebase
  const firebaseService = new FirebaseService();
  const businesses = await firebaseService.getBusinesses();
  
  // 2. Importar a Node.js
  const nodeService = new NodeJSService('http://localhost:3000/api');
  
  for (const business of businesses.data) {
    await nodeService.createBusiness(business);
  }
  
  console.log('Migración completada');
};
```

### Fase 3: Testing Dual
```typescript
// Probar ambos servicios en paralelo
const testBothServices = async () => {
  const firebaseService = ServiceFactory.getFirebaseService();
  const nodeService = ServiceFactory.getNodeJSService('http://localhost:3000/api');
  
  const [firebaseResult, nodeResult] = await Promise.all([
    firebaseService.getBusinesses(),
    nodeService.getBusinesses()
  ]);
  
  console.log('Firebase:', firebaseResult.data?.length);
  console.log('Node.js:', nodeResult.data?.length);
};
```

### Fase 4: Migración Gradual
```typescript
// Feature flags para migración gradual
const getBusinessService = () => {
  const useNodeJS = process.env.REACT_APP_USE_NODEJS_BUSINESS === 'true';
  
  if (useNodeJS) {
    return ServiceFactory.getNodeJSService(process.env.REACT_APP_API_URL!);
  }
  
  return ServiceFactory.getFirebaseService();
};

// Usar en componentes
const businessService = getBusinessService();
const businesses = await businessService.getBusinesses();
```

### Fase 5: Migración Completa
```typescript
// Variables de entorno
REACT_APP_API_URL=https://api.wenearby.com
REACT_APP_USE_NODEJS=true

// Configuración global
if (process.env.REACT_APP_USE_NODEJS === 'true') {
  ServiceFactory.switchService('nodejs', { 
    baseUrl: process.env.REACT_APP_API_URL 
  });
}
```

## 🔧 Configuración de Entorno

### .env Development
```bash
# Firebase (desarrollo)
REACT_APP_USE_NODEJS=false
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_PROJECT_ID=...

# Node.js (opcional para testing)
REACT_APP_API_URL=http://localhost:3000/api
```

### .env Production
```bash
# Node.js (producción)
REACT_APP_USE_NODEJS=true
REACT_APP_API_URL=https://api.wenearby.com

# Firebase (backup)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_PROJECT_ID=...
```

## 🧪 Testing de Migración

### 1. Testing Local
```typescript
// Probar Node.js localmente
ServiceFactory.switchService('nodejs', { 
  baseUrl: 'http://localhost:3000/api' 
});

const response = await apiService.getBusinesses();
console.log('Local Node.js:', response);
```

### 2. Testing de Staging
```typescript
// Probar en staging
ServiceFactory.switchService('nodejs', { 
  baseUrl: 'https://staging-api.wenearby.com' 
});
```

### 3. A/B Testing
```typescript
// 50% usuarios usan Node.js, 50% Firebase
const useNodeJS = Math.random() > 0.5;

if (useNodeJS) {
  ServiceFactory.switchService('nodejs', { baseUrl: API_URL });
} else {
  ServiceFactory.switchService('firebase');
}
```

## 📊 Monitoreo de Migración

### Métricas a Seguir
- Tiempo de respuesta API
- Tasa de errores
- Disponibilidad del servicio
- Experiencia del usuario

### Logging
```typescript
// Agregar logs para monitorear migración
const logApiCall = (service: string, method: string, success: boolean) => {
  console.log(`[${service}] ${method}: ${success ? '✅' : '❌'}`);
  
  // Enviar a analytics
  analytics.track('api_call', {
    service,
    method,
    success,
    timestamp: new Date()
  });
};
```

### Rollback Plan
```typescript
// Plan de rollback rápido
const rollbackToFirebase = () => {
  console.warn('🚨 Rollback to Firebase initiated');
  ServiceFactory.switchService('firebase');
  localStorage.setItem('force_firebase', 'true');
};

// Verificar si hay rollback forzado
if (localStorage.getItem('force_firebase') === 'true') {
  ServiceFactory.switchService('firebase');
}
```

## ✅ Checklist de Migración

### Pre-Migración
- [ ] Backend Node.js implementado y testeado
- [ ] Datos migrados exitosamente
- [ ] Testing dual completado
- [ ] Monitoreo configurado
- [ ] Plan de rollback definido

### Durante Migración
- [ ] Feature flags configurados
- [ ] Migración gradual por módulos
- [ ] Monitoring activo
- [ ] Feedback de usuarios

### Post-Migración
- [ ] Todos los servicios funcionando
- [ ] Performance optimizada
- [ ] Firebase como backup (opcional)
- [ ] Documentación actualizada

## 🎯 Beneficios Post-Migración

✅ **Control Total**: Tu propio backend, tus reglas
✅ **Costos Reducidos**: Sin límites de Firebase
✅ **Performance**: Optimizado para tu uso específico
✅ **Escalabilidad**: Escalar según necesidades
✅ **Integración**: Fácil integrar con otros sistemas
✅ **Datos**: Control completo sobre tus datos

La arquitectura de servicios abstractos hace que esta migración sea suave y sin riesgos! 🚀