import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Trash2,
  UploadCloud,
  DownloadCloud,
  FolderOpen,
  FileText,
  Database,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Music,
  Star,
  Disc3,
  FileImage,
  Check,
  Compass,
  FileAudio,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, HistoryItem, AstroChartItem } from "../types";
import {
  getAccessToken,
  googleSignIn,
  auth,
  testFirestoreConnection,
} from "../firebase";
import {
  listDriveBackups,
  backupFullDataToDrive,
  deleteDriveFile,
  getDriveFileContent,
  DriveFileItem,
  listDriveMusicTracks,
  uploadAstroChartToDrive,
  listDriveAstroCharts,
} from "../utils/googleDriveService";
import {
  saveAstroChartToFirestore,
  getAstroChartsFromFirestore,
  saveUserProfileToFirestore,
  logDriveBackupToFirestore,
  saveMusicTrackToFirestore,
} from "../utils/firebaseSync";
import {
  getTracksForUser,
  backupMusicTracksToGoogleDrive,
  restoreMusicTracksFromGoogleDrive,
  UserTrackItem,
} from "../utils/musicStorage";
import { getHistory } from "../utils/historyStorage";
import { getPlantGarden, savePlantGardenLocally } from "../utils/plantDiaryStorage";
import { saveStoredUser } from "./AuthModal";

interface GoogleDriveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateUser: (user: UserProfile | null) => void;
}

