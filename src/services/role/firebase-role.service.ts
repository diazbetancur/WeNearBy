/**
 * Firebase implementation of RoleService
 * Manages vendor role requests and vendor profile operations using Firestore
 *
 * Collection: vendor_profiles/{uid}
 * Document structure:
 * {
 *   userId: string;
 *   legalName: string;
 *   contactEmail: string;
 *   phone?: string;
 *   status: 'pending' | 'approved' | 'rejected';
 *   approved: boolean; // derived from status
 *   createdAt: Timestamp;
 *   updatedAt: Timestamp;
 * }
 *
 * @example
 * ```typescript
 * import { getRoleService } from '@/services/registry';
 *
 * const roleService = getRoleService();
 *
 * // Request vendor role
 * try {
 *   const profile = await roleService.requestVendorRole();
 *   console.log('Vendor request created:', profile.status); // 'pending'
 * } catch (error) {
 *   console.error('Request failed:', error.message);
 * }
 *
 * // Watch vendor profile changes
 * const unsubscribe = roleService.watchVendorProfile(userId, (profile) => {
 *   if (profile) {
 *     console.log('Profile status:', profile.status);
 *     if (profile.status === 'approved') {
 *       console.log('Vendor approved!');
 *     }
 *   } else {
 *     console.log('No vendor profile exists');
 *   }
 * });
 *
 * // Cleanup
 * unsubscribe();
 * ```
 */

import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import type { VendorProfile, VendorProfileStatus } from '../../types/models';
import type { RoleService } from './role.service';

/**
 * Converts Firestore document to VendorProfile model
 */
function firestoreToVendorProfile(docId: string, data: any): VendorProfile {
  const status: VendorProfileStatus = data.status || 'pending';
  const approved = status === 'approved';

  return {
    id: docId,
    userId: data.userId,
    legalName: data.legalName || '',
    contactEmail: data.contactEmail || '',
    phone: data.phone,
    approved,
    status,
    createdAt: data.createdAt?.toMillis?.() || Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() || Date.now()
  };
}

/**
 * Firebase implementation of RoleService
 */
export class FirebaseRoleService implements RoleService {
  /**
   * Request vendor role for the current user
   * Creates or updates vendor_profiles document with status='pending'
   */
  async requestVendorRole(): Promise<VendorProfile> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('Debes iniciar sesión para solicitar el rol de vendedor');
    }

    try {
      const profileDocRef = doc(db, 'vendor_profiles', currentUser.uid);

      // Check if profile already exists
      const existingDoc = await getDoc(profileDocRef);

      if (existingDoc.exists()) {
        const existingData = existingDoc.data();

        // If already approved, don't allow re-request
        if (existingData.status === 'approved') {
          return firestoreToVendorProfile(currentUser.uid, existingData);
        }

        // Update existing pending/rejected request
        const updatedData = {
          ...existingData,
          status: 'pending' as VendorProfileStatus,
          updatedAt: serverTimestamp()
        };

        await setDoc(profileDocRef, updatedData, { merge: true });

        return firestoreToVendorProfile(currentUser.uid, {
          ...updatedData,
          updatedAt: Timestamp.now()
        });
      }

      // Create new vendor profile request
      const newProfileData = {
        userId: currentUser.uid,
        legalName: currentUser.displayName || currentUser.email || 'Vendedor',
        contactEmail: currentUser.email || '',
        phone: null,
        status: 'pending' as VendorProfileStatus,
        approved: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(profileDocRef, newProfileData);

      return firestoreToVendorProfile(currentUser.uid, {
        ...newProfileData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('[FirebaseRoleService] Error requesting vendor role:', error);
      throw new Error('Error al solicitar el rol de vendedor. Intenta nuevamente.');
    }
  }

  /**
   * Subscribe to vendor profile changes for a specific user
   * @returns Unsubscribe function
   */
  watchVendorProfile(uid: string, callback: (profile: VendorProfile | null) => void): () => void {
    const profileDocRef = doc(db, 'vendor_profiles', uid);

    return onSnapshot(
      profileDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const profile = firestoreToVendorProfile(uid, snapshot.data());
          callback(profile);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('[FirebaseRoleService] Error watching vendor profile:', error);
        callback(null);
      }
    );
  }
}
