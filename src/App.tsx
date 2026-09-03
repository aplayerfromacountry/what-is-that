import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DailyOverviewColumn } from "./components/DailyOverviewColumn";
import { TuViSection } from "./components/TuViSection";
import { NatalChartSection } from "./components/NatalChartSection";
import { TarotSection } from "./components/TarotSection";
import { KinhDichSection } from "./components/KinhDichSection";
import { HistorySection } from "./components/HistorySection";
import { EntranceScreen } from "./components/EntranceScreen";
import { HubSelectionScreen } from "./components/HubSelectionScreen";
import { MusicPlayer } from "./components/MusicPlayer";
import { ShootingStarsBackground } from "./components/ShootingStarsBackground";
import { PersonalizedDailyModal } from "./components/PersonalizedDailyModal";
import { AuthModal, UserProfile, getStoredUser } from "./components/AuthModal";
import { TabType } from "./types";
import { getHistory, syncUserHistoryFromServer, clearLocalHistoryOnLogout } from "./utils/historyStorage";
import { X, Sparkles, Compass, DoorOpen, Grid, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ScreenMode = "entrance" | "selection" | "content";

export default function App() {
  const [screenMode, setScreenMode] = useState<ScreenMode>("entrance");
  const [activeTab, setActiveTab] = useState<TabType>("tu-vi");
  const [showDailyMobile, setShowDailyMobile] = useState<boolean>(false);
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isPersonalizedModalOpen, setIsPersonalizedModalOpen] = useState<boolean>(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<"account" | "astro" | "admin">("account");

  const refreshHistoryCount = () => {
    const list = getHistory();
    setHistoryCount(list.length);
  };

  const handleUserChange = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      syncUserHistoryFromServer(user.email || user.id).then(() => {
        refreshHistoryCount();
      });
    } else {
      clearLocalHistoryOnLogout();
      setHistoryCount(0);
    }
  };

  const handleOpenAuth = (initialTab: "account" | "astro" | "admin" = "account") => {
    setAuthModalInitialTab(initialTab);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const stored = getStoredUser();
    setCurrentUser(stored);

    if (stored) {
      syncUserHistoryFromServer(stored.email || stored.id).then(() => {
        refreshHistoryCount();
      });

      // Ensure session is backed up to server database
      if (stored.email) {
        fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stored),
        }).catch((e) => console.warn("App mount sync failed:", e));
      }
    } else {
      // Guest or logged out: ensure local history is empty
      clearLocalHistoryOnLogout();
      setHistoryCount(0);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 relative">
      {/* Dynamic Shooting Stars & Mystic Celestial Starfield */}
      <ShootingStarsBackground />

      <AnimatePresence mode="wait">
        {/* Screen 1: Entrance Screen (Màn hình Chờ) */}
        {screenMode === "entrance" && (
          <EntranceScreen
            key="entrance-screen"
            onEnter={() => {
              setScreenMode("selection");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onOpenAuth={handleOpenAuth}
            currentUser={currentUser}
          />
        )}

        {/* Screen 2: Hub Selection Screen (Màn hình Lựa Chọn: 4 Ô to & 1 Ô nhỏ Lịch sử) */}
        {screenMode === "selection" && (
          <HubSelectionScreen
            key="hub-selection-screen"
            onSelectOption={(chosenTab) => {
              setActiveTab(chosenTab);
              setScreenMode("content");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onOpenAuth={handleOpenAuth}
            currentUser={currentUser}
            historyCount={historyCount}
            onReturnToEntrance={() => {
              setScreenMode("entrance");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {/* Screen 3: Detail Content Screen (Màn hình Luận Giải Chi Tiết) */}
        {screenMode === "content" && (
          <motion.div
            key="content-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="min-h-screen bg-[#08080a] text-slate-100 flex flex-col relative overflow-hidden"
          >
            {/* Ambient background glow orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
              <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
              <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[140px]" />
              <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px]" />
              <div className="absolute top-2/3 left-[-10%] w-[450px] h-[450px] bg-cyan-600/8 rounded-full blur-[130px]" />
            </div>

            {/* App Header */}
            <div className="relative z-40">
              <Header
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                showDailyMobile={showDailyMobile}
                onToggleDailyMobile={() => setShowDailyMobile(!showDailyMobile)}
                historyCount={historyCount}
                onReturnToEntrance={() => {
                  setScreenMode("entrance");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onReturnToSelection={() => {
                  setScreenMode("selection");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onOpenAuth={handleOpenAuth}
                currentUser={currentUser}
              />
            </div>

            {/* Main Container */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 relative z-10">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Main Content Area */}
                <div className="flex-1 min-w-0 w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    >
                      {activeTab === "tu-vi" && (
                        <TuViSection
                          onSavedToHistory={refreshHistoryCount}
                          currentUser={currentUser}
                          onOpenAuth={() => setIsAuthModalOpen(true)}
                          onUpdateUser={setCurrentUser}
                        />
                      )}
                      {activeTab === "natal-chart" && (
                        <NatalChartSection
                          onSavedToHistory={refreshHistoryCount}
                          currentUser={currentUser}
                          onOpenAuth={() => setIsAuthModalOpen(true)}
                          onUpdateUser={setCurrentUser}
                        />
                      )}
                      {activeTab === "tarot" && (
                        <TarotSection onSavedToHistory={refreshHistoryCount} />
                      )}
                      {activeTab === "kinh-dich" && (
                        <KinhDichSection onSavedToHistory={refreshHistoryCount} />
                      )}
                      {activeTab === "history" && (
                        <HistorySection
                          onSelectType={(type) => {
                            setActiveTab(type);
                          }}
                          onHistoryChanged={refreshHistoryCount}
                          currentUser={currentUser}
                          onOpenAuth={() => setIsAuthModalOpen(true)}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Daily Overview Sidebar (Visible on desktop) */}
                <div className="hidden lg:block">
                  <DailyOverviewColumn
                    currentUser={currentUser}
                    onOpenAuth={() => handleOpenAuth("account")}
                    onOpenPersonalizedModal={() => setIsPersonalizedModalOpen(true)}
                    onOpenUploadAstro={() => handleOpenAuth("astro")}
                  />
                </div>
              </div>
            </main>

            {/* Mobile Drawer for Daily Overview */}
            {showDailyMobile && (
              <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-md flex justify-end transition-all">
                <div className="w-full max-w-sm glass-panel bg-[#08080a]/90 backdrop-blur-2xl h-full overflow-y-auto p-4 flex flex-col gap-4 border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-amber-400" />
                      <span className="font-cinzel font-bold text-sm text-amber-300">
                        Tổng Quan Năng Lượng Ngày
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDailyMobile(false)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <DailyOverviewColumn
                    currentUser={currentUser}
                    onOpenAuth={() => {
                      setShowDailyMobile(false);
                      handleOpenAuth("account");
                    }}
                    onOpenPersonalizedModal={() => {
                      setShowDailyMobile(false);
                      setIsPersonalizedModalOpen(true);
                    }}
                    onOpenUploadAstro={() => {
                      setShowDailyMobile(false);
                      handleOpenAuth("astro");
                    }}
                  />
                </div>
              </div>
            )}

            {/* App Footer */}
            <footer className="mt-12 border-t border-white/10 bg-black/40 backdrop-blur-xl py-8 text-center text-xs text-slate-400 relative z-10">
              <div className="max-w-7xl mx-auto px-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-amber-400 font-cinzel font-semibold">
                  <Sparkles className="w-4 h-4" />
                  A PRIVATE PLACE • VŨ TRỤ CHIÊM BÁI & TRIẾT HỌC
                </div>
                <p className="text-slate-400 max-w-xl mx-auto leading-relaxed text-xs">
                  Không gian kín đáo kết hợp Tử Vi Đẩu Số, Bản Đồ Sao, Tarot 78 Lá và Kinh Dịch 64 Quẻ với sự đồng hành chân thành và thấu cảm.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setScreenMode("selection");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors text-xs font-semibold"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    Màn Hình Lựa Chọn (4 Ô To)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScreenMode("entrance");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 border border-white/10 transition-colors text-xs font-medium"
                  >
                    <DoorOpen className="w-3.5 h-3.5" />
                    Cổng Vào (Entrance)
                  </button>

                  <a
                    href="https://facebook.com/chuhetrongrapxiec"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/30 transition-colors text-xs font-semibold"
                  >
                    <Facebook className="w-3.5 h-3.5 text-blue-400" />
                    <span>Facebook</span>
                  </a>
                </div>
                <p className="text-slate-500 text-[11px] pt-1">
                  © {new Date().getFullYear()} A Private Place.
                </p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Music Player across 4-box screen, content and everywhere */}
      <MusicPlayer currentUser={currentUser} />

      {/* Global Auth Modal for Login / Register */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUserChange}
        initialProfileTab={authModalInitialTab}
      />

      {/* Global Personalized Daily Modal */}
      <PersonalizedDailyModal
        isOpen={isPersonalizedModalOpen}
        onClose={() => setIsPersonalizedModalOpen(false)}
        currentUser={currentUser}
        onOpenUploadAstro={() => {
          setIsPersonalizedModalOpen(false);
          handleOpenAuth("astro");
        }}
      />
    </div>
  );
}
