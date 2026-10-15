import { FieldObservation } from '../types';

const DB_NAME = 'DeltaCOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'field_observations';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineObservation(observation: FieldObservation): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(observation);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, falling back to localStorage:', err);
    const existing = JSON.parse(localStorage.getItem('deltac_offline_queue') || '[]');
    const idx = existing.findIndex((o: any) => o.id === observation.id);
    if (idx >= 0) existing[idx] = observation;
    else existing.push(observation);
    localStorage.setItem('deltac_offline_queue', JSON.stringify(existing));
  }
}

export async function getAllLocalObservations(): Promise<FieldObservation[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const fallback = localStorage.getItem('deltac_offline_queue');
    return fallback ? JSON.parse(fallback) : [];
  }
}

export async function getPendingObservations(): Promise<FieldObservation[]> {
  const all = await getAllLocalObservations();
  return all.filter(obs => obs.syncStatus === 'Pending' || obs.syncStatus === 'Failed');
}

export async function updateObservationSyncStatus(
  id: string,
  status: 'Pending' | 'Syncing' | 'Synced' | 'Failed',
  extra?: { syncedAt?: string; errorMessage?: string }
): Promise<void> {
  const all = await getAllLocalObservations();
  const obs = all.find(o => o.id === id);
  if (obs) {
    obs.syncStatus = status;
    if (extra?.syncedAt) obs.syncedAt = extra.syncedAt;
    if (extra?.errorMessage) obs.errorMessage = extra.errorMessage;
    await saveOfflineObservation(obs);
  }
}

export async function deleteOfflineObservation(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    const existing = JSON.parse(localStorage.getItem('deltac_offline_queue') || '[]');
    const filtered = existing.filter((o: any) => o.id !== id);
    localStorage.setItem('deltac_offline_queue', JSON.stringify(filtered));
  }
}

export async function clearSyncedObservations(): Promise<void> {
  const all = await getAllLocalObservations();
  for (const obs of all) {
    if (obs.syncStatus === 'Synced') {
      await deleteOfflineObservation(obs.id);
    }
  }
}
