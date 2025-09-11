# WeNearBy - Arquitectura Modular

Esta estructura de carpetas está diseñada para permitir la separación futura de la aplicación en dos apps independientes: Customer App y Business App.

## 📁 Estructura de Carpetas

### 🏗️ Arquitectura General
```
src/
├── modules/           # Módulos principales de la aplicación
│   ├── customer/      # Funcionalidad para clientes
│   └── business/      # Funcionalidad para comercios
└── shared/           # Código compartido entre módulos
    ├── components/   # Componentes reutilizables
    ├── services/     # Servicios compartidos
    ├── types/        # Interfaces TypeScript
    └── utils/        # Funciones helpers
```

### 🎯 Principios de la Arquitectura

#### **Separación por Dominio**
- **Customer Module**: Todo lo relacionado con la experiencia del cliente
- **Business Module**: Todo lo relacionado con la gestión de comercios
- **Shared**: Código común que ambos módulos necesitan

#### **Preparación para Separación Futura**
- Cada módulo es independiente y autocontenido
- Las dependencias entre módulos están minimizadas
- El código compartido está claramente identificado
- Fácil extracción de cada módulo a una app separada

#### **Escalabilidad**
- Estructura clara para agregar nuevos módulos
- Componentes reutilizables centralizados
- Servicios compartidos optimizados

## 🚀 Beneficios

1. **Mantenibilidad**: Código organizado por dominio de negocio
2. **Reutilización**: Componentes y servicios compartidos
3. **Escalabilidad**: Fácil agregar nuevas funcionalidades
4. **Separación Futura**: Preparado para dividir en apps independientes
5. **Testing**: Más fácil hacer testing por módulos
6. **Desarrollo en Equipo**: Equipos pueden trabajar en módulos específicos

## 📋 Próximos Pasos

1. Migrar componentes existentes a la nueva estructura
2. Definir interfaces TypeScript en `shared/types`
3. Mover servicios a `shared/services`
4. Organizar pantallas por módulo
5. Implementar testing por módulo