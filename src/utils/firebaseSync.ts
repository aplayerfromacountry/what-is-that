import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, HistoryItem, UserPlantGardenState, AstroChartItem, UserMusicCloudRecord } from "../types";

export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  const path = `users/${uid}`;
  try {
    const payload = {
      userId: uid,
      email: user.email || auth.currentUser.email || "",
      name: user.name || auth.currentUser.displayName || "Người Bạn Tri Kỷ",
      role: user.role || "user",
      isAdmin: !!user.isAdmin,
      createdAt: user.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      astroProfile: user.astroProfile || {},
    };
    await setDoc(doc(db, "users", uid), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfileFromFirestore(
  uid: string
): Promise<Partial<UserProfile> | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      return snap.data() as Partial<UserProfile>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveReadingToFirestore(
  userId: string,
  item: HistoryItem
): Promise<void> {
  const path = `users/${userId}/readings/${item.id}`;
  try {
    const payload = {
      id: item.id,
      userId: userId,
      type: item.type,
      title: item.title,
      question: item.question || "",
      timestamp: item.timestamp,
      resultMarkdown: item.resultMarkdown,
      summary: item.summary || "",
      aspectOrSpread: item.aspectOrSpread || "",
      meta: item.meta || {},
    };
    await setDoc(doc(db, "users", userId, "readings", item.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getReadingsFromFirestore(
  userId: string
): Promise<HistoryItem[]> {
  const path = `users/${userId}/readings`;
  try {
    const q = query(collection(db, "users", userId, "readings"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    const items: HistoryItem[] = [];
    snap.forEach((d) => {
      const data = d.data();
      items.push(data as HistoryItem);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteReadingFromFirestore(
  userId: string,
  readingId: string
): Promise<void> {
  const path = `users/${userId}/readings/${readingId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "readings", readingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function savePlantGardenToFirestore(
  userId: string,
  garden: UserPlantGardenState
): Promise<void> {
  const path = `users/${userId}/plantGarden/garden_state`;
  try {
    const payload = {
      userId: userId,
      selectedTreeId: garden.selectedTreeId,
      level: garden.level,
      currentExp: garden.exp || 0,
      totalExp: garden.totalExp || 0,
      waterCount: garden.waterCount || 0,
      weedCount: garden.weedCount || 0,
      entries: garden.entries || [],
      plantedAt: garden.plantedAt || Date.now(),
      lastTendedAt: garden.lastTendedAt || Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, "users", userId, "plantGarden", "garden_state"), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getPlantGardenFromFirestore(
  userId: string
): Promise<UserPlantGardenState | null> {
  const path = `users/${userId}/plantGarden/garden_state`;
  try {
    const snap = await getDoc(doc(db, "users", userId, "plantGarden", "garden_state"));
    if (snap.exists()) {
      return snap.data() as UserPlantGardenState;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ==========================================
// Astrological Charts (Lá Số Tử Vi & Bản Đồ Sao) Sync
// ==========================================
export async function saveAstroChartToFirestore(
  userId: string,
  chart: AstroChartItem
): Promise<void> {
  const path = `users/${userId}/charts/${chart.id}`;
  try {
    const payload: AstroChartItem = {
      id: chart.id,
      userId,
      type: chart.type,
      title: chart.title || (chart.type === "tu-vi" ? "Lá Số Tử Vi" : "Bản Đồ Sao"),
      fullName: chart.fullName || "",
      birthDate: chart.birthDate || "",
      birthHour: chart.birthHour || "",
      calendarType: chart.calendarType || "solar",
      gender: chart.gender || "Chưa định",
      birthPlace: chart.birthPlace || "",
      chartImageUrl: chart.chartImageUrl || "",
      notes: chart.notes || "",
      updatedAt: chart.updatedAt || Date.now(),
    };
    await setDoc(doc(db, "users", userId, "charts", chart.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getAstroChartsFromFirestore(
  userId: string
): Promise<AstroChartItem[]> {
  const path = `users/${userId}/charts`;
  try {
    const q = query(collection(db, "users", userId, "charts"), orderBy("updatedAt", "desc"));
    const snap = await getDocs(q);
    const charts: AstroChartItem[] = [];
    snap.forEach((d) => {
      charts.push(d.data() as AstroChartItem);
    });
    return charts;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteAstroChartFromFirestore(
  userId: string,
  chartId: string
): Promise<void> {
  const path = `users/${userId}/charts/${chartId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "charts", chartId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Music Library Metadata Sync (Cross-Device Playlist & Links)
// ==========================================
export async function saveMusicTrackToFirestore(
  userId: string,
  track: UserMusicCloudRecord
): Promise<void> {
  const path = `users/${userId}/musicTracks/${track.id}`;
  try {
    const payload: UserMusicCloudRecord = {
      id: track.id,
      userId,
      title: track.title,
      artist: track.artist || "Nhạc của bạn",
      duration: track.duration || 0,
      fileSize: track.fileSize || "Đã đồng bộ",
      mimeType: track.mimeType || "audio/mpeg",
      driveFileId: track.driveFileId || "",
      driveUrl: track.driveUrl || "",
      createdAt: track.createdAt || Date.now(),
    };
    await setDoc(doc(db, "users", userId, "musicTracks", track.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getMusicTracksFromFirestore(
  userId: string
): Promise<UserMusicCloudRecord[]> {
  const path = `users/${userId}/musicTracks`;
  try {
    const q = query(collection(db, "users", userId, "musicTracks"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    const tracks: UserMusicCloudRecord[] = [];
    snap.forEach((d) => {
      tracks.push(d.data() as UserMusicCloudRecord);
    });
    return tracks;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteMusicTrackFromFirestore(
  userId: string,
  trackId: string
): Promise<void> {
  const path = `users/${userId}/musicTracks/${trackId}`;
  try {
    await deleteDoc(doc(db, "users", userId, "musicTracks", trackId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// Drive Backup Event Logging
// ==========================================
export async function logDriveBackupToFirestore(
  userId: string,
  backup: {
    id: string;
    driveFileId: string;
    fileName: string;
    backupType: "full" | "reading" | "plant-diary" | "music" | "astro-chart";
    webViewLink?: string;
  }
): Promise<void> {
  const path = `users/${userId}/driveBackups/${backup.id}`;
  try {
    const payload = {
      id: backup.id,
      userId,
      driveFileId: backup.driveFileId,
      fileName: backup.fileName,
      backupType: backup.backupType,
      webViewLink: backup.webViewLink || "",
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", userId, "driveBackups", backup.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// Migration Utility: LocalStorage -> Firestore
// ==========================================
export async function migrateLocalDataToFirestore(userId: string): Promise<{
  readingsMigrated: number;
  chartsMigrated: number;
  plantGardenMigrated: boolean;
}> {
  let readingsMigrated = 0;
  let chartsMigrated = 0;
  let plantGardenMigrated = false;

  try {
    // 1. Migrate Local History
    const localHistoryRaw = localStorage.getItem("huyen_co_quan_history_v1");
    if (localHistoryRaw) {
      const items = JSON.parse(localHistoryRaw);
      if (Array.isArray(items)) {
        for (const item of items.slice(0, 50)) {
          if (item && item.id) {
            await saveReadingToFirestore(userId, item).catch(() => {});
            readingsMigrated++;
          }
        }
      }
    }

    // 2. Migrate Plant Garden
    const localPlantRaw = localStorage.getItem("a_private_place_plant_garden_v1");
    if (localPlantRaw) {
      const plantState = JSON.parse(localPlantRaw);
      if (plantState) {
        await savePlantGardenToFirestore(userId, plantState).catch(() => {});
        plantGardenMigrated = true;
      }
    }

    // 3. Migrate Local Session Astro Charts
    const localUserRaw = localStorage.getItem("a_private_place_user_session");
    if (localUserRaw) {
      const user = JSON.parse(localUserRaw);
      if (user?.astroProfile) {
        if (user.astroProfile.tuViImageUrl) {
          await saveAstroChartToFirestore(userId, {
            id: "chart_tu_vi_profile",
            userId,
            type: "tu-vi",
            title: `Lá Số Tử Vi - ${user.astroProfile.fullName || user.name || "Cá Nhân"}`,
            fullName: user.astroProfile.fullName || user.name,
            birthDate: user.astroProfile.birthDate,
            birthHour: user.astroProfile.birthHour,
            calendarType: user.astroProfile.calendarType,
            gender: user.astroProfile.gender,
            birthPlace: user.astroProfile.birthPlace,
            chartImageUrl: user.astroProfile.tuViImageUrl,
            notes: "Di chuyển tự động từ bộ nhớ thiết bị",
            updatedAt: Date.now(),
          }).catch(() => {});
          chartsMigrated++;
        }
        if (user.astroProfile.natalChartImageUrl) {
          await saveAstroChartToFirestore(userId, {
            id: "chart_natal_chart_profile",
            userId,
            type: "natal-chart",
            title: `Bản Đồ Sao - ${user.astroProfile.fullName || user.name || "Cá Nhân"}`,
            fullName: user.astroProfile.fullName || user.name,
            birthDate: user.astroProfile.birthDate,
            birthHour: user.astroProfile.birthHour,
            calendarType: user.astroProfile.calendarType,
            gender: user.astroProfile.gender,
            birthPlace: user.astroProfile.birthPlace,
            chartImageUrl: user.astroProfile.natalChartImageUrl,
            notes: "Di chuyển tự động từ bộ nhớ thiết bị",
            updatedAt: Date.now(),
          }).catch(() => {});
          chartsMigrated++;
        }
      }
    }
  } catch (e) {
    console.warn("Migration warning:", e);
  }

  return { readingsMigrated, chartsMigrated, plantGardenMigrated };
}

