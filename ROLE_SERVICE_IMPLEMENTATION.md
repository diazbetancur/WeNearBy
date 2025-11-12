# Role Service & Context Implementation

## ✅ Completed

### Files Created/Updated

1. **`src/types/models.ts`**
   - Added `VendorProfileStatus` type: `'pending' | 'approved' | 'rejected'`
   - Updated `VendorProfile` interface with `status` and `updatedAt` fields

2. **`src/services/role/firebase-role.service.ts`**
   - Complete Firebase implementation of RoleService
   - Creates/updates `vendor_profiles/{uid}` documents
   - Real-time listener with `onSnapshot`

3. **`src/services/registry.ts`**
   - Updated to return `FirebaseRoleService` when `USE_FIREBASE=true`

4. **`src/context/RoleContextProvider.tsx`**
   - React context for vendor role state management
   - Listens to both auth and vendor profile changes
   - Exposes: `status`, `isVendorApproved`, `requestVendorRole()`, etc.

5. **`app/__tests__/role-test.tsx`** (Optional Test Screen)
   - Interactive UI to test all role flows
   - Shows real-time status updates
   - Instructions for manual approval in Firebase Console

## Implementation Details

### VendorProfile Model

```typescript
export type VendorProfileStatus = 'pending' | 'approved' | 'rejected';

export interface VendorProfile {
  id: string;
  userId: string;
  legalName: string;
  contactEmail: string;
  phone?: string;
  approved: boolean;        // Derived from status === 'approved'
  status: VendorProfileStatus;
  createdAt: number;
  updatedAt: number;
}
```

### Firestore Structure

**Collection**: `vendor_profiles/{uid}`

