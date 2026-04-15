import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Timestamp } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: Timestamp;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private firestore = inject(Firestore);

  readonly users = toSignal(
    collectionData<AppUser>(collection(this.firestore, 'users') as any, {
      idField: 'uid',
    }),
    { initialValue: [] as AppUser[] },
  );

  async create(uid: string, data: Omit<AppUser, 'uid'>): Promise<void> {
    await setDoc(doc(this.firestore, 'users', uid), data);
  }

  async update(
    uid: string,
    data: Partial<Omit<AppUser, 'uid'>>,
  ): Promise<void> {
    await updateDoc(doc(this.firestore, 'users', uid), data as any);
  }

  async delete(uid: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'users', uid));
  }

  getById(uid: string): AppUser | undefined {
    return this.users().find((u) => u.uid === uid);
  }
}
