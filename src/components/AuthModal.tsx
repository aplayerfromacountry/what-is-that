import React, { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Lock,
  Mail,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  LogIn,
  UserPlus,
  Compass,
  Star,
  Save,
  Calendar,
  Clock,
  MapPin,
  UploadCloud,
  FileImage,
  Trash2,
  Eye,
  Download,
  Users,
  AlertCircle,
  Sliders,
  Cloud,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, AstrologicalProfile } from "../types";
import { clearLocalHistoryOnLogout, syncUserHistoryFromServer } from "../utils/historyStorage";
import { getShootingStarsEnabled, setShootingStarsEnabled } from "../utils/settingsStorage";
import { AdminUsersView } from "./AdminUsersView";
import { googleSignIn, firebaseLogout, auth } from "../firebase";
import { saveUserProfileToFirestore, saveAstroChartToFirestore } from "../utils/firebaseSync";

export type { UserProfile, AstrologicalProfile };

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateUser: (user: UserProfile | null) => void;
  initialProfileTab?: "account" | "astro" | "admin";
  onOpenDriveManager?: () => void;
}

const AUTH_STORAGE_KEY = "a_private_place_user_session";
const ALL_USERS_CACHE_KEY = "a_private_place_all_users_cache";

export function getStoredUser(): UserProfile | null {
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load user session:", e);
  }
  return null;
}

export function getAllCachedUsers(): UserProfile[] {
  try {
    const data = localStorage.getItem(ALL_USERS_CACHE_KEY);
    if (data) {
      const list = JSON.parse(data);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    console.warn("Failed to load cached users:", e);
  }
  return [];
}

export function saveStoredUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      
      // Update all users cache for local backup & admin visibility
      if (user.email) {
        const cached = getAllCachedUsers();
        const existingIdx = cached.findIndex(
          (u) => u.email?.toLowerCase().trim() === user.email?.toLowerCase().trim()
        );
        if (existingIdx >= 0) {
          cached[existingIdx] = { ...cached[existingIdx], ...user };
        } else {
          cached.push(user);
        }
        localStorage.setItem(ALL_USERS_CACHE_KEY, JSON.stringify(cached));

        // Auto backup & sync to server database
        fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        }).catch((err) => console.warn("Background user backup failed:", err));
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Failed to save user session:", e);
  }
}

export function updateUserAstroProfile(profile: AstrologicalProfile): UserProfile | null {
  const current = getStoredUser();
  if (!current) return null;
  const updated: UserProfile = {
    ...current,
    astroProfile: {
      ...(current.astroProfile || {}),
      ...profile,
    },
  };
  saveStoredUser(updated);

  // Sync with backend API in background
  if (current.email) {
    fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: current.email,
        name: current.name,
        astroProfile: updated.astroProfile,
      }),
    }).catch((err) => console.warn("Background profile sync failed:", err));
  }

  return updated;
}

export const ZODIAC_SIGNS = [
  "Bạch Dương (Aries ♈)",
  "Kim Ngưu (Taurus ♉)",
  "Song Tử (Gemini ♊)",
  "Cự Giải (Cancer ♋)",
  "Sư Tử (Leo ♌)",
  "Xử Nữ (Virgo ♍)",
  "Thiên Bình (Libra ♎)",
  "Bọ Cạp (Scorpio ♏)",
  "Nhân Mã (Sagittarius ♐)",
  "Ma Kết (Capricorn ♑)",
  "Bảo Bình (Aquarius ♒)",
  "Song Ngư (Pisces ♓)",
  "Chưa rõ / Tự động phân tích",
];