**Document**:
```typescript
{
  userId: string;
  legalName: string;
  contactEmail: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### FirebaseRoleService Methods

#### `requestVendorRole(): Promise<VendorProfile>`

- Requires authenticated user
- Creates new document with `status: 'pending'`
- If document exists:
  - Already approved → returns existing profile
  - Pending/rejected → updates to `status: 'pending'`
- Auto-populates `legalName` from user display name or email
- Sets `createdAt` and `updatedAt` timestamps

#### `watchVendorProfile(uid, callback): () => void`

- Uses Firestore `onSnapshot` for real-time updates
- Calls callback with `VendorProfile | null`
- Returns unsubscribe function
- Handles errors gracefully

### RoleContextProvider

#### Exposed State

```typescript
interface RoleContextType {
  status: VendorProfileStatus | 'anonymous' | undefined;
  isVendorApproved: boolean;
  vendorProfile: VendorProfile | null;
  user: User | null;
  loading: boolean;
  requestVendorRole: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

#### Status Logic

- **`'anonymous'`**: No authenticated user
- **`undefined`**: User authenticated but no vendor profile exists
- **`'pending'`**: Vendor request pending approval
- **`'approved'`**: Vendor approved
- **`'rejected'`**: Vendor request rejected

#### Lifecycle

1. Listens to `authService.onAuthStateChanged()`
2. When user signs in, watches `vendor_profiles/{uid}`
3. Updates state in real-time as Firestore document changes
4. Cleans up listeners on unmount or sign out

## Usage Examples

### Basic Context Usage

```typescript
import { RoleProvider, useRole } from '@/src/context/RoleContextProvider';

// Wrap your app
function App() {
  return (
    <RoleProvider>
      <YourApp />
    </RoleProvider>
  );
}

// Use in components
function VendorScreen() {
  const { status, isVendorApproved, requestVendorRole } = useRole();

  if (status === 'anonymous') {
    return <Text>Sign in to request vendor role</Text>;
  }

  if (status === 'pending') {
    return <Text>Your request is pending approval</Text>;
  }

  if (isVendorApproved) {
    return <VendorDashboard />;
  }

  return (
    <Button onPress={requestVendorRole}>
      Request Vendor Role
    </Button>
  );
}
```

### Direct Service Usage

```typescript
import { getRoleService } from '@/services/registry';

const roleService = getRoleService();

// Request vendor role
const profile = await roleService.requestVendorRole();
console.log('Status:', profile.status); // 'pending'

// Watch profile changes
const unsubscribe = roleService.watchVendorProfile(userId, (profile) => {
  if (profile?.status === 'approved') {
    console.log('Vendor approved!');
  }
});

// Cleanup
unsubscribe();
```

### Conditional Rendering Based on Status

```typescript
function VendorButton() {
  const { status, requestVendorRole } = useRole();

  const getButtonState = () => {
    switch (status) {
      case 'anonymous':
        return { text: 'Sign In First', disabled: true };
      case undefined:
        return { text: 'Request Vendor Role', disabled: false };
      case 'pending':
        return { text: 'Request Pending...', disabled: true };
      case 'approved':
        return { text: 'Already Approved', disabled: true };
      case 'rejected':
        return { text: 'Request Again', disabled: false };
      default:
        return { text: 'Request Vendor Role', disabled: false };
    }
  };

  const { text, disabled } = getButtonState();

  return (
    <Button 
      title={text}
      onPress={requestVendorRole}
      disabled={disabled}
    />
  );
}
```

## Testing

### Using Test Screen

1. Navigate to `app/__tests__/role-test.tsx`
2. Ensure you're signed in (use auth-test.tsx first)
3. Click "Solicitar Rol de Vendedor"
4. Observe status change to "pending"
5. Go to Firebase Console to approve/reject

### Manual Approval in Firebase

**Firebase Console → Firestore → `vendor_profiles` → `{user_id}`**

Change the `status` field:
- `"approved"` → User becomes approved vendor
- `"rejected"` → Request rejected
- `"pending"` → Back to pending state

The app will automatically reflect the change in real-time.

### Test Flow Example

```typescript
// 1. Sign in
const user = await authService.signInEmail('test@test.com', 'test123');

// 2. Request vendor role
const profile = await roleService.requestVendorRole();
console.log('Status:', profile.status); // 'pending'

// 3. Listen to changes
roleService.watchVendorProfile(user.id, (profile) => {
  console.log('Profile updated:', profile?.status);
});

// 4. Manually approve in Firebase Console
// -> Listener automatically fires with status='approved'
```

## Acceptance Criteria

✅ **No session → status: 'anonymous'**
```typescript
const { status } = useRole();
// user = null → status = 'anonymous'
```

✅ **Session but no doc → undefined**
```typescript
const { status } = useRole();
// user exists, no vendor_profiles doc → status = undefined
```

✅ **requestVendorRole() creates pending**
```typescript
await requestVendorRole();
// Creates vendor_profiles/{uid} with status='pending'
```

✅ **watchVendorProfile uses onSnapshot**
```typescript
// Real-time updates via Firestore listener
// Changes in Firebase Console reflect immediately
```

✅ **Status updates automatically**
```typescript
// Change in Firebase Console
// ↓
// onSnapshot fires
// ↓
// RoleProvider updates state
// ↓
// Components re-render with new status
```

## Integration with Existing Code

### Wrap Your App

```typescript
// App root or layout
import { RoleProvider } from '@/src/context/RoleContextProvider';

export default function Layout() {
  return (
    <RoleProvider>
      {/* Your existing navigation/screens */}
    </RoleProvider>
  );
}
```

### Use in Business Screens

```typescript
import { useRole } from '@/src/context/RoleContextProvider';

function BusinessScreen() {
  const { isVendorApproved } = useRole();

  if (!isVendorApproved) {
    return <PendingApprovalScreen />;
  }

  return <BusinessDashboard />;
}
```

## Environment Configuration

Ensure `.env` has:

```bash
EXPO_PUBLIC_USE_FIREBASE=true
# ... other Firebase config
```

## Next Steps

1. ✅ **Integrate RoleProvider into app root**
   - Wrap main navigator with `<RoleProvider>`

2. **Create admin script for approval**
   - Node script to bulk approve/reject vendors
   - Or build admin UI in separate app

3. **Add role-based navigation guards**
   - Use `isVendorApproved` to control access
   - Show appropriate UI based on `status`

4. **Extend vendor profile**
   - Add more fields (address, business type, etc.)
   - Add form to update vendor profile

5. **Implement Store/Product services**
   - Allow approved vendors to create stores
   - Link stores to `userId`

## Benefits

✅ **Real-time updates**: Firestore listeners keep state in sync  
✅ **Clean API**: Simple `useRole()` hook for components  
✅ **Type-safe**: Full TypeScript coverage  
✅ **Testable**: Test screen for quick validation  
✅ **Flexible**: Easy to add more statuses or fields
