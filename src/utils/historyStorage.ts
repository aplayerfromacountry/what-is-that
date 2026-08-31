import { HistoryItem } from "../types";

const STORAGE_KEY = "huyen_co_quan_history_v1";

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

export function saveHistoryItem(item: Omit<HistoryItem, "id" | "timestamp">): HistoryItem {
  const newItem: HistoryItem = {
    ...item,
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  try {
    const history = getHistory();
    // Keep up to 100 recent items
    const updated = [newItem, ...history].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving history item:", error);
  }

  return newItem;
}

export function deleteHistoryItem(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting history item:", error);
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing history:", error);
  }
}
