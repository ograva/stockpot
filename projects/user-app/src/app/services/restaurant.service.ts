import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import {
  Restaurant,
  serializeRestaurant,
  AppUser,
  serializeAppUser,
} from '@stockpot/shared';
import { CoreService } from './core.service';

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private core = inject(CoreService);

  /**
   * Checks whether the authenticated user already has a tenant document.
   * Returns the restaurantId from the custom claim if present, otherwise null.
   */
  async getExistingRestaurantId(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    const token = await user.getIdTokenResult(false);
    return (token.claims['restaurantId'] as string) ?? null;
  }

  /**
   * Creates the tenant (restaurant) document and owner membership record.
   *
   * Steps:
   * 1. Write `restaurants/{restaurantId}` using serializeRestaurant()
   * 2. Write `restaurants/{restaurantId}/users/{uid}` using serializeAppUser()
   * 3. Attempt to refresh the auth token to pick up the `restaurantId` custom
   *    claim (requires the `setRestaurantIdClaim` Cloud Function to be deployed).
   * 4. Directly set CoreService.appUser() as a fallback for emulator environments
   *    where the Cloud Function may not be running.
   *
   * @param restaurantData Partial restaurant data from the setup wizard form.
   * @returns The restaurantId of the newly created tenant.
   */
  async createTenant(restaurantData: Partial<Restaurant>): Promise<string> {
    const user = this.auth.currentUser;
    if (!user)
      throw new Error('createTenant called without authenticated user');

    // Use the owner's UID as restaurantId for a 1:1 owner→restaurant mapping.
    const restaurantId = user.uid;
    const now = new Date().toISOString();

    const restaurant: Restaurant = {
      name: restaurantData.name ?? '',
      address: restaurantData.address ?? '',
      planTier: 'starter',
      timezone: restaurantData.timezone ?? 'Asia/Manila',
      currency: restaurantData.currency ?? 'PHP',
      createdAt: now,
      status: 'active',
    };

    // 1. Write restaurant doc
    await setDoc(
      doc(this.firestore, `restaurants/${restaurantId}`),
      serializeRestaurant(restaurant),
    );

    // 2. Write owner membership doc
    const ownerAppUser: AppUser = {
      uid: user.uid,
      restaurantId,
      name: user.displayName ?? restaurantData.name ?? '',
      email: user.email ?? '',
      role: 'owner',
    };
    await setDoc(
      doc(this.firestore, `restaurants/${restaurantId}/users/${user.uid}`),
      serializeAppUser(ownerAppUser),
    );

    // 3. Force token refresh to pick up the restaurantId custom claim.
    //    This only works after the setRestaurantIdClaim Cloud Function has run.
    //    In emulator environments without the CF, the token refresh is a no-op.
    try {
      await user.getIdToken(true);
    } catch {
      // Token refresh failure is non-fatal — emulator fallback below handles it.
    }

    // 4. Directly set the appUser signal so the app is functional immediately
    //    even in emulator environments where the custom claim CF is not running.
    this.core.setAppUser(ownerAppUser);

    return restaurantId;
  }

  /**
   * Checks if the restaurant document exists in Firestore.
   * Used by the wizard to determine if setup was already completed.
   */
  async restaurantExists(restaurantId: string): Promise<boolean> {
    const snap = await getDoc(
      doc(this.firestore, `restaurants/${restaurantId}`),
    );
    return snap.exists();
  }
}
