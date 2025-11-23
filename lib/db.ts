import Dexie, { Table } from 'dexie';

export interface OfflineBook {
  googleId: string;
  title: string;
  authors: string[]; // We store array here, but JSON string in Prisma
  description: string;
  pageCount: number;
  categories: string[];
  thumbnail: string;
  addedAt: number;
}

export interface SyncAction {
  id?: number;
  type: 'ADD_BOOK' | 'UPDATE_PROGRESS';
  payload: any;
  createdAt: number;
}

export class MySubClassedDexie extends Dexie {
  offlineBooks!: Table<OfflineBook>;
  syncQueue!: Table<SyncAction>;

  constructor() {
    super('LibraryAppDB');
    this.version(1).stores({
      offlineBooks: '++id, googleId, title', // Primary key and indexed props
      syncQueue: '++id, type, createdAt'
    });
  }
}

export const db = new MySubClassedDexie();
