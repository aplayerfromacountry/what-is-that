import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  Download,
  Calendar,
  Clock,
  Compass,
  Star,
  Sparkles,
  User,
  Mail,
  X,
  AlertCircle,
  FileImage,
  Filter,
} from "lucide-react";
import { UserProfile } from "../types";

interface AdminUsersViewProps {
  onSelectUserForDetail?: (user: UserProfile) => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "has_chart" | "members" | "admins">("all");
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState<string | null>(null);

  const syncAndFetchUsers = async (showManualFeedback: boolean = false) => {
    if (showManualFeedback) setIsSyncing(true);
    else setIsLoading(true);
    setErrorMsg(null);

    // 1. Gather all local accounts that need backup
    try {
      const localAccountsStr = localStorage.getItem("a_private_place_all_users_cache");
      const currentSessionStr = localStorage.getItem("a_private_place_user_session");
      const localAccounts: UserProfile[] = [];

      if (localAccountsStr) {
        try {
          const parsed = JSON.parse(localAccountsStr);
          if (Array.isArray(parsed)) localAccounts.push(...parsed);
        } catch (e) {}
      }
      if (currentSessionStr) {
        try {
          const session = JSON.parse(currentSessionStr);
          if (session && session.email && !localAccounts.some((a) => a.email?.toLowerCase() === session.email?.toLowerCase())) {
            localAccounts.push(session);
          }
        } catch (e) {}
      }

      // If we have local accounts, push them to server database for persistent backup
      if (localAccounts.length > 0) {
        await fetch("/api/admin/sync-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accounts: localAccounts }),
        }).catch((e) => console.warn("Background sync accounts failed:", e));
      }
    } catch (err) {
      console.warn("Error checking local accounts before fetch:", err);
    }

