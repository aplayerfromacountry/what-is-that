import React, { useState, useEffect } from "react";
import {
  Compass,
  Star,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  Eye,
  Feather,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TabType } from "../types";

interface EntranceScreenProps {
  onEnter: (targetTab?: TabType) => void;
}

const QUOTES = [
  {
    text: "Vạn vật trong vũ trụ đều có nhịp điệu riêng. Khi bạn tĩnh tâm lắng nghe, mọi khúc mắc đều hé lộ con đường sáng.",
    author: "Lão Tử • Đạo Đức Kinh",
  },
  {
    text: "Tương lai không phải là nơi ta bước tới, mà là nơi ta đang từng bước kiến tạo từ nhận thức hiện tại.",
    author: "Minh Triết Cổ Điển",
  },
  {
    text: "Những vì sao trên trời không ràng buộc số phận, chúng chỉ thắp sáng những lối đi cho tâm hồn can đảm.",
    author: "Paracelsus",
  },
];

export const EntranceScreen: React.FC<EntranceScreenProps> = ({ onEnter }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isHoveringEnter, setIsHoveringEnter] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const doorways: {
    id: TabType;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    borderColor: string;
  }[] = [
    {
      id: "tu-vi",
      title: "Tử Vi Đẩu Số",
      subtitle: "7 khía cạnh bản mệnh & lá số",
      icon: Compass,
      accentColor: "from-amber-500/20 to-amber-700/10 text-amber-300",
      borderColor: "hover:border-amber-400/50",
    },
    {
      id: "natal-chart",
      title: "Bản Đồ Sao",
      subtitle: "12 cung vị & góc chiếu",
      icon: Star,
      accentColor: "from-indigo-500/20 to-purple-700/10 text-indigo-300",
      borderColor: "hover:border-indigo-400/50",
    },
    {
      id: "tarot",
      title: "Bài Tarot",
      subtitle: "78 lá bài & trải nghiệm 3 lá",
      icon: Sparkles,
      accentColor: "from-purple-500/20 to-pink-700/10 text-purple-300",
      borderColor: "hover:border-purple-400/50",
    },
    {
      id: "kinh-dich",
      title: "Kinh Dịch",
      subtitle: "64 quẻ & hào âm dương",
      icon: Layers,
      accentColor: "from-yellow-500/20 to-stone-700/10 text-amber-200",
      borderColor: "hover:border-amber-400/50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 md:p-10 relative overflow-hidden bg-[#07090e] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* Background Animated Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-amber-500/10 via-indigo-600/10 to-purple-600/10 rounded-full blur-[160px]"
        />
        <div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] bg-cyan-600/8 rounded-full blur-[140px]" />
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-purple-700/10 rounded-full blur-[150px]" />
      </div>

      {/* Top Header Tag */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 w-full max-w-5xl flex items-center justify-between pt-2"
      >
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl text-xs text-slate-300 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium tracking-wide">Không Gian Kín Đáo & Bảo Mật Tuyệt Đối</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Eye className="w-3.5 h-3.5 text-amber-400/70" />
          <span className="hidden sm:inline">Trải Nghiệm Trực Giác Riêng Tư</span>
        </div>
      </motion.header>

      {/* Center Main Stage */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative z-10 w-full max-w-4xl mx-auto my-auto py-8 sm:py-12 flex flex-col items-center text-center space-y-8"
      >
        {/* Mystic Emblem Logo */}
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="relative group cursor-pointer"
          onClick={() => onEnter()}
        >
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-600/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-700" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/[0.05] border border-white/20 backdrop-blur-2xl flex items-center justify-center shadow-2xl shadow-black/40 group-hover:border-amber-400/60 transition-all duration-500">
            <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 group-hover:rotate-90 transition-transform duration-700" />
          </div>
        </motion.div>

        {/* Brand Typography */}
        <div className="space-y-3 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Vũ Trụ Chiêm Bái & Triết Học Đông Tây
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-cinzel tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-100 drop-shadow-[0_4px_24px_rgba(251,191,36,0.25)]"
          >
            A PRIVATE PLACE
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-sm sm:text-base text-slate-300 font-light leading-relaxed max-w-xl mx-auto px-4"
          >
            Nơi tĩnh tại để bạn lắng đọng tâm trí, kết nối trực giác và khám phá những chỉ dẫn huyền học sâu sắc từ các bậc thầy Tử Vi, Bản Đồ Sao, Tarot và Kinh Dịch.
          </motion.p>
        </div>

        {/* Quote Carousel */}
        <div className="w-full max-w-lg px-4">
          <div className="p-4 rounded-2xl glass-card text-xs sm:text-sm text-slate-300 border border-white/10 backdrop-blur-xl relative overflow-hidden transition-all duration-500 min-h-[90px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <p className="italic text-amber-200/90 leading-relaxed font-serif">
                  "{QUOTES[currentQuoteIndex].text}"
                </p>
                <span className="block text-[11px] text-slate-400 font-sans mt-1.5 font-medium">
                  — {QUOTES[currentQuoteIndex].author}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Primary Enter CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => onEnter()}
            onMouseEnter={() => setIsHoveringEnter(true)}
            onMouseLeave={() => setIsHoveringEnter(false)}
            className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-base sm:text-lg font-cinzel tracking-wider shadow-[0_4px_30px_rgba(251,191,36,0.35)] hover:shadow-[0_6px_40px_rgba(251,191,36,0.5)] active:scale-[0.98] transition-all duration-300 backdrop-blur-md"
          >
            <span>Bước Vào Không Gian Riêng</span>
            <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHoveringEnter ? "translate-x-1.5" : ""}`} />
          </motion.button>
          <p className="text-[11px] text-slate-500 mt-2.5">
            Nhấn để bước vào không gian luận giải cá nhân hóa
          </p>
        </motion.div>

        {/* Quick Doorways Grid */}
        <div className="w-full pt-4">
          <div className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-3 flex items-center justify-center gap-2">
            <Feather className="w-3.5 h-3.5 text-amber-400/80" />
            Hoặc chọn trực tiếp phân hệ bạn muốn khám phá:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {doorways.map((door, index) => {
              const Icon = door.icon;
              return (
                <motion.button
                  key={door.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + index * 0.08 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => onEnter(door.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl glass-card border border-white/10 ${door.borderColor} text-left transition-all duration-300 group hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${door.accentColor} border border-white/10 backdrop-blur-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <div className="font-semibold font-cinzel text-xs sm:text-sm text-slate-200 group-hover:text-amber-200 transition-colors line-clamp-1">
                      {door.title}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {door.subtitle}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Footer Disclaimer */}
      <footer className="relative z-10 w-full max-w-5xl text-center py-3 border-t border-white/10 text-[11px] text-slate-500">
        © {new Date().getFullYear()} A Private Place • Nền tảng chiêm nghiệm trực giác và triết lý phương Đông & phương Tây.
      </footer>
    </motion.div>
  );
};
