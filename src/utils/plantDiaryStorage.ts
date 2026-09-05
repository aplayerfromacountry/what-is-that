import { PlantDiaryEntry, PlantTreeType, UserPlantGardenState, UserProfile } from "../types";
import { calculateTreeLevel, PLANT_TREES } from "../data/plantTrees";

const STORAGE_KEY = "huyen_co_quan_plant_diary_v1";
const AUTH_STORAGE_KEY = "a_private_place_user_session";

export function getStoredUserForPlant(): UserProfile | null {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (data) {
      const user: UserProfile = JSON.parse(data);
      return user;
    }
  } catch (e) {
    console.error("Error reading auth state for plant diary:", e);
  }
  return null;
}

export function getCurrentUserKeyForPlant(): string | null {
  const user = getStoredUserForPlant();
  if (!user || !user.isLoggedIn) return null;
  return user.email?.trim().toLowerCase() || user.id?.trim().toLowerCase() || null;
}

export function getDefaultGardenState(treeId: PlantTreeType = "sakura"): UserPlantGardenState {
  const now = Date.now();
  return {
    selectedTreeId: treeId,
    level: 1,
    exp: 0,
    totalExp: 0,
    waterCount: 0,
    weedCount: 0,
    plantedAt: now,
    lastTendedAt: now,
    entries: [],
  };
}

export function getPlantGarden(): UserPlantGardenState {
  try {
    const userKey = getCurrentUserKeyForPlant();
    const storageKey = userKey ? `${STORAGE_KEY}_${userKey}` : STORAGE_KEY;
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      // If userKey is present but specific key is empty, check general key as fallback
      if (userKey) {
        const general = localStorage.getItem(STORAGE_KEY);
        if (general) {
          const parsed = JSON.parse(general);
          return parsed;
        }
      }
      return getDefaultGardenState();
    }
    const parsed = JSON.parse(raw);
    return {
      selectedTreeId: parsed.selectedTreeId || "sakura",
      level: parsed.level || 1,
      exp: parsed.exp || 0,
      totalExp: parsed.totalExp || 0,
      waterCount: parsed.waterCount || 0,
      weedCount: parsed.weedCount || 0,
      plantedAt: parsed.plantedAt || Date.now(),
      lastTendedAt: parsed.lastTendedAt || Date.now(),
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch (error) {
    console.error("Error reading plant garden from localStorage:", error);
    return getDefaultGardenState();
  }
}

export function savePlantGardenLocally(garden: UserPlantGardenState) {
  try {
    const userKey = getCurrentUserKeyForPlant();
    const storageKey = userKey ? `${STORAGE_KEY}_${userKey}` : STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(garden));
    // Also update generic key for seamless transition
    localStorage.setItem(STORAGE_KEY, JSON.stringify(garden));
  } catch (e) {
    console.warn("Could not save plant garden to localStorage:", e);
  }
}

/**
 * Syncs user plant diary from server
 */
export async function syncPlantGardenFromServer(userIdOrEmail?: string): Promise<UserPlantGardenState> {
  const key = userIdOrEmail?.trim().toLowerCase() || getCurrentUserKeyForPlant();
  const local = getPlantGarden();

  if (!key) {
    return local;
  }

  try {
    const res = await fetch(`/api/plant-diary/${encodeURIComponent(key)}`);
    const data = await res.json();

    if (data.success && data.garden) {
      const serverGarden: UserPlantGardenState = data.garden;

      // Merge entries by ID
      const map = new Map<string, PlantDiaryEntry>();
      for (const entry of serverGarden.entries || []) {
        if (entry && entry.id) map.set(entry.id, entry);
      }

      let hasLocalOnlyEntries = false;
      for (const entry of local.entries || []) {
        if (entry && entry.id) {
          if (!map.has(entry.id)) {
            map.set(entry.id, entry);
            hasLocalOnlyEntries = true;
          }
        }
      }

      const mergedEntries = Array.from(map.values());
      mergedEntries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      const maxExp = Math.max(serverGarden.totalExp || 0, local.totalExp || 0);
      const levelCalc = calculateTreeLevel(maxExp);

      const mergedGarden: UserPlantGardenState = {
        selectedTreeId: serverGarden.selectedTreeId || local.selectedTreeId || "sakura",
        level: levelCalc.level,
        exp: levelCalc.currentLevelExp,
        totalExp: maxExp,
        waterCount: Math.max(serverGarden.waterCount || 0, local.waterCount || 0),
        weedCount: Math.max(serverGarden.weedCount || 0, local.weedCount || 0),
        plantedAt: Math.min(serverGarden.plantedAt || Date.now(), local.plantedAt || Date.now()),
        lastTendedAt: Math.max(serverGarden.lastTendedAt || 0, local.lastTendedAt || 0),
        entries: mergedEntries.slice(0, 200),
      };

      savePlantGardenLocally(mergedGarden);

      // If local had changes or sync needed, push back to server
      if (hasLocalOnlyEntries || local.totalExp > (serverGarden.totalExp || 0)) {
        fetch("/api/plant-diary/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: key, garden: mergedGarden }),
        }).catch((err) => console.warn("Background plant garden sync failed:", err));
      }

      return mergedGarden;
    }
  } catch (err) {
    console.warn("Failed to fetch plant garden from server:", err);
  }

  return local;
}

