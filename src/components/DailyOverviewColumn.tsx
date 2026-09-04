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
  Zap,
  Star,
  UploadCloud,
  ChevronRight,
  Lock,
  LogIn,
  FileImage,
} from "lucide-react";
import { getDailyLunarInfo } from "../utils/lunarCalendar";
import { DailyLunarInfo, UserProfile } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface DailyOverviewColumnProps {
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
  onOpenPersonalizedModal?: () => void;
  onOpenUploadAstro?: () => void;
}

export const DailyOverviewColumn: React.FC<DailyOverviewColumnProps> = ({
  currentUser,
  onOpenAuth,
  onOpenPersonalizedModal,
  onOpenUploadAstro,
}) => {
  const [lunarInfo, setLunarInfo] = useState<DailyLunarInfo | null>(null);
  const [aiOverview, setAiOverview] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const hasTuVi = !!currentUser?.astroProfile?.tuViImageUrl;
  const hasNatal = !!currentUser?.astroProfile?.natalChartImageUrl;
  const hasAstroImage = hasTuVi || hasNatal;

  useEffect(() => {
    const info = getDailyLunarInfo();
    setLunarInfo(info);

    if (currentUser?.isLoggedIn && hasAstroImage) {
      const cacheKey = `daily_analysis_${currentUser.email || currentUser.id || "user"}_${info.solarDate}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.overview) setAiOverview(parsed.overview);
          else if (parsed.reading) setAiOverview(parsed.reading);
          if (parsed.metrics) setMetrics(parsed.metrics);
          return;
        } catch (e) {
          // ignore
        }
      }
      // Auto-trigger analysis for logged in user with chart image
      fetchAiDailyInsight(info);
    } else {
      setAiOverview(null);
      setMetrics(null);
    }
  }, [
    currentUser?.isLoggedIn,
    currentUser?.email,
    currentUser?.id,
    hasAstroImage,
    currentUser?.astroProfile?.tuViImageUrl,
    currentUser?.astroProfile?.natalChartImageUrl,
  ]);

  const fetchAiDailyInsight = async (infoOverride?: DailyLunarInfo) => {
    const targetInfo = infoOverride || lunarInfo || getDailyLunarInfo();
    if (!targetInfo) return;
    if (!currentUser?.isLoggedIn || !hasAstroImage) return;

    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/daily-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateStr: targetInfo.solarDate,
          lunarInfo: targetInfo,
          userName: currentUser?.name || "Bạn",
          tuViImage: currentUser?.astroProfile?.tuViImageUrl,
          natalChartImage: currentUser?.astroProfile?.natalChartImageUrl,
          astroProfile: currentUser?.astroProfile,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.overview) setAiOverview(data.overview);
        if (data.metrics) setMetrics(data.metrics);
        if (currentUser?.isLoggedIn) {
          try {
            const cacheKey = `daily_analysis_${currentUser.email || currentUser.id || "user"}_${targetInfo.solarDate}`;
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ overview: data.overview, metrics: data.metrics })
            );
          } catch (e) {}
        }
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
              <p className="text-[11px] text-slate-400">
                {currentUser?.isLoggedIn
                  ? hasAstroImage
                    ? "Đã cá nhân hóa theo lá số"
                    : "Cần 1 trong 2 ảnh lá số"
                  : "Khí vận & Thiên văn ngày"}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border shadow-sm ${
              currentUser?.isLoggedIn && hasAstroImage
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : currentUser?.isLoggedIn
                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                : "bg-slate-500/15 text-slate-300 border-slate-500/30"
            }`}
          >
            {currentUser?.isLoggedIn && hasAstroImage
              ? "Đã Khớp Lá Số"
              : currentUser?.isLoggedIn
              ? "Cần Ảnh Lá Số"
              : "Hôm Nay"}
          </span>
        </div>

        {/* Personalized Indicator or CTA */}
        {!currentUser?.isLoggedIn ? (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Năng lượng cát hung cá nhân</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Đăng nhập để xem điểm số & lời khuyên bám sát mệnh
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer"
            >
              Đăng Nhập ↗
            </button>
          </div>
        ) : !hasAstroImage ? (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                <FileImage className="w-3 h-3 text-amber-400" />
                <span>Cần 1 trong 2 ảnh lá số</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Tải lá số Tử Vi hoặc Bản đồ sao để bắt đầu phân tích
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenUploadAstro}
              className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer"
            >
              Tải Lá Số ↗
            </button>
          </div>
        ) : (
          <div className="mb-4 p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-indigo-500/15 border border-emerald-400/30 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Bám Sát Hồ Sơ Bản Mệnh</span>
              </div>
              <p className="text-[10px] text-slate-300">
                {hasTuVi && hasNatal
                  ? "Đầy đủ Lá số Tử Vi & Bản đồ sao"
                  : hasTuVi
                  ? "Khớp theo Lá số Tử Vi"
                  : "Khớp theo Bản đồ sao"}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenPersonalizedModal}
              className="px-2 py-1 rounded-lg bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold whitespace-nowrap transition-colors cursor-pointer"
            >
              Xem Chi Tiết ↗
            </button>
          </div>
        )}

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

        {/* Concrete Energy Metrics Cards (Chỉ số cát hung & năng lượng) */}
        {!currentUser?.isLoggedIn ? (
          /* Khách: Ô Đăng Nhập Để Biết Chỉ Số Cát Hung & Năng Lượng */
          <div className="glass-card rounded-xl p-3.5 space-y-2.5 mb-4 border border-amber-500/25 bg-amber-500/[0.04]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Chỉ Số Cát Hung Hôm Nay:
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Cần Đăng Nhập
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-light">
              Đăng nhập để AI tính toán điểm số cát hung và năng lượng ngày bám sát lá số Tử Vi & Bản đồ sao của bạn.
            </p>
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Đăng Nhập Để Biết
            </button>
          </div>
        ) : !hasAstroImage ? (
          /* Đã đăng nhập nhưng chưa có 1 trong 2 ảnh lá số */
          <div className="glass-card rounded-xl p-3.5 space-y-2.5 mb-4 border border-amber-500/25 bg-amber-500/[0.04]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Chỉ Số Năng Lượng & Cát Hung:
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Cần 1 Trong 2 Ảnh
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-light">
              Cần tải lên <strong className="text-amber-200">Lá số Tử Vi</strong> hoặc <strong className="text-indigo-200">Bản đồ sao</strong> để AI bắt đầu tính toán điểm số cát hung và năng lượng ngày.
            </p>
            <button
              type="button"
              onClick={onOpenUploadAstro}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Tải Bản Đồ Sao / Lá Số Tử Vi
            </button>
          </div>
        ) : (
          metrics && (
            <div className="glass-card rounded-xl p-3 space-y-2.5 mb-4 border border-amber-500/25 bg-amber-500/[0.04]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Chỉ Số Năng Lượng:
                </span>
                <span className="text-amber-200 font-extrabold text-sm font-cinzel">
                  {metrics.overallScore}/100 • {metrics.statusLabel}
                </span>
              </div>
              {/* 4 Mini Progress Bars */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-1.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Tài Lộc</span>
                    <span className="text-amber-300 font-bold">{metrics.fortuneScore}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${metrics.fortuneScore}%` }}
                    />
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Sự Nghiệp</span>
                    <span className="text-sky-300 font-bold">{metrics.careerScore}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${metrics.careerScore}%` }}
                    />
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Nhân Duyên</span>
                    <span className="text-rose-300 font-bold">{metrics.loveScore}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${metrics.loveScore}%` }}
                    />
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Thân Tâm</span>
                    <span className="text-emerald-300 font-bold">{metrics.healthScore}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${metrics.healthScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Lucky Hours */}
        <div className="glass-card rounded-xl p-3 space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {hasAstroImage ? "Giờ Hoàng Đạo Bản Mệnh:" : "Giờ Hoàng Đạo Chung:"}
            </span>
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
        <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
          {!currentUser?.isLoggedIn ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-600/20 to-purple-600/20 hover:from-amber-500/30 hover:via-indigo-600/30 hover:to-purple-600/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] backdrop-blur-md cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              Đăng Nhập Để Nhận Luận Giải Năng Lượng
            </button>
          ) : !hasAstroImage ? (
            <button
              type="button"
              onClick={onOpenUploadAstro}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-600/20 to-purple-600/20 hover:from-amber-500/30 hover:via-indigo-600/30 hover:to-purple-600/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] backdrop-blur-md cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-amber-300" />
              Tải 1 Trong 2 Ảnh Để Bắt Đầu Phân Tích
            </button>
          ) : !aiOverview ? (
            <button
              type="button"
              onClick={() => fetchAiDailyInsight()}
              disabled={isLoadingAi}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-600/20 to-purple-600/20 hover:from-amber-500/30 hover:via-indigo-600/30 hover:to-purple-600/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 backdrop-blur-md cursor-pointer"
            >
              {isLoadingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  Đang cảm nhận khí vận ngày...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Luận Giải Năng Lượng Cá Nhân Hóa
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bản Phân Tích Bám Sát Lá Số
                </span>
                <button
                  type="button"
                  onClick={() => fetchAiDailyInsight()}
                  disabled={isLoadingAi}
                  className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
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

          <button
            type="button"
            onClick={
              !currentUser?.isLoggedIn
                ? onOpenAuth
                : !hasAstroImage
                ? onOpenUploadAstro
                : onOpenPersonalizedModal
            }
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 border border-white/10 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>
              {!currentUser?.isLoggedIn
                ? "Đăng Nhập Xem Toàn Màn Hình"
                : !hasAstroImage
                ? "Tải Ảnh Để Xem Toàn Màn Hình"
                : "Mở Toàn Màn Hình Năng Lượng Ngày"}
            </span>
            <ChevronRight className="w-3 h-3 ml-auto" />
          </button>
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
