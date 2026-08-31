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
} from "lucide-react";
import { motion } from "motion/react";
import { TabType } from "../types";

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  showDailyMobile: boolean;
  onToggleDailyMobile: () => void;
  historyCount: number;
  onReturnToEntrance?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  showDailyMobile,
  onToggleDailyMobile,
  historyCount,
  onReturnToEntrance,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: "tu-vi", label: "Tử Vi 7 Khía Cạnh", icon: Compass },
    { id: "natal-chart", label: "Bản Đồ Sao", icon: Star },
    { id: "tarot", label: "Bốc Bài Tarot", icon: Sparkles },
    { id: "kinh-dich", label: "Gieo Quẻ Dịch", icon: Layers },
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
      className="sticky top-0 z-40 w-full bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)] transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (onReturnToEntrance) {
                onReturnToEntrance();
              } else {
                onSelectTab("tu-vi");
              }
            }}
            className="flex items-center gap-3 cursor-pointer group"
            title="Nhấn để quay về Màn hình Cổng vào (Entrance)"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg shadow-black/20 group-hover:border-amber-400/50 group-hover:bg-white/[0.08] transition-all duration-300">
              <Compass className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-lg sm:text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-100 drop-shadow-sm">
                  A PRIVATE PLACE
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 tracking-wide hidden xs:block">
                Tử Vi • Bản Đồ Sao • Tarot • Kinh Dịch
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/[0.03] backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
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
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
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

          {/* Mobile Right Action Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Daily Overview toggle */}
            <button
              type="button"
              onClick={onToggleDailyMobile}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1 backdrop-blur-md transition-all ${
                showDailyMobile
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              }`}
              title="Xem tổng quan ngày"
            >
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-medium hidden sm:inline">Tổng quan</span>
            </button>

            {/* Mobile Hamburger menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 hover:text-amber-300 hover:bg-white/10 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#08080a]/95 backdrop-blur-2xl border-b border-white/10 px-4 py-3 space-y-1.5 shadow-2xl animate-in slide-in-from-top duration-200">
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
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
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
        </div>
      )}
    </header>
  );
};
