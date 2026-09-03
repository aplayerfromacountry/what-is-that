import { HistoryItem, UserProfile } from "../types";

const STORAGE_KEY = "huyen_co_quan_history_v1";
const AUTH_STORAGE_KEY = "a_private_place_user_session";

export function getStoredUserForHistory(): UserProfile | null {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (data) {
      const user: UserProfile = JSON.parse(data);
      return user;
    }
  } catch (e) {
    console.error("Error reading auth state for history:", e);
  }
  return null;
}

export function isUserLoggedIn(): boolean {
  const user = getStoredUserForHistory();
  return Boolean(user && user.isLoggedIn);
}

export function getCurrentUserKey(): string | null {
  const user = getStoredUserForHistory();
  if (!user || !user.isLoggedIn) return null;
  return user.email?.trim().toLowerCase() || user.id?.trim().toLowerCase() || null;
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading history from localStorage:", error);
    return [];
  }
}

/**
 * Syncs user history from server to local storage and merges any pending local items.
 * Called on login, app start, and history view mount.
 */
export async function syncUserHistoryFromServer(userIdOrEmail?: string): Promise<HistoryItem[]> {
  const key = userIdOrEmail?.trim().toLowerCase() || getCurrentUserKey();
  if (!key) {
    return getHistory();
  }

  try {
    const res = await fetch(`/api/history/${encodeURIComponent(key)}`);
    const data = await res.json();

    if (data.success && Array.isArray(data.history)) {
      const serverItems: HistoryItem[] = data.history;
      const localItems = getHistory();

      // Merge items deduplicated by id
      const map = new Map<string, HistoryItem>();
      for (const item of serverItems) {
        if (item && item.id) map.set(item.id, item);
      }

      let hasLocalOnlyItems = false;
      for (const item of localItems) {
        if (item && item.id) {
          if (!map.has(item.id)) {
            map.set(item.id, item);
            hasLocalOnlyItems = true;
          }
        }
      }

      const merged = Array.from(map.values());
      merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      const trimmed = merged.slice(0, 150);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch (e) {
        console.warn("Could not save merged history to localStorage:", e);
      }

      // If there were local items not on server, sync them up
      if (hasLocalOnlyItems) {
        fetch("/api/history/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: key, history: trimmed }),
        }).catch((err) => console.warn("Background history sync failed:", err));
      }

      return trimmed;
    }
  } catch (err) {
    console.warn("Failed to fetch history from server:", err);
  }

  return getHistory();
}

export function saveHistoryItem(item: Omit<HistoryItem, "id" | "timestamp">): HistoryItem | null {
  // Only save history if the user is authenticated / logged in
  if (!isUserLoggedIn()) {
    return null;
  }

  const userKey = getCurrentUserKey();
  const newItem: HistoryItem = {
    ...item,
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  try {
    const history = getHistory();
    // Keep up to 150 recent items
    const updated = [newItem, ...history].slice(0, 150);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving history item locally:", error);
  }

  // Cross-device server sync
  if (userKey) {
    fetch("/api/history/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userKey,
        item: newItem,
      }),
    }).catch((err) => console.warn("Background server history save failed:", err));
  }

  return newItem;
}

export function deleteHistoryItem(id: string): void {
  const userKey = getCurrentUserKey();
  try {
    const history = getHistory();
    const filtered = history.filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting history item locally:", error);
  }

  // Cross-device server sync
  if (userKey) {
    fetch(`/api/history/${encodeURIComponent(userKey)}/item/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Background server delete history failed:", err));
  }
}

export function deleteMultipleHistoryItems(ids: string[]): void {
  const userKey = getCurrentUserKey();
  try {
    const idSet = new Set(ids);
    const history = getHistory();
    const filtered = history.filter((h) => !idSet.has(h.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting multiple history items locally:", error);
  }

  // Cross-device server sync
  if (userKey) {
    fetch(`/api/history/${encodeURIComponent(userKey)}/multiple`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch((err) => console.warn("Background server delete multiple history failed:", err));
  }
}

/**
 * Clear history.
 * @param localOnly If true (e.g. on user logout), only removes from this device's localStorage
 * so no traces remain on the shared/public device, while keeping data safe in the cloud.
 */
export function clearAllHistory(localOnly: boolean = false): void {
  const userKey = getCurrentUserKey();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing history locally:", error);
  }

  // If deliberate deletion (not logout), also clear from server
  if (!localOnly && userKey) {
    fetch(`/api/history/${encodeURIComponent(userKey)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Background server clear all history failed:", err));
  }
}

/**
 * Call on logout to remove all local traces on current machine without wiping cloud history.
 */
export function clearLocalHistoryOnLogout(): void {
  clearAllHistory(true);
}