    // 2. Fetch full list from server
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
        // Update local cache with latest server list
        try {
          localStorage.setItem("a_private_place_all_users_cache", JSON.stringify(data.users));
        } catch (e) {}
        if (showManualFeedback) {
          setSyncMessage(`Đã đồng bộ & sao lưu thành công ${data.users.length} tài khoản lên máy chủ!`);
          setTimeout(() => setSyncMessage(null), 3500);
        }
      } else {
        setErrorMsg(data.error || "Không thể tải danh sách tài khoản.");
      }
    } catch (err: any) {
      console.warn("Failed to fetch users from API, using local cache:", err);
      // Fallback local accounts
      try {
        const localData = localStorage.getItem("a_private_place_all_users_cache");
        if (localData) {
          setUsers(JSON.parse(localData));
        }
      } catch (e) {
        setErrorMsg("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncAndFetchUsers(false);
  }, []);

  const handleExportBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        totalUsers: users.length,
        users,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `a_private_place_users_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Không thể xuất file sao lưu.");
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (email === "aha@aha.com") {
      alert("Không thể xóa tài khoản Quản Trị Viên chính!");
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.email !== email));
        setDeleteEmailConfirm(null);
      } else {
        alert(data.error || "Không thể xóa tài khoản.");
      }
    } catch (e) {
      alert("Lỗi kết nối khi xóa tài khoản.");
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.astroProfile?.fullName?.toLowerCase().includes(q) ||
      u.astroProfile?.sunSign?.toLowerCase().includes(q);

    if (!matchQuery) return false;

    if (filterType === "has_chart") {
      return Boolean(u.astroProfile?.tuViImageUrl || u.astroProfile?.natalChartImageUrl);
    }
    if (filterType === "members") {
      return !u.isAdmin;
    }
    if (filterType === "admins") {
      return u.isAdmin;
    }

    return true;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.isAdmin).length;
  const memberCount = totalUsers - adminCount;
  const usersWithCharts = users.filter(
    (u) => u.astroProfile?.tuViImageUrl || u.astroProfile?.natalChartImageUrl
  ).length;

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold font-cinzel text-amber-200 flex items-center gap-2">
              Bảng Quản Trị Hệ Thống
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/30 text-amber-300 font-sans border border-amber-400/30">
                Admin: aha@aha.com
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Xem và quản lý tất cả các tài khoản người dùng đã được tạo trên web.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => syncAndFetchUsers(true)}
            disabled={isLoading || isSyncing}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Đồng bộ tất cả tài khoản từ bộ nhớ trình duyệt và máy chủ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || isLoading ? "animate-spin text-amber-300" : ""}`} />
            <span>{isSyncing ? "Đang sao lưu..." : "Sao Lưu & Đồng Bộ"}</span>
          </button>

          <button
            type="button"
            onClick={handleExportBackup}
            disabled={users.length === 0}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-amber-300 border border-white/15 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Tải về file JSON sao lưu toàn bộ danh sách tài khoản"
          >
            <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
            <span className="hidden sm:inline">Xuất File JSON</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-2.5 px-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in">
          <span>{syncMessage}</span>
          <span className="text-[10px] text-emerald-400/70">Đã lưu trữ an toàn</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center space-y-0.5">
          <div className="text-lg sm:text-xl font-bold font-cinzel text-amber-300">{totalUsers}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Users className="w-3 h-3 text-amber-400" />
            Tổng tài khoản
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center space-y-0.5">
          <div className="text-lg sm:text-xl font-bold font-cinzel text-emerald-300">{memberCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <User className="w-3 h-3 text-emerald-400" />
            Thành viên
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center space-y-0.5">
          <div className="text-lg sm:text-xl font-bold font-cinzel text-indigo-300">{usersWithCharts}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <FileImage className="w-3 h-3 text-indigo-400" />
            Đã tải lá số/bản đồ
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-center space-y-0.5">
          <div className="text-lg sm:text-xl font-bold font-cinzel text-purple-300">{adminCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            Quản trị viên
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, cung hoàng đạo..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
              filterType === "all"
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                : "bg-white/5 text-slate-400 hover:text-slate-200"
            }`}
          >
            Tất cả ({totalUsers})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("has_chart")}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
              filterType === "has_chart"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/40"
                : "bg-white/5 text-slate-400 hover:text-slate-200"
            }`}
          >
            Có ảnh lá số ({usersWithCharts})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("members")}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
              filterType === "members"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                : "bg-white/5 text-slate-400 hover:text-slate-200"
            }`}
          >
            Thành viên ({memberCount})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Users List Container */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
            <span>Đang tải danh sách tài khoản...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs rounded-xl bg-black/30 border border-white/10">
            Không tìm thấy tài khoản nào phù hợp với tìm kiếm.
          </div>
        ) : (
          filteredUsers.map((user, idx) => {
            const hasTuVi = Boolean(user.astroProfile?.tuViImageUrl);
            const hasNatal = Boolean(user.astroProfile?.natalChartImageUrl);
            const isTargetAdmin = user.email === "aha@aha.com" || user.isAdmin;

            return (
              <div
                key={user.email || idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  isTargetAdmin
                    ? "bg-gradient-to-br from-amber-500/10 via-black/40 to-yellow-500/5 border-amber-500/30 shadow-md shadow-amber-500/5"
                    : "bg-black/40 hover:bg-white/[0.03] border-white/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: User details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500/30 to-indigo-500/30 border border-white/20 flex items-center justify-center text-xs font-bold text-amber-300 font-cinzel">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="font-bold text-sm text-slate-100 truncate">
                        {user.name || "Chưa đặt tên"}
                      </span>

                      {isTargetAdmin ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Quản Trị Viên (Admin)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300 border border-white/15">
                          Thành viên
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400">
                      <div className="flex items-center gap-1 text-amber-200/90">
                        <Mail className="w-3 h-3 text-amber-400" />
                        <span>{user.email}</span>
                      </div>

                      {user.createdAt && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>Tạo: {new Date(user.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      )}
                    </div>

                    {/* Astrological Info Summary if filled */}
                    {user.astroProfile && (
                      <div className="pt-1.5 flex flex-wrap gap-1.5">
                        {user.astroProfile.birthDate && (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300">
                            Sinh: {user.astroProfile.birthDate} ({user.astroProfile.birthHour || "Giờ --"})
                          </span>
                        )}
                        {user.astroProfile.gender && (
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300">
                            {user.astroProfile.gender}
                          </span>
                        )}
                        {user.astroProfile.sunSign && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300">
                            ☉ {user.astroProfile.sunSign}
                          </span>
                        )}
                        {user.astroProfile.risingSign && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300">
                            Asc: {user.astroProfile.risingSign}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Chart previews & Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    {/* Lá Số Tử Vi preview button */}
                    {hasTuVi ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImage({
                            url: user.astroProfile!.tuViImageUrl!,
                            title: `Ảnh Lá Số Tử Vi • ${user.name} (${user.email})`,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                        title="Xem ảnh lá số tử vi"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Xem Lá Số</span>
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-500 text-[10px]">
                        Chưa có lá số
                      </span>
                    )}

                    {/* Bản Đồ Sao preview button */}
                    {hasNatal ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImage({
                            url: user.astroProfile!.natalChartImageUrl!,
                            title: `Ảnh Bản Đồ Sao • ${user.name} (${user.email})`,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                        title="Xem ảnh bản đồ sao"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Xem Bản Đồ Sao</span>
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-500 text-[10px]">
                        Chưa có bản đồ
                      </span>
                    )}

                    {/* Delete user button (for non-admin accounts) */}
                    {!isTargetAdmin && (
                      <div>
                        {deleteEmailConfirm === user.email ? (
                          <div className="flex items-center gap-1 bg-rose-500/20 border border-rose-500/40 p-1 rounded-lg">
                            <span className="text-[10px] text-rose-300 font-bold px-1">Xóa?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.email)}
                              className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold"
                            >
                              Có
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteEmailConfirm(null)}
                              className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[10px]"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteEmailConfirm(user.email)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-colors"
                            title="Xóa tài khoản này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Image Preview Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#0b0d14] border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/50">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold font-cinzel text-amber-200 truncate max-w-md">
                  {selectedImage.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedImage.url}
                  download="astrology_chart.png"
                  className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tải về máy</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image viewer */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl border border-white/15 shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
