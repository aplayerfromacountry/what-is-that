/**
 * Cross-Device Music Storage & Cloud Synchronization Utility
 * 
 * Supports:
 * - Ultra-fast local playback via client-side IndexedDB cache
 * - Full cloud synchronization via backend API so uploaded songs are preserved when switching devices
 */

import { auth } from "../firebase";
import {
  saveMusicTrackToFirestore,
  deleteMusicTrackFromFirestore,
  logDriveBackupToFirestore,
} from "./firebaseSync";
import {
  uploadMusicTrackToDrive,
  listDriveMusicTracks,
  downloadDriveAudioBlob,
} from "./googleDriveService";

export interface StoredTrackRecord {
  id: string;
  userId: string;
  title: string;
  artist: string;
  audioBlob: Blob;
  mimeType: string;
  duration: number;
  fileSize: string;
  createdAt: number;
  driveFileId?: string;
  driveUrl?: string;
}

export interface UserTrackItem {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration: number;
  fileSize?: string;
  createdAt?: number;
  isSynced?: boolean;
  driveFileId?: string;
  driveUrl?: string;
}

const DB_NAME = "a_private_place_music_db";
const DB_VERSION = 1;
const STORE_NAME = "user_tracks";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Helper: Convert Blob/File to Base64 data URL
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper: Convert Base64 data URL to Blob
 */
export function base64ToBlob(base64Data: string, fallbackMime: string = "audio/mpeg"): Blob {
  try {
    const parts = base64Data.split(",");
    const mimeMatch = parts[0]?.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : fallbackMime;
    const bstr = atob(parts[1] || parts[0]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("Failed to parse base64 to blob:", e);
    return new Blob([], { type: fallbackMime });
  }
}

/**
 * Read tracks from local IndexedDB cache
 */
export async function getLocalTracks(userId: string): Promise<{ items: UserTrackItem[]; records: StoredTrackRecord[] }> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("userId");
      const request = index.getAll(IDBKeyRange.only(userId));

      request.onsuccess = () => {
        const records: StoredTrackRecord[] = request.result || [];
        records.sort((a, b) => a.createdAt - b.createdAt);

        const items: UserTrackItem[] = records.map((rec) => {
          let objectUrl = "";
          try {
            objectUrl = URL.createObjectURL(rec.audioBlob);
          } catch (e) {
            console.error("Failed to create object URL for track blob:", e);
          }

          return {
            id: rec.id,
            title: rec.title,
            artist: rec.artist,
            src: objectUrl,
            duration: rec.duration || 0,
            fileSize: rec.fileSize,
            createdAt: rec.createdAt,
            isSynced: true,
          };
        });

        resolve({ items, records });
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to get local tracks for user:", userId, error);
    return { items: [], records: [] };
  }
}

/**
 * Convenience helper to get array of playable tracks for a user
 */
export async function getTracksForUser(userId: string): Promise<UserTrackItem[]> {
  const { items } = await getLocalTracks(userId.trim().toLowerCase());
  return items;
}

/**
 * Fetch tracks from cloud server for cross-device synchronization
 */
