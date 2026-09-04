import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Sun,
  Moon,
  Compass,
  Calendar,
  Clock,
  ExternalLink,
  UploadCloud,
  FileImage,
  RefreshCw,
  Copy,
  Check,
  Quote,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, DailyLunarInfo } from "../types";
import { getDailyLunarInfo } from "../utils/lunarCalendar";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface PersonalizedDailyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenUploadAstro: () => void;
}

export const PersonalizedDailyModal: React.FC<PersonalizedDailyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenUploadAstro,
}) => {
  const [lunarInfo, setLunarInfo] = useState<DailyLunarInfo | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const tuViImage = currentUser?.astroProfile?.tuViImageUrl || null;
  const natalChartImage = currentUser?.astroProfile?.natalChartImageUrl || null;
  const hasBoth = !!tuViImage && !!natalChartImage;
  const hasOne = !!tuViImage || !!natalChartImage;
  const hasAstroImage = hasBoth || hasOne;

  useEffect(() => {
    if (isOpen) {
      const info = getDailyLunarInfo();
      setLunarInfo(info);
      if (currentUser?.isLoggedIn && hasAstroImage) {
        const cacheKey = `daily_analysis_${currentUser.email || currentUser.id || "user"}_${info.solarDate}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.reading) setReading(parsed.reading);
            if (parsed.metrics) setMetrics(parsed.metrics);
            if (parsed.reading && parsed.metrics) return;
          } catch (e) {}
        }
        fetchDailyPersonalizedEnergy(info);
      } else {
        setReading(null);
        setMetrics(null);
      }
    }
  }, [isOpen, tuViImage, natalChartImage, currentUser?.isLoggedIn, currentUser?.email, currentUser?.id]);

  const fetchDailyPersonalizedEnergy = async (infoOverride?: DailyLunarInfo) => {
    if (!hasAstroImage) return;
    const info = infoOverride || lunarInfo || getDailyLunarInfo();
    setIsLoading(true);
    try {
      const res = await fetch("/api/daily-personalized-energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: currentUser?.name || "Bạn",
          tuViImage,
          natalChartImage,
          astroProfile: currentUser?.astroProfile,
          dateStr: info.solarDate,
          lunarInfo: info,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.reading) setReading(data.reading);
        if (data.metrics) setMetrics(data.metrics);
        if (currentUser?.isLoggedIn) {
          try {
            const cacheKey = `daily_analysis_${currentUser.email || currentUser.id || "user"}_${info.solarDate}`;
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ reading: data.reading, metrics: data.metrics })
            );
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("Error fetching personalized daily energy:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reading) return;
    navigator.clipboard.writeText(reading);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c0e14] border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        >
          {/* Top Decorative Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-80 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="relative z-10 flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-cinzel text-amber-200 tracking-wide">
                    Năng Lượng Của Ngày
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Tử Vi & Chiêm Tinh
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Phối hợp Thiên thời, Địa lợi & Tinh bàn cá nhân hóa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchDailyPersonalizedEnergy()}
                disabled={isLoading}
                className="p-2 rounded-xl glass-card hover:bg-white/10 text-slate-300 hover:text-amber-300 transition-colors disabled:opacity-50"
                title="Làm mới luận giải năng lượng"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl glass-card hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Quick Status Bar: Date info + Energy score + Profile Astro Link status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Box 1: Solar & Lunar Date */}
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>Thời Khắc Hôm Nay</span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-100">
                    {lunarInfo?.solarDate || "Ngày hôm nay"}
                  </div>
                  <div className="text-xs text-amber-300 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5" />
                    <span>{lunarInfo?.lunarDateStr || "Âm lịch"}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Can Chi: <strong className="text-emerald-300">{lunarInfo?.canChiDay}</strong> • {lunarInfo?.element}
                  </div>
                </div>
              </div>

              {/* Box 2: Energy score */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/15 via-amber-600/10 to-transparent border border-amber-400/30 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Chỉ Số Cát Hung
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 font-bold">
                    {hasAstroImage ? (metrics?.statusLabel || "Đại Cát Hanh Thông") : "Cần 1 Trong 2 Ảnh"}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-cinzel">
                    {hasAstroImage ? (metrics?.overallScore || 88) : "--"}
                    <span className="text-sm font-normal text-amber-400/70">/100</span>
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {hasAstroImage ? "Bám Sát Hồ Sơ" : "Chưa Bắt Đầu"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {hasAstroImage
                    ? "Tần số năng lượng đã đối chiếu với các cung sao và góc chiếu"
                    : "Cần tải 1 trong 2 file ảnh (Bản đồ sao / Lá số Tử Vi) để bắt đầu phân tích"}
                </p>
              </div>

              {/* Box 3: Astro Profile images status & link */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-400/30 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-indigo-400" />
                    Hồ Sơ Luận Giải
                  </span>
                  {hasBoth ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Đầy Đủ 2 Ảnh
                    </span>
                  ) : hasOne ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Có 1 Ảnh Lá Số
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-white/20">
                      Chưa Tải Lá Số
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <span
                      className={`inline-block w-5 h-5 rounded-full border text-[9px] flex items-center justify-center font-bold ${
                        tuViImage
                          ? "bg-amber-500/40 border-amber-400 text-amber-200"
                          : "bg-slate-800 border-slate-700 text-slate-500"
                      }`}
                      title="Lá Số Tử Vi"
                    >
                      T
                    </span>
                    <span
                      className={`inline-block w-5 h-5 rounded-full border text-[9px] flex items-center justify-center font-bold ${
                        natalChartImage
                          ? "bg-indigo-500/40 border-indigo-400 text-indigo-200"
                          : "bg-slate-800 border-slate-700 text-slate-500"
                      }`}
                      title="Bản Đồ Sao"
                    >
                      B
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 truncate">
                    {hasBoth
                      ? "Đã kết hợp cả Tử Vi & Chiêm Tinh"
                      : hasOne
                      ? "Đã kết hợp 1 ảnh hồ sơ"
                      : "Chưa tải ảnh lá số riêng"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onOpenUploadAstro}
                  className="mt-2 text-[11px] font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{hasBoth ? "Xem / Thay Đổi Ảnh Lá Số" : "Tải Ảnh Để AI Luận Chuẩn Xác"} ↗</span>
                </button>
              </div>
            </div>

            {/* If user has chart image: render Concrete Numbers & Metric Gauge Bar */}
            {hasAstroImage && metrics && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/[0.08] via-indigo-500/[0.06] to-purple-500/[0.08] border border-amber-400/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider font-cinzel">
                      Bảng Con Số Năng Lượng Cá Nhân Hóa (Bám Sát Lá Số)
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/40">
                    Xác suất thành công: {metrics.successProbability}%
                  </span>
                </div>

                {/* Metric Bars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Tài Lộc & KD</span>
                      <span className="text-amber-300 font-extrabold">{metrics.fortuneScore}/100</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full transition-all duration-700"
                        style={{ width: `${metrics.fortuneScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Sự Nghiệp</span>
                      <span className="text-sky-300 font-extrabold">{metrics.careerScore}/100</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-500 to-cyan-300 h-full rounded-full transition-all duration-700"
                        style={{ width: `${metrics.careerScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Nhân Duyên</span>
                      <span className="text-rose-300 font-extrabold">{metrics.loveScore}/100</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-rose-500 to-pink-300 h-full rounded-full transition-all duration-700"
                        style={{ width: `${metrics.loveScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Thân Tâm</span>
                      <span className="text-emerald-300 font-extrabold">{metrics.healthScore}/100</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all duration-700"
                        style={{ width: `${metrics.healthScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Specific Metrics: Hours & Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Khung Giờ Hoàng Đạo Vượng Khí:
                    </span>
                    <span className="text-amber-200 font-bold">
                      {metrics.peakHours?.join(" & ") || "08:30 - 10:15 & 15:00 - 16:45"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      Bộ Con Số Cát Tường May Mắn:
                    </span>
                    <div className="flex gap-1.5">
                      {(metrics.luckyNumbers || [3, 8, 19, 27]).map((num: number, idx: number) => (
                        <span
                          key={idx}
                          className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold flex items-center justify-center text-xs shadow-sm"
                        >
                          {num < 10 ? `0${num}` : num}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* When NO chart is present: Display friendly guide banner */}
            {!hasAstroImage && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-indigo-600/10 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <FileImage className="w-4 h-4 text-amber-400" />
                    <span>Cần 1 trong 2 file ảnh để bắt đầu phân tích</span>
                  </div>
                  <p className="text-slate-300 text-[11px] max-w-xl">
                    Hệ thống yêu cầu ảnh <strong>Bản đồ sao</strong> hoặc <strong>Lá số Tử Vi</strong> để AI giải mã các cung sao, tính toán chỉ số cát hung và phân tích năng lượng ngày bám sát mệnh bạn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenUploadAstro}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold whitespace-nowrap transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Tải Ảnh Ngay</span>
                </button>
              </div>
            )}

            {/* AI Reading Container */}
            <div className="rounded-2xl glass-panel p-5 sm:p-6 space-y-4 border border-white/10 relative">
              {!hasAstroImage ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-xl">
                    <FileImage className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h4 className="text-sm font-bold text-amber-200 font-cinzel">
                      Cần Tải 1 Trong 2 File Ảnh Để Bắt Đầu
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Để nhận bản luận giải năng lượng và điểm số cát hung hôm nay, bạn vui lòng tải lên ảnh <strong>Lá số Tử Vi</strong> hoặc <strong>Bản đồ sao</strong> cá nhân.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenUploadAstro}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Tải Bản Đồ Sao / Lá Số Tử Vi</span>
                  </button>
                </div>
              ) : isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-xl animate-pulse">
                      <Sun className="w-7 h-7 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-amber-200 font-cinzel">
                      Đang Quán Chiếu Năng Lượng Ngày Cá Nhân Hóa...
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      AI đang phối hợp các góc chiếu chiêm tinh, cung vị Tử Vi và năng lượng ngày hôm nay để đúc kết chỉ dẫn cho bạn.
                    </p>
                  </div>
                </div>
              ) : reading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 font-cinzel">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Bản Luận Giải Năng Lượng Chi Tiết</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-lg glass-card hover:bg-white/10 text-slate-300 hover:text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  <MarkdownRenderer content={reading} />
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Không thể tải nội dung luận giải. Vui lòng bấm làm mới.
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="relative z-10 p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3 text-xs text-slate-400">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Năng lượng ngày được cập nhật liên tục theo nhật vận & thiên văn học.
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onOpenUploadAstro}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-200 border border-white/10 transition-colors text-xs font-medium flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Quản Lý Ảnh Lá Số</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-bold transition-all shadow-md"
              >
                Đóng
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
