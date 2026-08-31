import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DailyOverviewColumn } from "./components/DailyOverviewColumn";
import { TuViSection } from "./components/TuViSection";
import { NatalChartSection } from "./components/NatalChartSection";
import { TarotSection } from "./components/TarotSection";
import { KinhDichSection } from "./components/KinhDichSection";
import { HistorySection } from "./components/HistorySection";
import { EntranceScreen } from "./components/EntranceScreen";
import { MusicPlayer } from "./components/MusicPlayer";
import { TabType } from "./types";
import { getHistory } from "./utils/historyStorage";
import { X, Sparkles, Compass, DoorOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>("tu-vi");
  const [showDailyMobile, setShowDailyMobile] = useState<boolean>(false);
  const [historyCount, setHistoryCount] = useState<number>(0);

  const refreshHistoryCount = () => {
    const list = getHistory();
    setHistoryCount(list.length);
  };

  useEffect(() => {
    refreshHistoryCount();
  }, [activeTab]);

  return (
    <AnimatePresence mode="wait">
      {!hasEntered ? (
        <EntranceScreen
          key="entrance-screen"
          onEnter={(targetTab) => {
            if (targetTab) {
              setActiveTab(targetTab);
            }
            setHasEntered(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : (
        <motion.div
          key="main-app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen bg-[#08080a] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 relative overflow-hidden"
        >
          {/* Ambient background glow orbs for authentic frosted glass refraction */}
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
              onReturnToEntrance={() => setHasEntered(false)}
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
                      <TuViSection onSavedToHistory={refreshHistoryCount} />
                    )}
                    {activeTab === "natal-chart" && (
                      <NatalChartSection onSavedToHistory={refreshHistoryCount} />
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
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Daily Overview Sidebar (Visible on desktop) */}
              <div className="hidden lg:block">
                <DailyOverviewColumn />
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
                <DailyOverviewColumn />
              </div>
            </div>
          )}

          {/* App Footer */}
          <footer className="mt-12 border-t border-white/10 bg-black/40 backdrop-blur-xl py-8 text-center text-xs text-slate-400 relative z-10">
            <div className="max-w-7xl mx-auto px-4 space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-cinzel font-semibold">
                <Sparkles className="w-4 h-4" />
                A PRIVATE PLACE • VŨ TRỤ CHIÊM BÁI & TRIẾT HỌC ĐÔNG TÂY
              </div>
              <p className="text-slate-400 max-w-xl mx-auto leading-relaxed text-xs">
                Không gian kín đáo kết hợp Tử Vi Đẩu Số, Bản Đồ Sao, Tarot 78 Lá và Kinh Dịch 64 Quẻ với sự đồng hành của các bậc thầy uyên thâm và trực giác.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setHasEntered(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 border border-white/10 transition-colors text-[11px]"
                >
                  <DoorOpen className="w-3.5 h-3.5" />
                  Quay lại Cổng vào (Entrance)
                </button>
              </div>
              <p className="text-slate-500 text-[11px]">
                © {new Date().getFullYear()} A Private Place. Mọi luận giải mang tính chất chiêm nghiệm & khai mở tâm trí.
              </p>
            </div>
          </footer>

          {/* Floating Music Player at bottom-right */}
          <MusicPlayer />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