export async function fetchServerTracks(userId: string): Promise<any[]> {
  try {
    const normalizedUserId = encodeURIComponent(userId.trim().toLowerCase());
    const res = await fetch(`/api/music/${normalizedUserId}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.success && Array.isArray(data.tracks)) {
      return data.tracks;
    }
    return [];
  } catch (e) {
    console.warn("Could not fetch cloud tracks (offline or network error):", e);
    return [];
  }
}

/**
 * Synchronize local IndexedDB with Cloud tracks.
 * If another device uploaded songs, this downloads them into local cache.
 */
export async function syncAndGetTracks(
  userId: string,
  onTracksUpdated?: (tracks: UserTrackItem[]) => void
): Promise<UserTrackItem[]> {
  const normalizedId = userId.trim().toLowerCase();

  // 1. Get instant local cache first
  const { items: localItems, records: localRecords } = await getLocalTracks(normalizedId);
  if (onTracksUpdated && localItems.length > 0) {
    onTracksUpdated(localItems);
  }

  // 2. Fetch from cloud server in background
  try {
    const serverTracks = await fetchServerTracks(normalizedId);
    if (!serverTracks || serverTracks.length === 0) {
      // If server has nothing, but local has items, upload local items to server for cross-device backup!
      if (localRecords.length > 0) {
        uploadLocalTracksToServer(normalizedId, localRecords);
      }
      return localItems;
    }

    const localIdSet = new Set(localRecords.map((r) => r.id));
    const missingFromServer: any[] = [];
    let hasNewFromCloud = false;

    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      for (const st of serverTracks) {
        if (!localIdSet.has(st.id)) {
          hasNewFromCloud = true;
          const blob = base64ToBlob(st.audioData, st.mimeType);
          const record: StoredTrackRecord = {
            id: st.id,
            userId: normalizedId,
            title: st.title,
            artist: st.artist,
            audioBlob: blob,
            mimeType: st.mimeType || "audio/mpeg",
            duration: st.duration || 0,
            fileSize: st.fileSize || "Đã đồng bộ",
            createdAt: st.createdAt || Date.now(),
          };
          store.put(record);
        }
      }
    });

    // Check if local has songs not on server yet -> push to server
    const serverIdSet = new Set(serverTracks.map((t) => t.id));
    const unbackedLocalRecords = localRecords.filter((r) => !serverIdSet.has(r.id));
    if (unbackedLocalRecords.length > 0) {
      uploadLocalTracksToServer(normalizedId, unbackedLocalRecords);
    }

    // If new songs were imported from cloud, reload fresh list
    if (hasNewFromCloud) {
      const { items: refreshedItems } = await getLocalTracks(normalizedId);
      if (onTracksUpdated) {
        onTracksUpdated(refreshedItems);
      }
      return refreshedItems;
    }

    return localItems;
  } catch (err) {
    console.error("Error during music sync:", err);
    return localItems;
  }
}

/**
 * Upload local records to server in background
 */
async function uploadLocalTracksToServer(userId: string, records: StoredTrackRecord[]) {
  try {
    const payloadTracks = await Promise.all(
      records.map(async (r) => {
        const base64 = await blobToBase64(r.audioBlob);
        return {
          id: r.id,
          title: r.title,
          artist: r.artist,
          audioData: base64,
          mimeType: r.mimeType,
          duration: r.duration,
          fileSize: r.fileSize,
          createdAt: r.createdAt,
        };
      })
    );

    await fetch("/api/music/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        tracks: payloadTracks,
      }),
    });

    if (auth.currentUser) {
      records.forEach((r) => {
        saveMusicTrackToFirestore(auth.currentUser!.uid, {
          id: r.id,
          userId: auth.currentUser!.uid,
          title: r.title,
          artist: r.artist,
          duration: r.duration,
          fileSize: r.fileSize,
          mimeType: r.mimeType,
          driveFileId: r.driveFileId,
          driveUrl: r.driveUrl,
          createdAt: r.createdAt,
        }).catch((err) => console.warn("Sync to Firestore:", err));
      });
    }
  } catch (e) {
    console.warn("Background upload to cloud failed:", e);
  }
}

/**
 * Save newly uploaded tracks for a specific user (Saves to IndexedDB + Cloud API)
 */
export async function saveTracksForUser(
  userId: string,
  tracks: {
    id: string;
    title: string;
    artist: string;
    file: File;
    duration?: number;
    fileSize?: string;
  }[]
): Promise<UserTrackItem[]> {
  const normalizedId = userId.trim().toLowerCase();
  try {
    const db = await openDB();
    const createdItems: UserTrackItem[] = [];
    const serverPayloadTracks: any[] = [];

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      for (const t of tracks) {
        const sizeFormatted = t.fileSize || `${(t.file.size / (1024 * 1024)).toFixed(1)} MB`;
        const record: StoredTrackRecord = {
          id: t.id,
          userId: normalizedId,
          title: t.title,
          artist: t.artist || "Nhạc của bạn",
          audioBlob: t.file,
          mimeType: t.file.type || "audio/mpeg",
          duration: t.duration || 0,
          fileSize: sizeFormatted,
          createdAt: Date.now(),
        };

        store.put(record);

        const objectUrl = URL.createObjectURL(t.file);
        createdItems.push({
          id: record.id,
          title: record.title,
          artist: record.artist,
          src: objectUrl,
          duration: record.duration,
          fileSize: record.fileSize,
          createdAt: record.createdAt,
          isSynced: true,
        });
      }
    });

    // Cloud upload for Cross-Device Persistence
    (async () => {
      try {
        for (const t of tracks) {
          const base64 = await blobToBase64(t.file);
          const sizeFormatted = t.fileSize || `${(t.file.size / (1024 * 1024)).toFixed(1)} MB`;
          serverPayloadTracks.push({
            id: t.id,
            title: t.title,
            artist: t.artist || "Nhạc của bạn",
            audioData: base64,
            mimeType: t.file.type || "audio/mpeg",
            duration: t.duration || 0,
            fileSize: sizeFormatted,
            createdAt: Date.now(),
          });

          // Sync metadata with Firebase Firestore if user is authenticated
          if (auth.currentUser) {
            saveMusicTrackToFirestore(auth.currentUser.uid, {
              id: t.id,
              userId: auth.currentUser.uid,
              title: t.title,
              artist: t.artist || "Nhạc của bạn",
              duration: t.duration || 0,
              fileSize: sizeFormatted,
              mimeType: t.file.type || "audio/mpeg",
              createdAt: Date.now(),
            }).catch((err) => console.warn("Firestore music track sync:", err));
          }
        }

        await fetch("/api/music/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: normalizedId,
            tracks: serverPayloadTracks,
          }),
        });
      } catch (cloudErr) {
        console.warn("Could not backup new tracks to cloud:", cloudErr);
      }
    })();

    return createdItems;
  } catch (error) {
    console.error("Failed to save tracks for user:", normalizedId, error);
    return [];
  }
}

/**
 * Update duration metadata for a track in IndexedDB
 */
export async function updateTrackDuration(trackId: string, duration: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const getReq = store.get(trackId);

      getReq.onsuccess = () => {
        const record: StoredTrackRecord | undefined = getReq.result;
        if (record) {
          record.duration = duration;
          store.put(record);
        }
        resolve();
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch (e) {
    console.error("Failed to update track duration:", e);
  }
}

/**
 * Delete a specific track by its ID (from local & cloud)
 */
export async function deleteTrackForUser(userId: string, trackId: string): Promise<void> {
  const normalizedId = userId.trim().toLowerCase();
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(trackId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Also delete on server
    fetch(`/api/music/track/${encodeURIComponent(normalizedId)}/${encodeURIComponent(trackId)}`, {
      method: "DELETE",
    }).catch((e) => console.warn("Cloud delete track failed:", e));

    // Also delete from Firestore if authenticated
    if (auth.currentUser) {
      deleteMusicTrackFromFirestore(auth.currentUser.uid, trackId).catch((err) =>
        console.warn("Firestore music track delete error:", err)
      );
    }
  } catch (error) {
    console.error("Failed to delete track:", trackId, error);
  }
}

/**
 * Clear all tracks for a specific user (from local & cloud)
 */
export async function clearAllTracksForUser(userId: string): Promise<void> {
  const normalizedId = userId.trim().toLowerCase();
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("userId");
      const request = index.getAllKeys(IDBKeyRange.only(normalizedId));

      request.onsuccess = () => {
        const keys = request.result;
        for (const key of keys) {
          store.delete(key);
        }
        resolve();
      };

      request.onerror = () => reject(request.error);
    });

    // Also delete on server
    fetch(`/api/music/all/${encodeURIComponent(normalizedId)}`, {
      method: "DELETE",
    }).catch((e) => console.warn("Cloud clear all tracks failed:", e));
  } catch (error) {
    console.error("Failed to clear tracks for user:", normalizedId, error);
  }
}

// =========================================================================
// Google Drive Music Backup & Restore Helpers
// =========================================================================

/**
 * Backs up all user's local music files to Google Drive (folder: "Nhạc Thiền & Thư Giãn")
 */
export async function backupMusicTracksToGoogleDrive(
  accessToken: string,
  userId: string
): Promise<{ uploaded: number; total: number; skipped: number }> {
  const normalizedId = userId.trim().toLowerCase();
  const db = await openDB();

  const records: StoredTrackRecord[] = await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("userId");
    const request = index.getAll(IDBKeyRange.only(normalizedId));
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

  if (records.length === 0) {
    return { uploaded: 0, total: 0, skipped: 0 };
  }

  let uploadedCount = 0;
  let skippedCount = 0;

  for (const track of records) {
    try {
      // Upload audio blob to Drive
      const driveFile = await uploadMusicTrackToDrive(
        accessToken,
        track.title,
        track.artist,
        track.audioBlob,
        track.mimeType || "audio/mpeg"
      );

      // Update record with Drive ID in IndexedDB
      track.driveFileId = driveFile.id;
      track.driveUrl = driveFile.webViewLink;

      await new Promise<void>((res) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const s = tx.objectStore(STORE_NAME);
        s.put(track);
        tx.oncomplete = () => res();
      });

      // Log backup to Firestore
      if (auth.currentUser) {
        logDriveBackupToFirestore(auth.currentUser.uid, {
          id: `backup-music-${track.id}-${Date.now()}`,
          driveFileId: driveFile.id,
          fileName: driveFile.name,
          backupType: "music",
          webViewLink: driveFile.webViewLink,
        }).catch((e) => console.warn("Log music drive backup to Firestore:", e));

        saveMusicTrackToFirestore(auth.currentUser.uid, {
          id: track.id,
          userId: auth.currentUser.uid,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          fileSize: track.fileSize,
          mimeType: track.mimeType,
          driveFileId: driveFile.id,
          driveUrl: driveFile.webViewLink,
          createdAt: track.createdAt,
        }).catch((e) => console.warn("Save music metadata to Firestore:", e));
      }

      uploadedCount++;
    } catch (err) {
      console.error(`Failed to upload track "${track.title}" to Google Drive:`, err);
      skippedCount++;
    }
  }

  return { uploaded: uploadedCount, total: records.length, skipped: skippedCount };
}

/**
 * Restores music tracks from Google Drive to local storage (for new devices)
 */
export async function restoreMusicTracksFromGoogleDrive(
  accessToken: string,
  userId: string
): Promise<UserTrackItem[]> {
  const normalizedId = userId.trim().toLowerCase();
  const driveFiles = await listDriveMusicTracks(accessToken);

  if (driveFiles.length === 0) return [];

  const existingLocal = await getTracksForUser(normalizedId);
  const existingTitles = new Set(existingLocal.map((t) => t.title.toLowerCase().trim()));

  const restoredTracks: UserTrackItem[] = [];

  for (const file of driveFiles) {
    // Extract title from file name: e.g. "[Nhac]_Giai_Dieu_Binh_Yen.mp3" -> "Giai Dieu Binh Yen"
    let rawTitle = file.name.replace(/^\[Nhac\]_?/i, "").replace(/\.[^/.]+$/, "");
    rawTitle = rawTitle.replace(/_/g, " ");

    if (existingTitles.has(rawTitle.toLowerCase().trim())) {
      continue; // already in local cache
    }

    try {
      const audioBlob = await downloadDriveAudioBlob(accessToken, file.id);
      const trackId = `track-drive-${file.id.slice(0, 12)}`;
      const sizeFormatted = file.size
        ? `${(parseInt(file.size, 10) / (1024 * 1024)).toFixed(1)} MB`
        : `${(audioBlob.size / (1024 * 1024)).toFixed(1)} MB`;

      const record: StoredTrackRecord = {
        id: trackId,
        userId: normalizedId,
        title: rawTitle,
        artist: "Đồng bộ từ Google Drive",
        audioBlob,
        mimeType: file.mimeType || "audio/mpeg",
        duration: 0,
        fileSize: sizeFormatted,
        createdAt: file.modifiedTime ? new Date(file.modifiedTime).getTime() : Date.now(),
        driveFileId: file.id,
        driveUrl: file.webViewLink,
      };

      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const s = tx.objectStore(STORE_NAME);
        s.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      const objectUrl = URL.createObjectURL(audioBlob);
      restoredTracks.push({
        id: trackId,
        title: rawTitle,
        artist: "Đồng bộ từ Google Drive",
        src: objectUrl,
        duration: 0,
        fileSize: sizeFormatted,
        createdAt: record.createdAt,
        isSynced: true,
        driveFileId: file.id,
        driveUrl: file.webViewLink,
      });

      existingTitles.add(rawTitle.toLowerCase().trim());
    } catch (e) {
      console.warn(`Could not restore file ${file.name} from Google Drive:`, e);
    }
  }

  return restoredTracks;
}

