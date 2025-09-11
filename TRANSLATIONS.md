# Traducciones Disponibles en WeNearBy App

## 🔍 Estado Actual
✅ Sistema de traducciones configurado y funcionando
✅ Soporte para Español (es) e Inglés (en)
✅ Detección automática del idioma del dispositivo
✅ Warning system para traducciones faltantes

## 📱 Secciones Traducidas

### 🔐 Autenticación (Login/Register)
- **login.title**: "Iniciar Sesión" / "Login"
- **login.email**: "Correo electrónico" / "Email"
- **login.password**: "Contraseña" / "Password"
- **login.button**: "Entrar" / "Sign In"
- **login.register**: "Registrarse" / "Register"
- **login.error**: "Error al iniciar sesión" / "Login error"
- **login.email_required**: "El email es requerido" / "Email is required"
- **login.email_invalid**: "El email no es válido" / "Email is not valid"
- **login.password_required**: "La contraseña es requerida" / "Password is required"

### 📝 Registro
- **register.title**: "Registro" / "Register"
- **register.email**: "Correo electrónico" / "Email"
- **register.password**: "Contraseña" / "Password"
- **register.confirmPassword**: "Confirmar contraseña" / "Confirm password"
- **register.button**: "Registrarse" / "Register"
- **register.back**: "Volver a Login" / "Back to Login"
- **register.error**: "Error al registrar" / "Registration error"
- **register.email_required**: "El email es requerido" / "Email is required"
- **register.email_invalid**: "El email no es válido" / "Email is not valid"
- **register.password_required**: "La contraseña es requerida" / "Password is required"
- **register.password_short**: "La contraseña debe tener al menos 6 caracteres" / "Password must be at least 6 characters"
- **register.confirm_required**: "La confirmación es requerida" / "Confirmation is required"
- **register.passwords_no_match**: "Las contraseñas no coinciden" / "Passwords do not match"

### 🏠 Navegación (Tabs)
- **tabs.home**: "Inicio" / "Home"
- **tabs.explore**: "Explorar" / "Explore"
- **tabs.profile**: "Perfil" / "Profile"
- **tabs.businesses**: "Comercios" / "Businesses"

### 🏡 Pantalla Principal
- **home.title**: "Bienvenido" / "Welcome"
- **home.subtitle**: "Encuentra comercios cerca de ti" / "Find businesses near you"
- **home.search_placeholder**: "Buscar comercios..." / "Search businesses..."

### 🔍 Pantalla Explorar
- **explore.title**: "Explorar" / "Explore"
- **explore.subtitle**: "Descubre nuevos lugares" / "Discover new places"
- **explore.categories**: "Categorías" / "Categories"
- **explore.nearby**: "Cerca de ti" / "Near you"

### 🛒 Carrito
- **cart.title**: "Carrito" / "Cart"
- **cart.empty**: "No hay productos en el carrito." / "No products in the cart."
- **cart.empty_title**: "Carrito Vacío" / "Empty Cart"
- **cart.total**: "Total" / "Total"
- **cart.order**: "Realizar pedido" / "Place order"
- **cart.processing**: "Procesando..." / "Processing..."
- **cart.login_required**: "Debes iniciar sesión para hacer un pedido" / "You must log in to place an order"
- **cart.success_title**: "¡Pedido realizado!" / "Order placed!"
- **cart.success_message**: "Tu pedido ha sido procesado exitosamente" / "Your order has been processed successfully"
- **cart.error_title**: "Error" / "Error"
- **cart.error_message**: "No se pudo procesar el pedido. Intenta nuevamente." / "Could not process the order. Please try again."
- **cart.back_button**: "Volver a comercios" / "Back to businesses"
- **cart.confirm_button**: "Confirmar pedido" / "Confirm order"
- **cart.unit**: "c/u" / "each"
- **cart.subtotal**: "Subtotal" / "Subtotal"

### 🏪 Lista de Comercios
- **businessList.title**: "Comercios Cercanos" / "Nearby Businesses"
- **businessList.empty**: "No hay comercios disponibles en este momento." / "No businesses available at the moment."
- **businessList.loading**: "Cargando comercios..." / "Loading businesses..."
- **businessList.error**: "Error al cargar comercios" / "Error loading businesses"
- **businessList.retry**: "Reintentar" / "Retry"

### 🏢 Perfil de Comercio
- **business.title**: "Comercio" / "Business"
- **business.no_products**: "Este comercio no tiene productos disponibles." / "This business has no products available."
- **business.add_to_cart**: "Agregar al carrito" / "Add to cart"
- **business.view_cart**: "Ver carrito" / "View cart"
- **business.contact**: "Contactar" / "Contact"
- **business.hours**: "Horarios" / "Hours"
- **business.address**: "Dirección" / "Address"
- **business.phone**: "Teléfono" / "Phone"
- **business.loading**: "Cargando productos..." / "Loading products..."
- **business.error_loading_products**: "Error al cargar productos" / "Error loading products"
- **business.price**: "Precio" / "Price"

### 🔧 Comunes
- **common.loading**: "Cargando..." / "Loading..."
- **common.error**: "Error" / "Error"
- **common.success**: "Éxito" / "Success"
- **common.cancel**: "Cancelar" / "Cancel"
- **common.save**: "Guardar" / "Save"
- **common.delete**: "Eliminar" / "Delete"
- **common.edit**: "Editar" / "Edit"
- **common.search**: "Buscar" / "Search"
- **common.retry**: "Reintentar" / "Retry"
- **common.ok**: "Ok" / "Ok"
- **common.yes**: "Sí" / "Yes"
- **common.no**: "No" / "No"
- **common.close**: "Cerrar" / "Close"
- **common.back**: "Atrás" / "Back"
- **common.next**: "Siguiente" / "Next"
- **common.previous**: "Anterior" / "Previous"
- **common.refresh**: "Actualizar" / "Refresh"

### ❌ Errores
- **errors.network**: "Error de conexión. Verifica tu internet." / "Connection error. Check your internet."
- **errors.server**: "Error del servidor. Intenta más tarde." / "Server error. Try again later."
- **errors.unknown**: "Ha ocurrido un error inesperado." / "An unexpected error occurred."
- **errors.required_field**: "Este campo es requerido" / "This field is required"
- **errors.invalid_format**: "Formato inválido" / "Invalid format"

## 📚 Uso del Hook de Traducción

```typescript
import { useTranslation } from '@/hooks/useTranslation';

function MiComponente() {
  const { t, locale, setLocale } = useTranslation();
  
  return (
    <Text>{t('login.title')}</Text>
  );
}
```

## 🔧 Características del Sistema

### ✨ Detección Automática
- Detecta automáticamente el idioma del dispositivo
- Fallback a español si no se detecta idioma

### ⚠️ Sistema de Warnings
- Muestra warnings en consola para traducciones faltantes
- Formato: `[Missing: clave.de.traduccion]`
- Facilita identificar qué traducciones necesitas agregar

### 🌐 Idiomas Soportados
- **Español (es)**: Idioma principal
- **Inglés (en)**: Idioma secundario

## 📝 Cómo Agregar Nuevas Traducciones

1. Edita `/locales/es.json` para español
2. Edita `/locales/en.json` para inglés
3. Usa la estructura de objetos anidados para organizar
4. Usa el hook `useTranslation()` en tus componentes

## 🚨 Monitoreando Traducciones Faltantes

El sistema muestra warnings en la consola cuando una traducción no existe:
```
🚨 Translation missing for key: "nueva.clave" in locale: "es"
```

¡El sistema de traducciones está completo y funcionando correctamente! 🎉