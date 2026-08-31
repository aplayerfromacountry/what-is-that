import React, { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Compass,
  RefreshCw,
  Quote,
} from "lucide-react";
import { getDailyLunarInfo } from "../utils/lunarCalendar";
import { DailyLunarInfo } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";

export const DailyOverviewColumn: React.FC = () => {
  const [lunarInfo, setLunarInfo] = useState<DailyLunarInfo | null>(null);
  const [aiOverview, setAiOverview] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    const info = getDailyLunarInfo();
    setLunarInfo(info);
  }, []);

  const fetchAiDailyInsight = async () => {
    if (!lunarInfo) return;
    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/daily-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateStr: lunarInfo.solarDate,
          lunarInfo,
        }),
      });
      const data = await res.json();
      if (data.success && data.overview) {
        setAiOverview(data.overview);
      }
    } catch (err) {
      console.error("Error fetching AI daily overview:", err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  if (!lunarInfo) return null;

  return (
    <aside
      id="daily-overview-column"
      className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-4"
    >
      {/* Primary Celestial Card */}
      <div className="rounded-2xl glass-panel-gold p-5 relative overflow-hidden backdrop-blur-2xl transition-all">
        {/* Subtle decorative orb */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-sm backdrop-blur-md">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-wider font-bold text-amber-400 font-cinzel">
                Tổng Quan Ngày
              </h2>
              <p className="text-[11px] text-slate-400">Khí vận & Âm dương ngũ hành</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm">
            Hôm Nay
          </span>
        </div>

        {/* Date Display */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              Dương Lịch:
            </span>
            <span className="font-semibold text-slate-100">{lunarInfo.solarDate}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Moon className="w-3.5 h-3.5 text-amber-300" />
              Âm Lịch:
            </span>
            <span className="font-bold text-amber-300">{lunarInfo.lunarDateStr}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Can Chi Ngày:
            </span>
            <span className="font-semibold text-emerald-300">{lunarInfo.canChiDay}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Ngũ Hành:
            </span>
            <span className="font-medium text-violet-300">{lunarInfo.element}</span>
          </div>
        </div>

        {/* Lucky Hours */}
        <div className="glass-card rounded-xl p-3 space-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Giờ Hoàng Đạo (Cát Khí):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {lunarInfo.luckyHours.map((h, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200 backdrop-blur-sm font-medium"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* Suitable & Unsuitable activities */}
        <div className="space-y-2.5 text-xs">
          <div className="space-y-1">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Việc Hanh Thông Nên Làm:
            </span>
            <ul className="pl-5 space-y-0.5 text-slate-300 text-[11px] list-disc">
              {lunarInfo.suitableActivities.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1">
            <span className="flex items-center gap-1.5 font-medium text-rose-400">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              Việc Thận Trọng Cần Tránh:
            </span>
            <ul className="pl-5 space-y-0.5 text-slate-300 text-[11px] list-disc">
              {lunarInfo.unsuitableActivities.map((act, i) => (
                <li key={i}>{act}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI Insight Button & Reveal */}
        <div className="mt-4 pt-3 border-t border-white/10">
          {!aiOverview ? (
            <button
              type="button"
              onClick={fetchAiDailyInsight}
              disabled={isLoadingAi}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-600/20 to-purple-600/20 hover:from-amber-500/30 hover:via-indigo-600/30 hover:to-purple-600/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 backdrop-blur-md"
            >
              {isLoadingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  Đang cảm nhận khí vận ngày...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Nhận Luận Giải Năng Lượng Chi Tiết
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Thông Điệp Khí Vận Ngày
                </span>
                <button
                  type="button"
                  onClick={fetchAiDailyInsight}
                  disabled={isLoadingAi}
                  className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingAi ? "animate-spin" : ""}`} />
                  Cập nhật
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto p-3 rounded-xl glass-card text-xs leading-relaxed">
                <MarkdownRenderer content={aiOverview} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ancient Thought / Proverb card */}
      <div className="rounded-xl glass-panel p-4 text-xs text-slate-300 relative overflow-hidden backdrop-blur-xl">
        <Quote className="w-6 h-6 text-amber-500/20 absolute top-3 right-3 pointer-events-none" />
        <h3 className="font-cinzel text-amber-400 font-bold text-[11px] uppercase tracking-wider mb-1.5">
          Tâm Niệm Ngày
        </h3>
        <p className="italic text-slate-300/90 leading-relaxed">
          "Thuận thiên giả tồn, nghịch thiên giả vong. Hiểu mệnh để an tâm, biết thời để hành động dứt khoát."
        </p>
      </div>
    </aside>
  );
};