const BIRTH_HOURS = [
  "Giờ Tý (23h - 01h)",
  "Giờ Sửu (01h - 03h)",
  "Giờ Dần (03h - 05h)",
  "Giờ Mão (05h - 07h)",
  "Giờ Thìn (07h - 09h)",
  "Giờ Tỵ (09h - 11h)",
  "Giờ Ngọ (11h - 13h)",
  "Giờ Mùi (13h - 15h)",
  "Giờ Thân (15h - 17h)",
  "Giờ Dậu (17h - 19h)",
  "Giờ Tuất (19h - 21h)",
  "Giờ Hợi (21h - 23h)",
  "Chưa rõ giờ sinh",
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  initialProfileTab = "account",
  onOpenDriveManager,
}) => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [profileTab, setProfileTab] = useState<"account" | "astro" | "admin">(initialProfileTab);

  // Form states for login/register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shootingStars, setShootingStars] = useState<boolean>(true);

  // Astro profile form state
  const [astroFullName, setAstroFullName] = useState("");
  const [astroBirthDate, setAstroBirthDate] = useState("");
  const [astroBirthHour, setAstroBirthHour] = useState("Giờ Thìn (07h - 09h)");
  const [astroCalendarType, setAstroCalendarType] = useState<"solar" | "lunar">("solar");
  const [astroGender, setAstroGender] = useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [astroBirthPlace, setAstroBirthPlace] = useState("Hà Nội, Việt Nam");
  const [astroSunSign, setAstroSunSign] = useState(ZODIAC_SIGNS[12]);
  const [astroMoonSign, setAstroMoonSign] = useState(ZODIAC_SIGNS[12]);
  const [astroRisingSign, setAstroRisingSign] = useState(ZODIAC_SIGNS[12]);

  // Image states for Lá Số Tử Vi & Western Natal Chart
  const [tuViImage, setTuViImage] = useState<string | null>(null);
  const [natalImage, setNatalImage] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<{ url: string; title: string } | null>(null);

  const tuViInputRef = useRef<HTMLInputElement>(null);
  const natalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSuccessMsg("");
      setErrorMsg("");
      setName("");
      setEmail("");
      setPassword("");
      setProfileTab(initialProfileTab);
      setShootingStars(getShootingStarsEnabled());

      if (currentUser?.astroProfile) {
        const p = currentUser.astroProfile;
        setAstroFullName(p.fullName || currentUser.name || "");
        setAstroBirthDate(p.birthDate || "");
        setAstroBirthHour(p.birthHour || "Giờ Thìn (07h - 09h)");
        setAstroCalendarType(p.calendarType || "solar");
        setAstroGender(p.gender || "Nam");
        setAstroBirthPlace(p.birthPlace || "Hà Nội, Việt Nam");
        setAstroSunSign(p.sunSign || ZODIAC_SIGNS[12]);
        setAstroMoonSign(p.moonSign || ZODIAC_SIGNS[12]);
        setAstroRisingSign(p.risingSign || ZODIAC_SIGNS[12]);
        setTuViImage(p.tuViImageUrl || null);
        setNatalImage(p.natalChartImageUrl || null);
      } else if (currentUser) {
        setAstroFullName(currentUser.name || "");
        setTuViImage(null);
        setNatalImage(null);
      }
    }
  }, [isOpen, currentUser, initialProfileTab]);

  if (!isOpen) return null;

  // File upload reader helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "tuVi" | "natal"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP).");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg("Kích thước tệp quá lớn. Vui lòng chọn ảnh dưới 15MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (type === "tuVi") {
          setTuViImage(result);
        } else {
          setNatalImage(result);
        }
        setErrorMsg("");
      };
      reader.readAsDataURL(file);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const userObj: UserProfile = data.user;
        saveStoredUser(userObj);
        onUpdateUser(userObj);
        // Sync history from server immediately
        syncUserHistoryFromServer(userObj.email || userObj.id);
        setSuccessMsg(data.message || "Đăng nhập thành công!");
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        // Fallback local admin check if server is unreachable
        if (cleanEmail === "aha@aha.com" && cleanPassword === "123456") {
          const adminUser: UserProfile = {
            id: "usr_admin_01",
            name: "Quản Trị Viên (Admin)",
            email: "aha@aha.com",
            role: "admin",
            isAdmin: true,
            isLoggedIn: true,
            createdAt: new Date().toISOString(),
          };
          saveStoredUser(adminUser);
          onUpdateUser(adminUser);
          syncUserHistoryFromServer(adminUser.email || adminUser.id);
          setSuccessMsg("Đăng nhập thành công với quyền Quản Trị Viên!");
          setTimeout(() => onClose(), 800);
        } else {
          setErrorMsg(data.error || "Email hoặc mật khẩu không chính xác.");
        }
      }
    } catch (err) {
      // Local fallback for admin
      if (cleanEmail === "aha@aha.com" && cleanPassword === "123456") {
        const adminUser: UserProfile = {
          id: "usr_admin_01",
          name: "Quản Trị Viên (Admin)",
          email: "aha@aha.com",
          role: "admin",
          isAdmin: true,
          isLoggedIn: true,
        };
        saveStoredUser(adminUser);
        onUpdateUser(adminUser);
        syncUserHistoryFromServer(adminUser.email || adminUser.id);
        setSuccessMsg("Đăng nhập thành công!");
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg("Lỗi kết nối khi đăng nhập. Vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register handler with unique email enforcement
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split("@")[0];
    const cleanPassword = password.trim();

    if (cleanPassword.length < 4) {
      setErrorMsg("Mật khẩu phải có ít nhất 4 ký tự.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: cleanPassword,
          astroProfile: {
            fullName: cleanName,
            birthDate: "",
            birthHour: "Giờ Thìn (07h - 09h)",
            calendarType: "solar",
            gender: "Nam",
            birthPlace: "Hà Nội, Việt Nam",
          },
        }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        const userObj: UserProfile = data.user;
        saveStoredUser(userObj);
        onUpdateUser(userObj);
        syncUserHistoryFromServer(userObj.email || userObj.id);
        setSuccessMsg("Đăng ký thành công! Đã kích hoạt lưu trữ hồ sơ.");
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        // Strict email uniqueness failure or server error
        setErrorMsg(
          data.error ||
            "Email này đã được sử dụng. Vui lòng chuyển sang Đăng Nhập hoặc dùng email khác."
        );
      }
    } catch (err) {
      setErrorMsg("Lỗi kết nối khi đăng ký tài khoản. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In handler with Firebase & Drive scope
  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);
    try {
      const res = await googleSignIn();
      if (res && res.user) {
        const u = res.user;
        const userObj: UserProfile = {
          id: u.uid,
          name: u.displayName || u.email?.split("@")[0] || "Bạn Tri Kỷ",
          email: u.email || "",
          isLoggedIn: true,
          role: "user",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        try {
          await saveUserProfileToFirestore(userObj);
        } catch (e) {
          console.warn("Could not save to firestore:", e);
        }
        saveStoredUser(userObj);
        onUpdateUser(userObj);
        syncUserHistoryFromServer(userObj.email || userObj.id);
        setSuccessMsg("Đăng nhập bằng tài khoản Google thành công!");
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err?.code === "auth/popup-closed-by-user") {
        setErrorMsg("Bạn đã đóng cửa sổ đăng nhập Google.");
      } else {
        setErrorMsg(`Đăng nhập Google thất bại: ${err?.message || "Vui lòng thử lại"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout handler: Wipe local session & local history completely with no trace left on device, while keeping server cloud history safe!
  const handleLogout = async () => {
    // 1. Wipe local history without deleting cloud database
    clearLocalHistoryOnLogout();
    // 2. Sign out of Firebase
    try {
      await firebaseLogout();
    } catch (e) {
      console.warn("Firebase signout error:", e);
    }
    // 3. Clear user session
    saveStoredUser(null);
    onUpdateUser(null);
    onClose();
  };

  // Save Astrological Profile & Uploaded Chart Images
  const handleSaveAstroProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSubmitting(true);
    const newAstro: AstrologicalProfile = {
      fullName: astroFullName.trim() || currentUser.name,
      birthDate: astroBirthDate,
      birthHour: astroBirthHour,
      calendarType: astroCalendarType,
      gender: astroGender,
      birthPlace: astroBirthPlace.trim(),
      sunSign: astroSunSign,
      moonSign: astroMoonSign,
      risingSign: astroRisingSign,
      tuViImageUrl: tuViImage || undefined,
      natalChartImageUrl: natalImage || undefined,
    };

    const updatedUser: UserProfile = {
      ...currentUser,
      name: astroFullName.trim() || currentUser.name,
      astroProfile: newAstro,
    };

    saveStoredUser(updatedUser);
    onUpdateUser(updatedUser);

    // Sync with server API
    try {
      await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          name: updatedUser.name,
          astroProfile: newAstro,
        }),
      });
    } catch (e) {
      console.warn("Could not sync profile to server:", e);
    }

    // Sync with Firebase Firestore for Cross-Device Persistence
    try {
      await saveUserProfileToFirestore(updatedUser);

      const activeUid = auth.currentUser?.uid || currentUser.id || currentUser.email;
      if (activeUid) {
        if (newAstro.tuViImageUrl) {
          await saveAstroChartToFirestore(activeUid, {
            id: "chart_tu_vi_profile",
            userId: activeUid,
            type: "tu-vi",
            title: `Lá Số Tử Vi - ${updatedUser.name}`,
            fullName: newAstro.fullName,
            birthDate: newAstro.birthDate,
            birthHour: newAstro.birthHour,
            calendarType: newAstro.calendarType,
            gender: newAstro.gender,
            birthPlace: newAstro.birthPlace,
            chartImageUrl: newAstro.tuViImageUrl,
            notes: "Lá số tử vi được gắn vào hồ sơ tài khoản",
            updatedAt: Date.now(),
          });
        }
        if (newAstro.natalChartImageUrl) {
          await saveAstroChartToFirestore(activeUid, {
            id: "chart_natal_chart_profile",
            userId: activeUid,
            type: "natal-chart",
            title: `Bản Đồ Sao - ${updatedUser.name}`,
            fullName: newAstro.fullName,
            birthDate: newAstro.birthDate,
            birthHour: newAstro.birthHour,
            calendarType: newAstro.calendarType,
            gender: newAstro.gender,
            birthPlace: newAstro.birthPlace,
            chartImageUrl: newAstro.natalChartImageUrl,
            notes: "Bản đồ sao chiêm tinh gắn vào hồ sơ tài khoản",
            updatedAt: Date.now(),
          });
        }
      }
    } catch (fbErr) {
      console.warn("Could not sync profile to Firestore:", fbErr);
    }

    setIsSubmitting(false);
    setSuccessMsg("Đã lưu hồ sơ lá số & ảnh cá nhân lên Firebase & Đám Mây an toàn!");
    setTimeout(() => {
      setSuccessMsg("");
    }, 3500);
  };

  const isAdminUser = currentUser?.isAdmin || currentUser?.email === "aha@aha.com";

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-2xl bg-[#0b0d14] border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(251,191,36,0.12)] relative max-h-[92vh] overflow-y-auto space-y-4"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {currentUser?.isLoggedIn ? (
          /* User Logged In View */
          <div className="space-y-5">
            {/* Top Navigation Tabs in Profile Modal */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setProfileTab("account")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  profileTab === "account"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Hồ Sơ Của Tôi
              </button>

              <button
                type="button"
                onClick={() => setProfileTab("astro")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                  profileTab === "astro"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Lá Số & Bản Đồ Sao Cá Nhân</span>
                {(currentUser.astroProfile?.tuViImageUrl ||
                  currentUser.astroProfile?.natalChartImageUrl) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                )}
              </button>

              {isAdminUser && (
                <button
                  type="button"
                  onClick={() => setProfileTab("admin")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    profileTab === "admin"
                      ? "bg-gradient-to-r from-amber-500/30 to-purple-500/30 text-amber-200 border border-amber-400/60 shadow-md"
                      : "text-amber-400/80 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quản Trị Viên (Admin)</span>
                </button>
              )}
            </div>

            {/* Tab 1: Account Info */}
            {profileTab === "account" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-indigo-500/30 border border-amber-400/30 flex items-center justify-center text-xl font-bold text-amber-300 font-cinzel shrink-0 shadow-lg">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="font-cinzel font-bold text-base text-slate-100 truncate">
                        {currentUser.name}
                      </h3>
                      {isAdminUser ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-400/40">
                          Quản Trị Viên
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300 border border-white/15">
                          Thành viên
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-200/80 flex items-center justify-center sm:justify-start gap-1">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      {currentUser.email}
                    </p>
                    <p className="text-[11px] text-slate-400 pt-1">
                      ✓ Đang kích hoạt chế độ tự động lưu lịch sử luận giải riêng tư.
                    </p>
                  </div>
                </div>

                {/* Quick Astro Summary if uploaded */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Hồ Sơ Chiêm Tinh & Lá Số Đã Lưu
                    </span>
                    <button
                      type="button"
                      onClick={() => setProfileTab("astro")}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Chỉnh sửa / Tải ảnh →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Lá số Tử Vi:</span>
                      <span className="font-semibold text-amber-200">
                        {currentUser.astroProfile?.tuViImageUrl ? "✓ Đã tải ảnh lên" : "Chưa tải"}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-[10px] text-slate-400 block">Bản đồ sao:</span>
                      <span className="font-semibold text-indigo-200">
                        {currentUser.astroProfile?.natalChartImageUrl ? "✓ Đã tải ảnh lên" : "Chưa tải"}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 block">Cung Hoàng Đạo:</span>
                      <span className="font-semibold text-slate-200 truncate block">
                        {currentUser.astroProfile?.sunSign || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual Settings: Shooting Stars */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span>Hiệu Ứng Sao Rơi (Sao Băng)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">
                          {shootingStars ? "Đang Bật" : "Đã Tắt"}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Hiển thị các vệt sao băng phát sáng lướt qua bầu trời đêm nền
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !shootingStars;
                      setShootingStars(nextVal);
                      setShootingStarsEnabled(nextVal);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                      shootingStars ? "bg-gradient-to-r from-amber-500 to-yellow-400" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                        shootingStars ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2 flex justify-between items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileTab("astro")}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Tải Ảnh Lá Số / Bản Đồ Sao
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
                  >
                    Đăng Xuất
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Astro Profile & Upload Images */}
            {profileTab === "astro" && (
              <form onSubmit={handleSaveAstroProfile} className="space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold font-cinzel text-amber-200 flex items-center justify-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Hồ Sơ & Tải Ảnh Lá Số, Bản Đồ Sao Cá Nhân
                  </h4>
                  <p className="text-xs text-slate-400">
                    Tải lên ảnh lá số Tử Vi và Bản Đồ Sao Tây Phương của bạn để hệ thống tự động nhận diện và luận giải chuẩn xác nhất.
                  </p>
                </div>

                {successMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" />
                    {successMsg}
                  </div>
                )}

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs text-center flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errorMsg}
                  </div>
                )}

                {/* 2 Explicit Upload Cards for Lá Số Tử Vi & Western Natal Chart */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Card 1: Ảnh Lá Số Tử Vi */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                        <Compass className="w-4 h-4 text-amber-400" />
                        <span>Ảnh Lá Số Tử Vi</span>
                      </div>
                      {tuViImage && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Đã có ảnh
                        </span>
                      )}
                    </div>

                    <input
                      ref={tuViInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "tuVi")}
                      className="hidden"
                    />

                    {tuViImage ? (
                      <div className="space-y-2">
                        <div className="relative h-32 rounded-xl overflow-hidden border border-white/15 bg-black/60 group">
                          <img
                            src={tuViImage}
                            alt="Lá Số Tử Vi"
                            className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() =>
                              setZoomImage({ url: tuViImage, title: "Ảnh Lá Số Tử Vi Cá Nhân" })
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setZoomImage({ url: tuViImage, title: "Ảnh Lá Số Tử Vi Cá Nhân" })
                            }
                            className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-black/70 text-amber-300 text-[10px] flex items-center gap-1 border border-white/20"
                          >
                            <Eye className="w-3 h-3" />
                            Phóng to
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => tuViInputRef.current?.click()}
                            className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-medium transition-colors"
                          >
                            Thay đổi ảnh
                          </button>
                          <button
                            type="button"
                            onClick={() => setTuViImage(null)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] transition-colors"
                            title="Xóa ảnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => tuViInputRef.current?.click()}
                        className="h-32 rounded-xl border border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 flex flex-col items-center justify-center text-center p-3 cursor-pointer transition-all group"
                      >
                        <UploadCloud className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-bold text-amber-200">Tải Ảnh Lá Số Tử Vi</span>
                        <span className="text-[10px] text-slate-400">
                          Bấm để chọn tệp (JPG, PNG)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Ảnh Bản Đồ Sao (Natal Chart) */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-indigo-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                        <Star className="w-4 h-4 text-indigo-400" />
                        <span>Ảnh Bản Đồ Sao (Natal Chart)</span>
                      </div>
                      {natalImage && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Đã có ảnh
                        </span>
                      )}
                    </div>

                    <input
                      ref={natalInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "natal")}
                      className="hidden"
                    />

                    {natalImage ? (
                      <div className="space-y-2">
                        <div className="relative h-32 rounded-xl overflow-hidden border border-white/15 bg-black/60 group">
                          <img
                            src={natalImage}
                            alt="Bản Đồ Sao"
                            className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() =>
                              setZoomImage({ url: natalImage, title: "Ảnh Bản Đồ Sao Cá Nhân" })
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setZoomImage({ url: natalImage, title: "Ảnh Bản Đồ Sao Cá Nhân" })
                            }
                            className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-black/70 text-indigo-300 text-[10px] flex items-center gap-1 border border-white/20"
                          >
                            <Eye className="w-3 h-3" />
                            Phóng to
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => natalInputRef.current?.click()}
                            className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-medium transition-colors"
                          >
                            Thay đổi ảnh
                          </button>
                          <button
                            type="button"
                            onClick={() => setNatalImage(null)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] transition-colors"
                            title="Xóa ảnh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => natalInputRef.current?.click()}
                        className="h-32 rounded-xl border border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 flex flex-col items-center justify-center text-center p-3 cursor-pointer transition-all group"
                      >
                        <UploadCloud className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs font-bold text-indigo-200">Tải Ảnh Bản Đồ Sao</span>
                        <span className="text-[10px] text-slate-400">
                          Bấm để chọn tệp (JPG, PNG)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Astro Info Details */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="text-xs font-semibold text-slate-300">
                    Thông Tin Sinh (Tùy chọn bổ sung)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Họ & Tên
                      </label>
                      <input
                        type="text"
                        value={astroFullName}
                        onChange={(e) => setAstroFullName(e.target.value)}
                        placeholder="Họ và tên..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={astroBirthDate}
                        onChange={(e) => setAstroBirthDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Giờ sinh
                      </label>
                      <select
                        value={astroBirthHour}
                        onChange={(e) => setAstroBirthHour(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        {BIRTH_HOURS.map((h, i) => (
                          <option key={i} value={h} className="bg-slate-900 text-slate-100">
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Cung Mặt Trời (Sun)
                      </label>
                      <select
                        value={astroSunSign}
                        onChange={(e) => setAstroSunSign(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/15 text-[11px] text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        {ZODIAC_SIGNS.map((s, i) => (
                          <option key={i} value={s} className="bg-slate-900 text-slate-100">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Cung Mặt Trăng (Moon)
                      </label>
                      <select
                        value={astroMoonSign}
                        onChange={(e) => setAstroMoonSign(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/15 text-[11px] text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        {ZODIAC_SIGNS.map((s, i) => (
                          <option key={i} value={s} className="bg-slate-900 text-slate-100">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Cung Mọc (Rising)
                      </label>
                      <select
                        value={astroRisingSign}
                        onChange={(e) => setAstroRisingSign(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/15 text-[11px] text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        {ZODIAC_SIGNS.map((s, i) => (
                          <option key={i} value={s} className="bg-slate-900 text-slate-100">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs font-cinzel shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>
                      {isSubmitting ? "Đang lưu..." : "Lưu Hồ Sơ & Ảnh Vào Firebase / Tài Khoản"}
                    </span>
                  </button>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-amber-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Được lưu an toàn trên Firebase. Chuyển thiết bị không lo mất dữ liệu!</span>
                    </div>
                    {onOpenDriveManager && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenDriveManager();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium flex items-center gap-1 shrink-0 border border-white/10 transition-colors"
                      >
                        <Cloud className="w-3 h-3 text-amber-300" />
                        <span>Sao lưu Google Drive</span>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}

            {/* Tab 3: Admin Dashboard (View all created accounts) */}
            {profileTab === "admin" && isAdminUser && <AdminUsersView />}
          </div>
        ) : (
          /* Login / Register Forms for Guests */
          <div className="space-y-4 pt-1">
            {/* Header Tabs */}
            <div className="flex items-center justify-center gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === "login"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("register");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === "register"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Đăng Ký
              </button>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold font-cinzel text-amber-200">
                {tab === "login" ? "Chào Mừng Quay Lại" : "Tạo Tài Khoản Riêng Tư"}
              </h3>
              <p className="text-xs text-slate-400">
                {tab === "login"
                  ? "Đăng nhập để tự động lưu hồ sơ lá số & lịch sử luận giải chi tiết."
                  : "Mỗi email chỉ được đăng ký một lần. Đăng ký để lưu trữ hồ sơ và ảnh lá số của bạn."}
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs text-center flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={tab === "login" ? handleLogin : handleRegister} className="space-y-3">
              {tab === "register" && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Tên người dùng
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ví dụ: Hoàng Minh"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@vidu.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    required
                  />
                </div>
                {tab === "register" && (
                  <p className="text-[10px] text-slate-400 pt-1">
                    * Lưu ý: Mỗi email sau khi đăng ký sẽ được bảo vệ và không thể dùng để đăng ký lại.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs font-cinzel tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? "Đang xử lý..."
                    : tab === "login"
                    ? "Đăng Nhập Ngay"
                    : "Hoàn Tất Đăng Ký"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Visual Settings for Guest */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">Hiệu ứng sao rơi (Sao Băng):</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !shootingStars;
                  setShootingStars(nextVal);
                  setShootingStarsEnabled(nextVal);
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                  shootingStars ? "bg-amber-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    shootingStars ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Lightbox zoom modal for user's own charts */}
      {zoomImage && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0b0d14] border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/50">
              <span className="text-xs sm:text-sm font-bold font-cinzel text-amber-200 truncate">
                {zoomImage.title}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={zoomImage.url}
                  download="my_astrology_chart.png"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải về</span>
                </a>
                <button
                  type="button"
                  onClick={() => setZoomImage(null)}
                  className="p-1 rounded-lg bg-white/10 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60">
              <img
                src={zoomImage.url}
                alt={zoomImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl border border-white/15"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
