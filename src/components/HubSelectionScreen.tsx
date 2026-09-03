import React, { useState, useEffect } from "react";
import {
  Compass,
  Star,
  Sparkles,
  Layers,
  History,
  ArrowRight,
  User,
  LogIn,
  DoorOpen,
  Sparkle,
  UploadCloud,
  ShieldCheck,
  Sun,
  Moon,
  Calendar,
  Zap,
  Quote,
} from "lucide-react";
import { motion } from "motion/react";
import { TabType, DailyLunarInfo } from "../types";
import { UserProfile } from "./AuthModal";
import { getDailyLunarInfo } from "../utils/lunarCalendar";
import { PersonalizedDailyModal } from "./PersonalizedDailyModal";

interface HubSelectionScreenProps {
  onSelectOption: (tab: TabType) => void;
  onOpenAuth: (tab?: "account" | "astro" | "admin") => void;
  currentUser: UserProfile | null;
  historyCount: number;
  onReturnToEntrance: () => void;
}

export const HubSelectionScreen: React.FC<HubSelectionScreenProps> = ({
  onSelectOption,
  onOpenAuth,
  currentUser,
  historyCount,
  onReturnToEntrance,
}) => {
  const [lunarInfo, setLunarInfo] = useState<DailyLunarInfo | null>(null);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setLunarInfo(getDailyLunarInfo());
  }, []);

  const hasTuVi = !!currentUser?.astroProfile?.tuViImageUrl;
  const hasNatal = !!currentUser?.astroProfile?.natalChartImageUrl;
  const hasBothImages = hasTuVi && hasNatal;

  const mainCards = [
    {
      id: "tu-vi" as TabType,
      title: "Tử Vi Đẩu Số",
      subtitle: "Lá số Đông Phương • 12 Cung Vị",
      description:
        "Luận giải chuyên sâu Mệnh, Thân, Quan Lộc, Tài Bạch, Phu Thê, Tử Tức cùng Đại hạn & Tiểu hạn. Hỗ trợ chụp và tải ảnh lá số để phân tích.",
      icon: Compass,
      gradient: "from-amber-500/25 via-amber-600/15 to-transparent",
      borderHover: "hover:border-amber-400/70 hover:shadow-amber-500/20",
      accentBg: "bg-amber-500/20 border-amber-500/40 text-amber-300",
      btnBg: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40",
      tag: "Phương Đông",
    },
    {
      id: "natal-chart" as TabType,
      title: "Bản Đồ Sao Chiêm Tinh",
      subtitle: "Western Natal Chart • Cung & Nhà",
      description:
        "Phân tích vị trí Mặt Trời, Mặt Trăng, Cung Mọc (Rising Sign), 12 Nhà chiêm tinh và các góc chiếu hình học (Trine, Square, Sextile, Opposition).",
      icon: Star,
      gradient: "from-indigo-500/25 via-purple-600/15 to-transparent",
      borderHover: "hover:border-indigo-400/70 hover:shadow-indigo-500/20",
      accentBg: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
      btnBg: "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border-indigo-500/40",
      tag: "Phương Tây",
    },
    {
      id: "tarot" as TabType,
      title: "Trải Bài Tarot 78 Lá",
      subtitle: "Thông Điệp Trực Giác & Năng Lượng",
      description:
        "Bốc và lật bài tương tác 3 lá: Quá Khứ, Hiện Tại, Tương Lai & Lời khuyên Vũ Trụ. Giải tỏa băn khoăn về tình duyên, công việc, tâm lý cá nhân.",
      icon: Sparkles,
      gradient: "from-purple-500/25 via-pink-600/15 to-transparent",
      borderHover: "hover:border-purple-400/70 hover:shadow-purple-500/20",
      accentBg: "bg-purple-500/20 border-purple-500/40 text-purple-300",
      btnBg: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border-purple-500/40",
      tag: "Trực Giác",
    },
    {
      id: "kinh-dich" as TabType,
      title: "Gieo Quẻ Kinh Dịch",
      subtitle: "64 Quẻ Chu Dịch • Hào Động & Biến",
      description:
        "Khởi tâm gieo 3 đồng xu cổ 6 lần để xác lập quẻ Chủ và quẻ Biến. Lắng nghe thông điệp Thoán từ, Tượng từ và Lời hào khuyên răn ứng biến.",
      icon: Layers,
      gradient: "from-yellow-500/25 via-amber-700/15 to-transparent",
      borderHover: "hover:border-amber-400/70 hover:shadow-amber-500/20",
      accentBg: "bg-yellow-500/20 border-yellow-500/40 text-amber-200",
      btnBg: "bg-yellow-500/20 hover:bg-yellow-500/30 text-amber-200 border-yellow-500/40",
      tag: "Đạo Dịch",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen w-full bg-[#07090e] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* Background Animated Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[180px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between gap-4 py-2 border-b border-white/10 pb-4">
        {/* Left: Brand Identity & Return to Entrance */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReturnToEntrance}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 border border-white/10 transition-all flex items-center justify-center shadow-sm group shrink-0"
            title="Quay lại Cổng vào"
          >
            <DoorOpen className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </button>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-cinzel text-base sm:text-lg font-bold text-amber-200 tracking-wider">
              A PRIVATE PLACE
            </span>
          </div>
        </div>

        {/* Right: Astro Upload, Admin & Login/Register */}
        <div className="flex items-center gap-2">
          {/* Lá Số & Bản Đồ Sao Button */}
          <button
            type="button"
            onClick={() => onOpenAuth("astro")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-amber-500/15 to-indigo-500/15 hover:from-amber-500/25 hover:to-indigo-500/25 text-amber-200 border border-amber-500/30 hover:border-amber-400/50 shadow-sm"
            title="Tải ảnh lá số tử vi & bản đồ sao cá nhân"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Lá Số & Bản Đồ Sao</span>
            <span className="sm:hidden">Lá Số</span>
            {(currentUser?.astroProfile?.tuViImageUrl ||
              currentUser?.astroProfile?.natalChartImageUrl) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Admin badge if logged in as admin */}
          {currentUser?.isAdmin && (
            <button
              type="button"
              onClick={() => onOpenAuth("admin")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 border border-amber-400/50 shadow-sm transition-all"
              title="Bảng quản trị tài khoản"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>
          )}

          {/* User / Login Button */}
          <button
            type="button"
            onClick={() => onOpenAuth("account")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              currentUser?.isLoggedIn
                ? "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-sm"
                : "bg-white/10 hover:bg-white/15 text-slate-200 border-white/20 hover:border-amber-400/40"
            }`}
          >
            {currentUser?.isLoggedIn ? (
              <>
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="max-w-[100px] truncate">{currentUser.name}</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Đăng Nhập / Đăng Ký</span>
                <span className="sm:hidden">Tài Khoản</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Hub Stage: Big Daily Energy Card + 4 Cards + 1 Small Card below */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-auto py-4 sm:py-6 flex flex-col items-center space-y-6 sm:space-y-7">
        
        {/* BIG CARD ON TOP: NĂNG LƯỢNG CỦA NGÀY (Personalized Daily Energy) */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          whileHover={{ scale: 1.008 }}
          whileTap={{ scale: 0.992 }}
          onClick={() => setIsDailyModalOpen(true)}
          className="w-full px-2 sm:px-4 cursor-pointer group"
        >
          <div className="relative rounded-3xl glass-panel-gold border border-amber-400/40 hover:border-amber-400/80 p-5 sm:p-6 md:p-7 overflow-hidden shadow-2xl transition-all duration-300 group-hover:shadow-amber-500/20">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar of the Big Card */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/30 to-indigo-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md group-hover:scale-105 transition-transform">
                  <Sun className="w-6 h-6 animate-[spin_20s_linear_infinite]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-2xl font-extrabold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-100 tracking-wide">
                      Năng Lượng Của Ngày
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                      Tử Vi & Chiêm Tinh
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-light mt-0.5">
                    Quán chiếu khí vận thiên văn & tinh bàn cá nhân hóa theo ngày
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 group-hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm">
                <span>Xem Luận Giải Chi Tiết</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Content: 2 Sub-boxes side-by-side */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              
              {/* SUB-BOX 1 (Left - 5 cols): Ô NHỎ GHI NGÀY THÁNG */}
              <div className="md:col-span-5 rounded-2xl bg-black/40 border border-white/10 p-4 sm:p-4.5 flex flex-col justify-between space-y-3 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold font-cinzel text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Thời Khắc Hôm Nay
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    Nhật Vận
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Solar Date */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400 font-medium">Dương Lịch:</span>
                    <span className="font-bold text-slate-100 tracking-wide">
                      {lunarInfo?.solarDate || "Hôm nay"}
                    </span>
                  </div>

                  {/* Lunar Date */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-amber-300" />
                      Âm Lịch:
                    </span>
                    <span className="font-bold text-amber-300">
                      {lunarInfo?.lunarDateStr || "Ngày Âm Lịch"}
                    </span>
                  </div>

                  {/* Can Chi & Element */}
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-400">Can Chi:</span>
                      <strong className="text-emerald-300">{lunarInfo?.canChiDay || "Cát Nhật"}</strong>
                    </div>
                    <div className="text-[11px] text-violet-300 font-medium bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                      {lunarInfo?.element || "Ngũ Hành"}
                    </div>
                  </div>
                </div>
              </div>

              {/* SUB-BOX 2 (Right - 7 cols): BÊN CẠNH GHI NĂNG LƯỢNG & CHỈ SỐ TỐT XẤU THEO LÁ SỐ / BẢN ĐỒ SAO */}
              <div className="md:col-span-7 rounded-2xl bg-gradient-to-br from-amber-500/10 via-indigo-950/30 to-purple-950/20 border border-amber-400/30 p-4 sm:p-4.5 flex flex-col justify-between space-y-3 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold font-cinzel text-amber-300 uppercase tracking-wider">
                      Chỉ Số Năng Lượng & Cát Hung
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Đại Cát Hanh Thông
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Big Score */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-amber-200 font-cinzel drop-shadow-sm">
                      88<span className="text-sm font-normal text-amber-400/70">/100</span>
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-100">
                        Vượng Khí • Thuận Khởi Sự
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Tâm thế sáng suốt, nhân duyên hài hòa
                      </div>
                    </div>
                  </div>

                  {/* Profile Association Badge */}
                  <div className="shrink-0">
                    {hasBothImages ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[11px] font-medium">
                        <Star className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã gắn cả 2 ảnh Lá Số & Bản Đồ Sao</span>
                      </div>
                    ) : hasTuVi || hasNatal ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[11px] font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Đã kết hợp 1 ảnh hồ sơ</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/15 border border-indigo-500/35 text-indigo-200 text-[11px] font-medium">
                        <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Bấm xem chi tiết & nhận lời khuyên cổ nhân</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ancient Wisdom Quote Teaser */}
                <div className="pt-2 border-t border-white/10 flex items-start gap-2 text-xs text-amber-200/90 italic">
                  <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="line-clamp-1">
                    "Quân tử dĩ thuận đức, tích tiểu dĩ cao đại." — Kinh Dịch (Đúc kết năng lượng ngày)
                  </p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Section Divider & Title for 4 Hub Cards */}
        <div className="text-center space-y-2 max-w-2xl mx-auto px-4 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm backdrop-blur-md">
            <Sparkle className="w-3.5 h-3.5" />
            Không Gian Lựa Chọn Chiêm Bái & Luận Giải
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-100 tracking-wide drop-shadow-sm">
            Bạn Muốn Khám Phá Điều Gì?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            Chọn một trong bốn phân hệ dưới đây để bắt đầu luận giải, hoặc mở mục lịch sử để xem lại các kết quả đã lưu.
          </p>
        </div>

        {/* 4 Big Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full px-2 sm:px-4">
          {mainCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectOption(card.id)}
                className={`relative group cursor-pointer rounded-2xl glass-card border border-white/15 p-5 sm:p-7 flex flex-col justify-between overflow-hidden transition-all duration-300 ${card.borderHover} shadow-xl hover:shadow-2xl`}
              >
                {/* Gradient corner accent */}
                <div
                  className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${card.gradient} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                />

                <div className="space-y-3.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg group-hover:scale-110 transition-transform duration-300 ${card.accentBg}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                          {card.tag}
                        </span>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-amber-300 group-hover:border-amber-400/50 group-hover:translate-x-1 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-cinzel text-slate-100 group-hover:text-amber-200 transition-colors">
                      {card.title}
                    </h2>
                    <p className="text-xs font-medium text-amber-300/80 mt-0.5">
                      {card.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                  <span className="text-xs text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
                    Nhấn để bắt đầu luận giải
                  </span>
                  <div
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${card.btnBg}`}
                  >
                    <span>Khám Phá</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 1 Small Card Below: History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectOption("history")}
          className="w-full max-w-xl px-2 sm:px-4 cursor-pointer"
        >
          <div className="rounded-2xl glass-panel-gold border border-amber-400/30 hover:border-amber-400/70 p-4 sm:p-4.5 flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/15 group">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold font-cinzel text-slate-100 group-hover:text-amber-200 transition-colors">
                    Lịch Sử Luận Giải Đã Xem
                  </h3>
                  {historyCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40">
                      {historyCount} bản ghi
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  Xem lại, tra cứu, xuất dữ liệu hoặc xóa các bản luận giải Tử Vi, Bản Đồ Sao, Tarot & Dịch
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 shrink-0 group-hover:bg-amber-500/25 transition-colors">
              <span className="hidden sm:inline">Mở Lịch Sử</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center text-center pt-4 border-t border-white/10 text-xs text-slate-400">
        <p className="text-slate-500 text-[11px]">
          © {new Date().getFullYear()} A Private Place • Không gian huyền học & triết lý sống.
        </p>
      </footer>

      {/* Personalized Daily Modal (Tử Vi & Chiêm Tinh Năng Lượng Ngày) */}
      <PersonalizedDailyModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        currentUser={currentUser}
        onOpenUploadAstro={() => {
          setIsDailyModalOpen(false);
          onOpenAuth("astro");
        }}
      />
    </motion.div>
  );
};
