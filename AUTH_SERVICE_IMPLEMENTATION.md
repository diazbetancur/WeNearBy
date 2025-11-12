# Firebase Auth Service Implementation

## ✅ Completed

### Files Created/Updated

1. **`src/services/auth/firebase-auth.service.ts`**
   - Complete Firebase Auth implementation
   - Error mapping to Spanish user-friendly messages
   - Firestore user document creation on signup
   - Automatic role initialization (customer)

2. **`src/services/registry.ts`**
   - Updated to return `FirebaseAuthService` when `USE_FIREBASE=true`
   - Falls back to stub when Firebase not enabled

3. **`app/__tests__/auth-test.tsx`** (Optional Test Screen)
   - Interactive test UI for all auth operations
   - Real-time auth state display
   - Detailed logging of operations

## Implementation Details

### FirebaseAuthService Methods

#### `signUpEmail(email, password): Promise<User>`
- Creates Firebase Auth user
- Creates Firestore user document with default `customer` role
- Returns normalized User model
- Maps Firebase errors to Spanish messages

#### `signInEmail(email, password): Promise<User>`
- Authenticates with Firebase Auth
- Fetches user data from Firestore
- Returns User with roles and currentRole
- Error handling with user-friendly messages

#### `signOut(): Promise<void>`
- Signs out current user from Firebase Auth
- Clears authentication state
- Error handling

#### `onAuthStateChanged(callback): () => void`
- Listens to Firebase auth state changes
- Converts Firebase user to User model
- Fetches Firestore data on auth changes
- Returns unsubscribe function

#### `getCurrentUser(): Promise<User | null>`
- Gets current authenticated user
- Returns null if not authenticated
- Fetches latest Firestore data

### Error Mapping

Common Firebase errors mapped to Spanish:
- `auth/email-already-in-use` → "Este correo ya está registrado"
- `auth/invalid-email` → "Correo electrónico inválido"
- `auth/weak-password` → "La contraseña debe tener al menos 6 caracteres"
- `auth/user-not-found` → "Usuario no encontrado"
- `auth/wrong-password` → "Contraseña incorrecta"
- `auth/invalid-credential` → "Credenciales inválidas"
- `auth/too-many-requests` → "Demasiados intentos. Intenta más tarde"
- `auth/network-request-failed` → "Error de red. Verifica tu conexión"

## Usage Examples

### Basic Authentication Flow

```typescript
import { getAuthService } from '@/services/registry';

const authService = getAuthService();

// Sign up new user
try {
  const user = await authService.signUpEmail('user@example.com', 'password123');
  console.log('User created:', user.id, user.email);
  console.log('Default role:', user.currentRole); // 'customer'
} catch (error) {
  console.error('Sign up failed:', error.message);
}

// Sign in existing user
try {
  const user = await authService.signInEmail('user@example.com', 'password123');
  console.log('Signed in:', user.email);
  console.log('Roles:', user.roles); // ['customer']
  console.log('Current role:', user.currentRole);
} catch (error) {
  console.error('Sign in failed:', error.message);
}
```

### Auth State Listener

```typescript
import { getAuthService } from '@/services/registry';

const authService = getAuthService();

// Listen to auth state changes
const unsubscribe = authService.onAuthStateChanged((user) => {
  if (user) {
    console.log('User signed in:', user.id);
    console.log('Email:', user.email);
    console.log('Roles:', user.roles);
  } else {
    console.log('User signed out');
  }
});

// Cleanup when component unmounts
return () => unsubscribe();
```

### Get Current User

```typescript
const currentUser = await authService.getCurrentUser();
if (currentUser) {
  console.log('Current user:', currentUser.email);
  console.log('UID:', currentUser.id);
  console.log('Roles:', currentUser.roles);
} else {
  console.log('No user authenticated');
}
```

### Sign Out

```typescript
try {
  await authService.signOut();
  console.log('Signed out successfully');
} catch (error) {
  console.error('Sign out failed:', error.message);
}
```

## Testing

### Using the Test Screen

1. Navigate to `app/__tests__/auth-test.tsx` in your app
2. Enter email and password
3. Test operations:
   - **Registrarse**: Create new account
   - **Iniciar Sesión**: Sign in existing user
   - **Ver Usuario Actual**: Get current user info
   - **Cerrar Sesión**: Sign out

The screen shows:
- Current auth state (authenticated/not authenticated)
- User ID, email, roles when signed in
- Real-time logs of all operations
- Error messages in Spanish

### Manual Testing

```typescript
import { getAuthService } from '@/services/registry';

const authService = getAuthService();

// Test signup
const user = await authService.signUpEmail('test@test.com', 'test123');
console.log('✅ Signup:', user.id);

// Test getCurrentUser
const current = await authService.getCurrentUser();
console.log('✅ Current user:', current?.email);

// Test signout
await authService.signOut();
console.log('✅ Signed out');

// Test signin
const signedIn = await authService.signInEmail('test@test.com', 'test123');
console.log('✅ Signed in:', signedIn.id);
```

## Firestore Structure

### User Document (`users/{uid}`)

```typescript
{
  email: string;
  displayName: string | null;
  roles: string[];           // ['customer'], later can add 'business'
  currentRole: string;        // 'customer' or 'business'
  createdAt: Timestamp;
  photoURL: string | null;
}
```

Created automatically on signup with:
- `roles: ['customer']`
- `currentRole: 'customer'`

## Environment Configuration

Ensure `.env` has:

```bash
EXPO_PUBLIC_USE_FIREBASE=true
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other Firebase config
```

## Next Steps

1. ✅ **Integrate with existing AuthContext**
   - Replace direct Firebase calls with `getAuthService()`
   - Keep same context API for components

2. **Implement other services**
   - `FirebaseRoleService` (vendor profile management)
   - `FirebaseStoreService` (store CRUD)
   - `FirebaseProductService` (product CRUD)

3. **Add Mock implementations**
   - `MockAuthService` for testing without Firebase
   - Switch with `EXPO_PUBLIC_USE_FIREBASE=false`

## Benefits

✅ **Abstraction**: Easy to swap Firebase for another backend  
✅ **Error Handling**: User-friendly Spanish messages  
✅ **Type Safety**: Full TypeScript support  
✅ **Testing**: Test screen for quick validation  
✅ **Documentation**: Complete usage examples in code
