import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  User,
  LogIn,
  Sparkles,
  ShieldCheck,
  History,
  X,
  Lock,
  DoorOpen,
  UploadCloud,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "./AuthModal";

interface EntranceScreenProps {
  onEnter: () => void;
  onOpenAuth: (tab?: "account" | "astro" | "admin") => void;
  currentUser: UserProfile | null;
}

export const EntranceScreen: React.FC<EntranceScreenProps> = ({
  onEnter,
  onOpenAuth,
  currentUser,
}) => {
  const [isHoveringEnter, setIsHoveringEnter] = useState(false);
  const [isEntranceModalOpen, setIsEntranceModalOpen] = useState(false);

  const handleTriggerEnter = () => {
    setIsEntranceModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-10 relative overflow-hidden bg-[#07090e] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* Background Animated Mystic Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-amber-500/15 via-indigo-600/10 to-purple-600/10 rounded-full blur-[160px]"
        />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-cyan-600/8 rounded-full blur-[140px]" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Header: Auth & Astro Buttons */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 w-full max-w-4xl flex items-center justify-end gap-2 pt-2"
      >
        {/* Quick Astro Upload button */}
        <button
          type="button"
          onClick={() => onOpenAuth("astro")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border backdrop-blur-xl bg-gradient-to-r from-amber-500/15 to-indigo-500/15 text-amber-200 border-amber-500/30 hover:border-amber-400/50"
        >
          <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Lá Số & Bản Đồ Sao</span>
          <span className="sm:hidden">Lá Số</span>
          {(currentUser?.astroProfile?.tuViImageUrl ||
            currentUser?.astroProfile?.natalChartImageUrl) && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        {/* Admin Badge button */}
        {currentUser?.isAdmin && (
          <button
            type="button"
            onClick={() => onOpenAuth("admin")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border backdrop-blur-xl bg-amber-500/25 text-amber-300 border-amber-400/50"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin</span>
          </button>
        )}

        {/* Login / Register Button */}
        <button
          type="button"
          onClick={() => onOpenAuth("account")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border backdrop-blur-xl ${
            currentUser?.isLoggedIn
              ? "bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-sm"
              : "bg-white/10 hover:bg-white/15 text-slate-200 border-white/20 hover:border-amber-400/40"
          }`}
        >
          {currentUser?.isLoggedIn ? (
            <>
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[120px] truncate">{currentUser.name}</span>
            </>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Đăng Nhập / Đăng Ký</span>
            </>
          )}
        </button>
      </motion.header>

      {/* Center Main Stage: Mystic Emblem + App Name + Enter Button */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative z-10 w-full max-w-2xl mx-auto my-auto py-12 flex flex-col items-center text-center space-y-8"
      >
        {/* Mystic Emblem Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="relative group cursor-pointer"
          onClick={handleTriggerEnter}
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-600/20 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-700" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/[0.05] border border-white/20 backdrop-blur-2xl flex items-center justify-center shadow-2xl shadow-black/60 group-hover:border-amber-400/60 transition-all duration-500">
            <Compass className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 group-hover:rotate-90 transition-transform duration-700" />
          </div>
        </motion.div>

        {/* App Name */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Vũ Trụ Chiêm Bái & Triết Học
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-cinzel tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-100 drop-shadow-[0_4px_30px_rgba(251,191,36,0.3)]"
          >
            A PRIVATE PLACE
          </motion.h1>
        </div>

        {/* Enter Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleTriggerEnter}
            onMouseEnter={() => setIsHoveringEnter(true)}
            onMouseLeave={() => setIsHoveringEnter(false)}
            className="group relative inline-flex items-center gap-3 px-10 sm:px-12 py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-base sm:text-lg font-cinzel tracking-wider shadow-[0_4px_30px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_40px_rgba(251,191,36,0.55)] active:scale-[0.98] transition-all duration-300 backdrop-blur-md cursor-pointer"
          >
            <span>Bước Vào Không Gian</span>
            <ArrowRight
              className={`w-5 h-5 transition-transform duration-300 ${
                isHoveringEnter ? "translate-x-1.5" : ""
              }`}
            />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Bottom Footer */}
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 w-full max-w-4xl flex items-center justify-center text-center py-3 border-t border-white/10 text-xs text-slate-400"
      >
        <p className="text-slate-500 text-[11px]">
          © {new Date().getFullYear()} A Private Place.
        </p>
      </motion.footer>

      {/* Entrance Gateway Popup Modal */}
      <AnimatePresence>
        {isEntranceModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md rounded-3xl glass-panel-gold p-6 sm:p-7 shadow-2xl relative border border-amber-400/35 overflow-hidden text-center space-y-5"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsEntranceModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Glowing Icon */}
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                <DoorOpen className="w-8 h-8 text-amber-300" />
              </div>

              {/* Header Title */}
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-amber-200">
                  Cổng Không Gian Huyền Học
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Chào mừng bạn chuẩn bị tiến vào không gian chiêm bái, giải quẻ và xem lá số riêng tư.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2.5 text-left text-xs bg-black/40 p-4 rounded-2xl border border-white/10">
                <div className="flex items-start gap-2.5 text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">Lưu Hồ Sơ Cá Nhân:</span>
                    <p className="text-[11px] text-slate-400">
                      Tự động điền ngày giờ sinh, giới tính cho Lá số Tử Vi & Bản đồ sao.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300">
                  <History className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-300">Lưu Lịch Sử Luận Giải:</span>
                    <p className="text-[11px] text-slate-400">
                      Chỉ những tài khoản đã đăng nhập mới được lưu trữ và tra cứu lịch sử xem.
                    </p>
                  </div>
                </div>
              </div>

              {/* Conditional Action Buttons */}
              {currentUser?.isLoggedIn ? (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 py-1.5 px-3 rounded-xl border border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Đã đăng nhập: {currentUser.name}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEntranceModalOpen(false);
                      onEnter();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm font-cinzel tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Tiến Vào Không Gian Chiêm Bái</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEntranceModalOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm font-cinzel tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng Nhập / Đăng Ký Để Lưu Lịch Sử</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEntranceModalOpen(false);
                      onEnter();
                    }}
                    className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Tiếp Tục Với Tư Cách Khách</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
