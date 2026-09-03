import React from "react";
import {
  Compass,
  Star,
  Sparkles,
  Layers,
  History,
  Sun,
  Menu,
  X,
  Grid,
  DoorOpen,
  User,
  LogIn,
  UploadCloud,
  ShieldCheck,
  FileImage,
} from "lucide-react";
import { motion } from "motion/react";
import { TabType } from "../types";
import { UserProfile } from "./AuthModal";

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  showDailyMobile: boolean;
  onToggleDailyMobile: () => void;
  historyCount: number;
  onReturnToEntrance?: () => void;
  onReturnToSelection?: () => void;
  onOpenAuth?: (initialTab?: "account" | "astro" | "admin") => void;
  currentUser?: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  showDailyMobile,
  onToggleDailyMobile,
  historyCount,
  onReturnToEntrance,
  onReturnToSelection,
  onOpenAuth,
  currentUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: "tu-vi", label: "Tử Vi Đẩu Số", icon: Compass },
    { id: "natal-chart", label: "Bản Đồ Sao", icon: Star },
    { id: "tarot", label: "Bài Tarot", icon: Sparkles },
    { id: "kinh-dich", label: "Kinh Dịch", icon: Layers },
    {
      id: "history",
      label: "Lịch Sử Xem",
      icon: History,
      badge: historyCount > 0 ? `${historyCount}` : undefined,
    },
  ];

  return (
    <header
      id="app-header"
      className="sticky top-0 z-40 w-full bg-black/45 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.35)] transition-all"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Left: Brand Logo & Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (onReturnToSelection) {
                  onReturnToSelection();
                } else if (onReturnToEntrance) {
                  onReturnToEntrance();
                }
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
              title="Nhấn để quay về Màn hình Lựa Chọn"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg shadow-black/20 group-hover:border-amber-400/50 group-hover:bg-white/[0.08] transition-all duration-300">
                <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div>
                <span className="font-cinzel text-base sm:text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 drop-shadow-sm">
                  A PRIVATE PLACE
                </span>
                <p className="text-[10px] text-slate-400 tracking-wide hidden lg:block">
                  Tử Vi • Bản Đồ Sao • Tarot • Kinh Dịch
                </p>
              </div>
            </motion.div>

            {/* Back to Hub / Selection Screen Button */}
            {onReturnToSelection && (
              <button
                type="button"
                onClick={onReturnToSelection}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 border border-white/10 text-xs font-medium transition-colors"
                title="Quay lại Màn hình Lựa Chọn (4 ô to)"
              >
                <Grid className="w-3.5 h-3.5 text-amber-400" />
                <span>Mục xem</span>
              </button>
            )}
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-amber-200"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-400/40 rounded-xl shadow-[0_2px_12px_rgba(251,191,36,0.15),inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`w-4 h-4 relative z-10 ${
                      isActive ? "text-amber-400" : "text-slate-400"
                    }`}
                  />
                  <span className="relative z-10">{tab.label}</span>
                  {tab.badge && (
                    <span className="relative z-10 ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40">
                      {tab.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Right Action Controls: Auth + Astro Chart Upload + Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Button: Lá Số & Bản Đồ Sao Cá Nhân (Quick upload / view) */}
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth("astro")}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-amber-500/15 to-indigo-500/15 hover:from-amber-500/25 hover:to-indigo-500/25 text-amber-200 border border-amber-500/30 hover:border-amber-400/50 shadow-sm"
                title="Tải ảnh lá số tử vi & bản đồ sao cá nhân"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Lá Số & Bản Đồ Sao</span>
                <span className="sm:hidden text-[11px]">Lá Số</span>
                {(currentUser?.astroProfile?.tuViImageUrl ||
                  currentUser?.astroProfile?.natalChartImageUrl) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            )}

            {/* Admin Badge Button (if logged in as aha@aha.com / admin) */}
            {currentUser?.isAdmin && onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth("admin")}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 border border-amber-400/50 shadow-sm transition-all"
                title="Bảng quản trị tài khoản"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* Auth Button */}
            {onOpenAuth && (
              <button
                type="button"
                onClick={() => onOpenAuth("account")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentUser?.isLoggedIn
                    ? "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-sm"
                    : "bg-white/5 hover:bg-white/10 text-slate-200 border-white/15"
                }`}
              >
                {currentUser?.isLoggedIn ? (
                  <>
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span className="max-w-[80px] sm:max-w-[100px] truncate hidden sm:inline">{currentUser.name}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Tài Khoản</span>
                  </>
                )}
              </button>
            )}

            {/* Mobile Daily Overview toggle */}
            <button
              type="button"
              onClick={onToggleDailyMobile}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1 backdrop-blur-md transition-all lg:hidden ${
                showDailyMobile
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
              title="Xem tổng quan ngày"
            >
              <Sun className="w-4 h-4 text-amber-400" />
            </button>

            {/* Mobile Hamburger menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 hover:text-amber-300 hover:bg-white/10 transition-colors md:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#08080a]/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
          {onReturnToSelection && (
            <button
              onClick={() => {
                onReturnToSelection();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30"
            >
              <Grid className="w-4 h-4" />
              <span>Quay lại Màn hình Lựa Chọn (4 ô to)</span>
            </button>
          )}

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-amber-400" : "text-slate-400"
                    }`}
                  />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/30 text-amber-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Mobile Quick Astro & Admin buttons */}
          {onOpenAuth && (
            <div className="pt-1 pb-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenAuth("astro");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/15 to-indigo-500/15 text-amber-200 border border-amber-500/30"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Tải Lá Số & Bản Đồ</span>
              </button>

              {currentUser?.isAdmin ? (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth("admin");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/25 text-amber-300 border border-amber-400/50"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin ({currentUser.email})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth("account");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-200 border border-white/10"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentUser?.isLoggedIn ? "Hồ Sơ Của Tôi" : "Tài Khoản"}</span>
                </button>
              )}
            </div>
          )}

          {onReturnToEntrance && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  onReturnToEntrance();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1.5 px-2 py-1"
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>Quay về Cổng vào</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