/**
 * Add a new entry (Tưới Cây hoặc Nhặt Cỏ)
 */
export async function addPlantActionEntry(
  type: "water" | "weed",
  content: string,
  wisdomMessage?: string
): Promise<{ garden: UserPlantGardenState; newEntry: PlantDiaryEntry }> {
  const current = getPlantGarden();
  const tree = PLANT_TREES.find((t) => t.id === current.selectedTreeId) || PLANT_TREES[0];
  const expGain = type === "water" ? 15 : 10;
  const now = Date.now();
  const dateObj = new Date(now);
  const dateStr = `${dateObj.getDate().toString().padStart(2, "0")}/${(dateObj.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, "0")}:${dateObj
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const newEntry: PlantDiaryEntry = {
    id: `entry_${now}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    treeId: current.selectedTreeId,
    treeName: tree.name,
    content: content.trim(),
    timestamp: now,
    dateStr,
    expGained: expGain,
    wisdomMessage: wisdomMessage || (type === "water"
      ? "Nước sương thẩm thấu qua từng tế bào lá. Lời nguyện ước của bạn hòa cùng nhịp thở vũ trụ, nuôi dưỡng tâm hồn thêm rạng ngời."
      : "Ngọn cỏ dại âu lo đã được xả bỏ, tan biến vào hư không và hóa thành chất mùn thanh lọc mảnh đất nội tâm."),
  };

  const newTotalExp = current.totalExp + expGain;
  const levelCalc = calculateTreeLevel(newTotalExp);

  const updatedGarden: UserPlantGardenState = {
    ...current,
    totalExp: newTotalExp,
    level: levelCalc.level,
    exp: levelCalc.currentLevelExp,
    waterCount: type === "water" ? current.waterCount + 1 : current.waterCount,
    weedCount: type === "weed" ? current.weedCount + 1 : current.weedCount,
    lastTendedAt: now,
    entries: [newEntry, ...current.entries].slice(0, 200),
  };

  savePlantGardenLocally(updatedGarden);

  // Sync to server if logged in
  const userKey = getCurrentUserKeyForPlant();
  if (userKey) {
    fetch("/api/plant-diary/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userKey, garden: updatedGarden, newEntry }),
    }).catch((e) => console.warn("Background plant save failed:", e));
  }

  return { garden: updatedGarden, newEntry };
}

/**
 * Switch active tree
 */
export function switchActivePlantTree(treeId: PlantTreeType): UserPlantGardenState {
  const current = getPlantGarden();
  const updatedGarden: UserPlantGardenState = {
    ...current,
    selectedTreeId: treeId,
  };
  savePlantGardenLocally(updatedGarden);

  const userKey = getCurrentUserKeyForPlant();
  if (userKey) {
    fetch("/api/plant-diary/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userKey, garden: updatedGarden }),
    }).catch((e) => console.warn("Switch plant server sync failed:", e));
  }

  return updatedGarden;
}

/**
 * Delete single entry
 */
export function deletePlantDiaryEntry(entryId: string): UserPlantGardenState {
  const current = getPlantGarden();
  const updatedEntries = current.entries.filter((e) => e.id !== entryId);
  const updatedGarden: UserPlantGardenState = {
    ...current,
    entries: updatedEntries,
  };
  savePlantGardenLocally(updatedGarden);

  const userKey = getCurrentUserKeyForPlant();
  if (userKey) {
    fetch(`/api/plant-diary/${encodeURIComponent(userKey)}/${encodeURIComponent(entryId)}`, {
      method: "DELETE",
    }).catch((e) => console.warn("Delete plant entry server sync failed:", e));
  }

  return updatedGarden;
}