export function GoogleDriveManagerModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}: GoogleDriveManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "astro" | "music" | "files">("overview");
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [musicFiles, setMusicFiles] = useState<DriveFileItem[]>([]);
  const [astroFiles, setAstroFiles] = useState<DriveFileItem[]>([]);
  const [localTracks, setLocalTracks] = useState<UserTrackItem[]>([]);
  const [savedCharts, setSavedCharts] = useState<AstroChartItem[]>([]);

  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean>(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Specific action loaders
  const [isBackingUpAll, setIsBackingUpAll] = useState<boolean>(false);
  const [isRestoringAll, setIsRestoringAll] = useState<boolean>(false);
  const [isBackingUpMusic, setIsBackingUpMusic] = useState<boolean>(false);
  const [isRestoringMusic, setIsRestoringMusic] = useState<boolean>(false);
  const [isBackingUpAstro, setIsBackingUpAstro] = useState<boolean>(false);

  // Destructive deletion confirmation state (Mandatory per Workspace skill)
  const [deleteTarget, setDeleteTarget] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Restore confirmation state
  const [restoreTarget, setRestoreTarget] = useState<DriveFileItem | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  const activeUserId = currentUser?.id || auth.currentUser?.uid || currentUser?.email || "anonymous";

  const refreshAllData = useCallback(async (accessToken?: string) => {
    const activeTok = accessToken || token || getAccessToken();
    setIsLoadingFiles(true);
    try {
      // 1. Load local music tracks
      const tracks = await getTracksForUser(activeUserId);
      setLocalTracks(tracks);

      // 2. Load firestore charts if logged in
      if (auth.currentUser) {
        const charts = await getAstroChartsFromFirestore(auth.currentUser.uid);
        setSavedCharts(charts);
      }

      // 3. Load Drive files if token available
      if (activeTok) {
        const [allFiles, mFiles, aFiles] = await Promise.all([
          listDriveBackups(activeTok).catch(() => []),
          listDriveMusicTracks(activeTok).catch(() => []),
          listDriveAstroCharts(activeTok).catch(() => []),
        ]);
        setFiles(allFiles);
        setMusicFiles(mFiles);
        setAstroFiles(aFiles);
      }
    } catch (err: any) {
      console.error("Failed to load cloud files:", err);
      if (err?.message?.includes("401") || err?.message?.includes("invalid_grant")) {
        setToken(null);
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, [activeUserId, token]);

  // Check token and firestore status on open
  useEffect(() => {
    if (isOpen) {
      const currentToken = getAccessToken();
      setToken(currentToken);
      testFirestoreConnection().then((connected) => setFirestoreConnected(connected));
      refreshAllData(currentToken || undefined);
    }
  }, [isOpen, refreshAllData]);

  const handleAuthorizeDrive = async () => {
    setIsAuthorizing(true);
    setMessage(null);
    try {
      const res = await googleSignIn();
      if (res && res.accessToken) {
        setToken(res.accessToken);
        setMessage({
          text: "Đã kết nối và cấp quyền Google Drive thành công!",
          type: "success",
        });

        if (res.user && (!currentUser || !currentUser.isLoggedIn)) {
          const newUser: UserProfile = {
            id: res.user.uid,
            email: res.user.email || "",
            name: res.user.displayName || "Bạn Tri Kỷ",
            isLoggedIn: true,
            role: "user",
            createdAt: new Date().toISOString(),
          };
          saveStoredUser(newUser);
          onUpdateUser(newUser);
        }

        await refreshAllData(res.accessToken);
      }
    } catch (err: any) {
      setMessage({
        text: `Cấp quyền Google Drive thất bại: ${err?.message || "Vui lòng thử lại"}`,
        type: "error",
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

  // 1-Click Backup Everything: Music, Astro Charts, Readings & Plant Garden
  const handleBackupAll = async () => {
    const currentToken = token || getAccessToken();
    setIsBackingUpAll(true);
    setMessage(null);

    let progressLog: string[] = [];

    try {
      // 1. Firebase Firestore sync
      if (currentUser && auth.currentUser) {
        await saveUserProfileToFirestore(currentUser);
        progressLog.push("Hồ sơ tài khoản");

        // Sync Astro charts to Firestore
        if (currentUser.astroProfile?.tuViImageUrl) {
          await saveAstroChartToFirestore(auth.currentUser.uid, {
            id: "chart_tu_vi_profile",
            userId: auth.currentUser.uid,
            type: "tu-vi",
            title: `Lá Số Tử Vi - ${currentUser.name}`,
            fullName: currentUser.astroProfile.fullName,
            birthDate: currentUser.astroProfile.birthDate,
            birthHour: currentUser.astroProfile.birthHour,
            calendarType: currentUser.astroProfile.calendarType,
            gender: currentUser.astroProfile.gender,
            birthPlace: currentUser.astroProfile.birthPlace,
            chartImageUrl: currentUser.astroProfile.tuViImageUrl,
            notes: "Lá số tử vi cá nhân",
            updatedAt: Date.now(),
          });
        }
        if (currentUser.astroProfile?.natalChartImageUrl) {
          await saveAstroChartToFirestore(auth.currentUser.uid, {
            id: "chart_natal_chart_profile",
            userId: auth.currentUser.uid,
            type: "natal-chart",
            title: `Bản Đồ Sao - ${currentUser.name}`,
            fullName: currentUser.astroProfile.fullName,
            birthDate: currentUser.astroProfile.birthDate,
            birthHour: currentUser.astroProfile.birthHour,
            calendarType: currentUser.astroProfile.calendarType,
            gender: currentUser.astroProfile.gender,
            birthPlace: currentUser.astroProfile.birthPlace,
            chartImageUrl: currentUser.astroProfile.natalChartImageUrl,
            notes: "Bản đồ sao chiêm tinh cá nhân",
            updatedAt: Date.now(),
          });
        }
      }

      // 2. Google Drive uploads if token available
      if (currentToken) {
        // A. Full Readings & Plant backup
        const history = getHistory();
        const plantGarden = getPlantGarden();
        await backupFullDataToDrive(currentToken, currentUser, history, plantGarden);
        progressLog.push("Lịch sử luận giải & Vườn tâm thức");

        // B. Music upload
        const musicResult = await backupMusicTracksToGoogleDrive(currentToken, activeUserId);
        if (musicResult.uploaded > 0) {
          progressLog.push(`${musicResult.uploaded} bài hát vào thư mục "Nhạc Thiền & Thư Giãn"`);
        }

        // C. Astro Charts upload
        if (currentUser?.astroProfile) {
          if (currentUser.astroProfile.tuViImageUrl) {
            await uploadAstroChartToDrive(currentToken, {
              type: "tu-vi",
              fullName: currentUser.astroProfile.fullName,
              birthDate: currentUser.astroProfile.birthDate,
              birthHour: currentUser.astroProfile.birthHour,
              chartImageUrl: currentUser.astroProfile.tuViImageUrl,
              notes: "Ảnh lá số tử vi cá nhân",
            });
            progressLog.push("Ảnh lá số tử vi lên Google Drive");
          }
          if (currentUser.astroProfile.natalChartImageUrl) {
            await uploadAstroChartToDrive(currentToken, {
              type: "natal-chart",
              fullName: currentUser.astroProfile.fullName,
              birthDate: currentUser.astroProfile.birthDate,
              birthHour: currentUser.astroProfile.birthHour,
              chartImageUrl: currentUser.astroProfile.natalChartImageUrl,
              notes: "Ảnh bản đồ sao chiêm tinh lên Google Drive",
            });
            progressLog.push("Ảnh bản đồ sao lên Google Drive");
          }
        }

        await refreshAllData(currentToken);
      }

      setMessage({
        text: `Đồng bộ hoàn tất! Đã lưu an toàn lên Firebase & Google Drive (${progressLog.join(", ") || "Dữ liệu được cập nhật"}).`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Backup all error:", err);
      setMessage({
        text: `Đồng bộ thất bại: ${err?.message || "Lỗi mạng hoặc quyền hạn"}`,
        type: "error",
      });
    } finally {
      setIsBackingUpAll(false);
    }
  };

  // 1-Click Restore All on New Device
  const handleRestoreAll = async () => {
    const currentToken = token || getAccessToken();
    setIsRestoringAll(true);
    setMessage(null);

    let restoredInfo: string[] = [];

    try {
      // 1. Restore Music from Google Drive
      if (currentToken) {
        const restoredMusic = await restoreMusicTracksFromGoogleDrive(currentToken, activeUserId);
        if (restoredMusic.length > 0) {
          restoredInfo.push(`${restoredMusic.length} bài hát`);
        }

        // 2. Look for the newest full JSON backup in Drive
        const allDriveBackups = await listDriveBackups(currentToken);
        const jsonBackup = allDriveBackups.find((f) => f.name.endsWith(".json"));
        if (jsonBackup) {
          const content = await getDriveFileContent(currentToken, jsonBackup.id);
          const parsed = JSON.parse(content);
          if (parsed) {
            if (Array.isArray(parsed.readings)) {
              localStorage.setItem("huyen_co_quan_history_v1", JSON.stringify(parsed.readings));
              restoredInfo.push(`${parsed.readings.length} bản luận giải`);
            }
            if (parsed.plantGarden) {
              savePlantGardenLocally(parsed.plantGarden);
              restoredInfo.push("Vườn tâm thức");
            }
            if (parsed.user && (!currentUser || !currentUser.isLoggedIn)) {
              saveStoredUser(parsed.user);
              onUpdateUser(parsed.user);
              restoredInfo.push("Hồ sơ tài khoản & Lá số");
            }
          }
        }
      }

      // 3. Check Firestore for Astro charts
      if (auth.currentUser) {
        const charts = await getAstroChartsFromFirestore(auth.currentUser.uid);
        if (charts.length > 0 && currentUser) {
          const tuVi = charts.find((c) => c.type === "tu-vi");
          const natal = charts.find((c) => c.type === "natal-chart");

          const updatedUser: UserProfile = {
            ...currentUser,
            astroProfile: {
              ...(currentUser.astroProfile || {
                fullName: currentUser.name,
                birthDate: "",
                birthHour: "Tý (23h - 1h)",
                calendarType: "solar",
                gender: "Khác",
                birthPlace: "",
                sunSign: "Bạch Dương",
                moonSign: "Bạch Dương",
                risingSign: "Bạch Dương",
              }),
              tuViImageUrl: tuVi?.chartImageUrl || currentUser.astroProfile?.tuViImageUrl,
              natalChartImageUrl: natal?.chartImageUrl || currentUser.astroProfile?.natalChartImageUrl,
            },
          };
          saveStoredUser(updatedUser);
          onUpdateUser(updatedUser);
          restoredInfo.push("Lá số từ Firebase Firestore");
        }
      }

      await refreshAllData(currentToken || undefined);

      setMessage({
        text: `Khôi phục thành công! (${restoredInfo.join(", ") || "Dữ liệu đã sẵn sàng trên thiết bị này"}).`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Restore all error:", err);
      setMessage({
        text: `Khôi phục thất bại: ${err?.message || "Lỗi tệp hoặc quyền truy cập"}`,
        type: "error",
      });
    } finally {
      setIsRestoringAll(false);
    }
  };

  // Back up Music Tracks exclusively
  const handleBackupMusicOnly = async () => {
    const currentToken = token || getAccessToken();
    if (!currentToken) {
      setMessage({
        text: "Vui lòng kết nối Google Drive để tải nhạc lên lưu trữ đám mây.",
        type: "info",
      });
      return;
    }

    setIsBackingUpMusic(true);
    setMessage(null);
    try {
      const res = await backupMusicTracksToGoogleDrive(currentToken, activeUserId);
      await refreshAllData(currentToken);
      setMessage({
        text: `Đã sao lưu ${res.uploaded} bài hát lên thư mục "Nhạc Thiền & Thư Giãn" trên Google Drive!`,
        type: "success",
      });
    } catch (err: any) {
      setMessage({
        text: `Sao lưu nhạc thất bại: ${err?.message || "Lỗi mạng"}`,
        type: "error",
      });
    } finally {
      setIsBackingUpMusic(false);
    }
  };

  // Restore Music Tracks exclusively
  const handleRestoreMusicOnly = async () => {
    const currentToken = token || getAccessToken();
    if (!currentToken) {
      setMessage({
        text: "Vui lòng kết nối Google Drive để khôi phục kho nhạc.",
        type: "info",
      });
      return;
    }

    setIsRestoringMusic(true);
    setMessage(null);
    try {
      const restored = await restoreMusicTracksFromGoogleDrive(currentToken, activeUserId);
      await refreshAllData(currentToken);
      setMessage({
        text: `Đã khôi phục thành công ${restored.length} bài hát từ Google Drive vào thiết bị này!`,
        type: "success",
      });
    } catch (err: any) {
      setMessage({
        text: `Khôi phục nhạc thất bại: ${err?.message || "Lỗi mạng"}`,
        type: "error",
      });
    } finally {
      setIsRestoringMusic(false);
    }
  };

  // Back up Astro Charts exclusively
  const handleBackupAstroOnly = async () => {
    const currentToken = token || getAccessToken();
    if (!currentUser?.astroProfile) {
      setMessage({
        text: "Chưa có dữ liệu hồ sơ lá số trong tài khoản của bạn. Vui lòng cập nhật hồ sơ trước.",
        type: "info",
      });
      return;
    }

    setIsBackingUpAstro(true);
    setMessage(null);
    try {
      const astro = currentUser.astroProfile;
      let count = 0;

      // 1. Firebase Firestore
      if (auth.currentUser) {
        if (astro.tuViImageUrl) {
          await saveAstroChartToFirestore(auth.currentUser.uid, {
            id: "chart_tu_vi_profile",
            userId: auth.currentUser.uid,
            type: "tu-vi",
            title: `Lá Số Tử Vi - ${astro.fullName || currentUser.name}`,
            fullName: astro.fullName,
            birthDate: astro.birthDate,
            birthHour: astro.birthHour,
            calendarType: astro.calendarType,
            gender: astro.gender,
            birthPlace: astro.birthPlace,
            chartImageUrl: astro.tuViImageUrl,
            notes: "Lá số tử vi cá nhân",
            updatedAt: Date.now(),
          });
          count++;
        }
        if (astro.natalChartImageUrl) {
          await saveAstroChartToFirestore(auth.currentUser.uid, {
            id: "chart_natal_chart_profile",
            userId: auth.currentUser.uid,
            type: "natal-chart",
            title: `Bản Đồ Sao - ${astro.fullName || currentUser.name}`,
            fullName: astro.fullName,
            birthDate: astro.birthDate,
            birthHour: astro.birthHour,
            calendarType: astro.calendarType,
            gender: astro.gender,
            birthPlace: astro.birthPlace,
            chartImageUrl: astro.natalChartImageUrl,
            notes: "Bản đồ sao chiêm tinh cá nhân",
            updatedAt: Date.now(),
          });
          count++;
        }
      }

      // 2. Google Drive
      if (currentToken) {
        if (astro.tuViImageUrl) {
          await uploadAstroChartToDrive(currentToken, {
            type: "tu-vi",
            fullName: astro.fullName,
            birthDate: astro.birthDate,
            birthHour: astro.birthHour,
            chartImageUrl: astro.tuViImageUrl,
            notes: "Lá số tử vi cá nhân",
          });
        }
        if (astro.natalChartImageUrl) {
          await uploadAstroChartToDrive(currentToken, {
            type: "natal-chart",
            fullName: astro.fullName,
            birthDate: astro.birthDate,
            birthHour: astro.birthHour,
            chartImageUrl: astro.natalChartImageUrl,
            notes: "Bản đồ sao chiêm tinh cá nhân",
          });
        }
      }

      await refreshAllData(currentToken || undefined);
      setMessage({
        text: `Đã lưu thành công lá số tử vi & bản đồ sao lên Firebase & Google Drive!`,
        type: "success",
      });
    } catch (err: any) {
      setMessage({
        text: `Lưu lá số thất bại: ${err?.message || "Lỗi thao tác"}`,
        type: "error",
      });
    } finally {
      setIsBackingUpAstro(false);
    }
  };

  // Perform destructive file deletion with mandatory user confirmation
  const confirmDeleteFile = async () => {
    if (!deleteTarget) return;
    const currentToken = token || getAccessToken();
    if (!currentToken) return;

    setIsDeleting(true);
    try {
      await deleteDriveFile(currentToken, deleteTarget.id);
      setMessage({
        text: `Đã xóa tệp "${deleteTarget.name}" khỏi Google Drive.`,
        type: "success",
      });
      setDeleteTarget(null);
      await refreshAllData(currentToken);
    } catch (err: any) {
      setMessage({
        text: `Không thể xóa tệp: ${err?.message || "Lỗi thao tác"}`,
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl bg-slate-900/95 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-blue-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-cinzel text-slate-100 flex items-center gap-2">
                Trung Tâm Lưu Trữ Đám Mây
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Firebase & Google Drive
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Bảo vệ vĩnh viễn Nhạc thiền, Lá số tử vi, Bản đồ sao & Dữ liệu khi đổi thiết bị
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-amber-400 text-amber-300 bg-white/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Đồng Bộ Đa Thiết Bị</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("astro")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "astro"
                ? "border-amber-400 text-amber-300 bg-white/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Lá Số & Bản Đồ Sao</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("music")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "music"
                ? "border-amber-400 text-amber-300 bg-white/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Kho Nhạc Thiền ({localTracks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("files")}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "files"
                ? "border-amber-400 text-amber-300 bg-white/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Tệp Google Drive ({files.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Notifications banner */}
          {message && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                message.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : message.type === "error"
                  ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                  : "bg-amber-950/40 border-amber-500/40 text-amber-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <div className="flex-1">{message.text}</div>
              <button
                type="button"
                onClick={() => setMessage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW & CROSS-DEVICE SYNC */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Infrastructure Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Firebase Firestore */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-amber-400" />
                        Firebase Firestore Cloud
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Đang hoạt động
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Lưu trữ hồ sơ tài khoản, thông số lá số tử vi & bản đồ sao, danh mục bài hát và lịch sử chiêm nghiệm.
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Dự án: reverberant-summer-gt8c4</span>
                    <span className="text-amber-400 font-mono">Đồng bộ tự động</span>
                  </div>
                </div>

                {/* Google Drive Workspace */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                        <Cloud className="w-3.5 h-3.5 text-blue-400" />
                        Google Drive Workspace
                      </span>
                      {token ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Đã cấp quyền
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                          Chưa liên kết
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Lưu trữ tệp nhị phân kích thước lớn: Tệp âm thanh MP3 và ảnh gốc lá số tử vi độ phân giải cao.
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between">
                    {token ? (
                      <span className="text-[11px] text-slate-400 truncate">
                        Thư mục: A Private Place - Hồ Sơ Huyền Học & Nhật Ký
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAuthorizeDrive}
                        disabled={isAuthorizing}
                        className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {isAuthorizing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Cloud className="w-3.5 h-3.5" />
                        )}
                        Đăng nhập & Cấp quyền Google Drive
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 1-Click Multi-Device Action Hub */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-800/80 to-blue-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold font-cinzel text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Giải Pháp Chuyển Đổi Thiết Bị Không Mất Dữ Liệu</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Khi bạn đổi sang điện thoại hoặc máy tính mới, chỉ cần đăng nhập Google và ấn nút <strong>&quot;Khôi Phục Dữ Liệu&quot;</strong> bên dưới. Toàn bộ nhạc thiền, ảnh lá số và các ghi chép sẽ tự động tải về đầy đủ.
                </p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleBackupAll}
                    disabled={isBackingUpAll}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                  >
                    {isBackingUpAll ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    <span>
                      {isBackingUpAll
                        ? "Đang tải Nhạc, Lá Số & Dữ Liệu..."
                        : "Đồng Bộ Tất Cả Lên Đám Mây (Firebase & Drive)"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestoreAll}
                    disabled={isRestoringAll}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-400/40 hover:border-amber-300 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isRestoringAll ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <DownloadCloud className="w-4 h-4 text-amber-300" />
                    )}
                    <span>
                      {isRestoringAll
                        ? "Đang khôi phục về thiết bị này..."
                        : "Khôi Phục Dữ Liệu Khi Đổi Thiết Bị"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASTROLOGICAL CHARTS (TỬ VI & BẢN ĐỒ SAO) */}
          {activeTab === "astro" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Lá Số Tử Vi & Bản Đồ Sao Chiêm Tinh
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lưu trữ ảnh lá số và thông tin lập số vào Firebase & Google Drive
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBackupAstroOnly}
                  disabled={isBackingUpAstro}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
                >
                  {isBackingUpAstro ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5" />
                  )}
                  <span>Lưu & Tải Lá Số Lên Drive/Firebase</span>
                </button>
              </div>

              {/* Astro Profile Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Lá Số Tử Vi */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                      <Compass className="w-4 h-4 text-amber-400" />
                      <span>Lá Số Tử Vi Đẩu Số</span>
                    </div>
                    {currentUser?.astroProfile?.tuViImageUrl ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã có ảnh lá số
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300">
                        Chưa nạp ảnh
                      </span>
                    )}
                  </div>

                  {currentUser?.astroProfile?.tuViImageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-white/10 max-h-36 bg-black/40">
                      <img
                        src={currentUser.astroProfile.tuViImageUrl}
                        alt="Lá Số Tử Vi"
                        className="w-full h-36 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-black/30 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                      Vào mục &quot;Tử Vi&quot; hoặc hồ sơ để tải lên ảnh lá số của bạn
                    </div>
                  )}

                  <div className="text-xs text-slate-300 space-y-1">
                    <div>
                      Họ tên:{" "}
                      <strong className="text-slate-100">
                        {currentUser?.astroProfile?.fullName || currentUser?.name || "Chưa đặt"}
                      </strong>
                    </div>
                    <div>
                      Ngày sinh:{" "}
                      <span className="text-slate-200">
                        {currentUser?.astroProfile?.birthDate || "Chưa cập nhật"}
                      </span>{" "}
                      • Giờ:{" "}
                      <span className="text-slate-200">
                        {currentUser?.astroProfile?.birthHour || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Bản Đồ Sao */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-indigo-300">
                      <Star className="w-4 h-4 text-indigo-400" />
                      <span>Bản Đồ Sao Chiêm Tinh</span>
                    </div>
                    {currentUser?.astroProfile?.natalChartImageUrl ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Đã có bản đồ sao
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-700 text-slate-300">
                        Chưa nạp ảnh
                      </span>
                    )}
                  </div>

                  {currentUser?.astroProfile?.natalChartImageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-white/10 max-h-36 bg-black/40">
                      <img
                        src={currentUser.astroProfile.natalChartImageUrl}
                        alt="Bản Đồ Sao"
                        className="w-full h-36 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-black/30 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                      Vào mục &quot;Bản Đồ Sao&quot; hoặc hồ sơ để nạp ảnh bản đồ sao
                    </div>
                  )}

                  <div className="text-xs text-slate-300 space-y-1">
                    <div>
                      Bộ 3 Tam Trụ: Sun:{" "}
                      <strong className="text-amber-300">
                        {currentUser?.astroProfile?.sunSign || "Chưa chọn"}
                      </strong>{" "}
                      • Moon:{" "}
                      <strong className="text-blue-300">
                        {currentUser?.astroProfile?.moonSign || "Chưa chọn"}
                      </strong>{" "}
                      • Rising:{" "}
                      <strong className="text-purple-300">
                        {currentUser?.astroProfile?.risingSign || "Chưa chọn"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Astro Files saved on Google Drive list */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tệp Lá Số Đã Lưu Trên Thư Mục Google Drive ({astroFiles.length})</span>
                </h4>

                {astroFiles.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-800/30">
                    Chưa có tệp lá số nào trong thư mục &quot;Lá Số Tử Vi & Bản Đồ Sao&quot; trên Google Drive. Nhấn &quot;Lưu & Tải Lá Số Lên Drive/Firebase&quot; để sao lưu.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {astroFiles.map((af) => (
                      <div
                        key={af.id}
                        className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileImage className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="truncate">
                            <div className="font-semibold text-slate-200 truncate">{af.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Kích thước: {af.size ? `${(parseInt(af.size) / 1024).toFixed(1)} KB` : "N/A"} • Ngày: {new Date(af.modifiedTime).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {af.webViewLink && (
                            <a
                              href={af.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 flex items-center gap-1 text-[11px]"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Xem trên Drive</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(af)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MUSIC STORAGE (KHO NHẠC THIỀN) */}
          {activeTab === "music" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                    <Music className="w-4 h-4 text-amber-400" />
                    Kho Nhạc Thiền & Thư Giãn Cá Nhân
                  </h3>
                  <p className="text-xs text-slate-400">
                    Đồng bộ tệp âm thanh MP3 lên Google Drive & Firebase để nghe trên mọi thiết bị
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBackupMusicOnly}
                    disabled={isBackingUpMusic || !token}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
                  >
                    {isBackingUpMusic ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5" />
                    )}
                    <span>Tải Nhạc Lên Drive</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestoreMusicOnly}
                    disabled={isRestoringMusic || !token}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {isRestoringMusic ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <DownloadCloud className="w-3.5 h-3.5" />
                    )}
                    <span>Tải Về Máy Này</span>
                  </button>
                </div>
              </div>

              {/* Local Tracks list */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Bài hát trên thiết bị hiện tại ({localTracks.length})</span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng phát offline
                  </span>
                </div>

                {localTracks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    Bạn chưa tải lên bài hát nào vào trình phát nhạc. Hãy vào góc phải màn hình mở mục &quot;Nhạc&quot; để thêm bài hát!
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {localTracks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Disc3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-medium text-slate-200 truncate">{t.title}</span>
                          <span className="text-slate-500 text-[10px]">— {t.artist}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0">
                          <span>{t.fileSize || "MP3"}</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                            Đã lưu
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drive Music Tracks List */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>Bài hát đã lưu trên thư mục Google Drive ({musicFiles.length})</span>
                  {token && (
                    <span className="text-[11px] text-blue-400">
                      Thư mục: Nhạc Thiền & Thư Giãn
                    </span>
                  )}
                </div>

                {musicFiles.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    Chưa có bài hát nào trên Google Drive. Nhấn nút &quot;Tải Nhạc Lên Drive&quot; ở trên để sao lưu.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {musicFiles.map((mf) => (
                      <div
                        key={mf.id}
                        className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileAudio className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="font-medium text-slate-200 truncate">{mf.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] shrink-0">
                          {mf.size && (
                            <span className="text-slate-400">
                              {(parseInt(mf.size) / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(mf)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: RAW GOOGLE DRIVE FILES LIST */}
          {activeTab === "files" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  Tất Cả Tệp Trong Thư Mục Google Drive ({files.length})
                </h4>
                {token && (
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    Mở Google Drive
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {!token ? (
                <div className="p-8 rounded-xl bg-slate-800/40 border border-dashed border-slate-700/80 text-center">
                  <Cloud className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-xs text-slate-300 font-medium">
                    Chưa kết nối với Google Drive của bạn
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                    Nhấn nút bên dưới để cấp quyền lưu trữ các bản luận giải trực tiếp vào Google Drive cá nhân của bạn.
                  </p>
                  <button
                    type="button"
                    onClick={handleAuthorizeDrive}
                    disabled={isAuthorizing}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
                  >
                    <Cloud className="w-4 h-4" />
                    Kết Nối Google Drive Ngay
                  </button>
                </div>
              ) : isLoadingFiles ? (
                <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
                  <RefreshCw className="w-6 h-6 mx-auto text-amber-400 animate-spin mb-2" />
                  <p className="text-xs text-slate-400">Đang đồng bộ danh sách tệp từ Google Drive...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
                  <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-300 font-medium">
                    Thư mục Google Drive chưa có tệp sao lưu nào
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 mb-3">
                    Hãy nhấn &quot;Đồng Bộ Tất Cả&quot; để tạo bản sao lưu đầu tiên!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {files.map((file) => {
                    const isJson = file.name.endsWith(".json");
                    const isMd = file.name.endsWith(".md");

                    return (
                      <div
                        key={file.id}
                        className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isJson
                                ? "bg-amber-500/20 text-amber-300"
                                : isMd
                                ? "bg-blue-500/20 text-blue-300"
                                : "bg-purple-500/20 text-purple-300"
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-200 truncate">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : "N/A"} •{" "}
                              {new Date(file.modifiedTime).toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isJson && (
                            <button
                              type="button"
                              onClick={() => setRestoreTarget(file)}
                              title="Khôi phục dữ liệu từ tệp này"
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
                            >
                              <DownloadCloud className="w-3 h-3" />
                              <span className="hidden sm:inline">Khôi phục</span>
                            </button>
                          )}

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              title="Xem tệp trên Google Drive"
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(file)}
                            title="Xóa tệp khỏi Google Drive"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mã hóa bảo mật Firebase & Quyền riêng tư Google Drive tuyệt đối</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </motion.div>

      {/* Mandatory Explicit User Confirmation Modal for Destructive Delete (Workspace Skill Requirement) */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Xác nhận xóa tệp khỏi Google Drive
                  </h3>
                  <p className="text-xs text-rose-300">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn có chắc chắn muốn xóa vĩnh viễn tệp{" "}
                <span className="font-semibold text-amber-300">&quot;{deleteTarget.name}&quot;</span>{" "}
                khỏi thư mục Google Drive của bạn?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFile}
                  disabled={isDeleting}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  Xác Nhận Xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Restore */}
      <AnimatePresence>
        {restoreTarget && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-400">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <DownloadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Khôi phục dữ liệu từ Google Drive
                  </h3>
                  <p className="text-xs text-amber-300">Đồng bộ lịch sử & khu vườn</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn có muốn khôi phục toàn bộ lịch sử chiêm nghiệm và tiến trình nuôi cây từ tệp{" "}
                <span className="font-semibold text-amber-300">&quot;{restoreTarget.name}&quot;</span>?
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestoreTarget(null)}
                  disabled={isRestoring}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!restoreTarget) return;
                    const currentToken = token || getAccessToken();
                    if (!currentToken) return;

                    setIsRestoring(true);
                    try {
                      const content = await getDriveFileContent(currentToken, restoreTarget.id);
                      const parsed = JSON.parse(content);

                      if (parsed && (parsed.readings || parsed.plantGarden)) {
                        if (Array.isArray(parsed.readings)) {
                          localStorage.setItem("huyen_co_quan_history_v1", JSON.stringify(parsed.readings));
                        }
                        if (parsed.plantGarden) {
                          savePlantGardenLocally(parsed.plantGarden);
                        }
                        if (parsed.user && (!currentUser || !currentUser.isLoggedIn)) {
                          saveStoredUser(parsed.user);
                          onUpdateUser(parsed.user);
                        }

                        setMessage({
                          text: `Đã khôi phục thành công ${parsed.readings?.length || 0} bản luận giải & dữ liệu nuôi cây từ Google Drive!`,
                          type: "success",
                        });
                        setRestoreTarget(null);
                      } else {
                        throw new Error("Cấu trúc tệp sao lưu không đúng định dạng chuẩn.");
                      }
                    } catch (err: any) {
                      setMessage({
                        text: `Khôi phục thất bại: ${err?.message || "Tệp không hợp lệ"}`,
                        type: "error",
                      });
                    } finally {
                      setIsRestoring(false);
                    }
                  }}
                  disabled={isRestoring}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {isRestoring ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  Xác Nhận Khôi Phục
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
